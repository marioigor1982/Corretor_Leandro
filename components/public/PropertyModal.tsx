import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Property } from '../../types';
import { BedIcon, BathIcon, AreaIcon } from '../icons';

export const PropertyModal: React.FC<{ property: Property, onClose: () => void }> = ({ property, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(property.mainImageIndex || 0);
    const modalRef = useRef<HTMLDivElement>(null);

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % property.imageUrls.length);
    }, [property.imageUrls.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + property.imageUrls.length) % property.imageUrls.length);
    }, [property.imageUrls.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, nextImage, prevImage]);

    const handleOutsideClick = (e: React.MouseEvent) => {
        if (modalRef.current === e.target) {
            onClose();
        }
    };
    
    const interestMessage = `Olá Corretor Leco, tudo bem? Quero mais informações (${property.title}, ${property.neighborhood}, ${property.city}) poderia me ajudar?`;
    const whatsappLink = `https://wa.me/5511991866739?text=${encodeURIComponent(interestMessage)}`;

    return (
        <div ref={modalRef} onClick={handleOutsideClick} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-2/3 h-1/2 md:h-full flex flex-col bg-gray-900">
                    <div className="relative flex-grow h-0">
                        <img src={property.imageUrls[currentIndex]} alt={`${property.title} - Foto ${currentIndex + 1}`} className="w-full h-full object-contain" />
                        {property.imageUrls.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/75 transition" aria-label="Foto anterior">
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/75 transition" aria-label="Próxima foto">
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </>
                        )}
                    </div>
                    {property.imageUrls.length > 1 && (
                        <div className="flex-shrink-0 bg-gray-900 p-2">
                             <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                                {property.imageUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Miniatura ${index + 1}`}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-20 h-16 object-cover rounded-md cursor-pointer border-2 transition ${currentIndex === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col p-6 overflow-y-auto">
                     <button onClick={onClose} className="absolute top-2 right-2 md:relative md:top-auto md:right-auto text-gray-400 hover:text-gray-800 transition self-end" aria-label="Fechar modal">
                        <i className="fa-solid fa-xmark text-2xl"></i>
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 mt-2">{property.title}</h2>
                    <p className="text-gray-500 mb-4">{`${property.neighborhood}, ${property.city}`}</p>
                    <p className="text-3xl font-light text-green-700 mb-4">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                    </p>
                    <div className="flex justify-start space-x-6 text-gray-700 border-t pt-4 mb-4">
                        <div className="flex items-center space-x-2"> <BedIcon /> <span>{property.bedrooms} Quartos</span> </div>
                        <div className="flex items-center space-x-2"> <BathIcon /> <span>{property.bathrooms} Banheiros</span> </div>
                        <div className="flex items-center space-x-2"> <AreaIcon /> <span>{property.area} m²</span> </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mt-4 border-b pb-2 mb-2">Descrição</h3>
                    <p className="text-gray-600 flex-grow text-base leading-relaxed">{property.description}</p>
                     <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-6 w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center space-x-2 transition duration-300">
                        <span>Tenho Interesse</span>
                        <i className="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};
