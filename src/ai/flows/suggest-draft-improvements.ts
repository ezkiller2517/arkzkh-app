'use server';

/**
 * @fileOverview An AI agent that suggests improvements to a draft document based on a strategic blueprint.
 *
 * - suggestDraftImprovements - A function that takes a draft document and a strategic blueprint and returns suggestions for improvement.
 */

import {ai} from '@/ai/genkit';
import {
  SuggestDraftImprovementsInput,
  SuggestDraftImprovementsInputSchema,
  SuggestDraftImprovementsOutput,
  SuggestDraftImprovementsOutputSchema,
} from '@/ai/types';

export async function suggestDraftImprovements(
  input: SuggestDraftImprovementsInput
): Promise<SuggestDraftImprovementsOutput> {
  return suggestDraftImprovementsFlow(input);
}

const suggestDraftImprovementsPrompt = ai.definePrompt({
  name: 'suggestDraftImprovementsPrompt',
  input: {schema: SuggestDraftImprovementsInputSchema},
  output: {schema: SuggestDraftImprovementsOutputSchema},
  prompt: `You are an AI assistant helping content creators align their drafts with the organization's strategic blueprint.\n\n  Strategic Blueprint: {{{strategicBlueprint}}}\n\n  Draft Content: {{{draftContent}}}\n\n  Provide a list of specific, actionable suggestions for improving the draft content to better align with the strategic blueprint. For each suggestion, explain the rationale behind it, i.e., why it would improve alignment. Return the suggestions and rationales in a structured JSON format.`,
});

const suggestDraftImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestDraftImprovementsFlow',
    inputSchema: SuggestDraftImprovementsInputSchema,
    outputSchema: SuggestDraftImprovementsOutputSchema,
  },
  async input => {
    const {output} = await suggestDraftImprovementsPrompt(input);
    return output!;
  }
);
