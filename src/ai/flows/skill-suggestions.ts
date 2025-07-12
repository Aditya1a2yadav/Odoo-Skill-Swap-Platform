// SkillSuggestions flow

'use server';

/**
 * @fileOverview AI skill suggestion agent.
 *
 * - suggestSkills - A function that suggests skills based on a user profile.
 * - SkillSuggestionInput - The input type for the suggestSkills function.
 * - SkillSuggestionOutput - The return type for the suggestSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillSuggestionInputSchema = z.object({
  profileContent: z
    .string()
    .describe('User profile content, including skills offered and wanted.'),
  swapHistory: z
    .string()
    .describe('A summary of the user swap history.'),
  trendingSkills: z
    .string()
    .describe('A list of popular and trending skills.'),
});

export type SkillSuggestionInput = z.infer<typeof SkillSuggestionInputSchema>;

const SkillSuggestionOutputSchema = z.object({
  suggestedSkills: z
    .array(z.string())
    .describe('An array of suggested skills for the user.'),
});

export type SkillSuggestionOutput = z.infer<typeof SkillSuggestionOutputSchema>;

export async function suggestSkills(input: SkillSuggestionInput): Promise<SkillSuggestionOutput> {
  return suggestSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillSuggestionPrompt',
  input: {schema: SkillSuggestionInputSchema},
  output: {schema: SkillSuggestionOutputSchema},
  prompt: `You are a skill suggestion expert. You will suggest skills to the user based on their profile content, swap history, and trending skills.

User Profile Content: {{{profileContent}}}

Swap History: {{{swapHistory}}}

Trending Skills: {{{trendingSkills}}}

Please suggest skills that the user might want to offer, so they can easily expand their profile and increase their chances of finding a relevant swap.

Ensure the suggested skills are relevant to the user's profile and swap history. Consider skills that are currently trending and in demand.
`,
});

const suggestSkillsFlow = ai.defineFlow(
  {
    name: 'suggestSkillsFlow',
    inputSchema: SkillSuggestionInputSchema,
    outputSchema: SkillSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
