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
