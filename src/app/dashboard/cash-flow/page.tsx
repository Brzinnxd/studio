import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CandlestickChart } from 'lucide-react';

export default function CashFlowPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Fluxo de Caixa</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Caixa</CardTitle>
          <CardDescription>
            Monitore suas entradas e saídas para manter a saúde financeira do seu negócio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <CandlestickChart className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Em Construção</h3>
          <p className="text-muted-foreground mt-2">
            Esta seção está sendo desenvolvida e estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
