import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Controle de Estoque</h1>
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Produtos</CardTitle>
          <CardDescription>
            Monitore a quantidade de cada produto disponível.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">O Estoque Está Vazio</h3>
          <p className="text-muted-foreground mt-2">
            Adicione produtos ao seu inventário para começar a rastrear.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
