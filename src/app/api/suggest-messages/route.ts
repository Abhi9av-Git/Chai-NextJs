import OpenAI from 'openai';
import { shouldParseToolCall } from 'openai/lib/ResponsesParser.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const runtime = 'edge';

export async function POST(req: Request) {
  try {

    const prompt="Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me,and should be suitable for a diverse AudioEncoder. Avoid personal or sensitive Topics, focusing instead on Universal themes that encourage friendly interaction.For example, your output should be structured like this:'What's hobby you have recently started?||If you could have dinner with any historical flightRouterStateSchema, who would it be?||What's a simple thing that makes you happy?.Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."

    const response=await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      max_tokens: 400,
      stream: true,
      prompt
    })

    // Return the streaming response directly
    return new Response(response.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
  catch (error) {
    if (error instanceof OpenAI.APIError) {
      const {name, status, headers, message}=error
      return new Response(
        JSON.stringify({ name, status, headers, message }),
        {
          status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    else {
      console.log("An unexpected error occured", error)
      throw error
    }
  }
}
