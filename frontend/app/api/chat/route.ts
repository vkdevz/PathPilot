import { OpenAI } from 'openai';
import { StreamingTextResponse } from 'ai';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Fallback response if API key is not configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key') {
      const lastMessage = messages[messages.length - 1]?.content || 'Hello';
      const mockStream = new ReadableStream({
        start(controller) {
          const text = `I am your PathPilot AI Tutor. You asked: "${lastMessage}". Let's master this concept step by step!`;
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();
        },
      });
      return new StreamingTextResponse(mockStream);
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        {
          role: 'system',
          content: 'You are PathPilot AI, an expert technical tutor guiding learners through personalized skill milestones.',
        },
        ...messages,
      ],
    });

    // Simple stream transformation
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
