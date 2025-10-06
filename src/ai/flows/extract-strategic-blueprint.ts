'use server';

/**
 * @fileOverview A strategic blueprint extraction AI agent.
 *
 * - extractStrategicBlueprint - A function that handles the blueprint extraction process.
 * - ExtractStrategicBlueprintInput - The input type for the extractStrategicBlueprint function.
 * - ExtractStrategicBlueprintOutput - The return type for the extractStrategicBlueprint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractStrategicBlueprintInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to analyze.'),
});
export type ExtractStrategicBlueprintInput = z.infer<typeof ExtractStrategicBlueprintInputSchema>;

const ExtractStrategicBlueprintOutputSchema = z.object({
  vision: z.string().describe('The vision statement of the organization.'),
  mission: z.string().describe('The mission statement of the organization.'),
  values: z.array(z.string()).describe('The core values of the organization.'),
  objectives: z.array(z.string()).describe('The strategic objectives of the organization.'),
  pillars: z.array(z.string()).describe('The strategic pillars of the organization.'),
  taxonomyTerms: z.array(z.string()).describe('The taxonomy terms used by the organization.'),
});
export type ExtractStrategicBlueprintOutput = z.infer<typeof ExtractStrategicBlueprintOutputSchema>;

export async function extractStrategicBlueprint(
  input: ExtractStrategicBlueprintInput
): Promise<ExtractStrategicBlueprintOutput> {
  return extractStrategicBlueprintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractStrategicBlueprintPrompt',
  input: {schema: ExtractStrategicBlueprintInputSchema},
  output: {schema: ExtractStrategicBlueprintOutputSchema},
  prompt: `You are an expert in extracting strategic information from documents.

  Analyze the following document content and extract the key strategic elements, including:

  - Vision Statement: The overarching aspiration of the organization.
  - Mission Statement: The purpose of the organization.
  - Values: The guiding principles of the organization.
  - Objectives: The strategic goals of the organization.
  - Pillars: The main areas of focus for the organization.
  - Taxonomy Terms: The key terms and concepts used by the organization.

  Document Content: {{{documentContent}}}

  Return the extracted information in a structured JSON format.
  `,
});

const extractStrategicBlueprintFlow = ai.defineFlow(
  {
    name: 'extractStrategicBlueprintFlow',
    inputSchema: ExtractStrategicBlueprintInputSchema,
    outputSchema: ExtractStrategicBlueprintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
