import React from 'react';
import { Property } from '../../types';
import { BedIcon, BathIcon, AreaIcon } from '../icons';

export const PropertyCard: React.FC<{ property: Property, onClick: () => void }> = ({ property, onClick }) => (
    <div onClick={onClick} className="flex-shrink-0 w-[90vw] max-w-[20rem] sm:w-80 bg-white rounded-lg shadow-lg overflow-hidden snap-center transform transition-transform hover:scale-105 cursor-pointer">
        <img src={property.imageUrls[property.mainImageIndex] || 'https://picsum.photos/800/600'} alt={property.title} className="w-full h-48 object-cover" />
        <div className="p-4 text-gray-800">
            <h3 className="text-xl font-bold mb-2 truncate">{property.title}</h3>
            <p className="text-gray-600 mb-2">{`${property.neighborhood}, ${property.city}`}</p>
            <p className="text-2xl font-light text-green-700 mb-4">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
            </p>
            <div className="flex justify-between text-gray-700 border-t pt-3">
                <div className="flex items-center space-x-2">
                    <BedIcon />
                    <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <BathIcon />
                    <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <AreaIcon />
                    <span>{property.area} m²</span>
                </div>
            </div>
        </div>
    </div>
);
