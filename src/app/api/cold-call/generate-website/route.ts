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

const SYSTEM_PROMPT = `You are a world-class web designer from a top agency like Pentagram or Huge. You create minimal, sophisticated websites that win Awwwards.

DESIGN PHILOSOPHY:
- MINIMAL & ELEGANT: Less is more. Whitespace is your friend.
- EDITORIAL FEEL: Like a luxury magazine - clean, refined, intentional
- ASYMMETRIC LAYOUTS: Break the grid thoughtfully. Split screens, offset elements.
- TYPOGRAPHY-FIRST: Type IS the design. Large, bold headlines. Thin elegant body text.
- MUTED COLORS: Sophisticated palettes - off-whites, warm grays, one accent color
- SUBTLE ANIMATIONS: Gentle fades, smooth transitions. Never flashy.

STRICT DESIGN RULES:
1. HERO: Full viewport, split layout (text left, image right) or large image with overlay text
2. TYPOGRAPHY: Use font-weight contrasts (900 for headlines, 300 for body). Letter-spacing on caps.
3. SPACING: Minimum py-24 for sections. Generous gaps (gap-16, gap-20). Let content breathe.
4. COLORS: Background #fafafa or #f5f5f4. Text #1a1a1a. One muted accent (terracotta, sage, navy)
5. IMAGES: Large, cinematic. Use aspect-[4/3] or aspect-[3/4]. Rounded corners (rounded-2xl)
6. NAVIGATION: Minimal. Logo left, few links center/right. Sticky, transparent or light bg.
7. BUTTONS: Understated. Border buttons or text links with arrows. No heavy gradients.
8. GRID: Use asymmetric grids. 60/40 splits. Offset images. Overlapping elements.
9. FOOTER: Simple, elegant. Dark or light. Minimal links.
10. NO CLUTTER: Remove anything unnecessary. Every element must earn its place.

LAYOUT PATTERNS TO USE:
- Split hero: Large headline left (text-6xl md:text-8xl), full-height image right
- Bento grid: Asymmetric card layouts with varying sizes
- Editorial sections: Large image with small text block offset
- Feature strips: Icon + text in horizontal rows with lots of space
- Testimonials: Single large quote, minimal styling

Return ONLY the HTML code inside the <body> tag. No explanations, no markdown.`

