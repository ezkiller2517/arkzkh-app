'use server';

/**
 * @fileOverview A strategic blueprint extraction AI agent.
 *
 * - extractStrategicBlueprint - A function that handles the blueprint extraction process.
 */

import {ai} from '@/ai/genkit';
import {
  ExtractStrategicBlueprintInput,
  ExtractStrategicBlueprintInputSchema,
  ExtractStrategicBlueprintOutput,
  ExtractStrategicBlueprintOutputSchema,
} from '@/ai/types';

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
