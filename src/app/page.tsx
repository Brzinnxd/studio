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
import { sweets } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

function ProductCard({ sweet }: { sweet: (typeof sweets)[0] }) {
  const placeholder = PlaceHolderImages.find(
    (p) => p.id === sweet.image
  ) as ImagePlaceholder;

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description}
            fill
            className="object-cover"
            data-ai-hint={placeholder.imageHint}
          />
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
        <Button>Fazer Pedido</Button>
      </CardFooter>
    </Card>
  );
}

export default function CatalogPage() {
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
          <ProductCard key={sweet.id} sweet={sweet} />
        ))}
      </div>
    </div>
  );
}
