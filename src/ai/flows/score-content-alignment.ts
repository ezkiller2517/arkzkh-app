'use server';

/**
 * @fileOverview This file defines a Genkit flow for scoring content alignment against a strategic blueprint.
 *
 * The flow takes content and a strategic blueprint as input, and returns an alignment score, feedback,
 * suggested actions, and rationale in a structured JSON format.
 *
 * - scoreContentAlignment - The main function to trigger the content alignment scoring flow.
 */

import {ai} from '@/ai/genkit';
import {
  ScoreContentAlignmentInput,
  ScoreContentAlignmentInputSchema,
  ScoreContentAlignmentOutput,
  ScoreContentAlignmentOutputSchema,
} from '@/ai/types';

export async function scoreContentAlignment(input: ScoreContentAlignmentInput): Promise<ScoreContentAlignmentOutput> {
  return scoreContentAlignmentFlow(input);
}

const scoreContentAlignmentPrompt = ai.definePrompt({
  name: 'scoreContentAlignmentPrompt',
  input: {schema: ScoreContentAlignmentInputSchema},
  output: {schema: ScoreContentAlignmentOutputSchema},
  prompt: `As a corporate communications strategist, evaluate the following DRAFT against the provided STRATEGIC BLUEPRINT. 
  
  Provide:
  1. An alignment score from 0 to 1.
  2. A concise, one-sentence justification for the score.
  3. A list of 2-3 actionable suggestions for improving alignment.
  4. A detailed rationale explaining the score and suggestions.

  STRATEGIC BLUEPRINT: {{{strategicBlueprint}}}
  
  DRAFT CONTENT: {{{content}}}

  Output the result as a JSON object matching the following schema. Use the descriptions to guide the content of each field:
  \`\`\`json
  { 
    "alignmentScore": "number between 0 and 1",
    "justification": "A concise, one-sentence justification for the score.",
    "suggestedActions": "An array of 2-3 actionable suggestions for improvement.",
    "rationale": "A detailed rationale explaining the score and suggestions.",
    "feedback": "General feedback on what to fix."
  }
  \`\`\`
  `,
});

const scoreContentAlignmentFlow = ai.defineFlow(
  {
    name: 'scoreContentAlignmentFlow',
    inputSchema: ScoreContentAlignmentInputSchema,
    outputSchema: ScoreContentAlignmentOutputSchema,
  },
  async input => {
    const {output} = await scoreContentAlignmentPrompt(input);
    // Ensure feedback is populated even if the model doesn't provide it, for backward compatibility
    if (!output!.feedback) {
      output!.feedback = output!.rationale;
    }
    return output!;
  }
);
