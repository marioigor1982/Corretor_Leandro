import { Property } from '../types';

// --- MOCK DATABASE ---
// In a real application, this data would live on a server database.
// We are simulating it here with a local variable and localStorage for persistence during development.
const DB_KEY = 'leandroCorretorProperties';

let properties: Property[] = [];

const initializeData = () => {
  try {
    const storedData = localStorage.getItem(DB_KEY);
    if (storedData) {
      properties = JSON.parse(storedData);
    } else {
      // If no data in localStorage, initialize with some mock data.
      properties = [
        {
          id: 1,
          title: "Apartamento Aconchegante no Centro",
          description: "Lindo apartamento com 2 quartos, sala ampla e cozinha planejada. Perfeito para quem busca conforto e praticidade no coração da cidade.",
          type: "Apartamento",
          category: "venda",
          price: 280000,
          neighborhood: "Centro",
          city: "São Paulo",
          bedrooms: 2,
          bathrooms: 1,
          area: 65,
          imageUrls: ["https://i.postimg.cc/Vv9Td2sV/6e7e5047-6cb8-44ec-9223-55d354d7eb6e.jpg", "https://i.postimg.cc/66CFj4V2/f16ad66f-5aa9-4348-b63f-6a9127bee08d.jpg"],
          mainImageIndex: 0,
          isFeatured: true,
        },
        {
          id: 2,
          title: "Casa Espaçosa com Quintal",
          description: "Casa incrível com 3 suítes, área gourmet e um quintal espaçoso para sua família. Localizada em um bairro tranquilo e arborizado.",
          type: "Casa",
          category: "venda",
          price: 550000,
          neighborhood: "Jardim das Flores",
          city: "Santo André",
          bedrooms: 3,
          bathrooms: 4,
          area: 150,
          imageUrls: ["https://i.postimg.cc/qqcYzWBZ/93ebed18-1f23-47df-8ec9-f4727215f637.jpg", "https://i.postimg.cc/5y5G6D9G/a8f8fe57-1f30-43ac-b6df-55b068365447.jpg"],
          mainImageIndex: 0,
          isFeatured: true,
        },
        {
            id: 3,
            title: "Cobertura Duplex com Vista Panorâmica",
            description: "Uma cobertura de tirar o fôlego, com piscina privativa, churrasqueira e uma vista incrível da cidade. Acabamentos de alto padrão.",
            type: "Apartamento",
            category: "venda",
            price: 1200000,
            neighborhood: "Vila Mariana",
            city: "São Paulo",
            bedrooms: 4,
            bathrooms: 5,
            area: 250,
            imageUrls: ["https://i.postimg.cc/vT7jcC8C/96ce8d25-2383-4ff3-aae8-d256ce292b38.jpg"],
            mainImageIndex: 0,
            isFeatured: true,
        },
        {
            id: 4,
            title: "Studio Moderno Próximo ao Metrô",
            description: "Studio ideal para investidores ou jovens que buscam praticidade. Totalmente mobiliado, com lazer completo no condomínio e a passos do metrô.",
            type: "Apartamento",
            category: "aluguel",
            price: 2500,
            neighborhood: "Consolação",
            city: "São Paulo",
            bedrooms: 1,
            bathrooms: 1,
            area: 35,
            imageUrls: ["https://i.postimg.cc/66CFj4V2/f16ad66f-5aa9-4348-b63f-6a9127bee08d.jpg"],
            mainImageIndex: 0,
            isFeatured: false,
        },
        {
            id: 5,
            title: "Casa Térrea em Condomínio Fechado",
            description: "Excelente casa térrea em condomínio com segurança 24h. Possui 3 quartos, sendo 1 suíte, e um belo jardim de inverno.",
            type: "Casa",
            category: "venda",
            price: 450000,
            neighborhood: "Pauliceia",
            city: "São Bernardo do Campo",
            bedrooms: 3,
            bathrooms: 2,
            area: 120,
            imageUrls: ["https://i.postimg.cc/5y5G6D9G/a8f8fe57-1f30-43ac-b6df-55b068365447.jpg"],
            mainImageIndex: 0,
            isFeatured: false,
        }
      ];
      syncDb();
    }
  } catch (e) {
    console.error("Failed to initialize property data:", e);
    properties = [];
  }
};

const syncDb = () => {
  // This function simulates saving to a persistent store (like a database).
  // Here, we use localStorage. To make this app work across devices,
  // this function should be replaced with an API call to your backend.
  localStorage.setItem(DB_KEY, JSON.stringify(properties));
};

// Initialize data on load
initializeData();


// --- API-like Functions ---

/**
 * Fetches all properties.
 * In a real app, this would be: `return fetch('/api/properties').then(res => res.json())`
 */
export const getProperties = async (): Promise<Property[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...properties].sort((a, b) => b.id - a.id); // Return newest first
};

/**
 * Adds a new property.
 * In a real app, this would be a POST request to '/api/properties'.
 */
export const addProperty = async (propertyData: Omit<Property, 'id'>): Promise<Property> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newProperty: Property = {
    ...propertyData,
    id: Date.now(), // Generate a unique ID
    isFeatured: propertyData.isFeatured || false
  };
  properties.unshift(newProperty); // Add to the beginning of the array
  syncDb();
  return newProperty;
};


/**
 * Updates an existing property.
 * In a real app, this would be a PUT or PATCH request to `/api/properties/:id`.
 */
export const updateProperty = async (propertyId: number, updates: Omit<Property, 'id'>): Promise<Property> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const propertyIndex = properties.findIndex(p => p.id === propertyId);
  if (propertyIndex === -1) {
    throw new Error("Property not found");
  }
  const updatedProperty = { ...updates, id: propertyId, isFeatured: updates.isFeatured || false };
  properties[propertyIndex] = updatedProperty;
  syncDb();
  return updatedProperty;
};

/**
 * Deletes a property.
 * In a real app, this would be a DELETE request to `/api/properties/:id`.
 */
export const deleteProperty = async (propertyId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const initialLength = properties.length;
  properties = properties.filter(p => p.id !== propertyId);
  if (properties.length === initialLength) {
    throw new Error("Property not found");
  }
  syncDb();
};
