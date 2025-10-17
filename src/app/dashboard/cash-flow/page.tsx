'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function CashFlowPage() {
  const firestore = useFirestore();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [allMonths, setAllMonths] = useState<string[]>([]);

  const transactionsCollection = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'business_transactions') : null;
  }, [firestore]);

  const { data: allTransactions, isLoading: isLoadingAll } = useCollection<Transaction>(transactionsCollection);

  const monthlyTransactionsQuery = useMemoFirebase(() => {
    if (!transactionsCollection) return null;
    const [year, month] = selectedMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    return query(transactionsCollection, where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
  }, [transactionsCollection, selectedMonth]);

  const { data: transactions, isLoading: isLoadingMonth } = useCollection<Transaction>(monthlyTransactionsQuery);

  useEffect(() => {
    if (allTransactions) {
      const months = new Set(allTransactions.map(t => t.date.substring(0, 7)));
      const currentMonth = getCurrentMonthKey();
      if (!months.has(currentMonth)) {
        months.add(currentMonth);
      }
      setAllMonths(Array.from(months).sort().reverse());
    }
  }, [allTransactions]);
  

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !transactionsCollection) return;

    const newTransaction = {
      name,
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };

    addDocumentNonBlocking(transactionsCollection, newTransaction);
    setName('');
    setDescription('');
    setAmount('');
  };

  const handleDeleteTransaction = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'business_transactions', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  const displayedTransactions = transactions || [];

  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    const txs = transactions || [];
    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
    };
  }, [transactions]);


  const chartData = [
    { name: 'Entradas', value: totalIncome },
    { name: 'Gastos', value: totalExpense },
  ];

  const COLORS = ['#22c55e', '#ef4444'];
  
  const isLoading = isLoadingAll || isLoadingMonth;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Fluxo de Caixa Empresarial</h1>
         <div className="flex items-center gap-4">
          <Label>Ver Relatório</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {allMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adicionar Transação</CardTitle>
            <CardDescription>
              Registre uma nova entrada ou gasto no mês atual.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddTransaction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Venda de bolo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Bolo de chocolate para festa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <RadioGroup
                  value={type}
                  onValueChange={(value) =>
                    setType(value as 'income' | 'expense')
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Entrada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Gasto</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Adicionar
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Entradas
                </CardTitle>
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                <div className="text-2xl font-bold">
                  {totalIncome.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
                }
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Gastos
                </CardTitle>
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                <div className="text-2xl font-bold">
                  {totalExpense.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
                }
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                <div
                  className={`text-2xl font-bold ${
                    netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {netProfit.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
                }
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral do Mês</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <div className='flex justify-center items-center h-[250px]'><Skeleton className='h-[250px] w-full' /></div> :
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
                }
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                        <TableCell><Skeleton className='h-5 w-40' /></TableCell>
                        <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                        <TableCell className='text-right'><Skeleton className='h-5 w-24 inline-block' /></TableCell>
                        <TableCell className='text-right'><Skeleton className='h-8 w-8 inline-block' /></TableCell>
                    </TableRow>
                ))
              ) : displayedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhuma transação registrada para {getMonthName(selectedMonth)}.
                  </TableCell>
                </TableRow>
              ) : (
                displayedTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground text-xs">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">{t.name}<p className="text-xs text-muted-foreground font-normal">{t.description}</p></TableCell>
                    <TableCell>
                      <Badge
                        variant={t.type === 'income' ? 'default' : 'destructive'}
                      >
                        {t.type === 'income' ? 'Entrada' : 'Gasto'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {t.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTransaction(t.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
