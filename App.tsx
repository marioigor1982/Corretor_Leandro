import React, { useState, useEffect, useCallback } from 'react';
import { Property, User } from './types';
import { LoadingSpinner } from './components/icons';
import { getProperties } from './services/propertyService';
import { PublicSite } from './pages/PublicSite';
import { Dashboard } from './pages/Dashboard';

const App: React.FC = () => {
    // Mock user state, always "logged in" for dashboard access.
    const [user, setUser] = useState<User | null>({
        name: 'Corretor Leandro',
        email: 'corretor@exemplo.com',
        picture: 'https://i.postimg.cc/131QvDnS/Foto-Leandro.jpg',
    });
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ type: string; message: string } | null>(null);
    const [isDashboard, setIsDashboard] = useState(window.location.hash === '#/dashboard');

    const loadProperties = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedProperties = await getProperties();
            setProperties(fetchedProperties);
        } catch (err: any) {
            console.error("Failed to fetch properties:", err);
            setError({ type: 'generic', message: 'Falha ao carregar os imóveis. Tente novamente mais tarde.' });
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

    const handleLogout = () => {
        // In a mock environment, we can't truly log out.
        // We'll just navigate back to the home page.
        alert("Sessão encerrada. Retornando à página inicial.");
        window.location.hash = '#/';
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (error) {
        return <div className="flex items-center justify-center h-screen text-center p-8 text-red-500 bg-gray-50">{error.message}</div>;
    }

    if (isDashboard) {
        // Since there's no real login, we always show the dashboard for a mock user.
        if (user) {
             return <Dashboard user={user} onLogout={handleLogout} properties={properties} onPropertiesUpdate={loadProperties} />;
        }
        // This part should be unreachable, but as a fallback, redirect to home.
        window.location.hash = '#/';
        return <LoadingSpinner />;
    }

    return <PublicSite properties={properties} />;
};

export default App;
