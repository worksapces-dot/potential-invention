import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { leadId } = await req.json()

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const lead = await (client as any).coldCallLead.findFirst({
      where: {
        id: leadId,
        userId: dbUser.id,
      },
      include: {
        generatedWebsite: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get custom images if they exist
    const customImages = lead.generatedWebsite?.customImages || []
    const logoUrl = lead.generatedWebsite?.logoUrl || null

    const prompt = buildPremiumPrompt(lead, customImages)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    })

    const generatedHtml = completion.choices[0]?.message?.content || ''

    const cleanHtml = generatedHtml
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const fullHtml = wrapWithPremiumTemplate(cleanHtml, lead, { customImages, logoUrl })

    const websiteData = {
      template: lead.category,
      content: {
        html: fullHtml,
        generatedAt: new Date().toISOString(),
        leadData: {
          businessName: lead.businessName,
          category: lead.category,
          city: lead.city,
          phone: lead.phone,
        },
      },
    }

    let generatedWebsite
    if (lead.generatedWebsite) {
      generatedWebsite = await client.generatedWebsite.update({
        where: { id: lead.generatedWebsite.id },
        data: websiteData,
      })
    } else {
      generatedWebsite = await client.generatedWebsite.create({
        data: {
          ...websiteData,
          leadId: lead.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      websiteId: generatedWebsite.id,
      previewUrl: `/cold-call/preview/${generatedWebsite.id}`,
    })
  } catch (error: any) {
    console.error('Generate website error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate website' },
      { status: 500 }
    )
  }
}

const SYSTEM_PROMPT = `You are a world-class web designer creating modern, conversion-focused websites inspired by top SaaS landing pages like Linear, Vercel, and Stripe.

DESIGN PHILOSOPHY:
- MODERN & CLEAN: Minimal, sophisticated, lots of whitespace
- DARK/LIGHT CONTRAST: Dark sections alternating with light for visual rhythm
- ROUNDED CORNERS: Use rounded-2xl and rounded-3xl extensively
- GLASSMORPHISM: Subtle backdrop-blur effects, semi-transparent backgrounds
- BOLD TYPOGRAPHY: Large headlines (text-5xl to text-7xl), tight tracking
- SUBTLE ANIMATIONS: Hover effects, smooth transitions
- TRUST SIGNALS: Reviews, ratings, badges prominently displayed

STRICT DESIGN RULES:
1. HERO: Full viewport, centered content, large headline, subtitle, CTA button, trust badges below
2. NAVIGATION: Sticky, glassmorphism (bg-white/80 backdrop-blur-xl), rounded-2xl, logo left, links right
3. BUTTONS: Rounded-full, dark bg (bg-gray-900), white text, shadow-xl, hover:-translate-y-0.5
4. CARDS: bg-white, rounded-3xl, border border-gray-200, p-8, hover:shadow-xl transition
5. SECTIONS: Alternate between bg-white and bg-gray-50, py-24 minimum
6. BADGES: rounded-full, bg-gray-100, px-4 py-2, text-sm font-medium
7. ICONS: Use Lucide icons, displayed in rounded-2xl bg containers
8. IMAGES: rounded-3xl, shadow-2xl, object-cover
9. GRID: Use asymmetric layouts, bento grids for features
10. FOOTER: Dark (bg-gray-900 text-white), rounded-t-[3rem], comprehensive links

COLOR PALETTE:
- Background: white (#ffffff) and gray-50 (#f9fafb)
- Text: gray-900 (#111827) for headlines, gray-600 (#4b5563) for body
- Accent: Use category-specific accent color sparingly
- Borders: gray-200 (#e5e7eb)

Return ONLY the HTML code inside the <body> tag. No explanations, no markdown.`

