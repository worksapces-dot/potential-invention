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

    const lead = await client.coldCallLead.findFirst({
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

    const prompt = buildPremiumPrompt(lead)
    
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

    const fullHtml = wrapWithPremiumTemplate(cleanHtml, lead)

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

const SYSTEM_PROMPT = `You are an elite web designer who creates stunning, award-winning websites that look like they cost $50,000+.

Your designs are characterized by:
- PREMIUM AESTHETICS: Clean, sophisticated, luxurious feel
- MODERN TRENDS: Glass morphism, subtle gradients, micro-animations
- PERFECT TYPOGRAPHY: Beautiful font pairings, proper hierarchy, generous spacing
- VISUAL HIERARCHY: Clear sections, breathing room, intentional whitespace
- TRUST SIGNALS: Professional imagery, social proof, credibility markers
- CONVERSION FOCUSED: Clear CTAs, easy navigation, compelling copy

Design Rules:
1. Use a cohesive, sophisticated color palette (max 3-4 colors)
2. Large, bold headlines with elegant body text
3. Generous padding and margins (sections should breathe)
4. Subtle shadows and depth (not flat, not overdone)
5. Rounded corners on cards and buttons (modern feel)
6. High-quality placeholder images from Unsplash
7. Smooth hover effects and transitions
8. Mobile-first responsive design
9. Professional iconography (Lucide icons)
10. Trust badges, ratings, testimonials

Return ONLY the HTML code inside the <body> tag. No explanations, no markdown.`

function buildPremiumPrompt(lead: any): string {
  const categoryStyles: Record<string, any> = {
    restaurant: {
      vibe: 'warm, inviting, appetizing',
      colors: 'warm earth tones, deep burgundy or forest green accent',
      imagery: 'food, dining atmosphere, chef',
      sections: ['Hero with signature dish', 'About/Story', 'Menu Highlights', 'Ambiance Gallery', 'Reviews', 'Reservation CTA', 'Location & Hours'],
    },
    cafe: {
      vibe: 'cozy, artisanal, instagram-worthy',
      colors: 'warm browns, cream, terracotta accents',
      imagery: 'coffee, pastries, cozy interior',
      sections: ['Hero with latte art', 'Our Story', 'Menu', 'The Space', 'Reviews', 'Visit Us'],
    },
    salon: {
      vibe: 'chic, stylish, luxurious',
      colors: 'black, white, gold or rose gold accents',
      imagery: 'hair styling, beauty, elegant interior',
      sections: ['Hero with transformation', 'Services & Pricing', 'Our Stylists', 'Gallery', 'Reviews', 'Book Now'],
    },
    dentist: {
      vibe: 'clean, trustworthy, modern medical',
      colors: 'clean whites, soft blues, teal accents',
      imagery: 'smiling patients, modern equipment, friendly staff',
      sections: ['Hero with happy smile', 'Services', 'Meet the Team', 'Technology', 'Patient Reviews', 'Book Appointment'],
    },
    plumber: {
      vibe: 'reliable, professional, trustworthy',
      colors: 'navy blue, white, orange or yellow accents',
      imagery: 'professional technician, tools, happy homeowner',
      sections: ['Hero with emergency CTA', 'Services', 'Why Choose Us', 'Service Areas', 'Reviews', 'Get Quote'],
    },
    electrician: {
      vibe: 'safe, professional, certified',
      colors: 'dark blue, yellow/amber accents, white',
      imagery: 'electrician at work, modern home, safety',
      sections: ['Hero with 24/7 service', 'Services', 'Certifications', 'Projects', 'Reviews', 'Contact'],
    },
    gym: {
      vibe: 'energetic, motivating, powerful',
      colors: 'dark/black, vibrant red or orange accents',
      imagery: 'fitness, equipment, motivated people',
      sections: ['Hero with motivation', 'Memberships', 'Facilities', 'Classes', 'Trainers', 'Join Now'],
    },
    auto_repair: {
      vibe: 'trustworthy, expert, honest',
      colors: 'red, black, white, metallic accents',
      imagery: 'mechanics, cars, garage',
      sections: ['Hero with expertise', 'Services', 'Why Us', 'Certifications', 'Reviews', 'Schedule Service'],
    },
    cleaning: {
      vibe: 'fresh, sparkling, reliable',
      colors: 'fresh greens, clean blues, white',
      imagery: 'clean spaces, happy clients, professional team',
      sections: ['Hero with transformation', 'Services', 'Pricing', 'Process', 'Reviews', 'Get Quote'],
    },
    landscaping: {
      vibe: 'natural, beautiful, transformative',
      colors: 'greens, earth tones, sky blue',
      imagery: 'beautiful gardens, before/after, outdoor living',
      sections: ['Hero with stunning yard', 'Services', 'Portfolio', 'Process', 'Reviews', 'Free Estimate'],
    },
    bakery: {
      vibe: 'sweet, artisanal, homemade',
      colors: 'soft pinks, cream, warm browns',
      imagery: 'fresh baked goods, pastries, cozy shop',
      sections: ['Hero with signature item', 'Our Treats', 'Custom Orders', 'About Us', 'Reviews', 'Order Now'],
    },
    spa: {
      vibe: 'serene, luxurious, rejuvenating',
      colors: 'soft neutrals, sage green, lavender accents',
      imagery: 'relaxation, treatments, peaceful environment',
      sections: ['Hero with tranquility', 'Treatments', 'Packages', 'The Experience', 'Reviews', 'Book Treatment'],
    },
  }

  const style = categoryStyles[lead.category] || {
    vibe: 'professional, trustworthy, modern',
    colors: 'navy blue, white, accent color',
    imagery: 'professional service, happy customers',
    sections: ['Hero', 'Services', 'About', 'Reviews', 'Contact'],
  }

  return `Create a STUNNING, premium website for:

**Business:** ${lead.businessName}
**Type:** ${lead.category.replace(/_/g, ' ')}
**Location:** ${lead.city}, ${lead.country}
**Phone:** ${lead.phone || '(555) 123-4567'}
**Rating:** ${lead.rating ? `${lead.rating}★ (${lead.reviewCount} reviews)` : '5.0★ (New)'}

**Design Direction:**
- Vibe: ${style.vibe}
- Color Palette: ${style.colors}
- Imagery Style: ${style.imagery}

**Required Sections:**
${style.sections.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

**Design Requirements:**

HERO SECTION:
- Full viewport height (min-h-screen)
- Stunning background image from Unsplash (use https://images.unsplash.com/photo-[relevant-id]?w=1920&q=80)
- Dark overlay for text readability
- Large, bold headline (text-5xl md:text-7xl)
- Compelling subheadline
- Primary CTA button (large, rounded-full, with hover effect)
- Secondary link or scroll indicator

TYPOGRAPHY:
- Headlines: font-bold, tracking-tight
- Body: text-lg, text-gray-600, leading-relaxed
- Use Inter or system fonts

SPACING:
- Sections: py-20 md:py-32
- Container: max-w-7xl mx-auto px-4 md:px-8
- Cards: p-8 md:p-10
- Generous gaps between elements

COMPONENTS:
- Cards with subtle shadows (shadow-xl) and rounded-2xl
- Buttons: px-8 py-4 rounded-full with hover:scale-105 transition
- Images: rounded-2xl with object-cover
- Icons: Use Lucide icons (already included)

EFFECTS:
- Smooth transitions: transition-all duration-300
- Hover states on all interactive elements
- Subtle background patterns or gradients

FOOTER:
- Dark background
- Business info, quick links, social icons
- Copyright with current year

Use these Unsplash images (pick relevant ones):
- Restaurant/Food: photo-1517248135467-4c7edcad34c4, photo-1414235077428-338989a2e8c0
- Cafe/Coffee: photo-1495474472287-4d71bcdd2085, photo-1501339847302-ac426a4a7cbb
- Salon/Beauty: photo-1560066984-138dadb4c035, photo-1522337360788-8b13dee7a37e
- Dental/Medical: photo-1629909613654-28e377c37b09, photo-1588776814546-1ffcf47267a5
- Home Services: photo-1581578731548-c64695cc6952, photo-1621905251189-08b45d6a269e
- Fitness/Gym: photo-1534438327276-14e5300c3a48, photo-1571902943202-507ec2618e8f
- Spa/Wellness: photo-1544161515-4ab6ce6db874, photo-1540555700478-4be289fbecef

Generate the complete HTML now. Make it look like a $50,000 website.`
}

function wrapWithPremiumTemplate(html: string, lead: any): string {
  const chatbotContext = buildChatbotContext(lead)
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lead.businessName} | ${lead.city}</title>
  <meta name="description" content="${lead.businessName} - Premium ${lead.category.replace(/_/g, ' ')} services in ${lead.city}. Contact us today!">
  
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
    body { font-family: 'Inter', system-ui, sans-serif; }
    
    /* Smooth animations */
    .fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Glass effect */
    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    /* Hover lift */
    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .hover-lift:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    /* Chatbot styles */
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    #chatbot-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
    }
    
    #chatbot-button svg {
      width: 28px;
      height: 28px;
      color: white;
    }
    
    #chatbot-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 500px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    #chatbot-header-avatar {
      width: 45px;
      height: 45px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
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
      opacity: 0.9;
      margin: 2px 0 0 0;
    }
    
    #chatbot-close {
      margin-left: auto;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
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
      gap: 16px;
    }
    
    .chat-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .chat-message.bot {
      background: #f1f3f4;
      color: #1a1a1a;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    
    .chat-message.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .chat-message.typing {
      display: flex;
      gap: 4px;
      padding: 16px 20px;
    }
    
    .typing-dot {
      width: 8px;
      height: 8px;
      background: #999;
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
      padding: 16px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }
    
    #chatbot-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 25px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    #chatbot-input:focus {
      border-color: #667eea;
    }
    
    #chatbot-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    
    #chatbot-send:hover {
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
      margin-top: 8px;
    }
    
    .quick-reply {
      padding: 8px 14px;
      background: white;
      border: 1px solid #667eea;
      color: #667eea;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .quick-reply:hover {
      background: #667eea;
      color: white;
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
