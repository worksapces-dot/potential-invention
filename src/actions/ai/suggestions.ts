'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});

type UserContext = {
    name: string;
    followers: number;
    totalDMs: number;
    totalReplies: number;
    automationCount: number;
    avgEngagement: number;
    automations: Array<{
        name: string;
        dmsSent: number;
        commentsReplied: number;
        engagementPercent: number;
    }>;
};

export async function chatWithAI(
    message: string,
    userContext: UserContext,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
) {
    try {
        const systemPrompt = `You are an expert Instagram automation assistant helping ${userContext.name}. 

Current User Stats:
- Instagram Followers: ${userContext.followers.toLocaleString()}
- Total DMs Sent: ${userContext.totalDMs}
- Total Auto Replies: ${userContext.totalReplies}
- Active Automations: ${userContext.automationCount}
- Average Engagement Rate: ${userContext.avgEngagement.toFixed(1)}%

Active Automations:
${userContext.automations.map(a => `- ${a.name}: ${a.dmsSent} DMs, ${a.commentsReplied} replies, ${a.engagementPercent.toFixed(1)}% engagement`).join('\n')}

Your role:
- Provide personalized advice based on their specific data
- Be conversational and friendly
- Give actionable, specific recommendations
- Reference their actual stats when relevant
- Keep responses concise (2-3 sentences max)
- Use emojis sparingly and naturally

Remember: You have access to their real analytics data, so be specific!`;

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.8,
            max_tokens: 200,
        });

        const response = completion.choices[0].message.content || 'Sorry, I couldn\'t process that.';

        return {
            success: true,
            response,
        };
    } catch (error) {
        console.error('AI Chat Error:', error);
        return {
            success: false,
            response: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        };
    }
}

export async function getInitialGreeting(userContext: UserContext) {
    try {
        const prompt = `Greet ${userContext.name} and give them a quick insight about their Instagram automation performance. Be friendly and mention 1 specific stat that stands out. Keep it to 2 sentences max.

Their stats:
- Followers: ${userContext.followers.toLocaleString()}
- Total DMs: ${userContext.totalDMs}
- Automations: ${userContext.automationCount}
- Engagement: ${userContext.avgEngagement.toFixed(1)}%`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a friendly Instagram automation assistant. Be warm and conversational.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.9,
            max_tokens: 100,
        });

        return completion.choices[0].message.content || `Hey ${userContext.name}! 👋 Ready to optimize your Instagram automations?`;
    } catch (error) {
        console.error('Greeting Error:', error);
        return `Hey ${userContext.name}! 👋 I'm your AI assistant. Ask me anything about your Instagram automation!`;
    }
}
