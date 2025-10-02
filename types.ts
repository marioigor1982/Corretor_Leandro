
export interface Property {
  id: number;
  title: string;
  description: string;
  type: string; // 'Apartamento', 'Casa', etc.
  category: 'venda' | 'aluguel';
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrls: string[]; // Base64 encoded strings
  mainImageIndex: number;
}
