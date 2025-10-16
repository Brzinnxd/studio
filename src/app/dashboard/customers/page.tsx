import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Perfis de Clientes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Veja o histórico de pedidos e as preferências dos seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <Users className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Nenhum Cliente Registrado</h3>
          <p className="text-muted-foreground mt-2">
            Os perfis dos clientes aparecerão aqui após a primeira compra.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