function buildPremiumPrompt(lead: any, customImages: string[] = []): string {
  const categoryStyles: Record<string, any> = {
    restaurant: {
      accent: '#8B4513',
      accentName: 'warm sienna',
      imagery: ['1414235077428-338989a2e8c0', '1517248135467-4c7edcad34c4', '1552566626-52f8b828add9'],
      tagline: 'A Culinary Experience',
    },
    cafe: {
      accent: '#C4A484',
      accentName: 'warm taupe',
      imagery: ['1495474472287-4d71bcdd2085', '1501339847302-ac426a4a7cbb', '1509042239860-f550ce710b93'],
      tagline: 'Crafted With Care',
    },
    salon: {
      accent: '#B8860B',
      accentName: 'golden',
      imagery: ['1560066984-138dadb4c035', '1522337360788-8b13dee7a37e', '1521590832167-7bcbfaa6381f'],
      tagline: 'Your Style, Elevated',
    },
    dentist: {
      accent: '#5F9EA0',
      accentName: 'calm teal',
      imagery: ['1629909613654-28e377c37b09', '1588776814546-1ffcf47267a5', '1606811841689-23dfddce3e95'],
      tagline: 'Smile With Confidence',
    },
    plumber: {
      accent: '#2F4F4F',
      accentName: 'slate',
      imagery: ['1581578731548-c64695cc6952', '1504328345606-18bbc8c9d7d1', '1558618666-fcd25c85cd64'],
      tagline: 'Reliable. Professional. Fast.',
    },
    electrician: {
      accent: '#DAA520',
      accentName: 'amber',
      imagery: ['1621905251189-08b45d6a269e', '1558618666-fcd25c85cd64', '1581578731548-c64695cc6952'],
      tagline: 'Powering Your World Safely',
    },
    gym: {
      accent: '#DC143C',
      accentName: 'crimson',
      imagery: ['1534438327276-14e5300c3a48', '1571902943202-507ec2618e8f', '1517836357463-d25dfeac3438'],
      tagline: 'Transform Your Limits',
    },
    spa: {
      accent: '#9CAF88',
      accentName: 'sage',
      imagery: ['1544161515-4ab6ce6db874', '1540555700478-4be289fbecef', '1507003211169-0a1dd7228f2d'],
      tagline: 'Restore. Renew. Relax.',
    },
    auto_repair: {
      accent: '#B22222',
      accentName: 'deep red',
      imagery: ['1486262715619-67b85e0b08d3', '1558618666-fcd25c85cd64', '1530046339160-ce3e530c7d2f'],
      tagline: 'Expert Care For Your Vehicle',
    },
    cleaning: {
      accent: '#4682B4',
      accentName: 'steel blue',
      imagery: ['1581578731548-c64695cc6952', '1527515637462-cff94eecc1ac', '1558317374-067fb5f30001'],
      tagline: 'Spotless. Every Time.',
    },
    landscaping: {
      accent: '#556B2F',
      accentName: 'olive',
      imagery: ['1558904541-efa843a96f01', '1416879595882-3373a0480b5b', '1585320806297-9794b3e4eeae'],
      tagline: 'Nature, Perfected',
    },
    bakery: {
      accent: '#DEB887',
      accentName: 'warm wheat',
      imagery: ['1509440159562-66b02b259e5c', '1486427944299-d1955d23e34d', '1517433670267-30f206be5f84'],
      tagline: 'Baked Fresh Daily',
    },
  }

  const style = categoryStyles[lead.category] || {
    accent: '#374151',
    accentName: 'charcoal',
    imagery: ['1497366216548-37526070297c', '1497366811353-6870744d04b2'],
    tagline: 'Excellence In Every Detail',
  }

  const mainImage = style.imagery[0]
  const secondaryImage = style.imagery[1] || style.imagery[0]

  // Use custom images if available, otherwise use Unsplash
  const heroImage = customImages[0] || `https://images.unsplash.com/photo-${mainImage}?w=1200&q=80`
  const aboutImage = customImages[1] || `https://images.unsplash.com/photo-${secondaryImage}?w=800&q=80`
  const galleryImages = customImages.length > 2 ? customImages.slice(2) : []

  return `Create a MINIMAL, SOPHISTICATED website for:

BUSINESS: ${lead.businessName}
TYPE: ${lead.category.replace(/_/g, ' ')}
LOCATION: ${lead.city}, ${lead.country}
PHONE: ${lead.phone || '(555) 123-4567'}
TAGLINE: "${style.tagline}"

DESIGN SYSTEM:
- Background: #fafaf9 (warm off-white)
- Text: #1c1917 (warm black)
- Accent: ${style.accent} (${style.accentName})
- Secondary: #78716c (warm gray)

IMAGES TO USE (IMPORTANT - use these exact URLs):
- Hero image: ${heroImage}
- About/Secondary image: ${aboutImage}
${galleryImages.length > 0 ? `- Gallery images: ${galleryImages.join(', ')}` : ''}

=== EXACT STRUCTURE TO FOLLOW ===

1. NAVIGATION (sticky top-0, bg-white/80 backdrop-blur):
   - Logo/name on left (text-xl font-semibold tracking-tight)
   - 3-4 minimal links on right (text-sm font-medium text-gray-600 hover:text-black)
   - Use: "About", "Services", "Contact"

2. HERO SECTION (min-h-screen, grid grid-cols-1 lg:grid-cols-2):
   LEFT SIDE (flex flex-col justify-center px-8 lg:px-16):
   - Small caps label: "• ${lead.category.toUpperCase().replace(/_/g, ' ')}" (text-xs tracking-[0.2em] text-gray-500)
   - Main headline: Split into 2 lines, first line regular, second line in accent color
     Example: "Quality" (text-6xl lg:text-8xl font-light) + "& Care" (same size, accent color)
   - Subtitle: 2 lines max (text-lg text-gray-500 mt-6 max-w-md)
   - CTA: Text link with arrow "View Services →" (text-sm font-medium mt-8 hover:underline)
   
   RIGHT SIDE:
   - Full height image (h-[70vh] lg:h-screen object-cover)
   - Add small location badge overlay: "${lead.city}" (absolute bottom-8 left-8, bg-white/90 px-4 py-2 text-xs)

3. FEATURES STRIP (py-8 border-y border-gray-200):
   - 3 items in a row (grid grid-cols-3 gap-8 max-w-4xl mx-auto)
   - Each: Icon (w-5 h-5) + text (text-sm text-gray-600)
   - Examples: "Licensed & Insured", "5-Star Rated", "Same Day Service"

4. ABOUT SECTION (py-32 px-8):
   - Asymmetric layout: Image on left (60%), text on right (40%)
   - Image: aspect-[4/5] rounded-3xl
   - Text: Small label "ABOUT US", headline (text-4xl font-light), paragraph (text-gray-600), link

5. SERVICES SECTION (py-32 bg-gray-50):
   - Section label + headline centered
   - Bento grid of services (grid-cols-2 lg:grid-cols-3 gap-4)
   - Each card: bg-white p-8 rounded-2xl, service name (font-medium), brief description (text-sm text-gray-500)

6. TESTIMONIAL (py-32):
   - Single large quote centered (text-3xl lg:text-4xl font-light italic max-w-3xl mx-auto text-center)
   - Author name below (text-sm text-gray-500 mt-8)

7. CTA SECTION (py-24 bg-[${style.accent}] text-white):
   - Simple centered: Headline + subtitle + button (bg-white text-black)

8. FOOTER (py-16 bg-gray-900 text-white):
   - Grid: Logo/about, Quick Links, Contact Info
   - Copyright at bottom (text-sm text-gray-500)

CRITICAL RULES:
- NO gradients on buttons (use solid colors or borders)
- NO heavy shadows (use shadow-sm or none)
- NO rounded-full on cards (use rounded-2xl or rounded-3xl)
- Headlines: font-light or font-normal, NOT bold
- Lots of whitespace (py-32 for sections minimum)
- Images should be LARGE and cinematic
- Keep copy SHORT and elegant`
}

