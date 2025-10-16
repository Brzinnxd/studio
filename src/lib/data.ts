export type Sweet = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isFlagship?: boolean;
};

export const sweets: Sweet[] = [
  {
    id: '1',
    name: 'Bala Baiana',
    description: 'Deliciosas balas de coco caramelizadas, o clássico que todos amam.',
    price: 25.0,
    image: 'bala-baiana',
    isFlagship: true,
  },
  {
    id: '2',
    name: 'Bolo de pote',
    description: 'Bolo fofinho e recheio cremoso, na medida certa para sua vontade.',
    price: 12.0,
    image: 'bolo-de-pote',
  },
  {
    id: '3',
    name: 'Cocadas',
    description: 'Doce de coco cremoso e suave, em pedaços generosos.',
    price: 5.0,
    image: 'cocada',
  },
  {
    id: '4',
    name: 'Pé de moleque',
    description: 'O clássico doce de amendoim, crocante e delicioso.',
    price: 4.0,
    image: 'pe-de-moleque',
  },
  {
    id: '5',
    name: 'Pé de moça',
    description: 'Uma versão mais macia e cremosa do pé de moleque.',
    price: 4.5,
    image: 'pe-de-moca',
  },
  {
    id: '6',
    name: 'Morango do amor',
    description: 'Morango coberto com uma casquinha de caramelo crocante.',
    price: 8.0,
    image: 'morango-do-amor',
  },
  {
    id: '7',
    name: 'Musse de maracujá',
    description: 'Leve, aerado e com o azedinho característico da fruta.',
    price: 10.0,
    image: 'mousse-de-maracuja',
  },
  {
    id: '8',
    name: 'Espetinho de morango',
    description: 'Morangos frescos com cobertura de chocolate.',
    price: 7.0,
    image: 'espetinho-de-morango',
  },
  {
    id: '9',
    name: 'Bombom de chocolate',
    description: 'Bombons de chocolate recheados com sabores variados.',
    price: 3.0,
    image: 'bombom-de-chocolate',
  },
];