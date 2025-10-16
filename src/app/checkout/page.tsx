'use client';

import { useCart } from '@/context/cart-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CreditCard, QrCode } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export default function CheckoutPage() {
  const { cartItems } = useCart();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-3xl font-bold font-headline mb-4">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-8">Parece que você não adicionou nada para comprar.</p>
            <Button asChild>
                <a href="/">Voltar para o catálogo</a>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold font-headline">Finalizar Compra</h1>
        <p className="text-muted-foreground mt-2">
          Preencha seus dados para concluir o pedido.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" placeholder="(00) 00000-0000" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="zip">CEP</Label>
                <Input id="zip" placeholder="00000-000" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Sua rua, avenida..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input id="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" placeholder='Apto, Bloco...' />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" />
              </div>
              <div className="grid grid-cols-[2fr_1fr] gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input id="city" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input id="state" />
                </div>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="credit-card">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="credit-card"><CreditCard className='mr-2' /> Cartão de Crédito</TabsTrigger>
                        <TabsTrigger value="pix"><QrCode className='mr-2'/> Pix</TabsTrigger>
                    </TabsList>
                    <TabsContent value="credit-card" className='pt-4 space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor="card-number">Número do Cartão</Label>
                            <Input id="card-number" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="card-name">Nome no Cartão</Label>
                            <Input id="card-name" placeholder="Como está no cartão" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="card-expiry">Validade</Label>
                                <Input id="card-expiry" placeholder="MM/AA" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="card-cvv">CVV</Label>
                                <Input id="card-cvv" placeholder="123" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="pix" className='pt-4 flex flex-col items-center justify-center text-center'>
                         <div className="bg-muted rounded-md p-4">
                            <QrCode className="h-32 w-32 mx-auto" />
                        </div>
                        <p className='text-sm text-muted-foreground mt-4'>
                            Use a câmera do seu celular para escanear o QR Code e pagar via Pix.
                        </p>
                    </TabsContent>
                </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => {
                 const placeholder = PlaceHolderImages.find(
                (p) => p.id === item.image
              ) as ImagePlaceholder;
                return (
                    <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                        <div className='relative h-16 w-16 rounded-md overflow-hidden'>
                             <Image
                                src={placeholder.imageUrl}
                                alt={placeholder.description}
                                fill
                                className="object-cover"
                                data-ai-hint={placeholder.imageHint}
                                />
                        </div>
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                        </div>
                        </div>
                        <p className="font-medium">
                        {(item.price * item.quantity).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        })}
                        </p>
                    </div>
                );
              })}
              <Separator />
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
              <div className="flex justify-between">
                <p>Frete</p>
                <p>Grátis</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </CardContent>
          </Card>
          <Button className="w-full text-lg py-6">
            Pagar e Finalizar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
