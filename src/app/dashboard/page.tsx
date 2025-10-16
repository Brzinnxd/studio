'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    title: 'Receita Total',
    value: 'R$ 45.231,89',
    numericValue: 45231.89,
    change: '+20.1% do último mês',
    icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Pedidos',
    value: '+2350',
    numericValue: 2350,
    change: '+180.1% do último mês',
    icon: <ShoppingBag className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Novos Clientes',
    value: '+12.234',
    numericValue: 12234,
    change: '+19% do último mês',
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Produtos em Estoque',
    value: '573',
    numericValue: 573,
    change: '+201 desde a última semana',
    icon: <Package className="h-4 w-4 text-muted-foreground" />,
  },
];

const pieChartData = stats.map((stat) => ({
  name: stat.title,
  value: stat.numericValue,
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentOrders = [
  {
    id: 'ORD001',
    customer: 'Fulano de Tal',
    total: 'R$ 99,90',
    status: 'Enviado',
  },
  {
    id: 'ORD002',
    customer: 'Ciclano de Tal',
    total: 'R$ 45,50',
    status: 'Pendente',
  },
  {
    id: 'ORD003',
    customer: 'Beltrano de Tal',
    total: 'R$ 120,00',
    status: 'Entregue',
  },
  {
    id: 'ORD004',
    customer: 'João da Silva',
    total: 'R$ 30,20',
    status: 'Cancelado',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral das Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'Receita Total') {
                      return [
                        (value as number).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }),
                        name,
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Acompanhe os últimos pedidos recebidos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'Enviado'
                            ? 'default'
                            : order.status === 'Pendente'
                            ? 'secondary'
                            : order.status === 'Entregue'
                            ? 'outline'
                            : 'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
