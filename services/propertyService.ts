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
      // If no data in localStorage, initialize with an empty array.
      properties = [];
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
