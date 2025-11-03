'use client';

import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getTrendAnalysis, type State } from './actions';
import { Lightbulb, TrendingUp } from 'lucide-react';
import React from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Analisando...' : 'Analisar Tendências'}
    </Button>
  );
}

export default function TrendsPage() {
  const initialState: State = {};
  const [state, dispatch] = React.useActionState(getTrendAnalysis, initialState);
  const [salesData, setSalesData] = React.useState('');

  const exampleSalesData = `Exemplo de dados:\n- Pedido 1: Bala Baiana (2), Brigadeiro (4)\n- Pedido 2: Quindim (1), Beijinho (3)\n- Pedido 3: Bala Baiana (5)\n- Pedido 4: Brigadeiro (6), Beijinho (6)`;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSalesData(e.target.value);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Análise de Tendências</h1>
        <p className="text-muted-foreground mt-2">
          Use IA para analisar seus dados de vendas e descobrir quais
          combinações de sabores estão em alta.
        </p>
      </header>

      <Card>
        <form action={dispatch}>
          <CardHeader>
            <CardTitle>Analisador de Vendas</CardTitle>
            <CardDescription>
              Cole os dados de vendas de produtos para obter insights sobre
              tendências.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-2">
              <Label htmlFor="salesData">Dados de Vendas</Label>
              <Textarea
                id="salesData"
                name="salesData"
                placeholder={exampleSalesData}
                required
                value={salesData}
                onChange={handleTextChange}
              />
              {state?.message && state.message.includes('Invalid') && (
                 <p className="text-sm text-destructive">{state.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.trendingFlavors && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Sabores em Alta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{state.trendingFlavors}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                <span>Sugestões de Tendências</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{state.possibleTrends}</p>
            </CardContent>
          </Card>
        </div>
      )}
      {state?.message && state.message.includes('Failed') && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro na Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{state.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
