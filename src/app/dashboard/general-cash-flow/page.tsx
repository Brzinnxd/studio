'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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


export default function GeneralCashFlowPage() {
    const firestore = useFirestore();
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
    const [allMonths, setAllMonths] = useState<string[]>([]);

    const businessTransactionsCollection = useMemoFirebase(() => {
        return firestore ? collection(firestore, 'business_transactions') : null;
    }, [firestore]);

    const personalTransactionsCollection = useMemoFirebase(() => {
        return firestore ? collection(firestore, 'personal_transactions') : null;
    }, [firestore]);
    
    const {data: allBusinessTransactions, isLoading: isLoadingAllBusiness } = useCollection<Transaction>(businessTransactionsCollection);
    const {data: allPersonalTransactions, isLoading: isLoadingAllPersonal } = useCollection<Transaction>(personalTransactionsCollection);

    const monthlyBusinessQuery = useMemoFirebase(() => {
        if (!businessTransactionsCollection) return null;
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        return query(businessTransactionsCollection, where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
    }, [businessTransactionsCollection, selectedMonth]);

    const monthlyPersonalQuery = useMemoFirebase(() => {
        if (!personalTransactionsCollection) return null;
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        return query(personalTransactionsCollection, where('date', '>=', startDate.toISOString()), where('date', '<=', endDate.toISOString()));
    }, [personalTransactionsCollection, selectedMonth]);

    const { data: businessTransactions, isLoading: isLoadingBusinessMonth } = useCollection<Transaction>(monthlyBusinessQuery);
    const { data: personalTransactions, isLoading: isLoadingPersonalMonth } = useCollection<Transaction>(monthlyPersonalQuery);


    useEffect(() => {
        const allTxs = [...(allBusinessTransactions || []), ...(allPersonalTransactions || [])];
        if (allTxs.length > 0) {
            const months = new Set(allTxs.map(t => t.date.substring(0, 7)));
             const currentMonth = getCurrentMonthKey();
            if (!months.has(currentMonth)) {
                months.add(currentMonth);
            }
            setAllMonths(Array.from(months).sort().reverse());
        }
    }, [allBusinessTransactions, allPersonalTransactions]);
  
  const displayedTransactions = useMemo(() => {
      return [...(businessTransactions || []), ...(personalTransactions || [])]
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [businessTransactions, personalTransactions]);

  const businessIncome = useMemo(() => (businessTransactions || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [businessTransactions]);
  const businessExpense = useMemo(() => (businessTransactions || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [businessTransactions]);
  const personalIncome = useMemo(() => (personalTransactions || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [personalTransactions]);
  const personalExpense = useMemo(() => (personalTransactions || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [personalTransactions]);

  const totalIncome = businessIncome + personalIncome;
  const totalExpense = businessExpense + personalExpense;
  const netProfit = totalIncome - totalExpense;

  const chartData = [
        { name: 'Empresarial', Entradas: businessIncome, Gastos: businessExpense },
        { name: 'Pessoal', Entradas: personalIncome, Gastos: personalExpense },
    ];
    
  const isLoading = isLoadingAllBusiness || isLoadingAllPersonal || isLoadingBusinessMonth || isLoadingPersonalMonth;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Fluxo de Caixa Geral</h1>
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
                    {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                    <div className="text-2xl font-bold">
                    {totalIncome.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                    </div>
                    }
                    <Separator />
                     {isLoading ? <div className='space-y-2 pt-1'><Skeleton className='h-4 w-full'/><Skeleton className='h-4 w-full'/></div> :
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
              <CardContent className="space-y-2">
                 {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                 <div className="text-2xl font-bold">
                  {totalExpense.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
                }
                 <Separator />
                    {isLoading ? <div className='space-y-2 pt-1'><Skeleton className='h-4 w-full'/><Skeleton className='h-4 w-full'/></div> :
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
                    }
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido Total</CardTitle>
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
                {isLoading ? <div className='flex justify-center items-center h-[250px]'><Skeleton className='h-[250px] w-full' /></div> :
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" tickFormatter={(value) => `R$${value/1000}k`} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Legend />
                    <Bar dataKey="Entradas" fill="#22c55e" />
                    <Bar dataKey="Gastos" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
              }
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
              {isLoading ? (
                Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                        <TableCell><Skeleton className='h-5 w-40' /></TableCell>
                        <TableCell><Skeleton className='h-5 w-16' /></TableCell>
                        <TableCell className='text-right'><Skeleton className='h-5 w-24 inline-block' /></TableCell>
                    </TableRow>
                ))
              ) : displayedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
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

    