function buildPremiumPrompt(lead: any, customImages: string[] = []): string {
  const categoryStyles: Record<string, any> = {
    restaurant: {
      accent: '#dc2626',
      accentName: 'red-600',
      imagery: ['1414235077428-338989a2e8c0', '1517248135467-4c7edcad34c4'],
      tagline: 'Exceptional Dining Experience',
      services: ['Dine-In', 'Takeout', 'Catering', 'Private Events'],
    },
    cafe: {
      accent: '#92400e',
      accentName: 'amber-800',
      imagery: ['1495474472287-4d71bcdd2085', '1501339847302-ac426a4a7cbb'],
      tagline: 'Crafted With Passion',
      services: ['Specialty Coffee', 'Fresh Pastries', 'Breakfast', 'Lunch'],
    },
    salon: {
      accent: '#be185d',
      accentName: 'pink-700',
      imagery: ['1560066984-138dadb4c035', '1522337360788-8b13dee7a37e'],
      tagline: 'Your Style, Elevated',
      services: ['Haircuts', 'Coloring', 'Styling', 'Treatments'],
    },
    dentist: {
      accent: '#0891b2',
      accentName: 'cyan-600',
      imagery: ['1629909613654-28e377c37b09', '1588776814546-1ffcf47267a5'],
      tagline: 'Smile With Confidence',
      services: ['Cleanings', 'Whitening', 'Implants', 'Cosmetic'],
    },
    plumber: {
      accent: '#2563eb',
      accentName: 'blue-600',
      imagery: ['1581578731548-c64695cc6952', '1504328345606-18bbc8c9d7d1'],
      tagline: 'Fast. Reliable. Professional.',
      services: ['Emergency Repairs', 'Installation', 'Maintenance', 'Inspections'],
    },
    electrician: {
      accent: '#ca8a04',
      accentName: 'yellow-600',
      imagery: ['1621905251189-08b45d6a269e', '1558618666-fcd25c85cd64'],
      tagline: 'Powering Your World Safely',
      services: ['Repairs', 'Installation', 'Upgrades', 'Inspections'],
    },
    gym: {
      accent: '#dc2626',
      accentName: 'red-600',
      imagery: ['1534438327276-14e5300c3a48', '1571902943202-507ec2618e8f'],
      tagline: 'Transform Your Limits',
      services: ['Personal Training', 'Group Classes', 'Nutrition', 'Recovery'],
    },
    spa: {
      accent: '#059669',
      accentName: 'emerald-600',
      imagery: ['1544161515-4ab6ce6db874', '1540555700478-4be289fbecef'],
      tagline: 'Restore. Renew. Relax.',
      services: ['Massage', 'Facials', 'Body Treatments', 'Wellness'],
    },
    auto_repair: {
      accent: '#dc2626',
      accentName: 'red-600',
      imagery: ['1486262715619-67b85e0b08d3', '1558618666-fcd25c85cd64'],
      tagline: 'Expert Care For Your Vehicle',
      services: ['Diagnostics', 'Repairs', 'Maintenance', 'Inspections'],
    },
    cleaning: {
      accent: '#0891b2',
      accentName: 'cyan-600',
      imagery: ['1581578731548-c64695cc6952', '1527515637462-cff94eecc1ac'],
      tagline: 'Spotless. Every Time.',
      services: ['Residential', 'Commercial', 'Deep Clean', 'Move-In/Out'],
    },
    landscaping: {
      accent: '#16a34a',
      accentName: 'green-600',
      imagery: ['1558904541-efa843a96f01', '1416879595882-3373a0480b5b'],
      tagline: 'Nature, Perfected',
      services: ['Design', 'Installation', 'Maintenance', 'Hardscaping'],
    },
    bakery: {
      accent: '#ea580c',
      accentName: 'orange-600',
      imagery: ['1509440159562-66b02b259e5c', '1486427944299-d1955d23e34d'],
      tagline: 'Baked Fresh Daily',
      services: ['Bread', 'Pastries', 'Custom Cakes', 'Catering'],
    },
  }

  const style = categoryStyles[lead.category] || {
    accent: '#2563eb',
    accentName: 'blue-600',
    imagery: ['1497366216548-37526070297c'],
    tagline: 'Excellence In Every Detail',
    services: ['Consultation', 'Service', 'Support', 'Maintenance'],
  }

  const heroImage = customImages[0] || `https://images.unsplash.com/photo-${style.imagery[0]}?w=1200&q=80`
  const aboutImage = customImages[1] || `https://images.unsplash.com/photo-${style.imagery[1] || style.imagery[0]}?w=800&q=80`

  return `Create a MODERN, CONVERSION-FOCUSED website for:

BUSINESS: ${lead.businessName}
TYPE: ${lead.category.replace(/_/g, ' ')}
LOCATION: ${lead.city}, ${lead.country}
PHONE: ${lead.phone || '(555) 123-4567'}
TAGLINE: "${style.tagline}"
${lead.rating ? `RATING: ${lead.rating} stars (${lead.reviewCount} reviews)` : ''}

ACCENT COLOR: ${style.accent} (${style.accentName})
SERVICES: ${style.services.join(', ')}

IMAGES (use these exact URLs):
- Hero: ${heroImage}
- About: ${aboutImage}

=== EXACT STRUCTURE ===

1. NAVIGATION (sticky top-0 z-50 px-4 pt-4):
   Container: mx-auto max-w-7xl rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-lg
   Inner: flex h-16 items-center justify-between px-6
   - Logo: text-xl font-bold tracking-tight
   - Links: hidden md:flex gap-8, text-sm font-medium text-gray-600 hover:text-gray-900
   - CTA: rounded-full bg-gray-900 text-white px-6 py-2.5 text-sm font-medium shadow-lg hover:bg-gray-800

2. HERO (min-h-screen flex items-center py-20):
   - Badge: inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium mb-8
   - Headline: text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6
   - Subtitle: text-xl text-gray-600 max-w-2xl mb-8
   - CTA Row: flex gap-4
     - Primary: rounded-full bg-gray-900 text-white px-8 py-4 text-lg font-medium shadow-xl hover:-translate-y-0.5
     - Secondary: rounded-full border-2 border-gray-200 px-8 py-4 text-lg font-medium hover:bg-gray-50
   - Trust badges below: flex gap-6 mt-12 (rating stars, "Licensed & Insured", "Same Day Service")
   - Hero image on right side or below on mobile

3. FEATURES/SERVICES (py-24 bg-gray-50):
   - Section badge + headline centered
   - Bento grid (grid-cols-2 lg:grid-cols-4 gap-4)
   - Each card: bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-xl transition-all
     - Icon in rounded-2xl bg-gray-100 container
     - Service name (font-semibold text-lg)
     - Brief description (text-gray-600)

4. ABOUT SECTION (py-24):
   - Two column: Image left (rounded-3xl shadow-2xl), content right
   - Small label, large headline, paragraph, bullet points with checkmarks

5. WHY CHOOSE US (py-24 bg-gray-50):
   - 3 cards in a row
   - Each: icon, stat number (text-4xl font-bold), label

6. TESTIMONIAL (py-24):
   - Large quote centered (text-2xl md:text-3xl italic text-gray-700)
   - 5 stars above quote
   - Author info below

7. CTA SECTION (py-20 bg-gray-900 text-white rounded-[3rem] mx-4 my-8):
   - Centered: headline, subtitle, white button

8. FOOTER (py-16 bg-gray-900 text-white):
   - Grid: Business info, Quick Links, Services, Contact
   - Copyright at bottom

CRITICAL:
- Use Tailwind classes exactly as specified
- All buttons: rounded-full with shadow
- All cards: rounded-3xl
- Lots of whitespace (py-24 for sections)
- Include hover states on interactive elements
- Make phone number clickable (tel: link)`
}


