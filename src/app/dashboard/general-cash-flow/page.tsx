'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
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

export default function GeneralCashFlowPage() {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allMonthlyReports, setAllMonthlyReports] = useState<MonthlyReport[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());


  useEffect(() => {
    // --- Load data from localStorage on component mount ---
    const storedBusinessReports = localStorage.getItem('monthlyReports');
    const storedBusinessTransactions = localStorage.getItem('transactions');
    const storedPersonalReports = localStorage.getItem('personalMonthlyReports');
    const storedPersonalTransactions = localStorage.getItem('personalTransactions');
    
    const businessReports: MonthlyReport[] = storedBusinessReports ? JSON.parse(storedBusinessReports) : [];
    const businessTransactions: Transaction[] = storedBusinessTransactions ? JSON.parse(storedBusinessTransactions) : [];
    const personalReports: MonthlyReport[] = storedPersonalReports ? JSON.parse(storedPersonalReports) : [];
    const personalTransactions: Transaction[] = storedPersonalTransactions ? JSON.parse(storedPersonalTransactions) : [];

    const combinedTransactions = [...businessTransactions, ...personalTransactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setAllTransactions(combinedTransactions);

    const combinedReportsMap = new Map<string, MonthlyReport>();

    [...businessReports, ...personalReports].forEach(report => {
        const existingReport = combinedReportsMap.get(report.month);
        if (existingReport) {
            existingReport.transactions.push(...report.transactions);
            existingReport.totalIncome += report.totalIncome;
            existingReport.totalExpense += report.totalExpense;
            existingReport.netProfit += report.netProfit;
            existingReport.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else {
            combinedReportsMap.set(report.month, { ...report });
        }
    });

    setAllMonthlyReports(Array.from(combinedReportsMap.values()));

  }, [selectedMonth]);
  
  const displayedTransactions = selectedMonth === getCurrentMonthKey() 
    ? allTransactions 
    : allMonthlyReports.find(r => r.month === selectedMonth)?.transactions || [];

  const totalIncome = displayedTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = displayedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const chartData = [
    { name: 'Entradas', value: totalIncome },
    { name: 'Gastos', value: totalExpense },
  ];

  const COLORS = ['#22c55e', '#ef4444'];
  
  const uniqueMonths = [...new Set(allMonthlyReports.map(r => r.month))];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Fluxo de Caixa Geral</h1>
         <div className="flex items-center gap-4">
          <Label>Ver Relatório</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={getCurrentMonthKey()}>Mês Atual</SelectItem>
              {uniqueMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
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
                <CardTitle className="text-sm font-medium">Lucro Líquido Total</CardTitle>
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
              <CardTitle>Visão Geral Consolidada do Mês</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Geral de Transações do Mês</CardTitle>
          <CardDescription>Todas as transações empresariais e pessoais.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
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