function wrapWithPremiumTemplate(
  html: string, 
  lead: any, 
  options: { customImages?: string[], logoUrl?: string | null } = {}
): string {
  const chatbotContext = buildChatbotContext(lead)
  const { customImages = [], logoUrl } = options
  
  // SEO data
  const seoTitle = lead.generatedWebsite?.seoTitle || `${lead.businessName} | ${lead.category.replace(/_/g, ' ')} in ${lead.city}`
  const seoDesc = lead.generatedWebsite?.seoDescription || `${lead.businessName} - Professional ${lead.category.replace(/_/g, ' ')} services in ${lead.city}. Quality service, trusted by locals.`
  const seoKeywords = lead.generatedWebsite?.seoKeywords?.join(', ') || `${lead.category.replace(/_/g, ' ')}, ${lead.city}, ${lead.businessName}`
  const heroImage = customImages[0] || `https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80`
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary SEO -->
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}">
  <meta name="keywords" content="${seoKeywords}">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${seoTitle}">
  <meta property="og:description" content="${seoDesc}">
  <meta property="og:image" content="${heroImage}">
  <meta property="og:site_name" content="${lead.businessName}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seoTitle}">
  <meta name="twitter:description" content="${seoDesc}">
  <meta name="twitter:image" content="${heroImage}">
  
  <!-- Local Business Schema -->
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
          colors: {
            stone: {
              50: '#fafaf9',
              100: '#f5f5f4',
              200: '#e7e5e4',
              800: '#292524',
              900: '#1c1917',
            }
          }
        },
      },
    }
  </script>
  
  <!-- Google Fonts - Using lighter weights for elegance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  
  <style>
    html { scroll-behavior: smooth; }
    body { 
      font-family: 'Inter', system-ui, sans-serif; 
      background-color: #fafaf9;
      color: #1c1917;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Elegant animations */
    .fade-up { 
      animation: fadeUp 0.8s ease-out; 
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Subtle hover */
    .hover-subtle {
      transition: all 0.3s ease;
    }
    .hover-subtle:hover {
      opacity: 0.7;
    }
    
    /* Image zoom on hover */
    .img-zoom {
      overflow: hidden;
    }
    .img-zoom img {
      transition: transform 0.6s ease;
    }
    .img-zoom:hover img {
      transform: scale(1.05);
    }
    
    /* Chatbot styles - more minimal */
    #chatbot-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    #chatbot-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #1c1917;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    #chatbot-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
    }
    
    #chatbot-button svg {
      width: 24px;
      height: 24px;
      color: white;
    }
    
    #chatbot-window {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 360px;
      max-width: calc(100vw - 48px);
      height: 480px;
      max-height: calc(100vh - 120px);
      background: #fafaf9;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #e7e5e4;
    }
    
    #chatbot-window.open {
      display: flex;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    #chatbot-header {
      background: #1c1917;
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    #chatbot-header-avatar {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #chatbot-header-info h3 {
      font-weight: 500;
      font-size: 15px;
      margin: 0;
    }
    
    #chatbot-header-info p {
      font-size: 12px;
      opacity: 0.7;
      margin: 2px 0 0 0;
    }
    
    #chatbot-close {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    
    #chatbot-close:hover {
      opacity: 1;
    }
    
    #chatbot-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: white;
    }
    
    .chat-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .chat-message.bot {
      background: #f5f5f4;
      color: #1c1917;
      align-self: flex-start;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
    }
    
    .chat-message.user {
      background: #1c1917;
      color: white;
      align-self: flex-end;
      border-radius: 16px;
      border-bottom-right-radius: 4px;
    }
    
    .chat-message.typing {
      display: flex;
      gap: 4px;
      padding: 16px 20px;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      background: #a8a29e;
      border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typingBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-4px); }
    }
    
    #chatbot-input-area {
      padding: 16px;
      border-top: 1px solid #e7e5e4;
      display: flex;
      gap: 10px;
      background: white;
    }
    
    #chatbot-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      background: #fafaf9;
    }
    
    #chatbot-input:focus {
      border-color: #1c1917;
    }
    
    #chatbot-send {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #1c1917;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }
    
    #chatbot-send:hover {
      opacity: 0.8;
    }
    
    #chatbot-send svg {
      width: 18px;
      height: 18px;
      color: white;
    }
    
    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    
    .quick-reply {
      padding: 6px 12px;
      background: white;
      border: 1px solid #e7e5e4;
      color: #1c1917;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-reply:hover {
      background: #1c1917;
      color: white;
      border-color: #1c1917;
    }
  </style>