function wrapWithPremiumTemplate(
  html: string, 
  lead: any, 
  options: { customImages?: string[], logoUrl?: string | null } = {}
): string {
  const { customImages = [], logoUrl } = options
  
  // SEO data
  const seoTitle = lead.generatedWebsite?.seoTitle || `${lead.businessName} | ${lead.category.replace(/_/g, ' ')} in ${lead.city}`
  const seoDesc = lead.generatedWebsite?.seoDescription || `${lead.businessName} - Professional ${lead.category.replace(/_/g, ' ')} services in ${lead.city}. Quality service, trusted by locals.`
  const seoKeywords = lead.generatedWebsite?.seoKeywords?.join(', ') || `${lead.category.replace(/_/g, ' ')}, ${lead.city}, ${lead.businessName}`
  const heroImage = customImages[0] || `https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80`
  
  const chatbotContext = buildChatbotContext(lead)
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO -->
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}">
  <meta name="keywords" content="${seoKeywords}">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${seoTitle}">
  <meta property="og:description" content="${seoDesc}">
  <meta property="og:image" content="${heroImage}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seoTitle}">
  <meta name="twitter:description" content="${seoDesc}">
  
  <!-- Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "${lead.businessName}",
    "description": "${seoDesc}",
    "image": "${heroImage}",
    "telephone": "${lead.phone || ''}",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "${lead.city}",
      "addressCountry": "${lead.country}"
    }${lead.rating ? `,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "${lead.rating}",
      "reviewCount": "${lead.reviewCount || 1}"
    }` : ''}
  }
  </script>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  
  <style>
    html { scroll-behavior: smooth; }
    body { 
      font-family: 'Inter', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Animations */
    .fade-up {
      animation: fadeUp 0.6s ease-out forwards;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .hover-lift {
      transition: all 0.3s ease;
    }
    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    /* Chatbot Styles */
    #chatbot-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    #chatbot-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #111827;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }
    
    #chatbot-button:hover {
      transform: scale(1.05);
      box-shadow: 0 15px 50px rgba(0,0,0,0.25);
    }
    
    #chatbot-button svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    #chatbot-window {
      position: absolute;
      bottom: 76px;
      right: 0;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 500px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }
    
    #chatbot-window.open {
      display: flex;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    #chatbot-header {
      background: #111827;
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    #chatbot-header-avatar {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.1);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #chatbot-header-info h3 {
      font-weight: 600;
      font-size: 16px;
      margin: 0;
    }
    
    #chatbot-header-info p {
      font-size: 13px;
      opacity: 0.7;
      margin: 3px 0 0 0;
    }
    
    #chatbot-close {
      margin-left: auto;
      background: rgba(255,255,255,0.1);
      border: none;
      border-radius: 10px;
      width: 36px;
      height: 36px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    #chatbot-close:hover {
      background: rgba(255,255,255,0.2);
    }
    
    #chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #f9fafb;
    }
    
    .chat-message {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: 20px;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .chat-message.bot {
      background: white;
      color: #111827;
      align-self: flex-start;
      border-radius: 20px 20px 20px 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .chat-message.user {
      background: #111827;
      color: white;
      align-self: flex-end;
      border-radius: 20px 20px 6px 20px;
    }
    
    .chat-message.typing {
      display: flex;
      gap: 5px;
      padding: 18px 22px;
    }
    
    .typing-dot {
      width: 8px;
      height: 8px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typingBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    
    #chatbot-input-area {
      padding: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      background: white;
    }
    
    #chatbot-input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #e5e7eb;
      border-radius: 16px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      background: #f9fafb;
    }
    
    #chatbot-input:focus {
      border-color: #111827;
      background: white;
    }
    
    #chatbot-send {
      width: 50px;
      height: 50px;
      border-radius: 16px;
      background: #111827;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    #chatbot-send:hover {
      background: #1f2937;
      transform: scale(1.05);
    }
    
    #chatbot-send svg {
      width: 20px;
      height: 20px;
      color: white;
    }
    
    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    
    .quick-reply {
      padding: 8px 14px;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      color: #374151;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-reply:hover {
      background: #111827;
      color: white;
      border-color: #111827;
    }
  </style>
