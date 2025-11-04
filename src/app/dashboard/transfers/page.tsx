'use client';

import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRightLeft,
  Briefcase,
  User,
  Trash2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Transfer, Transaction } from '@/lib/types';


export default function TransfersPage() {
  const firestore = useFirestore();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState<'business' | 'personal' | ''>('');
  
  const transfersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'transfers');
  }, [firestore]);

  const businessTransactionsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'business_transactions');
  }, [firestore]);

  const personalTransactionsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'personal_transactions');
  }, [firestore]);


  const { data: transfers, isLoading } = useCollection<Transfer>(transfersCollection);

  const handleAddTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !fromAccount || !transfersCollection || !businessTransactionsCollection || !personalTransactionsCollection) return;

    const transferAmount = parseFloat(amount);
    const toAccount = fromAccount === 'business' ? 'personal' : 'business';
    const date = new Date().toISOString();

    const newTransfer: Omit<Transfer, 'id'> = {
      description,
      amount: transferAmount,
      fromAccount,
      toAccount,
      date: date,
    };
    
    // 1. Record the transfer itself
    addDocumentNonBlocking(transfersCollection, newTransfer);

    // 2. Create the expense transaction for the 'from' account
    const expenseTransaction: Omit<Transaction, 'id'> = {
        name: `Transferência para conta ${toAccount}`,
        description: description,
        amount: transferAmount,
        type: 'expense',
        date: date
    }
    if (fromAccount === 'business') {
        addDocumentNonBlocking(businessTransactionsCollection, expenseTransaction);
    } else {
        addDocumentNonBlocking(personalTransactionsCollection, expenseTransaction);
    }

    // 3. Create the income transaction for the 'to' account
    const incomeTransaction: Omit<Transaction, 'id'> = {
        name: `Transferência da conta ${fromAccount}`,
        description: description,
        amount: transferAmount,
        type: 'income',
        date: date
    }
    if (toAccount === 'business') {
        addDocumentNonBlocking(businessTransactionsCollection, incomeTransaction);
    } else {
        addDocumentNonBlocking(personalTransactionsCollection, incomeTransaction);
    }


    setDescription('');
    setAmount('');
    setFromAccount('');
  };

  const handleDeleteTransfer = (id: string) => {
    if (!firestore) return;
    // Note: This only deletes the transfer record, not the associated transactions.
    // For a real-world app, you might want to implement a more robust deletion logic.
    const docRef = doc(firestore, 'transfers', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  const { totalPersonalToBusiness, totalBusinessToPersonal } = useMemo(() => {
    const txs = transfers || [];
    const personalToBusiness = txs
      .filter((t) => t.fromAccount === 'personal')
      .reduce((acc, t) => acc + t.amount, 0);
    const businessToPersonal = txs
      .filter((t) => t.fromAccount === 'business')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalPersonalToBusiness: personalToBusiness,
      totalBusinessToPersonal: businessToPersonal,
    };
  }, [transfers]);

  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Transferências entre Contas</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Registrar Transferência</CardTitle>
            <CardDescription>
              Use para despesas pessoais com dinheiro da empresa e vice-versa.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddTransfer}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Compra de material de escritório"
                  required
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
                <Label>Dinheiro gasto da conta...</Label>
                <Select value={fromAccount} onValueChange={(value) => setFromAccount(value as 'business' | 'personal')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">
                        <div className='flex items-center gap-2'><Briefcase className='h-4 w-4' /> Empresarial</div>
                    </SelectItem>
                    <SelectItem value="personal">
                        <div className='flex items-center gap-2'><User className='h-4 w-4' /> Pessoal</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Registrar Transferência
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pessoal usado para Empresa
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                <div className="text-2xl font-bold">
                  {totalPersonalToBusiness.toLocaleString('pt-BR', {
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
                  Total da Empresa usado para Pessoal
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className='h-8 w-3/4' /> :
                <div className="text-2xl font-bold">
                  {totalBusinessToPersonal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
                }
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transferências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Movimentação</TableHead>
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
                          <TableCell><Skeleton className='h-5 w-48' /></TableCell>
                          <TableCell className='text-right'><Skeleton className='h-5 w-24 inline-block' /></TableCell>
                          <TableCell className='text-right'><Skeleton className='h-8 w-8 inline-block' /></TableCell>
                      </TableRow>
                  ))
                ) : !transfers || transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Nenhuma transferência registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-muted-foreground text-xs">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{t.fromAccount === 'business' ? 'Empresa' : 'Pessoal'}</Badge>
                          <ArrowRightLeft className='h-3 w-3 text-muted-foreground' />
                          <Badge>{t.toAccount === 'business' ? 'Empresa' : 'Pessoal'}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {t.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransfer(t.id)}
                          title="Excluir apenas o registro do histórico"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
