
export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  type: string; // 'Apartamento', 'Casa', etc.
  category: 'venda' | 'aluguel';
  price: number;
  neighborhood: string;
  city: string;
  state: string; // UF, e.g., 'SP', 'RJ'
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrls: string[]; // Base64 encoded strings
  mainImageIndex: number;
  isFeatured: boolean;
}