import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are Slide's friendly AI assistant on the landing page. You help visitors learn about Slide - an Instagram DM automation platform.

About Slide:
- Slide automates Instagram DMs and comment replies using AI
- Key features: Auto DM replies, Keyword triggers, Smart AI responses, Comment automation, Analytics dashboard, Template marketplace
- How it works: 1) Connect Instagram via secure OAuth, 2) Set up keyword triggers and AI prompts, 3) Automations run 24/7
- Use cases: Content creators, Influencers, E-commerce brands, Coaches & Consultants
- Pricing: Free plan available, no credit card required
- Benefits: Reply instantly 24/7, Convert more leads, Grow engagement, AI that sounds like you

Your personality:
- Friendly, helpful, and concise
- Answer questions about Slide's features, pricing, and how it works
- If asked about technical implementation details you don't know, suggest they sign up or contact support
- Keep responses short (2-3 sentences max) unless more detail is needed
- Use emojis sparingly to be friendly
- If asked unrelated questions, politely redirect to Slide topics

Always encourage visitors to try Slide for free!`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content || "Sorry, I couldn't process that. Please try again!"

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    )
  }
}
