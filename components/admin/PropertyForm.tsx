import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { BRAZILIAN_STATES, PROPERTY_TYPES } from '../../constants';
import { LoadingSpinner } from '../icons';
import { AutocompleteInput } from '../ui/AutocompleteInput';

export const PropertyForm: React.FC<{
  onSubmit: (property: Omit<Property, 'id'>) => void;
  onCancel: () => void;
  initialData?: Property | null;
  theme: 'light' | 'dark';
}> = ({ onSubmit, onCancel, initialData, theme }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', type: '', category: 'venda' as 'venda' | 'aluguel',
        price: 0, neighborhood: '', city: '', state: '', bedrooms: 0, bathrooms: 0, area: 0,
        isFeatured: false,
    });
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title, description: initialData.description, type: initialData.type,
                category: initialData.category, price: initialData.price, neighborhood: initialData.neighborhood, 
                city: initialData.city, state: initialData.state, bedrooms: initialData.bedrooms, bathrooms: initialData.bathrooms, 
                area: initialData.area,
                isFeatured: initialData.isFeatured,
            });
            setImageUrls(initialData.imageUrls);
            setMainImageIndex(initialData.mainImageIndex);
        }
    }, [initialData]);
    
    const baseInputClasses = "mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500";
    const lightThemeInputClasses = "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
    const darkThemeInputClasses = "bg-slate-700 border-slate-600 text-white placeholder-gray-400";
    const errorClasses = "border-red-500 focus:border-red-500 focus:ring-red-500";
    
    const getInputClass = (fieldName: keyof typeof errors) => {
        const themeClasses = theme === 'dark' ? darkThemeInputClasses : lightThemeInputClasses;
        const validationClasses = errors[fieldName] ? errorClasses : '';
        return `${baseInputClasses} ${themeClasses} ${validationClasses}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' 
                ? checked 
                : (name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'area' ? parseFloat(value) || 0 : value) 
        }));
    };
    
    const handleAutocompleteChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + imageUrls.length > 10) {
            alert('Você pode enviar no máximo 10 fotos.');
            return;
        }
        setIsUploading(true);
        const promises = files.map((file: File) => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        Promise.all(promises).then(base64Images => {
            setImageUrls(prev => [...prev, ...base64Images]);
            setIsUploading(false);
        }).catch(error => {
            console.error("Error reading files:", error);
            setIsUploading(false);
            alert("Erro ao carregar imagens.");
        });
    };
    
    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
        if (index === mainImageIndex) {
            setMainImageIndex(0);
        } else if (index < mainImageIndex) {
            setMainImageIndex(prev => prev - 1);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "O título é obrigatório.";
        if (!formData.neighborhood.trim()) newErrors.neighborhood = "O bairro é obrigatório.";
        if (!formData.city.trim()) newErrors.city = "A cidade é obrigatória.";
        if (!formData.state) newErrors.state = "O estado é obrigatório.";
        if (!formData.description.trim()) newErrors.description = "A descrição é obrigatória.";
        if (!formData.type.trim()) newErrors.type = "O tipo de imóvel é obrigatório.";
        
        if (isNaN(formData.price) || formData.price <= 0) {
            newErrors.price = "O valor é obrigatório e deve ser maior que zero.";
        }
        
        if (isNaN(formData.area) || formData.area <= 0) {
            newErrors.area = "A área é obrigatória e deve ser maior que zero.";
        }
        
        if (isNaN(formData.bedrooms) || formData.bedrooms < 0 || !Number.isInteger(formData.bedrooms)) {
            newErrors.bedrooms = "O nº de quartos deve ser um inteiro (0 ou mais).";
        }

        if (isNaN(formData.bathrooms) || formData.bathrooms < 0 || !Number.isInteger(formData.bathrooms)) {
            newErrors.bathrooms = "O nº de banheiros deve ser um inteiro (0 ou mais).";
        }
        
        if (imageUrls.length === 0) newErrors.images = "É necessário enviar pelo menos uma foto.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        onSubmit({ ...formData, imageUrls, mainImageIndex });
    };

    return (
        <div className={`p-4 sm:p-6 md:p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} max-h-[calc(100vh-65px)] overflow-y-auto`}>
            <div className={`max-w-4xl mx-auto rounded-lg shadow-xl p-6 md:p-8 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}>
                <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{initialData ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label htmlFor="title" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Título</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className={getInputClass('title')}/>
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div>
                            <label htmlFor="neighborhood" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bairro</label>
                            <input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleChange} required className={getInputClass('neighborhood')}/>
                            {errors.neighborhood && <p className="mt-1 text-xs text-red-600">{errors.neighborhood}</p>}
                        </div>
                        <div>
                            <label htmlFor="city" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cidade</label>
                            <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className={getInputClass('city')}/>
                            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                        </div>
                        <div>
                            <label htmlFor="state" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
                            <select name="state" id="state" value={formData.state} onChange={handleChange} required className={getInputClass('state')}>
                                <option value="" disabled>Selecione um estado</option>
                                {BRAZILIAN_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
                            </select>
                            {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className={getInputClass('description')}></textarea>
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="price" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Valor (R$)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="1" step="any" placeholder="Ex: 250000" className={getInputClass('price')}/>
                            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                        </div>
                        <div>
                            <label htmlFor="type" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tipo de Imóvel</label>
                             <AutocompleteInput
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={(value) => handleAutocompleteChange('type', value)}
                                options={PROPERTY_TYPES}
                                placeholder="Ex: Apartamento"
                                required
                                error={!!errors.type}
                                theme={theme}
                            />
                            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                        </div>
                        <div>
                            <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Categoria</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} required className={`${baseInputClasses} ${theme === 'dark' ? darkThemeInputClasses : lightThemeInputClasses}`}>
                                <option value="venda">Venda</option>
                                <option value="aluguel">Aluguel</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="area" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Área (m²)</label>
                            <input type="number" name="area" id="area" value={formData.area} onChange={handleChange} required min="1" placeholder="Ex: 50" className={getInputClass('area')}/>
                            {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
                        </div>
                         <div>
                            <label htmlFor="bedrooms" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Quartos</label>
                            <input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms} onChange={handleChange} required min="0" step="1" className={getInputClass('bedrooms')}/>
                             {errors.bedrooms && <p className="mt-1 text-xs text-red-600">{errors.bedrooms}</p>}
                        </div>
                        <div>
                            <label htmlFor="bathrooms" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Banheiros</label>
                            <input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms} onChange={handleChange} required min="0" step="1" className={getInputClass('bathrooms')}/>
                             {errors.bathrooms && <p className="mt-1 text-xs text-red-600">{errors.bathrooms}</p>}
                        </div>
                    </div>
                    
                    {/* Featured Checkbox */}
                    <div className="pt-4">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="isFeatured"
                                    name="isFeatured"
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isFeatured" className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Marcar como Destaque</label>
                                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Imóveis em destaque aparecem na página inicial.</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Fotos (até 10)</label>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${errors.images ? 'border-red-500' : (theme === 'dark' ? 'border-gray-600' : 'border-gray-300')}`}>
                            <div className="space-y-1 text-center">
                                <i className={`fa-solid fa-image text-4xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}></i>
                                <div className={`flex text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-800 text-indigo-400 hover:text-indigo-300' : 'bg-white text-indigo-600 hover:text-indigo-500'}`}>
                                        <span>Carregar arquivos</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} disabled={imageUrls.length >= 10}/>
                                    </label>
                                    <p className="pl-1">ou arraste e solte</p>
                                </div>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{10 - imageUrls.length} restantes</p>
                            </div>
                        </div>
                         {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
                    </div>

                    {isUploading && <LoadingSpinner />}
                    {imageUrls.length > 0 && (
                        <div>
                            <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Imagens Carregadas:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {imageUrls.map((url, index) => (
                                    <div key={index} className={`relative group rounded-lg overflow-hidden border-2 ${index === mainImageIndex ? 'border-indigo-500' : 'border-transparent'}`}>
                                        <img src={url} alt={`Preview ${index}`} className="h-32 w-full object-cover"/>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-2">
                                            <button type="button" onClick={() => setMainImageIndex(index)} title="Marcar como principal" className="text-white text-xs bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded w-full text-center">
                                                <i className="fa-solid fa-star mr-1"></i> Principal
                                            </button>
                                            <button type="button" onClick={() => removeImage(index)} title="Remover imagem" className="text-white text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded w-full text-center">
                                                <i className="fa-solid fa-trash mr-1"></i> Remover
                                            </button>
                                        </div>
                                         {index === mainImageIndex && <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"><i className="fa-solid fa-star"></i></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Actions */}
                    <div className="pt-5 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 gap-3 sm:gap-0">
                        <button type="button" onClick={onCancel} className={`py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500 text-gray-200 border-slate-500' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}>
                            Cancelar
                        </button>
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Salvar Imóvel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
