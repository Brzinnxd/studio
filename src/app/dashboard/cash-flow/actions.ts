'use server';

import { analyzeReceipt, type AnalyzeReceiptInput } from '@/ai/flows/analyze-receipt';

export async function analyzeReceiptAction(
  input: AnalyzeReceiptInput
): Promise<{ totalAmount?: number; error?: string }> {
  try {
    const result = await analyzeReceipt(input);
    return { totalAmount: result.totalAmount };
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    return { error: 'Não foi possível analisar a imagem. Tente novamente.' };
  }
}
