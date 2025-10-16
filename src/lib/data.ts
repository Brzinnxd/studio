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
    name: 'Balas Baianas',
    description: 'Deliciosas balas de coco caramelizadas, o clássico que todos amam.',
    price: 25.0,
    image: 'bala-baiana',
    isFlagship: true,
  },
  {
    id: '2',
    name: 'Brigadeiro Gourmet',
    description: 'O tradicional brigadeiro com um toque sofisticado de chocolate belga.',
    price: 4.0,
    image: 'brigadeiro',
  },
  {
    id: '3',
    name: 'Beijinho de Coco',
    description: 'Doce de coco cremoso e suave, coberto com coco ralado fresco.',
    price: 3.5,
    image: 'beijinho',
  },
  {
    id: '4',
    name: 'Quindim',
    description: 'Uma sobremesa brilhante e irresistível com gema de ovo e coco.',
    price: 7.0,
    image: 'quindim',
  },
  {
    id: '5',
    name: 'Pavê de Chocolate',
    description: 'Camadas de creme e biscoito, finalizado com raspas de chocolate.',
    price: 18.0,
    image: 'pave',
  },
  {
    id: '6',
    name: 'Bolo de Pote',
    description: 'Bolo fofinho e recheio cremoso, na medida certa para sua vontade.',
    price: 12.0,
    image: 'bolo-de-pote',
  },
  {
    id: '7',
    name: 'Brownie Recheado',
    description: 'Brownie de chocolate com casquinha crocante e recheio de doce de leite.',
    price: 9.0,
    image: 'brownie',
  },
  {
    id: '8',
    name: 'Palha Italiana',
    description: 'A combinação perfeita de brigadeiro e biscoito triturado.',
    price: 6.0,
    image: 'palha-italiana',
  },
];
