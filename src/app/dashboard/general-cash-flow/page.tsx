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
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
  Briefcase,
  User,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
    const [chartData, setChartData] = useState<any[]>([]);
    const [businessIncome, setBusinessIncome] = useState(0);
    const [businessExpense, setBusinessExpense] = useState(0);
    const [personalIncome, setPersonalIncome] = useState(0);
    const [personalExpense, setPersonalExpense] = useState(0);


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

    const isCurrentMonth = selectedMonth === getCurrentMonthKey();

    const currentBusinessTxs = isCurrentMonth ? businessTransactions : businessReports.find(r => r.month === selectedMonth)?.transactions || [];
    const currentPersonalTxs = isCurrentMonth ? personalTransactions : personalReports.find(r => r.month === selectedMonth)?.transactions || [];
    
    const combinedTransactions = [...currentBusinessTxs, ...currentPersonalTxs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
    
    const reports = Array.from(combinedReportsMap.values());
    if (isCurrentMonth) {
        const currentMonthReport = reports.find(r => r.month === getCurrentMonthKey());
        if (!currentMonthReport) {
             const currentMonthTotalIncome = combinedTransactions
                .filter((t) => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);
              const currentMonthTotalExpense = combinedTransactions
                .filter((t) => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);
        }
    }
    setAllMonthlyReports(reports);

    // Prepare data for bar chart and cards
    const busIncome = currentBusinessTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const busExpense = currentBusinessTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const persIncome = currentPersonalTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const persExpense = currentPersonalTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    setBusinessIncome(busIncome);
    setBusinessExpense(busExpense);
    setPersonalIncome(persIncome);
    setPersonalExpense(persExpense);

    setChartData([
        { name: 'Empresarial', Entradas: busIncome, Gastos: busExpense },
        { name: 'Pessoal', Entradas: persIncome, Gastos: persExpense },
    ]);


  }, [selectedMonth]);
  
  const displayedTransactions = allTransactions;

  const totalIncome = businessIncome + personalIncome;
  const totalExpense = businessExpense + personalExpense;
  const netProfit = totalIncome - totalExpense;
  
  const uniqueMonths = [...new Set(allMonthlyReports.map(r => r.month))].sort().reverse();


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
                <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">
                    {totalIncome.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                    </div>
                    <Separator />
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div className='flex justify-between items-center'>
                            <span className='flex items-center gap-1'><Briefcase className='h-3 w-3'/> Empresarial</span>
                            <span>{businessIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='flex items-center gap-1'><User className='h-3 w-3'/> Pessoal</span>
                            <span>{personalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>
                        </div>
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
              <CardContent className="space-y-2">
                 <div className="text-2xl font-bold">
                  {totalExpense.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
                 <Separator />
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div className='flex justify-between items-center'>
                            <span className='flex items-center gap-1'><Briefcase className='h-3 w-3'/> Empresarial</span>
                            <span>{businessExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='flex items-center gap-1'><User className='h-3 w-3'/> Pessoal</span>
                            <span>{personalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}</span>
                        </div>
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
                 <p className="text-xs text-muted-foreground pt-2">
                    O balanço consolidado de suas finanças.
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral Consolidada do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$${value}`} />
                    <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Legend />
                    <Bar dataKey="Entradas" fill="#22c55e" />
                    <Bar dataKey="Gastos" fill="#ef4444" />
                </BarChart>
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

    