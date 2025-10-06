'use server';

/**
 * @fileOverview An AI agent that suggests improvements to a draft document based on a strategic blueprint.
 *
 * - suggestDraftImprovements - A function that takes a draft document and a strategic blueprint and returns suggestions for improvement.
 * - SuggestDraftImprovementsInput - The input type for the suggestDraftImprovements function.
 * - SuggestDraftImprovementsOutput - The return type for the suggestDraftImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDraftImprovementsInputSchema = z.object({
  draftContent: z
    .string()
    .describe('The content of the draft document to be improved.'),
  strategicBlueprint: z
    .string()
    .describe(
      'The strategic blueprint of the organization, including vision, mission, values, objectives, pillars, and taxonomy terms.'
    ),
});
export type SuggestDraftImprovementsInput = z.infer<
  typeof SuggestDraftImprovementsInputSchema
>;

const SuggestDraftImprovementsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of AI-driven suggestions for improving the draft content to better align with the strategic blueprint.'
    ),
  rationale: z
    .string()
    .describe(
      'A rationale for each suggestion, explaining why the suggestion would improve alignment.'
    ),
});
export type SuggestDraftImprovementsOutput = z.infer<
  typeof SuggestDraftImprovementsOutputSchema
>;

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
