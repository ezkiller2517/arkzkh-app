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
      // It's a URL, fetch the content first.
      try {
        const response = await fetch(input.document.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const htmlContent = await response.text();
        // Now ask the AI to extract text from the HTML content.
        const result = await ai.generate({
          prompt: `Extract the main text content from the following HTML: \n\n${htmlContent}`,
        });
        content = result.text || '';
      } catch (error: any) {
        if (error instanceof TypeError && error.message.includes('fetch failed')) {
            throw new Error(`Failed to fetch the URL: ${input.document.url}. Please ensure it is correct and publicly accessible.`);
        }
        throw error;
      }
    }

    return { content };
  }
);