</head>
<body class="bg-white text-gray-900 antialiased">
${html}

<!-- AI Chatbot Widget -->
<div id="chatbot-widget">
  <div id="chatbot-window">
    <div id="chatbot-header">
      <div id="chatbot-header-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
        </svg>
      </div>
      <div id="chatbot-header-info">
        <h3>${lead.businessName}</h3>
        <p>AI Assistant • Online now</p>
      </div>
      <button id="chatbot-close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div id="chatbot-messages">
      <div class="chat-message bot">
        Hi there! 👋 Welcome to ${lead.businessName}. How can I help you today?
        <div class="quick-replies">
          <button class="quick-reply" onclick="sendQuickReply('What services do you offer?')">Services</button>
          <button class="quick-reply" onclick="sendQuickReply('What are your hours?')">Hours</button>
          <button class="quick-reply" onclick="sendQuickReply('How can I contact you?')">Contact</button>
        </div>
      </div>
    </div>
    <div id="chatbot-input-area">
      <input type="text" id="chatbot-input" placeholder="Type a message..." onkeypress="handleKeyPress(event)">
      <button id="chatbot-send" onclick="sendMessage()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </div>
  </div>
  <button id="chatbot-button" onclick="toggleChat()">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  </button>
</div>

<script>
  lucide.createIcons();
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  const businessContext = ${JSON.stringify(chatbotContext)};
  
  function toggleChat() {
    document.getElementById('chatbot-window').classList.toggle('open');
  }
  
  document.getElementById('chatbot-close').addEventListener('click', toggleChat);
  
  function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
  }
  
  function sendQuickReply(text) {
    document.getElementById('chatbot-input').value = text;
    sendMessage();
  }
  
  async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    showTyping();
    
    setTimeout(() => {
      hideTyping();
      const response = generateResponse(message);
      addMessage(response, 'bot');
    }, 800 + Math.random() * 800);
  }
  
  function addMessage(text, type) {
    const messages = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chat-message ' + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  
  function showTyping() {
    const messages = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chat-message bot typing';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  
  function hideTyping() {
    document.getElementById('typing-indicator')?.remove();
  }
  
  function generateResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('service') || msg.includes('offer') || msg.includes('do you do')) return businessContext.servicesResponse;
    if (msg.includes('hour') || msg.includes('open') || msg.includes('close')) return businessContext.hoursResponse;
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('call')) return businessContext.contactResponse;
    if (msg.includes('location') || msg.includes('address') || msg.includes('where')) return businessContext.locationResponse;
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) return businessContext.pricingResponse;
    if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule')) return businessContext.bookingResponse;
    return businessContext.defaultResponse;
  }
</script>
</body>
</html>`
}

function buildChatbotContext(lead: any): any {
  const name = lead.businessName
  const phone = lead.phone || '(555) 123-4567'
  const city = lead.city
  const category = lead.category.replace(/_/g, ' ')
  
  return {
    servicesResponse: `At ${name}, we offer a full range of ${category} services. We're known for quality work and customer satisfaction. Would you like to know more about any specific service?`,
    hoursResponse: `We're open Monday through Friday 8am-6pm, and Saturday 9am-4pm. We're closed on Sundays. Feel free to call us at ${phone} to schedule!`,
    contactResponse: `You can reach us at ${phone}. We're located in ${city} and always happy to help with any questions!`,
    locationResponse: `We're proudly serving ${city} and surrounding areas. Call us at ${phone} for directions or to schedule a visit!`,
    pricingResponse: `Our pricing varies based on the specific service needed. We offer free estimates! Call us at ${phone} or book online to get a quote.`,
    bookingResponse: `We'd love to schedule you! You can book online using the booking button on this page, or call us directly at ${phone}.`,
    defaultResponse: `Thanks for reaching out to ${name}! For the fastest response, give us a call at ${phone}. We're here to help with all your ${category} needs!`,
  }
}
