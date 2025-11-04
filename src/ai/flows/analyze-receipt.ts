'use server';

/**
 * @fileOverview A Genkit flow for analyzing receipts to extract the total amount.
 *
 * analyzeReceipt - An async function that takes a receipt image and returns the total amount.
 * AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * AnalyzeReceiptOutput - The output type for the analyzeReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeReceiptInput = z.infer<typeof AnalyzeReceiptInputSchema>;

const AnalyzeReceiptOutputSchema = z.object({
  totalAmount: z
    .number()
    .describe('The total amount found on the receipt.'),
});
export type AnalyzeReceiptOutput = z.infer<typeof AnalyzeReceiptOutputSchema>;

export async function analyzeReceipt(input: AnalyzeReceiptInput): Promise<AnalyzeReceiptOutput> {
  return analyzeReceiptFlow(input);
}

const analyzeReceiptPrompt = ai.definePrompt({
  name: 'analyzeReceiptPrompt',
  input: { schema: AnalyzeReceiptInputSchema },
  output: { schema: AnalyzeReceiptOutputSchema },
  prompt: `You are an expert in reading receipts. Analyze the provided receipt image and extract only the final total amount. Return the amount as a number.

Photo: {{media url=photoDataUri}}`,
});

const analyzeReceiptFlow = ai.defineFlow(
  {
    name: 'analyzeReceiptFlow',
    inputSchema: AnalyzeReceiptInputSchema,
    outputSchema: AnalyzeReceiptOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeReceiptPrompt(input);
    return output!;
  }
);
