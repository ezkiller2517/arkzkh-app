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
  prompt: `You are an AI assistant specialized in scoring content alignment against a strategic blueprint.

  Given the following content and strategic blueprint, assess the alignment of the content with the blueprint.
  Provide an alignment score between 0 and 1, feedback on what to fix, suggested actions, and a rationale for the score.
  Return the output in a structured JSON format.

  Content: {{{content}}}
  Strategic Blueprint: {{{strategicBlueprint}}}

  Output the result as a JSON object matching the following schema.  Use descriptions to guide the content of each field:
  \`\`\`json
  { 
    "alignmentScore": "number between 0 and 1",
    "feedback": "string",
    "suggestedActions": "array of strings",
    "rationale": "string"
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
    return output!;
  }
);
