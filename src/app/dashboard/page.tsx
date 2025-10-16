import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';

const stats = [
  {
    title: 'Receita Total',
    value: 'R$ 45.231,89',
    change: '+20.1% do último mês',
    icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Pedidos',
    value: '+2350',
    change: '+180.1% do último mês',
    icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Novos Clientes',
    value: '+12.234',
    change: '+19% do último mês',
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Produtos em Estoque',
    value: '573',
    change: '+201 desde a última semana',
    icon: <Package className="h-4 w-4 text-muted-foreground" />,
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vinda de volta, Angel!</CardTitle>
            <CardDescription>
              Aqui está um resumo do seu negócio. Continue o ótimo trabalho!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Use o menu à esquerda para navegar pelas seções de gerenciamento.
              Você pode ver pedidos, gerenciar seu estoque, ver perfis de
              clientes e analisar tendências de produtos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
