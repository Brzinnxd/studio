export type Sweet = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isFlagship?: boolean;
  inventory?: number;
};

export type UserProfile = {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    isAdmin: boolean;
};

export type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  transferId?: string; // Add this line
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export type Transfer = {
  id: string;
  amount: number;
  fromAccount: 'personal' | 'business';
  toAccount: 'personal' | 'business';
  description: string;
  date: string;
};
