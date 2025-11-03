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
  Search,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Input } from '@/components/ui/input';


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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    
    const businessCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'business_transactions');
    }, [firestore]);

    const personalCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'personal_transactions');
    }, [firestore]);

    const { data: businessTransactions, isLoading: isBusinessLoading } = useCollection<Transaction>(businessCollection);
    const { data: personalTransactions, isLoading: isPersonalLoading } = useCollection<Transaction>(personalCollection);

    const isLoading = isBusinessLoading || isPersonalLoading;

    const allMonths = useMemo(() => {
        const allTxs = [...(businessTransactions || []), ...(personalTransactions || [])];
        const months = new Set(allTxs.map(t => t.date.substring(0, 7)));
         const currentMonth = getCurrentMonthKey();
        if (!months.has(currentMonth)) {
            months.add(currentMonth);
        }
        return Array.from(months).sort().reverse();
    }, [businessTransactions, personalTransactions]);
  
  const filteredTransactions = useMemo(() => {
      const allMonthlyTxs = [...(businessTransactions || []), ...(personalTransactions || [])]
        .filter(t => t.date.substring(0, 7) === selectedMonth)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (!searchTerm) {
            return allMonthlyTxs;
        }

        const lowercasedTerm = searchTerm.toLowerCase();
        
        return allMonthlyTxs.filter(t => {
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            const type = t.type === 'income' ? 'receita' : 'despesa';

            switch (filterType) {
                case 'date':
                    return date.includes(lowercasedTerm);
                case 'name':
                    return t.name.toLowerCase().includes(lowercasedTerm) || (t.description || '').toLowerCase().includes(lowercasedTerm);
                case 'type':
                    return type.includes(lowercasedTerm);
                case 'amount':
                    return t.amount.toString().includes(lowercasedTerm);
                case 'all':
                default:
                    return t.name.toLowerCase().includes(lowercasedTerm) ||
                        (t.description || '').toLowerCase().includes(lowercasedTerm) ||
                        type.includes(lowercasedTerm) ||
                        date.includes(lowercasedTerm) ||
                        t.amount.toString().includes(lowercasedTerm);
            }
        });
  }, [businessTransactions, personalTransactions, selectedMonth, searchTerm, filterType]);

  const { businessIncome, businessExpense, personalIncome, personalExpense } = useMemo(() => {
    const bTxs = businessTransactions?.filter(t => t.date.substring(0, 7) === selectedMonth) || [];
    const pTxs = personalTransactions?.filter(t => t.date.substring(0, 7) === selectedMonth) || [];

    return {
      businessIncome: bTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      businessExpense: bTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      personalIncome: pTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      personalExpense: pTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    };
  }, [businessTransactions, personalTransactions, selectedMonth]);

  const totalIncome = businessIncome + personalIncome;
  const totalExpense = businessExpense + personalExpense;
  const netProfit = totalIncome - totalExpense;

  const chartData = [
        { name: 'Empresarial', Receitas: businessIncome, Despesas: businessExpense },
        { name: 'Pessoal', Receitas: personalIncome, Despesas: personalExpense },
    ];

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
                  Total de Receitas
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
                  Total de Despesas
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
                <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
                    <XAxis type="number" tickFormatter={(value) => `R$${value/1000}k`} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <Legend />
                    <Bar dataKey="Receitas" fill="#22c55e" />
                    <Bar dataKey="Despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
              }
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Histórico Geral de Transações do Mês</CardTitle>
                    <CardDescription>Todas as transações empresariais e pessoais.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filtrar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                            <SelectItem value="name">Nome</SelectItem>
                            <SelectItem value="type">Tipo</SelectItem>
                            <SelectItem value="amount">Valor</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Pesquisar transações..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
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
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                     {searchTerm ? 'Nenhuma transação encontrada.' : `Nenhuma transação registrada para ${getMonthName(selectedMonth)}.`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground text-xs">
                        {new Date(t.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">{t.name}<p className="text-xs text-muted-foreground font-normal">{t.description}</p></TableCell>
                    <TableCell>
                      <Badge
                        variant={t.type === 'income' ? 'default' : 'destructive'}
                      >
                        {t.type === 'income' ? 'Receita' : 'Despesa'}
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
