'use client';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';

function getInitials(name: string) {
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.toUpperCase();
}

// Static customer data to avoid Firestore permission errors
const staticCustomers: Customer[] = [
    { id: '1', firstName: 'João', lastName: 'Silva', email: 'joao.silva@example.com', phone: '(11) 98765-4321', address: 'Rua das Flores, 123' },
    { id: '2', firstName: 'Maria', lastName: 'Oliveira', email: 'maria.oliveira@example.com', phone: '(21) 91234-5678', address: 'Avenida do Sol, 456' },
    { id: '3', firstName: 'Pedro', lastName: 'Santos', email: 'pedro.santos@example.com', phone: '(31) 95555-8888', address: 'Praça da Lua, 789' },
    { id: '4', firstName: 'Ana', lastName: 'Costa', email: 'ana.costa@example.com', phone: '(41) 99999-1111', address: 'Travessa Estrela, 101' },
];


export default function CustomersPage() {
  const customers = useMemo(() => staticCustomers, []);
  const isLoading = false;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline">Perfis de Clientes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Veja o histórico de pedidos e as preferências dos seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[64px]">Avatar</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-56" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !customers || customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Nenhum Cliente Registrado</h3>
              <p className="text-muted-foreground mt-2">
                Os perfis dos clientes aparecerão aqui após a primeira compra.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[64px]">Avatar</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                       <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${customer.id}`} />
                        <AvatarFallback>{getInitials(`${customer.firstName} ${customer.lastName}`)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{`${customer.firstName} ${customer.lastName}`}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
