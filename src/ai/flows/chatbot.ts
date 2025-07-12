'use server';

/**
 * @fileOverview A general-purpose chatbot flow.
 *
 * - chat - A function that handles a single turn of a conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export type ChatOutput = string;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatInputSchema},
  prompt: `You are a helpful and friendly assistant for the SkillSwap platform. Your name is 'SwapBot'.
  
  Your goal is to assist users with their questions about the platform, help them find skills, or just have a pleasant conversation.
  Keep your responses concise and helpful.

  Here is the conversation history:
  {{#each history}}
    {{role}}: {{{content}}}
  {{/each}}
  user: {{{message}}}
  model:`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const response = await prompt(input);
    const output = response.output;
    if (!output) {
      console.error('Chatbot AI failed to generate a response. Full response:', JSON.stringify(response, null, 2));
      return "I'm sorry, I'm having trouble connecting. Please try again in a moment.";
    }
    return output;
  }
);
