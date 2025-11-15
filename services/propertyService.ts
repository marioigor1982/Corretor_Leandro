import { Property, FirebaseTimestamp } from '../types';

// Helper to create a Firestore-like timestamp
const createTimestamp = (): FirebaseTimestamp => {
    const now = new Date();
    return {
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: (now.getTime() % 1000) * 1000000,
        toMillis: () => now.getTime(),
    };
};

const initialMockProperties: Property[] = [
    {
        id: 'prop1',
        title: 'Apartamento Aconchegante no Centro',
        description: 'Lindo apartamento com 2 quartos, sala, cozinha e banheiro. Totalmente mobiliado e com ótima localização, perto de metrô e comércios. Perfeito para quem busca praticidade e conforto no coração da cidade.',
        type: 'Apartamento',
        category: 'venda',
        price: 350000,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        imageUrls: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'
        ],
        mainImageIndex: 0,
        isFeatured: true,
        createdAt: createTimestamp(),
    },
    {
        id: 'prop2',
        title: 'Casa Espaçosa com Quintal',
        description: 'Casa com 3 quartos, sendo 1 suíte. Amplo quintal com churrasqueira e espaço para piscina. Garagem para 2 carros. Bairro tranquilo e arborizado, ideal para famílias.',
        type: 'Casa',
        category: 'venda',
        price: 680000,
        neighborhood: 'Vila Madalena',
        city: 'São Paulo',
        state: 'SP',
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [
             'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=800&auto=format&fit=crop',
             'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop'
        ],
        mainImageIndex: 0,
        isFeatured: true,
        createdAt: createTimestamp(),
    },
    {
        id: 'prop3',
        title: 'Studio Mobiliado perto da USP',
        description: 'Studio moderno e funcional, perfeito para estudantes ou jovens profissionais. Totalmente mobiliado, com cozinha compacta e banheiro. Prédio com lavanderia e academia.',
        type: 'Kitnet / Studio',
        category: 'aluguel',
        price: 1800,
        neighborhood: 'Butantã',
        city: 'São Paulo',
        state: 'SP',
        bedrooms: 1,
        bathrooms: 1,
        area: 35,
        imageUrls: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'
        ],
        mainImageIndex: 0,
        isFeatured: true,
        createdAt: createTimestamp(),
    },
     {
        id: 'prop4',
        title: 'Cobertura Duplex com Vista',
        description: 'Cobertura incrível com 4 suítes, piscina privativa e vista panorâmica da cidade. Acabamentos de luxo e automação residencial. Condomínio com segurança 24h e lazer completo.',
        type: 'Cobertura',
        category: 'venda',
        price: 2500000,
        neighborhood: 'Morumbi',
        city: 'São Paulo',
        state: 'SP',
        bedrooms: 4,
        bathrooms: 5,
        area: 320,
        imageUrls: [
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop'
        ],
        mainImageIndex: 0,
        isFeatured: false,
        createdAt: createTimestamp(),
    },
];

// In-memory session storage to simulate persistence. Resets on browser close.
const SESSION_STORAGE_KEY = 'mock_properties';

const getSessionProperties = (): Property[] => {
    try {
        const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
            // Re-add methods to timestamp objects after parsing from JSON
            return JSON.parse(stored).map((p: any) => ({
                ...p,
                createdAt: p.createdAt ? { ...p.createdAt, toMillis: () => new Date(p.createdAt.seconds * 1000).getTime() } : undefined
            }));
        }
    } catch (e) {
        console.error("Could not parse session properties", e);
    }
    // If nothing in session, return initial data
    return initialMockProperties;
};

const setSessionProperties = (properties: Property[]) => {
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(properties));
    } catch (e) {
        console.error("Could not save session properties", e);
    }
};

// Initialize session storage if it's empty
if (!sessionStorage.getItem(SESSION_STORAGE_KEY)) {
    setSessionProperties(initialMockProperties);
}


export const getProperties = async (): Promise<Property[]> => {
    const properties = getSessionProperties();
    // Manually sort properties by creation date, descending.
    return Promise.resolve([...properties].sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
    }));
};

export const addProperty = async (propertyData: Omit<Property, 'id' | 'createdAt'>): Promise<Property> => {
    const currentProperties = getSessionProperties();
    const newProperty: Property = {
        ...propertyData,
        id: `mock_${Date.now()}`,
        createdAt: createTimestamp(),
    };
    const updatedProperties = [newProperty, ...currentProperties];
    setSessionProperties(updatedProperties);
    return Promise.resolve(newProperty);
};


export const updateProperty = async (propertyId: string, updates: Omit<Property, 'id' | 'createdAt'>): Promise<Property> => {
    let currentProperties = getSessionProperties();
    let updatedProperty: Property | undefined;
    
    const updatedProperties = currentProperties.map(p => {
        if (p.id === propertyId) {
            // Preserve the original creation date
            updatedProperty = { ...p, ...updates, createdAt: p.createdAt };
            return updatedProperty;
        }
        return p;
    });

    if (updatedProperty) {
        setSessionProperties(updatedProperties);
        return Promise.resolve(updatedProperty);
    } else {
        return Promise.reject(new Error("Property not found"));
    }
};

export const deleteProperty = async (propertyId: string): Promise<void> => {
    let currentProperties = getSessionProperties();
    const updatedProperties = currentProperties.filter(p => p.id !== propertyId);
    setSessionProperties(updatedProperties);
    return Promise.resolve();
};
