'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sweets as initialSweets, type Sweet } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { ShoppingCart, Pencil } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

function ProductCard({
  sweet,
  onEdit,
}: {
  sweet: Sweet;
  onEdit: (sweet: Sweet) => void;
}) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const placeholder = PlaceHolderImages.find(
    (p) => p.id === sweet.image
  ) as ImagePlaceholder;

  const handleAddToCart = () => {
    addToCart(sweet);
    toast({
      title: 'Produto adicionado!',
      description: `${sweet.name} foi adicionado ao seu carrinho.`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/2] w-full">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={placeholder.description}
              fill
              className="object-cover"
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg font-headline">
            {sweet.name}
          </CardTitle>
          {sweet.isFlagship && <Badge variant="secondary">Carro-chefe</Badge>}
        </div>
        <CardDescription className="mt-2 text-sm text-muted-foreground">
          {sweet.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <p className="text-lg font-semibold">
          {sweet.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Editar produto"
            onClick={() => onEdit(sweet)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleAddToCart}
            size="icon"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCart />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function EditProductModal({
  sweet,
  isOpen,
  onClose,
  onSave,
}: {
  sweet: Sweet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSweet: Sweet) => void;
}) {
  const [editedSweet, setEditedSweet] = useState<Sweet | null>(sweet);

  useEffect(() => {
    setEditedSweet(sweet);
  }, [sweet]);

  if (!isOpen || !editedSweet) {
    return null;
  }

  const handleSave = () => {
    onSave(editedSweet);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes do produto aqui. Clique em salvar quando
            terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={editedSweet.name}
              onChange={(e) =>
                setEditedSweet({ ...editedSweet, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={editedSweet.description}
              onChange={(e) =>
                setEditedSweet({ ...editedSweet, description: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Preço
            </Label>
            <Input
              id="price"
              type="number"
              value={editedSweet.price}
              onChange={(e) =>
                setEditedSweet({
                  ...editedSweet,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="col-span-3"
            />
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


export default function CatalogPage() {
  const [sweets, setSweets] = useState<Sweet[]>(initialSweets);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSweet(null);
  };

  const handleSaveSweet = (updatedSweet: Sweet) => {
    setSweets(currentSweets => 
      currentSweets.map(s => s.id === updatedSweet.id ? updatedSweet : s)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary-foreground md:text-5xl">
          Nosso Doce Catálogo
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore nossa seleção de doces artesanais, feitos com amor e os
          melhores ingredientes.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sweets.map((sweet) => (
          <ProductCard key={sweet.id} sweet={sweet} onEdit={handleEditClick} />
        ))}
      </div>
      <EditProductModal 
        sweet={editingSweet}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSweet}
      />
    </div>
  );
}
