'use server';

/**
 * @fileOverview An AI agent that extracts content from a document, which can be a URL or a file.
 *
 * - extractDocumentContent - A function that takes a URL or a file and returns the text content.
 * - DocumentInput - The input type for the extractDocumentContent function.
 * - DocumentOutput - The return type for the extractDocumentContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DocumentInputSchema = z.object({
  document: z.union([
    z.object({
      url: z.string().url().describe("The URL of the document to extract content from."),
    }),
    z.object({
      data: z.string().describe("A file to extract content from as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    }),
  ]),
});
export type DocumentInput = z.infer<typeof DocumentInputSchema>;

export const DocumentOutputSchema = z.object({
  content: z.string().describe('The extracted text content of the document.'),
});
export type DocumentOutput = z.infer<typeof DocumentOutputSchema>;


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
