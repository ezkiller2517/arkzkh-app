'use server';

/**
 * @fileOverview An AI agent that extracts content from a document, which can be a URL or a file.
 *
 * - extractDocumentContent - A function that takes a URL or a file and returns the text content.
 */

import {ai} from '@/ai/genkit';
import {
  DocumentInput,
  DocumentInputSchema,
  DocumentOutput,
  DocumentOutputSchema,
} from '@/ai/types';

export async function extractDocumentContent(
  input: DocumentInput
): Promise<DocumentOutput> {
  return extractDocumentContentFlow(input);
}

const extractDocumentContentFlow = ai.defineFlow(
  {
    name: 'extractDocumentContentFlow',
    inputSchema: DocumentInputSchema,
    outputSchema: DocumentOutputSchema,
  },
  async (input) => {
    const media = "data" in input.document ? { url: input.document.data } : { url: input.document.url };
    const result = await ai.extractText(
        { media },
    );
    return { content: result.text || '' };
  }
);
