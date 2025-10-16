'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing product trends in sales data.
 *
 * analyzeProductTrends - An async function that takes sales data as input and returns an analysis of trending flavor combinations.
 * AnalyzeProductTrendsInput - The input type for the analyzeProductTrends function, expects sales data.
 * AnalyzeProductTrendsOutput - The output type for the analyzeProductTrends function, providing insights into trending flavors.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductTrendsInputSchema = z.object({
  salesData: z
    .string()
    .describe(
      'A string containing sales data, including product pairings and sales figures.'
    ),
});

export type AnalyzeProductTrendsInput = z.infer<typeof AnalyzeProductTrendsInputSchema>;

const AnalyzeProductTrendsOutputSchema = z.object({
  trendingFlavors: z
    .string()
    .describe(
      'A description of the trending flavor combinations identified in the sales data.'
    ),
  possibleTrends: z
    .string()
    .describe(
      'Suggestions for possible trending flavors based on the analysis of the sales data.'
    ),
});

export type AnalyzeProductTrendsOutput = z.infer<typeof AnalyzeProductTrendsOutputSchema>;

export async function analyzeProductTrends(
  input: AnalyzeProductTrendsInput
): Promise<AnalyzeProductTrendsOutput> {
  return analyzeProductTrendsFlow(input);
}

const analyzeProductTrendsPrompt = ai.definePrompt({
  name: 'analyzeProductTrendsPrompt',
  input: {schema: AnalyzeProductTrendsInputSchema},
  output: {schema: AnalyzeProductTrendsOutputSchema},
  prompt: `You are an expert in analyzing sales data to identify trending flavor combinations for a sweets business.

  Analyze the following sales data to identify current trends and possible future trends in flavor pairings.

  Sales Data:
  {{salesData}}

  Based on this data, provide insights into the trending flavor combinations and suggest possible new flavor combinations that could become popular.
  Be brief and to the point.
  `,
});

const analyzeProductTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeProductTrendsFlow',
    inputSchema: AnalyzeProductTrendsInputSchema,
    outputSchema: AnalyzeProductTrendsOutputSchema,
  },
  async input => {
    const {output} = await analyzeProductTrendsPrompt(input);
    return output!;
  }
);
