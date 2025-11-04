'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Sweet } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { ShoppingCart, Pencil, Upload, Link as LinkIcon } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Skeleton } from '@/components/ui/skeleton';

type DisplaySweet = Sweet & { newImageUrl?: string };

function ProductCard({
  sweet,
  onEdit,
}: {
  sweet: DisplaySweet;
  onEdit: (sweet: Sweet) => void;
}) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  let imageUrl: string;
  let imageAlt: string;
  let imageHint: string | undefined;

  // The `image` property from Firestore now holds the direct URL
  if (sweet.newImageUrl) {
    imageUrl = sweet.newImageUrl;
    imageAlt = sweet.name;
  } else {
    imageUrl = sweet.image;
    imageAlt = `Image of ${sweet.name}`;
    imageHint = 'product image';
  }
  
  const placeholder = PlaceHolderImages.find((p) => p.id === sweet.id);
  if (!imageUrl && placeholder) {
      imageUrl = placeholder.imageUrl;
      imageAlt = placeholder.description;
      imageHint = placeholder.imageHint;
  } else if (!imageUrl) {
      imageUrl = 'https://picsum.photos/seed/placeholder/600/400';
      imageAlt = 'Placeholder Image';
  }


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
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              data-ai-hint={imageHint}
              unoptimized // Use this if you are using external images with data URLs or from unconfigured hostnames
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
  sweet: DisplaySweet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSweet: DisplaySweet) => void;
}) {
  const [editedSweet, setEditedSweet] = useState<DisplaySweet | null>(sweet);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedSweet(sweet);
  }, [sweet]);

  if (!isOpen || !editedSweet) {
    return null;
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedSweet({ ...editedSweet, newImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSweet({ ...editedSweet, newImageUrl: e.target.value });
  };


  const handleSave = () => {
    if (editedSweet.newImageUrl) {
        // The image URL is now part of the sweet object itself
        editedSweet.image = editedSweet.newImageUrl;
    }
    const { newImageUrl, ...sweetToSave } = editedSweet;
    onSave(sweetToSave);
    onClose();
  };
  
  let imageUrl = editedSweet.newImageUrl || editedSweet.image;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes do produto aqui. Clique em salvar quando
            terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="relative aspect-[3/2] w-full rounded-md overflow-hidden border">
                    {imageUrl ? (
                        <Image src={imageUrl} alt="Pré-visualização do produto" fill className="object-cover" unoptimized/>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                            Sem imagem
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Carregar do Computador
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">OU</span>
                        </div>
                    </div>
                    
                    <div className='relative'>
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cole o link da imagem aqui"
                            className="pl-9"
                            value={editedSweet.newImageUrl || editedSweet.image || ''}
                            onChange={handleImageUrlChange}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
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
              <div className="space-y-2">
                <Label htmlFor="description">
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
              <div className="space-y-2">
                <Label htmlFor="price">
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
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'products');
  }, [firestore]);

  const { data: sweets, isLoading } = useCollection<Sweet>(productsCollection);

  const [editingSweet, setEditingSweet] = useState<DisplaySweet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (sweet: DisplaySweet) => {
    setEditingSweet(sweet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSweet(null);
  };

  const handleSaveSweet = (updatedSweet: Sweet) => {
    if (!firestore) return;
    const productRef = doc(firestore, 'products', updatedSweet.id);
    setDocumentNonBlocking(productRef, updatedSweet, { merge: true });
  };
  
  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight md:text-5xl">
                Nosso Doce Catálogo
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Explore nossa seleção de doces artesanais, feitos com amor e os
                melhores ingredientes.
                </p>
            </header>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden">
                        <CardHeader className="p-0">
                           <Skeleton className="aspect-[3/2] w-full" />
                        </CardHeader>
                        <CardContent className="flex-grow p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex items-center justify-between">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight">
          Nosso Doce Catálogo
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Explore nossa seleção de doces artesanais, feitos com amor e os
          melhores ingredientes.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sweets?.map((sweet) => (
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
