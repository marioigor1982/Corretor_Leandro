
export interface User {
  name: string;
  email: string;
  picture: string;
}

// Add a type for Firestore Timestamps to avoid using 'any'
export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
  toMillis: () => number;
}


export interface Property {
  id: string; // Changed from number to string for Firestore
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
  imageUrls: string[]; // URLs from Firebase Storage
  mainImageIndex: number;
  isFeatured: boolean;
  createdAt?: FirebaseTimestamp;
}