</head>
<body class="bg-stone-50 text-stone-900 antialiased">
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
        <p>AI Assistant • Online</p>
      </div>
      <button id="chatbot-close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div id="chatbot-messages">
      <div class="chat-message bot">
        Hi! 👋 Welcome to ${lead.businessName}. I'm here to help you with any questions about our services. How can I assist you today?
        <div class="quick-replies">
          <button class="quick-reply" onclick="sendQuickReply('What services do you offer?')">Services</button>
          <button class="quick-reply" onclick="sendQuickReply('What are your hours?')">Hours</button>
          <button class="quick-reply" onclick="sendQuickReply('How can I contact you?')">Contact</button>
        </div>
      </div>
    </div>
    <div id="chatbot-input-area">
      <input type="text" id="chatbot-input" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
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
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
  // Chatbot functionality
  const businessContext = ${JSON.stringify(chatbotContext)};
  
  function toggleChat() {
    const window = document.getElementById('chatbot-window');
    window.classList.toggle('open');
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
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showTyping();
    
    // Generate response
    setTimeout(() => {
      hideTyping();
      const response = generateResponse(message);
      addMessage(response, 'bot');
    }, 1000 + Math.random() * 1000);
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
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }
  
  function generateResponse(message) {
    const msg = message.toLowerCase();
    
    // Services
    if (msg.includes('service') || msg.includes('offer') || msg.includes('do you do') || msg.includes('what do you')) {
      return businessContext.servicesResponse;
    }
    
    // Hours
    if (msg.includes('hour') || msg.includes('open') || msg.includes('close') || msg.includes('time')) {
      return businessContext.hoursResponse;
    }
    
    // Contact
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('call') || msg.includes('reach')) {
      return businessContext.contactResponse;
    }
    
    // Location
    if (msg.includes('location') || msg.includes('address') || msg.includes('where') || msg.includes('find you')) {
      return businessContext.locationResponse;
    }
    
    // Price
    if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('rate')) {
      return businessContext.pricingResponse;
    }
    
    // Booking
    if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule') || msg.includes('reserve')) {
      return businessContext.bookingResponse;
    }
    
    // Default
    return businessContext.defaultResponse;
  }
