'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  AlertTriangle,
  Search,
  Pencil,
  Camera,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { analyzeReceiptAction } from './actions';


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

function EditTransactionModal({ transaction, isOpen, onClose, onSave }: { transaction: Transaction | null, isOpen: boolean, onClose: () => void, onSave: (updatedTransaction: Transaction) => void }) {
    const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(transaction);

    useEffect(() => {
        setEditedTransaction(transaction);
    }, [transaction]);

    if (!isOpen || !editedTransaction) {
        return null;
    }

    const handleSave = () => {
        if (editedTransaction) {
            onSave(editedTransaction);
        }
        onClose();
    };

    const inputStyle = {
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='bg-card'>
                <DialogHeader>
                    <DialogTitle>Editar Transação</DialogTitle>
                    <DialogDescription>
                        Faça alterações na sua transação aqui. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nome</Label>
                        <Input id="edit-name" style={inputStyle} value={editedTransaction.name} onChange={(e) => setEditedTransaction({ ...editedTransaction, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Descrição</Label>
                        <Input id="edit-description" style={inputStyle} value={editedTransaction.description} onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-amount">Valor</Label>
                        <Input id="edit-amount" type="number" style={inputStyle} value={editedTransaction.amount} onChange={(e) => setEditedTransaction({ ...editedTransaction, amount: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <RadioGroup value={editedTransaction.type} onValueChange={(value) => setEditedTransaction({ ...editedTransaction, type: value as 'income' | 'expense' })} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="income" id="edit-income" />
                                <Label htmlFor="edit-income">Receita</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="expense" id="edit-expense" />
                                <Label htmlFor="edit-expense">Despesa</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ScanReceiptModal({ isOpen, onClose, onAmountExtracted }: { isOpen: boolean, onClose: () => void, onAmountExtracted: (amount: number) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) return;

        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setHasCameraPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Acesso à Câmera Negado',
                    description: 'Por favor, habilite a permissão da câmera nas configurações do seu navegador para usar esta função.',
                });
            }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [isOpen, toast]);

    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        setIsAnalyzing(true);
        toast({ title: 'Analisando imagem...', description: 'Aguarde enquanto lemos a nota fiscal.' });


        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            
            const result = await analyzeReceiptAction({ photoDataUri: dataUri });

            if (result.error) {
                toast({ variant: 'destructive', title: 'Erro na Análise', description: result.error });
            } else if (result.totalAmount !== undefined) {
                onAmountExtracted(result.totalAmount);
                toast({ title: 'Sucesso!', description: `Valor R$ ${result.totalAmount.toFixed(2)} extraído.` });
                onClose();
            }
        }
        setIsAnalyzing(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Escanear Nota Fiscal</DialogTitle>
                    <DialogDescription>
                        Posicione a nota fiscal na frente da câmera e capture a imagem.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                       <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                       {hasCameraPermission === false && (
                           <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Acesso à Câmera Necessário</AlertTitle>
                                <AlertDescription>
                                    Permita o acesso à câmera para escanear a nota fiscal.
                                </AlertDescription>
                            </Alert>
                       )}
                    </div>
                     <canvas ref={canvasRef} className="hidden" />
                </div>
                <DialogFooter>
                     <Button onClick={handleCapture} disabled={!hasCameraPermission || isAnalyzing}>
                        {isAnalyzing ? 'Analisando...' : 'Capturar Foto'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function CashFlowPage() {
  const firestore = useFirestore();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  
  const transactionsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'business_transactions');
  }, [firestore]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsCollection);

  const allMonths = useMemo(() => {
    const months = new Set(transactions?.map(t => t.date.substring(0, 7)) || []);
    const currentMonth = getCurrentMonthKey();
    if (!months.has(currentMonth)) {
      months.add(currentMonth);
    }
    return Array.from(months).sort().reverse();
  }, [transactions]);


  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !transactionsCollection) return;

    const newTransaction: Omit<Transaction, 'id'> = {
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
  
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };
  
  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'business_transactions', updatedTransaction.id);
    setDocumentNonBlocking(docRef, updatedTransaction, { merge: true });
  }

  const handleDeleteTransaction = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'business_transactions', id);
    deleteDocumentNonBlocking(docRef);
  };

  const filteredTransactions = useMemo(() => {
    const monthlyTransactions = transactions?.filter(t => t.date.substring(0, 7) === selectedMonth) || [];
    if (!searchTerm) {
        return monthlyTransactions;
    }
    const lowercasedTerm = searchTerm.toLowerCase();

    return monthlyTransactions.filter(t => {
        const date = new Date(t.date).toLocaleDateString('pt-BR');
        const type = t.type === 'income' ? 'receita' : 'despesa';

        switch (filterType) {
            case 'date':
                return date.includes(lowercasedTerm);
            case 'name':
                return t.name.toLowerCase().includes(lowercasedTerm) || t.description.toLowerCase().includes(lowercasedTerm);
            case 'type':
                return type.includes(lowercasedTerm);
            case 'amount':
                return t.amount.toString().includes(lowercasedTerm);
            case 'all':
            default:
                return t.name.toLowerCase().includes(lowercasedTerm) ||
                       t.description.toLowerCase().includes(lowercasedTerm) ||
                       type.includes(lowercasedTerm) ||
                       date.includes(lowercasedTerm) ||
                       t.amount.toString().includes(lowercasedTerm);
        }
    });
  }, [transactions, selectedMonth, searchTerm, filterType]);

  const handleClearMonth = () => {
    if (!firestore) return;
    const monthlyTransactions = transactions?.filter(t => t.date.substring(0, 7) === selectedMonth) || [];
    monthlyTransactions.forEach(t => {
        const docRef = doc(firestore, 'business_transactions', t.id);
        deleteDocumentNonBlocking(docRef);
    });
  }
  
  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    const txs = transactions?.filter(t => t.date.substring(0, 7) === selectedMonth) || [];
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
  }, [transactions, selectedMonth]);


  const chartData = [
    { name: 'Receitas', value: totalIncome },
    { name: 'Despesas', value: totalExpense },
  ];

  const COLORS = ['#22c55e', '#ef4444'];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Fluxo de Caixa Empresarial</h1>
         <div className="flex items-center gap-4">
          <div className='flex items-center gap-2'>
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
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={!filteredTransactions || filteredTransactions.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar Mês
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className='flex items-center gap-2'><AlertTriangle /> Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as <strong>{(transactions?.filter(t => t.date.substring(0, 7) === selectedMonth) || []).length} transações</strong> de <strong>{getMonthName(selectedMonth)}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearMonth}>Confirmar Exclusão</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Adicionar Transação</CardTitle>
              <CardDescription>
                Registre uma nova receita ou despesa no mês atual.
              </CardDescription>
            </div>
             <Button variant="outline" size="icon" onClick={() => setIsScanModalOpen(true)}>
              <Camera className="h-4 w-4" />
              <span className="sr-only">Escanear Nota Fiscal</span>
            </Button>
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
                    <Label htmlFor="income">Receita</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Despesa</Label>
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
                  Total de Receitas
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
                  Total de Despesas
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
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Transações do Mês</CardTitle>
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
                <TableHead className="text-center">Ações</TableHead>
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
                        <TableCell className='text-center'><Skeleton className='h-8 w-20 inline-block' /></TableCell>
                    </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
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
                    <TableCell className="text-center">
                       <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                            variant="ghost"
                            size="icon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente a transação.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTransaction(t.id)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveTransaction}
      />
      <ScanReceiptModal 
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onAmountExtracted={(extractedAmount) => {
            setAmount(extractedAmount.toString());
            setType('expense');
            setName('Despesa da Nota Fiscal');
        }}
      />
    </div>
  );
}
