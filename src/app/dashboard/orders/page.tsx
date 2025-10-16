import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Gerenciamento de Pedidos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Meus Pedidos</CardTitle>
          <CardDescription>
            Aqui você pode visualizar e gerenciar todos os pedidos recebidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Nenhum Pedido Encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Quando os clientes fizerem pedidos, eles aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
