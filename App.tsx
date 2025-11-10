// Fix: Add global declaration for window.google to fix TypeScript errors.
declare global {
  interface Window {
    google: any;
  }
}

import React, { useState, useEffect, useCallback } from 'react';
import { Property, User } from './types';
import { LoadingSpinner } from './components/icons';
import { getProperties } from './services/propertyService';
import { PublicSite } from './pages/PublicSite';
import { LoginScreen } from './pages/LoginScreen';
import { Dashboard } from './pages/Dashboard';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDashboard, setIsDashboard] = useState(window.location.hash === '#/dashboard');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('leandroCorretorUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('leandroCorretorUser');
        }
    }, []);

    const loadProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedProperties = await getProperties();
            setProperties(fetchedProperties);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch properties:", err);
            setError('Falha ao carregar os imóveis. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);
    
    useEffect(() => {
        const handleHashChange = () => {
            setIsDashboard(window.location.hash === '#/dashboard');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleLoginSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
        window.location.hash = '#/dashboard';
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('leandroCorretorUser');
        window.location.hash = '#/';
    };

    if (isLoading && !properties.length) {
        return <LoadingSpinner />;
    }
    
    if (error) {
        return <div className="flex items-center justify-center h-screen text-center p-8 text-red-500 bg-gray-50">{error}</div>;
    }

    if (isDashboard) {
        if (user) {
            return <Dashboard user={user} onLogout={handleLogout} properties={properties} onPropertiesUpdate={loadProperties} />;
        } else {
            return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
        }
    }

    return <PublicSite properties={properties} />;
};

export default App;
