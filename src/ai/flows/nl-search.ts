
'use server';

/**
 * @fileOverview An AI agent for converting natural language search queries into structured data.
 *
 * - nlSearch - A function that converts a natural language query into a list of skills.
 * - NlSearchInput - The input type for the nlSearch function.
 * - NlSearchOutput - The return type for the nlSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NlSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query from the user.'),
});
export type NlSearchInput = z.infer<typeof NlSearchInputSchema>;

const NlSearchOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills extracted from the query.'),
});
export type NlSearchOutput = z.infer<typeof NlSearchOutputSchema>;

export async function nlSearch(input: NlSearchInput): Promise<NlSearchOutput> {
  return nlSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nlSearchPrompt',
  input: {schema: NlSearchInputSchema},
  output: {schema: NlSearchOutputSchema},
  prompt: `You are an expert at parsing user search queries on a skill-swapping platform.
  Your task is to extract the names of professional skills from the user's query.

  - The user is searching for people who are offering skills.
  - If the query is already a skill (e.g., "Python", "Graphic Design"), return that skill directly.
  - If multiple skills are mentioned (e.g., separated by 'or', 'and', or commas), extract all of them.
  - Return the skills as a JSON object with a "skills" key containing an array of strings.
  - Capitalize the first letter of each word in the skill name (e.g., "generative ai" becomes "Generative AI").
  - For programming languages with special characters like "C++" or "C#", preserve their original casing and format.
  - If the query does not seem to contain a specific skill, interpret the user's intent and provide the most likely skill they are looking for. If you cannot determine a skill, return an empty array.

  Example 1:
  Input: "Find users who are offering Generative AI or Deep Learning"
  Output: { "skills": ["Generative AI", "Deep Learning"] }

  Example 2:
  Input: "I need a python developer"
  Output: { "skills": ["Python"] }
  
  Example 3:
  Input: "someone who can draw"
  Output: { "skills": ["Drawing"] }

  Example 4:
  Input: "c++"
  Output: { "skills": ["C++"] }

  Now convert the following user query:
  "{{query}}"
  `,
});

const nlSearchFlow = ai.defineFlow(
  {
    name: 'nlSearchFlow',
    inputSchema: NlSearchInputSchema,
    outputSchema: NlSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