</script>
</body>
</html>`
}

function buildChatbotContext(lead: any): any {
  const category = lead.category
  const name = lead.businessName
  const phone = lead.phone || '(555) 123-4567'
  const city = lead.city
  
  const categoryResponses: Record<string, any> = {
    restaurant: {
      servicesResponse: "At " + name + ", we offer a delicious menu featuring appetizers, main courses, desserts, and beverages. We also provide catering services for special events, takeout, and delivery options. Would you like to know about any specific dishes?",
      hoursResponse: "We're open Monday to Thursday 11am-10pm, Friday & Saturday 11am-11pm, and Sunday 12pm-9pm. We recommend making reservations for weekend dinners!",
      pricingResponse: "Our menu ranges from $12-35 for main courses. We also have lunch specials starting at $10. Would you like me to tell you about our current specials?",
      bookingResponse: "I'd be happy to help you make a reservation! You can call us at " + phone + " or book online. How many guests and what date were you thinking?",
    },
    cafe: {
      servicesResponse: "Welcome to " + name + "! We serve specialty coffee, espresso drinks, fresh pastries, breakfast items, and light lunch options. We also offer free WiFi and a cozy atmosphere for working or relaxing.",
      hoursResponse: "We're open daily from 7am to 7pm. Early birds love our fresh-baked pastries that come out at 7:30am!",
      pricingResponse: "Our coffee drinks range from $3-7, pastries $3-6, and breakfast/lunch items $8-15. We also have a loyalty program - ask about it on your next visit!",
      bookingResponse: "No reservations needed - just walk in! For large groups or catering orders, please call us at " + phone + ".",
    },
    salon: {
      servicesResponse: "At " + name + ", we offer haircuts, coloring, highlights, balayage, treatments, styling, and more. Our experienced stylists specialize in all hair types and the latest trends.",
      hoursResponse: "We're open Tuesday to Saturday 9am-7pm. We're closed Sunday and Monday. Evening appointments available on Thursday and Friday!",
      pricingResponse: "Haircuts start at $35, color services from $75, and highlights from $120. We offer free consultations to discuss your perfect look and provide accurate pricing.",
      bookingResponse: "I'd love to help you book an appointment! Call us at " + phone + " or book online. Which service are you interested in?",
    },
    dentist: {
      servicesResponse: name + " provides comprehensive dental care including cleanings, exams, fillings, crowns, whitening, Invisalign, implants, and emergency dental services. We accept most insurance plans.",
      hoursResponse: "Our office is open Monday to Friday 8am-5pm, with early morning and late evening appointments available. We also offer Saturday hours twice a month.",
      pricingResponse: "We accept most dental insurance plans. For uninsured patients, we offer affordable payment plans. A routine cleaning and exam starts at $150. Contact us for a detailed estimate.",
      bookingResponse: "Ready to schedule your appointment? Call us at " + phone + " or request an appointment online. New patients welcome - we'll make your first visit comfortable!",
    },
    plumber: {
      servicesResponse: name + " handles all plumbing needs: leak repairs, drain cleaning, water heater installation, pipe repairs, bathroom/kitchen plumbing, and 24/7 emergency services. Licensed and insured!",
      hoursResponse: "We're available Monday to Saturday 7am-6pm for regular appointments. For emergencies, we offer 24/7 service - just call our emergency line!",
      pricingResponse: "Service calls start at $75. We provide free estimates for larger jobs. No hidden fees - we'll give you upfront pricing before any work begins.",
      bookingResponse: "Need a plumber? Call us at " + phone + " for same-day service when available. For emergencies, we can usually be there within an hour!",
    },
    gym: {
      servicesResponse: name + " offers state-of-the-art equipment, group fitness classes, personal training, locker rooms, and more. We have cardio, strength training, and functional fitness areas.",
      hoursResponse: "We're open 24/7 for members! Staffed hours are Monday-Friday 6am-10pm and weekends 8am-8pm. Personal trainers available by appointment.",
      pricingResponse: "Memberships start at $29/month with no long-term contracts. We also offer day passes for $15. Ask about our current promotions and free trial!",
      bookingResponse: "Ready to start your fitness journey? Come in for a free tour and trial workout, or call " + phone + " to speak with a membership advisor.",
    },
    spa: {
      servicesResponse: name + " offers massages, facials, body treatments, manicures, pedicures, and wellness packages. Our skilled therapists create a peaceful escape for total relaxation.",
      hoursResponse: "We're open Tuesday to Sunday 10am-8pm. We recommend booking in advance, especially for weekend appointments.",
      pricingResponse: "Massages start at $80/hour, facials from $75, and we have spa packages starting at $150. Gift cards available for that special someone!",
      bookingResponse: "Ready to relax? Book your treatment by calling " + phone + " or online. First-time guests receive 15% off their first service!",
    },
  }
  
  const defaultResponses = {
    servicesResponse: "At " + name + ", we offer a wide range of professional services tailored to your needs. We pride ourselves on quality work and customer satisfaction. What specific service are you interested in?",
    hoursResponse: "We're typically open Monday to Friday 9am-6pm, and Saturday 10am-4pm. For the most accurate hours, please call us at " + phone + ".",
    pricingResponse: "Our pricing varies based on the service. We offer competitive rates and free estimates. Contact us at " + phone + " for detailed pricing information.",
    bookingResponse: "We'd love to help you! Please call us at " + phone + " or visit us in " + city + " to schedule an appointment or get more information.",
  }
  
  const responses = categoryResponses[category] || defaultResponses
  
  return {
    ...responses,
    contactResponse: "You can reach us at " + phone + ". We're located in " + city + ". Feel free to call or visit us - we'd love to help you!",
    locationResponse: "We're conveniently located in " + city + ". Call us at " + phone + " for directions or to schedule a visit!",
    defaultResponse: "Thanks for your question! For the best assistance, please call us at " + phone + " or visit " + name + " in " + city + ". We're happy to help with anything you need!",
  }
}
