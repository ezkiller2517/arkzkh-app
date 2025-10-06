import {z} from 'genkit';

export const DocumentInputSchema = z.object({
  document: z.union([
    z.object({
      url: z
        .string()
        .url()
        .describe('The URL of the document to extract content from.'),
    }),
    z.object({
      data: z
        .string()
        .describe(
          "A file to extract content from as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  ]),
});
export type DocumentInput = z.infer<typeof DocumentInputSchema>;

export const DocumentOutputSchema = z.object({
  content: z.string().describe('The extracted text content of the document.'),
});
export type DocumentOutput = z.infer<typeof DocumentOutputSchema>;

export const ExtractStrategicBlueprintInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to analyze.'),
});
export type ExtractStrategicBlueprintInput = z.infer<
  typeof ExtractStrategicBlueprintInputSchema
>;

export const ExtractStrategicBlueprintOutputSchema = z.object({
  vision: z.string().describe('The vision statement of the organization.'),
  mission: z.string().describe('The mission statement of the organization.'),
  values: z
    .array(z.string())
    .describe('The core values of the organization.'),
  objectives: z
    .array(z.string())
    .describe('The strategic objectives of the organization.'),
  pillars: z
    .array(z.string())
    .describe('The strategic pillars of the organization.'),
  taxonomyTerms: z
    .array(z.string())
    .describe('The taxonomy terms used by the organization.'),
});
export type ExtractStrategicBlueprintOutput = z.infer<
  typeof ExtractStrategicBlueprintOutputSchema
>;

export const ScoreContentAlignmentInputSchema = z.object({
  content: z.string().describe('The content to be scored for alignment.'),
  strategicBlueprint: z
    .string()
    .describe(
      'The strategic blueprint to align the content against.  This should include elements such as vision, mission, values, objectives, pillars, and taxonomy terms.'
    ),
});
export type ScoreContentAlignmentInput = z.infer<
  typeof ScoreContentAlignmentInputSchema
>;

export const ScoreContentAlignmentOutputSchema = z.object({
  alignmentScore: z
    .number()
    .min(0)
    .max(1)
    .describe('The alignment score between 0 and 1, where 1 is perfect alignment.'),
  justification: z
    .string()
    .describe('A concise, one-sentence justification for the score.'),
  suggestedActions: z
    .array(z.string())
    .describe('A list of 2-3 actionable suggestions for improving alignment.'),
  rationale: z
    .string()
    .describe('A detailed rationale explaining the score and suggestions.'),
  feedback: z
    .string()
    .describe('General feedback on what to fix (for backward compatibility).'),
});
export type ScoreContentAlignmentOutput = z.infer<
  typeof ScoreContentAlignmentOutputSchema
>;

export const SuggestDraftImprovementsInputSchema = z.object({
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

export const SuggestDraftImprovementsOutputSchema = z.object({
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
