'use server';

/**
 * @fileOverview An AI agent that extracts content from a document, which can be a URL or a file.
 *
 * - extractDocumentContent - A function that takes a URL or a file and returns the text content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
    let content: string;
    try {
      if ('data' in input.document) {
        // It's a file, pass the data URI directly.
        const result = await ai.generate({
          prompt: [
            {text: 'Extract the text from this document.'},
            {media: {url: input.document.data}},
          ],
        });
        content = result.text || '';
      } else {
        // It's a URL. Let the model fetch and extract the content.
        const result = await ai.generate({
          prompt: `Extract the main text content from the website at the following URL: ${input.document.url}`,
        });
        content = result.text || '';
      }
    } catch (error: any) {
        console.error('Error in extractDocumentContentFlow:', error);
        if (error.message.includes('fetch')) {
             throw new Error(`Failed to fetch the URL: ${'url' in input.document ? input.document.url : 'N/A'}. Please ensure it is correct and publicly accessible.`);
        }
        throw new Error('An unexpected error occurred while extracting the document content.');
    }

    return { content };
  }
);
