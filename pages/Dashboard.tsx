
import React, { useState, useMemo } from 'react';
import { Property, User } from '../types';
import { addProperty, updateProperty, deleteProperty } from '../services/propertyService';
import { BrazilMap } from '../components/admin/BrazilMap';
import { PropertyForm } from '../components/admin/PropertyForm';
import { LogoutIcon, SunIcon, MoonIcon } from '../components/icons';

interface DashboardProps {
    user: User;
    onLogout: () => void;
    properties: Property[];
    onPropertiesUpdate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, properties, onPropertiesUpdate }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const propertiesByState = useMemo(() => {
        return properties.reduce((acc, property) => {
            if (property.state) {
              acc[property.state] = (acc[property.state] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });
    }, [properties]);

    const filteredProperties = useMemo(() => {
        let filtered = properties;
        if (selectedState) {
            filtered = filtered.filter(p => p.state === selectedState);
        }
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(lowercasedTerm) ||
                p.city.toLowerCase().includes(lowercasedTerm) ||
                p.neighborhood.toLowerCase().includes(lowercasedTerm)
            );
        }
        return filtered;
    }, [properties, selectedState, searchTerm]);

    const handleAddClick = () => {
        setEditingProperty(null);
        setView('form');
    };

    const handleEditClick = (property: Property) => {
        setEditingProperty(property);
        setView('form');
    };

    const handleCancelForm = () => {
        setView('list');
        setEditingProperty(null);
    };

    const handleSubmitForm = async (propertyData: Omit<Property, 'id'>) => {
        try {
            if (editingProperty) {
                await updateProperty(editingProperty.id, propertyData);
            } else {
                await addProperty(propertyData);
            }
            onPropertiesUpdate();
            setView('list');
            setEditingProperty(null);
        } catch (error) {
            console.error("Failed to save property:", error);
            alert("Erro ao salvar imóvel. Tente novamente.");
        }
    };

    const handleDeleteClick = async (propertyId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
            try {
                await deleteProperty(propertyId);
                onPropertiesUpdate();
                 if (selectedState && filteredProperties.length === 1 && filteredProperties[0].id === propertyId) {
                    setSelectedState(null);
                }
            } catch (error) {
                console.error("Failed to delete property:", error);
                alert("Erro ao excluir imóvel. Tente novamente.");
            }
        }
    };
    
    const handleStateClick = (stateAbbr: string) => {
        setSelectedState(prevState => prevState === stateAbbr ? null : stateAbbr);
    };

    const themeClasses = {
        bg: theme === 'dark' ? 'bg-slate-900' : 'bg-gray-100',
        text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
        cardBg: theme === 'dark' ? 'bg-slate-800' : 'bg-white',
        border: theme === 'dark' ? 'border-slate-700' : 'border-gray-200',
        inputBg: theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200',
        placeholderText: theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-500',
    };

    if (view === 'form') {
        return (
            <div className={themeClasses.bg}>
                 <header className={`${themeClasses.cardBg} shadow-md sticky top-0 z-30`}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                           <h1 className={`text-xl font-bold ${themeClasses.text}`}>
                                {editingProperty ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}
                            </h1>
                             <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white ${theme === 'dark' ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-gray-200'}`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </div>
                </header>
                <PropertyForm 
                    onSubmit={handleSubmitForm} 
                    onCancel={handleCancelForm}
                    initialData={editingProperty}
                    theme={theme}
                />
            </div>
        );
    }
    

    return (
        <div className={`${themeClasses.bg} ${themeClasses.text} min-h-screen font-sans`}>
            {/* Header */}
            <header className={`${themeClasses.cardBg} shadow-md sticky top-0 z-30`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <img src="https://i.postimg.cc/1znGLc6T/LOGO-LEANDRO.png" alt="Logo" className="h-10 w-auto bg-white rounded-md p-1" />
                            <h1 className="text-xl font-bold hidden sm:block">Painel do Corretor</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                             <span className="text-sm hidden md:block">Olá, {user.name.split(' ')[0]}!</span>
                             <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white ${theme === 'dark' ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-gray-200'}`}
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                            </button>
                            <button onClick={onLogout} className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`} aria-label="Sair">
                                <LogoutIcon />
                                <span className="hidden lg:block">Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats and Map */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className={`${themeClasses.cardBg} p-6 rounded-lg shadow-lg`}>
                            <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
                             <div className="flex justify-between items-center text-lg">
                                <span>Total de Imóveis:</span>
                                <span className="font-bold text-2xl text-blue-400">{properties.length}</span>
                            </div>
                        </div>
                        <div className={`${themeClasses.cardBg} p-6 rounded-lg shadow-lg`}>
                             <h2 className="text-2xl font-bold mb-4">Imóveis por Estado</h2>
                            <BrazilMap 
                                data={propertiesByState}
                                selectedState={selectedState}
                                onStateClick={handleStateClick}
                                theme={theme}
                            />
                        </div>
                    </div>
                    {/* Right Column: Property List */}
                    <div className="lg:col-span-2">
                        <div className={`${themeClasses.cardBg} rounded-lg shadow-lg overflow-hidden`}>
                             <div className="p-6 border-b ${themeClasses.border}">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                     <h2 className="text-2xl font-bold">
                                        {selectedState ? `Imóveis em ${selectedState}` : 'Todos os Imóveis'}
                                        {selectedState && <button onClick={() => setSelectedState(null)} className="ml-3 text-sm text-red-400 hover:text-red-300">(Limpar)</button>}
                                     </h2>
                                     <button onClick={handleAddClick} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                                        <i className="fa-solid fa-plus"></i>
                                        <span>Adicionar Imóvel</span>
                                    </button>
                                </div>
                                <div className="mt-4 relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar por título, cidade, bairro..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className={`w-full p-2 pl-10 rounded-md border ${themeClasses.border} ${themeClasses.inputBg} ${themeClasses.text} ${themeClasses.placeholderText} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                                    />
                                    <i className={`fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}></i>
                                </div>
                            </div>
                            
                            <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
                                <ul className={`divide-y ${themeClasses.border}`}>
                                    {filteredProperties.length > 0 ? (
                                        filteredProperties.map(prop => (
                                             <li key={prop.id} className={`p-4 hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors`}>
                                                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                     <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <img src={prop.imageUrls[prop.mainImageIndex]} alt={prop.title} className="w-20 h-16 object-cover rounded-md flex-shrink-0"/>
                                                        <div className="min-w-0">
                                                             <p className="font-bold truncate" title={prop.title}>{prop.title}</p>
                                                             <p className="text-sm text-gray-400 truncate">{`${prop.neighborhood}, ${prop.city} - ${prop.state}`}</p>
                                                             <p className="text-sm text-green-400 font-semibold">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}
                                                             </p>
                                                        </div>
                                                     </div>
                                                     <div className="flex-shrink-0 flex space-x-2 self-start sm:self-center">
                                                         <button onClick={() => handleEditClick(prop)} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">Editar</button>
                                                         <button onClick={() => handleDeleteClick(prop.id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md">Excluir</button>
                                                     </div>
                                                 </div>
                                             </li>
                                        ))
                                    ) : (
                                        <li className="p-8 text-center text-gray-500">
                                            Nenhum imóvel encontrado.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
