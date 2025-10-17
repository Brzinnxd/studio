'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link as LinkIcon, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const productSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('O preço deve ser um número positivo.')
  ),
  inventory: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(0, 'O estoque não pode ser negativo.')
  ),
  isFlagship: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    // In a real app, you would upload this to a service like Firebase Storage
    // and get back a URL. For now, we'll use a data URL for local preview.
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O serviço de banco de dados não está disponível.',
      });
      return;
    }

    if (!imageUrl) {
      toast({
        variant: 'destructive',
        title: 'Imagem faltando',
        description: 'Por favor, adicione uma imagem para o produto.',
      });
      return;
    }

    const productsCollection = collection(firestore, 'products');
    const newProduct = {
      ...data,
      image: imageUrl, // For simplicity, storing URL directly.
    };

    addDocumentNonBlocking(productsCollection, newProduct);

    toast({
      title: 'Sucesso!',
      description: `Produto "${data.name}" adicionado ao catálogo.`,
    });
    reset();
    setImageUrl('');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Adicionar Novo Produto</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os detalhes abaixo para adicionar um novo doce ao seu catálogo.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Produto</CardTitle>
            <CardDescription>
              Forneça as informações do produto, incluindo nome, preço e uma imagem.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  placeholder="Ex: Bala Baiana"
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o produto, seus ingredientes, etc."
                  {...register('description')}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    {...register('price')}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Estoque Inicial</Label>
                  <Input
                    id="inventory"
                    type="number"
                    placeholder="100"
                    {...register('inventory')}
                  />
                  {errors.inventory && <p className="text-sm text-destructive">{errors.inventory.message}</p>}
                </div>
              </div>
               <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="isFlagship" {...register('isFlagship')} />
                    <label
                        htmlFor="isFlagship"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Marcar como carro-chefe
                    </label>
                </div>
            </div>
            
            <div className="space-y-2">
              <Label>Imagem do Produto</Label>
              <div className="relative aspect-[3/2] w-full rounded-md overflow-hidden border-2 border-dashed border-muted flex items-center justify-center">
                {imageUrl ? (
                  <Image src={imageUrl} alt="Pré-visualização do produto" fill className="object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Upload className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm">Arraste uma imagem ou clique para selecionar</p>
                  </div>
                )}
                 <Input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
              </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">OU</span>
                    </div>
                </div>
                <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cole um link de imagem aqui"
                        className="pl-9"
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isUploading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isUploading ? 'Processando Imagem...' : 'Adicionar Produto'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
