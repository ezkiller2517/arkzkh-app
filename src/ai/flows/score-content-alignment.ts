'use server';

/**
 * @fileOverview This file defines a Genkit flow for scoring content alignment against a strategic blueprint.
 *
 * The flow takes content and a strategic blueprint as input, and returns an alignment score, feedback,
 * suggested actions, and rationale in a structured JSON format.
 *
 * - scoreContentAlignment - The main function to trigger the content alignment scoring flow.
 * - ScoreContentAlignmentInput - The input type for the scoreContentAlignment function.
 * - ScoreContentAlignmentOutput - The output type for the scoreContentAlignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ScoreContentAlignmentInputSchema = z.object({
  content: z.string().describe('The content to be scored for alignment.'),
  strategicBlueprint: z.string().describe('The strategic blueprint to align the content against.  This should include elements such as vision, mission, values, objectives, pillars, and taxonomy terms.'),
});
export type ScoreContentAlignmentInput = z.infer<typeof ScoreContentAlignmentInputSchema>;

const ScoreContentAlignmentOutputSchema = z.object({
  alignmentScore: z.number().min(0).max(1).describe('The alignment score between 0 and 1.'),
  feedback: z.string().describe('Feedback on what to fix to improve alignment.'),
  suggestedActions: z.array(z.string()).describe('Suggested actions to take to improve alignment.'),
  rationale: z.string().describe('Rationale for the alignment score and feedback.'),
});
export type ScoreContentAlignmentOutput = z.infer<typeof ScoreContentAlignmentOutputSchema>;


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
