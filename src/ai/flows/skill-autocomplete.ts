'use server';

/**
 * @fileOverview An AI-powered skill autocomplete agent.
 *
 * - skillAutocomplete - A function that handles the skill autocomplete process.
 * - SkillAutocompleteInput - The input type for the skillAutocomplete function.
 * - SkillAutocompleteOutput - The return type for the skillAutocomplete function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillAutocompleteInputSchema = z.object({
  query: z.string().describe('The search query for skill autocomplete.'),
});
export type SkillAutocompleteInput = z.infer<typeof SkillAutocompleteInputSchema>;

const SkillAutocompleteOutputSchema = z.array(z.string()).describe('An array of skill suggestions.');
export type SkillAutocompleteOutput = z.infer<typeof SkillAutocompleteOutputSchema>;

export async function skillAutocomplete(input: SkillAutocompleteInput): Promise<SkillAutocompleteOutput> {
  return skillAutocompleteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillAutocompletePrompt',
  input: {schema: SkillAutocompleteInputSchema},
  output: {schema: SkillAutocompleteOutputSchema},
  prompt: `You are a helpful AI assistant that provides skill autocomplete suggestions based on the user's query.

  Given the following query:
  {{query}}

  Provide a maximum of 5 skill suggestions that are relevant to the query.  The suggestions should be suitable for inclusion in a skill search user interface, and can be skills that are similar or related to the query.  Return the suggestions as a JSON array of strings.
  `,
});

const skillAutocompleteFlow = ai.defineFlow(
  {
    name: 'skillAutocompleteFlow',
    inputSchema: SkillAutocompleteInputSchema,
    outputSchema: SkillAutocompleteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
