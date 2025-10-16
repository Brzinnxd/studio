'use client';

import { useState, useEffect } from 'react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
  Archive,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
};

type MonthlyReport = {
  month: string; // e.g., "2023-10"
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;
};

export default function CashFlowPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');


  useEffect(() => {
    // --- Load data from localStorage on component mount ---
    const storedReports = localStorage.getItem('monthlyReports');
    const storedTransactions = localStorage.getItem('transactions');
    const lastProcessedMonth = localStorage.getItem('lastProcessedMonth');
    const currentMonth = getCurrentMonthKey();

    const reports: MonthlyReport[] = storedReports
      ? JSON.parse(storedReports)
      : [];
    let currentTransactions: Transaction[] = storedTransactions
      ? JSON.parse(storedTransactions)
      : [];

    if (lastProcessedMonth && lastProcessedMonth !== currentMonth) {
      // --- Archive previous month and start a new one ---
      const prevMonthTotalIncome = currentTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
      const prevMonthTotalExpense = currentTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      const prevMonthNetProfit = prevMonthTotalIncome - prevMonthTotalExpense;

      const newReport: MonthlyReport = {
        month: lastProcessedMonth,
        transactions: currentTransactions,
        totalIncome: prevMonthTotalIncome,
        totalExpense: prevMonthTotalExpense,
        netProfit: prevMonthNetProfit,
      };
      reports.push(newReport);

      // Start new month with opening balance
      currentTransactions = [];
      if (prevMonthNetProfit > 0) {
        currentTransactions.push({
          id: new Date().toISOString(),
          name: 'Saldo Inicial',
          description: `Lucro líquido de ${lastProcessedMonth}`,
          amount: prevMonthNetProfit,
          type: 'income',
          date: new Date().toISOString(),
        });
      }
    }

    setTransactions(currentTransactions);
    setMonthlyReports(reports);
    localStorage.setItem('transactions', JSON.stringify(currentTransactions));
    localStorage.setItem('monthlyReports', JSON.stringify(reports));
    localStorage.setItem('lastProcessedMonth', currentMonth);
  }, []);
  
  useEffect(() => {
    // --- Save transactions to localStorage whenever they change ---
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);


  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || selectedMonth !== getCurrentMonthKey()) return;

    const newTransaction: Transaction = {
      id: new Date().toISOString(),
      name,
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };

    setTransactions([...transactions, newTransaction]);
    setName('');
    setDescription('');
    setAmount('');
  };

  const handleDeleteTransaction = (id: string) => {
    if (selectedMonth !== getCurrentMonthKey()) return; // Can't delete from archived reports
    setTransactions(transactions.filter((t) => t.id !== id));
  };
  
  const displayedTransactions = selectedMonth === getCurrentMonthKey() 
    ? transactions 
    : monthlyReports.find(r => r.month === selectedMonth)?.transactions || [];

  const totalIncome = displayedTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = displayedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const chartData = [
    {
      name: selectedMonth,
      entradas: totalIncome,
      gastos: totalExpense,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Fluxo de Caixa Empresarial</h1>
         <div className="flex items-center gap-4">
          <Label>Ver Relatório</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={getCurrentMonthKey()}>Mês Atual</SelectItem>
              {monthlyReports.map(report => (
                <SelectItem key={report.month} value={report.month}>
                  {report.month}
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
                  disabled={selectedMonth !== getCurrentMonthKey()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Bolo de chocolate para festa"
                  disabled={selectedMonth !== getCurrentMonthKey()}
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
                  disabled={selectedMonth !== getCurrentMonthKey()}
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
                  disabled={selectedMonth !== getCurrentMonthKey()}
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
              <Button type="submit" className="w-full" disabled={selectedMonth !== getCurrentMonthKey()}>
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
                <div className="text-2xl font-bold">
                  {totalIncome.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
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
                <div className="text-2xl font-bold">
                  {totalExpense.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Comparativo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <Legend />
                  <Bar dataKey="entradas" fill="#22c55e" name="Entradas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="#ef4444" name="Gastos" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              {displayedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhuma transação registrada para {selectedMonth}.
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
                        disabled={selectedMonth !== getCurrentMonthKey()}
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

    