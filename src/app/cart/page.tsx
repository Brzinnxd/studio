'use client';

import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<string[]>(
    cartItems.map((item) => item.id)
  );

  const handleSelectItem = (itemId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    if (value === '') {
        // Do not update quantity when input is empty to allow user to type
    } else {
      const newQuantity = parseInt(value, 10);
      if (!isNaN(newQuantity) && newQuantity > 0) {
        updateQuantity(itemId, newQuantity);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.value = '';
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, itemId: string) => {
    if (e.target.value === '') {
        updateQuantity(itemId, 1);
    } else {
        const newQuantity = parseInt(e.target.value, 10);
        if (!isNaN(newQuantity) && newQuantity > 0) {
            updateQuantity(itemId, newQuantity);
        } else {
            updateQuantity(itemId, 1);
        }
    }
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const total = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Meu Carrinho</h1>
          <p className="text-muted-foreground mt-2">
            Revise os itens do seu pedido antes de finalizar a compra.
          </p>
        </div>
        {cartItems.length > 0 && (
          <Button variant="outline" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar Carrinho
          </Button>
        )}
      </header>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Seu carrinho está vazio</h3>
            <p className="text-muted-foreground mt-2">
              Adicione alguns doces deliciosos do nosso catálogo!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="selectAll"
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  onCheckedChange={(checked) =>
                    handleSelectAll(checked as boolean)
                  }
                />
                <label htmlFor="selectAll" className="text-sm font-medium">
                  Selecionar todos
                </label>
              </div>
            </div>
            {cartItems.map((item) => {
              const placeholder = PlaceHolderImages.find(
                (p) => p.id === item.image
              ) as ImagePlaceholder;
              return (
                <Card key={item.id} className="flex items-center gap-4 p-4">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item.id, checked as boolean)
                    }
                  />
                  <div className="relative h-24 w-24 rounded-md overflow-hidden">
                    <Image
                      src={placeholder.imageUrl}
                      alt={placeholder.description}
                      fill
                      className="object-cover"
                      data-ai-hint={placeholder.imageHint}
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold">{item.name}</h4>
                    <div className="flex items-center border rounded-md w-fit mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="text"
                        className="h-8 w-12 text-center border-0 focus-visible:ring-0 p-0"
                        defaultValue={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        onFocus={handleFocus}
                        onBlur={(e) => handleBlur(e, item.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">
                      {(item.price * item.quantity).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <CardDescription>
                  Confira o total e finalize sua compra.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({selectedCartItems.length}{' '}
                    {selectedCartItems.length === 1 ? 'item' : 'itens'})
                  </span>
                  <span>
                    {total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={selectedItems.length === 0}>
                  Finalizar Compra
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}