'use server';

import { analyzeProductTrends } from '@/ai/flows/analyze-product-trends';
import { z } from 'zod';

const formSchema = z.object({
  salesData: z
    .string()
    .min(10, 'Por favor, forneça dados de vendas mais detalhados.'),
});

export type State = {
  message?: string;
  trendingFlavors?: string;
  possibleTrends?: string;
};

export async function getTrendAnalysis(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    salesData: formData.get('salesData'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Dados de vendas inválidos.',
    };
  }

  try {
    const result = await analyzeProductTrends(validatedFields.data);
    return {
      message: 'Análise completa.',
      trendingFlavors: result.trendingFlavors,
      possibleTrends: result.possibleTrends,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Falha ao analisar tendências. Por favor, tente novamente.',
    };
  }
}
