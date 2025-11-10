// Fix: Add global declaration for window.google to fix TypeScript errors.
declare global {
  interface Window {
    google: any;
  }
}

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Property, User } from './types';
import { LoadingSpinner, BedIcon, BathIcon, AreaIcon, UserIcon, MapPinIcon, StarIcon, LogoutIcon, HomeIcon } from './components/icons';
import { getProperties, addProperty, updateProperty, deleteProperty } from './services/propertyService';

// --- LOGIN COMPONENT ---

const LoginScreen: React.FC<{ onLoginSuccess: (user: User) => void; }> = ({ onLoginSuccess }) => {
    
    const handleLoginSuccess = useCallback((credentialResponse: any) => {
        // In a real app, you would send this to your backend/Firebase to verify and create a session.
        // For this example, we'll decode it on the client to get user info.
        try {
            const idToken = credentialResponse.credential;
            const userObject = JSON.parse(atob(idToken.split('.')[1]));
            const user: User = {
                name: userObject.name,
                email: userObject.email,
                picture: userObject.picture,
            };
            
            // TODO: Firebase Integration - Sign in with Firebase after getting the idToken
            // import { auth } from './services/firebase'; // (you'll need to create this file)
            // import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
            // const credential = GoogleAuthProvider.credential(idToken);
            // await signInWithCredential(auth, credential);
            
            localStorage.setItem('leandroCorretorUser', JSON.stringify(user));
            onLoginSuccess(user);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Ocorreu um erro durante o login. Tente novamente.");
        }
    }, [onLoginSuccess]);

    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                // IMPORTANT: Replace with your actual Google Client ID
                client_id: '396869408013-4h18v6c4jb99f8s1qc3h2csj5ed5mq1f.apps.googleusercontent.com',
                callback: handleLoginSuccess,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                { theme: 'outline', size: 'large', width: '250', logo_alignment: 'left' }
            );
            // Optional: Show the One Tap prompt
            // window.google.accounts.id.prompt(); 
        } else {
            console.error("Google Identity Services script not loaded.");
        }
    }, [handleLoginSuccess]);
    
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Left Pane - Desktop */}
            <div className="hidden md:flex w-1/2 items-center justify-center bg-[#083358] p-8">
                <img src="https://i.postimg.cc/1znGLc6T/LOGO-LEANDRO.png" alt="Logo Leandro Corretor" className="w-full max-w-md"/>
            </div>

            {/* Right Pane / Mobile View */}
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 relative">
                 <a href="#/" className="absolute top-6 left-6 z-20 flex items-center space-x-3 text-white md:text-gray-700 hover:text-gray-300 md:hover:text-black transition-colors font-medium">
                    <HomeIcon />
                    <span className="text-lg">Voltar à página inicial</span>
                </a>
                {/* Mobile Background */}
                <div className="md:hidden absolute inset-0 bg-[#083358]">
                </div>

                <div className="w-full max-w-sm bg-transparent md:bg-transparent shadow-none md:shadow-none p-0 md:p-0 z-10 text-center">
                    <img src="https://i.postimg.cc/1znGLc6T/LOGO-LEANDRO.png" alt="Logo Leandro Corretor" className="w-4/5 max-w-xs mx-auto mb-12 md:hidden" />
                    <img src="https://i.postimg.cc/131QvDnS/Foto-Leandro.jpg" alt="Logo Corretor Leandro" className="w-24 h-24 rounded-full mx-auto mb-4 hidden md:block" />
                    <h1 className="text-2xl font-bold text-white md:text-gray-800 mb-2">Área Restrita</h1>
                    <p className="text-white md:text-gray-600 mb-8">Faça login para gerenciar os imóveis.</p>
                    <div id="googleSignInButton" className="flex justify-center"></div>
                </div>
            </div>
        </div>
    );
};


// --- PUBLIC SITE COMPONENTS ---

const backgroundImages = [
  'https://i.postimg.cc/Vv9Td2sV/6e7e5047-6cb8-44ec-9223-55d354d7eb6e.jpg',
  'https://i.postimg.cc/qqcYzWBZ/93ebed18-1f23-47df-8ec9-f4727215f637.jpg',
  'https://i.postimg.cc/vT7jcC8C/96ce8d25-2383-4ff3-aae8-d256ce292b38.jpg',
  'https://i.postimg.cc/5y5G6D9G/a8f8fe57-1f30-43ac-b6df-55b068365447.jpg',
  'https://i.postimg.cc/66CFj4V2/f16ad66f-5aa9-4348-b63f-6a9127bee08d.jpg'
];

const PropertyModal: React.FC<{ property: Property, onClose: () => void }> = ({ property, onClose }) => {
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
                     <a href="#contato" onClick={onClose} className="mt-6 w-full text-center bg-[#6c9a8b] hover:bg-[#5a8a7b] text-white font-bold py-3 px-6 rounded-lg text-lg flex items-center justify-center space-x-2 transition duration-300">
                        <span>Tenho Interesse</span>
                        <i className="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};

const PropertyCard: React.FC<{ property: Property, onClick: () => void }> = ({ property, onClick }) => (
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

const PublicSite: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [language, setLanguage] = useState<'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh' | 'ru'>('pt');
  const [visits, setVisits] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const [filterType, setFilterType] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);

  const translations = { pt: { selectLanguage: "Selecione o idioma", home: "Home", about: "Sobre Mim", contact: "Contato", visits: "Visitas", heroTitle: "O sonho da casa própria nunca foi tão fácil de realizar!", heroSubtitle: "Especialista no programa Minha Casa Minha Vida", speakToMe: "Fale Comigo", brokerArea: "Área do Corretor", highlights: "Destaques", errorFetching: "Nenhum imóvel cadastrado ainda. Volte em breve!", aboutName: "Leandro Buscarioli Colares", aboutCreci: "CRECI-SP 283775F", aboutText1: "Sou Leandro Buscarioli Colares, corretor de imóveis atuante na região da Grande São Paulo e ABC. Minha missão é facilitar a realização do sonho da casa própria para meus clientes, com um atendimento personalizado e diferenciado.", aboutText2: "Meu diferencial está na consultoria completa que ofereço, sempre pronto para responder dúvidas e auxiliar em todas as etapas do processo de compra, venda ou locação de imóveis.", aboutText3: "Acredito que cada cliente é único, por isso trabalho para entender suas necessidades específicas e oferecer as melhores condições para que possam realizar o sonho de ter uma casa que possam chamar de 'sua'.", aboutText4: "Com conhecimento do mercado local e dedicação ao atendimento, meu compromisso é proporcionar uma experiência tranquila e segura em todos os aspectos da negociação imobiliária.", whyChooseMe: "Por que escolher meus serviços?", card1Title: "Atendimento Personalizado", card1Text: "Dedico tempo para entender suas necessidades específicas e encontrar o imóvel perfeito para você.", card2Title: "Conhecimento Local", card2Text: "Amplo conhecimento do mercado imobiliário na região do ABC e Grande São Paulo.", card3Title: "Condições Especiais", card3Text: "Trabalho para oferecer as melhores condições de negociação e financiamento para meus clientes.", contactMe: "Entre em Contato", contactFooter: "Contato", locationFooter: "Localização", noProperties: "Nenhum imóvel em destaque no momento." }, en: { selectLanguage: "Select language", home: "Home", about: "About Me", contact: "Contact", visits: "Visits", heroTitle: "The dream of owning a home has never been easier to achieve!", heroSubtitle: "Specialist in the 'Minha Casa Minha Vida' program", speakToMe: "Talk to Me", brokerArea: "Broker's Area", highlights: "Highlights", errorFetching: "No properties listed yet. Please check back later.", aboutName: "Leandro Buscarioli Colares", aboutCreci: "CRECI-SP 283775F", aboutText1: "I am Leandro Buscarioli Colares, a real estate agent in the Greater São Paulo and ABC region. My mission is to make the dream of homeownership a reality for my clients with personalized service.", aboutText2: "My specialty is the complete consulting I offer, always ready to answer questions and assist in all stages of buying, selling, or renting properties.", aboutText3: "I believe every client is unique, so I work to understand their specific needs and offer the best conditions for them to achieve the dream of having a home to call their own.", aboutText4: "With local market knowledge and dedication, my commitment is to provide a smooth and secure experience in all aspects of real estate negotiation.", whyChooseMe: "Why Choose My Services?", card1Title: "Personalized Service", card1Text: "I take the time to understand your specific needs and find the perfect property for you.", card2Title: "Local Knowledge", card2Text: "Extensive knowledge of the real estate market in the ABC and Greater São Paulo region.", card3Title: "Special Conditions", card3Text: "I work to offer the best negotiation and financing conditions for my clients.", contactMe: "Get in Touch", contactFooter: "Contact", locationFooter: "Location", noProperties: "No featured properties at the moment." }, es: { selectLanguage: "Seleccione el idioma", home: "Inicio", about: "Sobre Mí", contact: "Contacto", visits: "Visitas", heroTitle: "¡El sueño de la casa propia nunca ha sido tan fácil de realizar!", heroSubtitle: "Especialista en el programa 'Minha Casa Minha Vida'", speakToMe: "Hable Conmigo", brokerArea: "Área del Corredor", highlights: "Destacados", errorFetching: "No hay propiedades listadas todavía. Por favor, vuelva más tarde.", aboutName: "Leandro Buscarioli Colares", aboutCreci: "CRECI-SP 283775F", aboutText1: "Soy Leandro Buscarioli Colares, agente inmobiliario en la región de Gran São Paulo y ABC. Mi misión es facilitar el sueño de la casa propia a mis clientes, con un servicio personalizado y diferenciado.", aboutText2: "Mi diferencial es la consultoría completa que ofrezco, siempre listo para responder dudas y ayudar en todas las etapas del proceso de compra, venta o alquiler de inmuebles.", aboutText3: "Creo que cada cliente es único, por eso trabajo para entender sus necesidades específicas y ofrecer las mejores condiciones para que puedan realizar el sueño de tener una casa que puedan llamar 'suya'.", aboutText4: "Con conocimiento del mercado local y dedicación al servicio, mi compromiso es proporcionar una experiencia tranquila y segura en todos los aspectos de la negociación inmobiliaria.", whyChooseMe: "¿Por qué elegir mis servicios?", card1Title: "Atención Personalizada", card1Text: "Dedico tiempo a entender sus necesidades específicas y encontrar la propiedad perfecta para usted.", card2Title: "Conocimiento Local", card2Text: "Amplio conocimiento del mercado inmobiliario en la región del ABC y Gran São Paulo.", card3Title: "Condiciones Especiales", card3Text: "Trabajo para ofrecer las mejores condiciones de negociación y financiación para mis clientes.", contactMe: "Ponerse en Contacto", contactFooter: "Contacto", locationFooter: "Ubicación", noProperties: "No hay propiedades destacadas en este momento." }, fr: { selectLanguage: "Sélectionner la langue", home: "Accueil", about: "À Propos", contact: "Contact", visits: "Visites", heroTitle: "Le rêve de devenir propriétaire n'a jamais été aussi facile à réaliser !", heroSubtitle: "Spécialiste du programme 'Minha Casa Minha Vida'", speakToMe: "Parlez-moi", brokerArea: "Espace Courtier", highlights: "En Vedette", errorFetching: "Aucune propriété répertoriée pour le moment. Veuillez réessayer plus tard.", aboutName: "Leandro Buscarioli Colares", aboutCreci: "CRECI-SP 283775F", aboutText1: "Je suis Leandro Buscarioli Colares, agent immobilier dans la région du Grand São Paulo et ABC. Ma mission est de faciliter le rêve de devenir propriétaire pour mes clients, avec un service personnalisé et différencié.", aboutText2: "Ma spécialité est le conseil complet que j'offre, toujours prêt à répondre aux questions et à aider à toutes les étapes du processus d'achat, de vente ou de location.", aboutText3: "Je crois que chaque client est unique, c'est pourquoi je m'efforce de comprendre leurs besoins spécifiques et d'offrir les meilleures conditions pour qu'ils puissent réaliser le rêve d'avoir une maison bien à eux.", aboutText4: "Avec une connaissance du marché local et un dévouement au service, mon engagement est de fournir une expérience fluide et sécurisée dans tous les aspects de la négociation immobilière.", whyChooseMe: "Pourquoi Choisir Mes Services ?", card1Title: "Service Personnalisé", card1Text: "Je prends le temps de comprendre vos besoins spécifiques et de trouver la propriété idéale pour vous.", card2Title: "Connaissance Locale", card2Text: "Vaste connaissance du marché immobilier dans la région de l'ABC et du Grand São Paulo.", card3Title: "Conditions Spéciales", card3Text: "Je m'efforce d'offrir les meilleures conditions de négociation et de financement à mes clients.", contactMe: "Contactez-moi", contactFooter: "Contact", locationFooter: "Localisation", noProperties: "Aucune propriété en vedette pour le moment." }, de: { selectLanguage: "Sprache auswählen", home: "Startseite", about: "Über Mich", contact: "Kontakt", visits: "Besuche", heroTitle: "Der Traum vom Eigenheim war noch nie so einfach zu verwirklichen!", heroSubtitle: "Spezialist für das Programm 'Minha Casa Minha Vida'", speakToMe: "Sprechen Sie mit mir", brokerArea: "Maklerbereich", highlights: "Highlights", errorFetching: "Noch keine Immobilien aufgeführt. Bitte versuchen Sie es später erneut.", aboutName: "Leandro Buscarioli Colares", aboutCreci: "CRECI-SP 283775F", aboutText1: "Ich bin Leandro Buscarioli Colares, Immobilienmakler in der Region Greater São Paulo und ABC. Meine Mission ist es, meinen Kunden den Traum vom Eigenheim mit persönlichem Service zu ermöglichen.", aboutText2: "Meine Spezialität ist die umfassende Beratung, die ich anbiete. Ich bin immer bereit, Fragen zu beantworten und in allen Phasen des Kaufs, Verkaufs oder der Vermietung zu unterstützen.", aboutText3: "Ich glaube, jeder Kunde ist einzigartig, deshalb arbeite ich daran, seine spezifischen Bedürfnisse zu verstehen und die besten Bedingungen zu bieten, damit sie den Traum von einem eigenen Zuhause verwirklichen können.", aboutText4: "Mit Kenntnissen des lokalen Marktes und Engagement ist es mein Ziel, eine reibungslose und sichere Erfahrung in allen Aspekten der Immobilienverhandlung zu bieten.", whyChooseMe: "Warum meine Dienste wählen?", card1Title: "Persönlicher Service", card1Text: "Ich nehme mir Zeit, Ihre spezifischen Bedürfnisse zu verstehen und die perfekte Immobilie für Sie zu finden.", card2Title: "Lokale Kenntnisse", card2Text: "Umfassende Kenntnisse des Immobilienmarktes in der ABC-Region und im Großraum São Paulo.", card3Title: "Sonderkonditionen", card3Text: "Ich arbeite daran, meinen Kunden die besten Verhandlungs- und Finanzierungsbedingungen zu bieten.", contactMe: "Kontakt aufnehmen", contactFooter: "Kontakt", locationFooter: "Standort", noProperties: "Momentan keine besonderen Immobilien." }, it: { selectLanguage: "Seleziona la lingua", home: "Home", about: "Chi Sono", contact: "Contatti", visits: "Visite", heroTitle: "Il sogno di una casa di proprietà non è mai stato così facile da realizzare!", heroSubtitle: "Specialista del programma 'Minha Casa Minha Vida'", speakToMe: "Parla con me", brokerArea: "Area Agente", highlights: "In Evidenza", errorFetching: "Nessun immobile ancora elencato. Riprova più tardi.", aboutName: "Leandro Buscarioli Colares", aboutCreci: "CRECI-SP 283775F", aboutText1: "Sono Leandro Buscarioli Colares, agente immobiliare nella regione della Grande San Paolo e ABC. La mia missione è realizzare il sogno della casa di proprietà per i miei clienti con un servizio personalizzato.", aboutText2: "La mia specialità è la consulenza completa che offro, sempre pronto a rispondere a domande e assistere in tutte le fasi di acquisto, vendita o affitto di immobili.", aboutText3: "Credo che ogni cliente sia unico, quindi lavoro per capire le loro esigenze specifiche e offrire le migliori condizioni affinché possano realizzare il sogno di avere una casa da chiamare propria.", aboutText4: "Con la conoscenza del mercato locale e la dedizione, il mio impegno è fornire un'esperienza serena e sicura in tutti gli aspetti della negoziazione immobiliare.", whyChooseMe: "Perché Scegliere I Miei Servizi?", card1Title: "Servizio Personalizzato", card1Text: "Dedico tempo a comprendere le tue esigenze specifiche e a trovare l'immobile perfetto per te.", card2Title: "Conoscenza Locale", card2Text: "Ampia conoscenza del mercato immobiliare nella regione ABC e della Grande San Paolo.", card3Title: "Condizioni Speciali", card3Text: "Lavoro per offrire le migliori condizioni di negoziazione e finanziamento ai miei clienti.", contactMe: "Contattami", contactFooter: "Contatti", locationFooter: "Posizione", noProperties: "Nessuna proprietà in primo piano al momento." }, ja: { selectLanguage: "言語を選択する", home: "ホーム", about: "私について", contact: "連絡先", visits: "訪問", heroTitle: "マイホームの夢が、これまでになく簡単に実現できます！", heroSubtitle: "「ミーニャ・カーザ・ミーニャ・ヴィーダ」プログラムの専門家", speakToMe: "話しましょう", brokerArea: "仲介業者エリア", highlights: "ハイライト", errorFetching: "まだ物件が登録されていません。後でもう一度お試しください。", aboutName: "レアンドロ・ブスカリオリ・コラレス", aboutCreci: "CRECI-SP 283775F", aboutText1: "私は大サンパウロおよびABC地域で活動する不動産業者のレアンドロ・ブスカリオリ・コラレスです。私の使命は、個別対応のサービスでお客様のマイホームの夢を実現することです。", aboutText2: "私の専門は、購入、売却、賃貸の全段階で質問に答え、サポートする総合的なコンサルティングです。", aboutText3: "お客様一人ひとりがユニークであると信じており、特定のニーズを理解し、自分の家と呼べる夢を実現するための最良の条件を提供します。", aboutText4: "地域の市場知識と献身的なサービスで、不動産交渉のあらゆる面でスムーズで安全な経験を提供することをお約束します。", whyChooseMe: "私のサービスを選ぶ理由", card1Title: "個別対応サービス", card1Text: "お客様の特定のニーズを理解し、最適な物件を見つけるために時間をかけます。", card2Title: "地域知識", card2Text: "ABC地域および大サンパウロの不動産市場に関する広範な知識。", card3Title: "特別条件", card3Text: "お客様に最良の交渉および融資条件を提供するために尽力します。", contactMe: "お問い合わせ", contactFooter: "連絡先", locationFooter: "場所", noProperties: "現在、注目の物件はありません。" }, ko: { selectLanguage: "언어 선택", home: "홈", about: "소개", contact: "연락처", visits: "방문", heroTitle: "내 집 마련의 꿈이 그 어느 때보다 쉬워졌습니다!", heroSubtitle: "'Minha Casa Minha Vida' 프로그램 전문가", speakToMe: "문의하기", brokerArea: "중개사 공간", highlights: "주요 매물", errorFetching: "아직 등록된 속성이 없습니다. 나중에 다시 시도하십시오.", aboutName: "레안드로 부스카리올리 콜라레스", aboutCreci: "CRECI-SP 283775F", aboutText1: "저는 그레이터 상파울루 및 ABC 지역의 부동산 중개인 레안드로 부스카리올리 콜라레스입니다. 저의 임무는 맞춤형 서비스로 고객의 내 집 마련 꿈을 실현하는 것입니다.", aboutText2: "저의 전문 분야는 구매, 판매 또는 임대의 모든 단계에서 질문에 답하고 지원하는 완벽한 컨설팅입니다.", aboutText3: "모든 고객은 독특하다고 믿으며, 그들의 특정 요구를 이해하고 자신의 집이라고 부를 수 있는 꿈을 이룰 수 있도록 최상의 조건을 제공하기 위해 노력합니다.", aboutText4: "지역 시장 지식과 헌신으로 부동산 협상의 모든 측면에서 원활하고 안전한 경험을 제공하기 위해 최선을 다하고 있습니다.", whyChooseMe: "왜 제 서비스를 선택해야 할까요?", card1Title: "맞춤형 서비스", card1Text: "귀하의 특정 요구를 이해하고 완벽한 부동산을 찾기 위해 시간을 할애합니다.", card2Title: "지역 지식", card2Text: "ABC 지역 및 그레이터 상파울루의 부동산 시장에 대한 광범한 지식.", card3Title: "특별 조건", card3Text: "고객에게 최상의 협상 및 금융 조건을 제공하기 위해 노력합니다.", contactMe: "연락하기", contactFooter: "연락처", locationFooter: "위치", noProperties: "현재 추천 부동산이 없습니다." }, zh: { selectLanguage: "选择语言", home: "首页", about: "关于我", contact: "联系方式", visits: "访问", heroTitle: "拥有自己家的梦想从未如此容易实现！", heroSubtitle: "'Minha Casa Minha Vida' 计划专家", speakToMe: "与我交谈", brokerArea: "经纪人专区", highlights: "精选房源", errorFetching: "尚无房产列出。请稍后再试。", aboutName: "莱安德罗·布斯卡里奥利·科拉雷斯", aboutCreci: "CRECI-SP 283775F", aboutText1: "我是莱安德罗·布斯卡里奥利·科拉雷斯，大圣保罗和ABC地区的房地产经纪人。我的使命是通过个性化服务为客户实现拥有房屋的梦想。", aboutText2: "我的专长是提供全面的咨询服务，随时准备回答问题并在购买、出售或租赁的各个阶段提供帮助。", aboutText3: "我相信每位客户都是独一-无二的，因此我努力了解他们的具体需求，并提供最佳条件，让他们实现拥有一个可以称之为“自己家”的梦想。", aboutText4: "凭借对当地市场的了解和敬业精神，我致力于在房地产谈判的各个方面提供顺畅和安全的体验。", whyChooseMe: "为什么选择我的服务？", card1Title: "个性化服务", card1Text: "我花时间了解您的具体需求，并为您找到完美的房产。", card2Title: "本地知识", card2Text: "对ABC地区和大圣保羅的房地产市场有广泛的了解。", card3Title: "特殊条件", card3Text: "我努力为客户提供最佳的谈判和融资条件。", contactMe: "联系我", contactFooter: "联系方式", locationFooter: "位置", noProperties: "目前没有推荐的房产。" }, ru: { selectLanguage: "Выберите язык", home: "Главная", about: "Обо мне", contact: "Контакты", visits: "Посещения", heroTitle: "Мечта о собственном доме никогда не была так легко осуществима!", heroSubtitle: "Специалист по программе 'Minha Casa Minha Vida'", speakToMe: "Свяжитесь со мной", brokerArea: "Раздел брокера", highlights: "Рекомендуемые", errorFetching: "Объекты еще не добавлены. Пожалуйста, зайдите позже.", aboutName: "Леандро Бускариоли Коларес", aboutCreci: "CRECI-SP 283775F", aboutText1: "Я Леандро Бускариоли Коларес, агент по недвижимости в регионе Большого Сан-Паулу и ABC. Моя миссия - воплотить мечту о собственном доме для моих клиентов с помощью персонализированного обслуживания.", aboutText2: "Моя специализация - это полная консультация, которую я предлагаю, всегда готовый ответить на вопросы и помочь на всех этапах покупки, продажи или аренды недвижимости.", aboutText3: "Я считаю, что каждый клиент уникален, поэтому я работаю, чтобы понять их конкретные потребности и предложить лучшие условия, чтобы они могли осуществить мечту о доме, который они смогут назвать «своим».", aboutText4: "С знанием местного рынка и преданностью делу, мое обязательство - обеспечить гладкий и безопасный опыт во всех аспектах переговоров по недвижимости.", whyChooseMe: "Почему стоит выбрать мои услуги?", card1Title: "Персонализированное обслуживание", card1Text: "Я уделяю время, чтобы понять ваши конкретные потребности и найти идеальную недвижимость для вас.", card2Title: "Знание местного рынка", card2Text: "Обширные знания рынка недвижимости в регионе ABC и Большого Сан-Паулу.", card3Title: "Особые условия", card3Text: "Я работаю, чтобы предложить лучшие условия переговоров и финансирования для моих клиентов.", contactMe: "Связаться", contactFooter: "Контакты", locationFooter: "Местоположение", noProperties: "В настоящее время нет избранных объектов." }};

  const t = (key: keyof typeof translations.pt) => translations[language][key] || translations.pt[key];

  useEffect(() => {
    try {
      const storedCount = localStorage.getItem('leandroCorretorSiteVisits');
      const currentCount = storedCount ? parseInt(storedCount, 10) + 1 : 1;
      localStorage.setItem('leandroCorretorSiteVisits', currentCount.toString());
      setVisits(currentCount);
    } catch (error) {
      console.warn('Could not access localStorage for visit counting.');
      setVisits(1);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const handleCarouselScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const cardWidth = 320; // w-80
        const gap = 32; // space-x-8
        const scrollAmount = cardWidth + gap;
        scrollContainerRef.current.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
    }
  };

  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
    }
  };

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoScrollIntervalRef.current = window.setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          handleCarouselScroll('right');
        }
      }
    }, 4000);
  }, []);
  
  const featuredProperties = useMemo(() => properties.filter(p => p.isFeatured), [properties]);
    
  const uniqueTypes = useMemo(() => [...new Set(featuredProperties.map(p => p.type).filter(Boolean))].sort(), [featuredProperties]);
  const uniqueCities = useMemo(() => [...new Set(featuredProperties.map(p => p.city).filter(Boolean))].sort(), [featuredProperties]);
  const uniqueNeighborhoods = useMemo(() => [...new Set(featuredProperties.map(p => p.neighborhood).filter(Boolean))].sort(), [featuredProperties]);

  const handleClearFilters = () => {
      setFilterType('');
      setFilterCity('');
      setFilterNeighborhood('');
      setFilterPrice('all');
  };

  const filteredFeaturedProperties = useMemo(() => {
      return featuredProperties.filter(p => {
          const matchesType = !filterType || p.type === filterType;
          const matchesCity = !filterCity || p.city === filterCity;
          const matchesNeighborhood = !filterNeighborhood || p.neighborhood === filterNeighborhood;
          
          const matchesPrice = (() => {
              if (filterPrice === 'all') return true;
              const [min, max] = filterPrice.split('-').map(Number);
              if (isNaN(max)) return p.price >= min; // Case for "600001-"
              return p.price >= min && p.price <= max;
          })();

          return matchesType && matchesCity && matchesNeighborhood && matchesPrice;
      });
  }, [featuredProperties, filterType, filterCity, filterNeighborhood, filterPrice]);


  useEffect(() => {
    if (filteredFeaturedProperties.length > 0) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [filteredFeaturedProperties, startAutoScroll]);


  return (
    <>
      <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
        <header className="bg-[#2C3E50] fixed top-0 w-full z-50 shadow-md">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <img src="https://i.postimg.cc/131QvDnS/Foto-Leandro.jpg" alt="Logo Corretor Leandro" className="w-14 h-14 rounded-full border-2 border-gray-400 object-cover" />
            </div>
            <div className="flex items-center space-x-6 text-base text-white">
              <div className="hidden md:flex items-center">
                <select name="language" id="language" className="bg-transparent border border-gray-500 rounded px-2 py-1 focus:outline-none focus:border-white cursor-pointer" aria-label="Selecionar idioma" value={language} onChange={(e) => setLanguage(e.target.value as any)}>
                  <option value="pt" className="bg-[#2C3E50]">🌐 {t('selectLanguage')}</option>
                  <option value="pt" className="bg-[#2C3E50]">🇧🇷 Português</option>
                  <option value="en" className="bg-[#2C3E50]">🇺🇸 English</option>
                  <option value="es" className="bg-[#2C3E50]">🇪🇸 Español</option>
                  <option value="fr" className="bg-[#2C3E50]">🇫🇷 Français</option>
                  <option value="de" className="bg-[#2C3E50]">🇩🇪 Deutsch</option>
                  <option value="it" className="bg-[#2C3E50]">🇮🇹 Italiano</option>
                  <option value="ja" className="bg-[#2C3E50]">🇯🇵 日本語</option>
                  <option value="ko" className="bg-[#2C3E50]">🇰🇷 한국어</option>
                  <option value="zh" className="bg-[#2C3E50]">🇨🇳 中文</option>
                  <option value="ru" className="bg-[#2C3E50]">🇷🇺 Русский</option>
                </select>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <a href="#home" className="hover:text-gray-300 transition-colors">{t('home')}</a>
                <a href="#sobre" className="hover:text-gray-300 transition-colors">{t('about')}</a>
                <a href="#contato" className="hover:text-gray-300 transition-colors">{t('contact')}</a>
              </div>
              <div className="text-gray-400">
                {t('visits')}: {visits}
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white z-50" aria-label="Abrir menu" aria-expanded={isMenuOpen}>
                  <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl transition-transform duration-300`} aria-hidden="true"></i>
              </button>
            </div>
          </nav>
           {/* Mobile Menu */}
           <div className={`fixed inset-0 bg-[#2C3E50] z-40 transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-in-out md:hidden`}>
                <div className="flex flex-col items-center justify-center h-full">
                    <a href="#home" className="text-white text-3xl font-bold py-4 hover:text-gray-300 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('home')}</a>
                    <a href="#sobre" className="text-white text-3xl font-bold py-4 hover:text-gray-300 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('about')}</a>
                    <a href="#contato" className="text-white text-3xl font-bold py-4 hover:text-gray-300 transition-colors" onClick={() => setIsMenuOpen(false)}>{t('contact')}</a>
                </div>
            </div>
        </header>

        <main>
          <section id="home" className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden text-white">
            <div className="absolute inset-0 w-full h-full">
              {backgroundImages.map((url, index) => (
                <div key={url} className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url('${url}')` }} aria-hidden="true" />
              ))}
            </div>
            <div className="absolute inset-0 bg-black/60" aria-hidden="true"></div>
            <div className="relative z-10 flex flex-col items-center max-w-5xl mt-16">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4" style={{textShadow: '2px 2px 6px rgba(0,0,0,0.8)'}}>
                    {t('heroTitle')}
                </h1>
                <p className="text-lg md:text-xl mb-8" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                    {t('heroSubtitle')}
                </p>
                <div className="mb-10">
                    <img src="https://i.postimg.cc/Y0qKh97c/minha-casa-minha-vida-logo-png-seeklogo-204618.png" alt="Minha Casa Minha Vida Logo" className="w-40 h-auto bg-white p-3 rounded-xl shadow-lg"/>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <a href="#contato" className="bg-[#6c9a8b] hover:bg-[#5a8a7b] text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center justify-center space-x-2 transition duration-300 w-full sm:w-auto">
                        <span>{t('speakToMe')}</span>
                        <span className="font-sans" aria-hidden="true">&rarr;</span>
                    </a>
                    <a href="#/dashboard" className="bg-[#34495e] hover:bg-[#2c3e50] text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center justify-center space-x-2 transition duration-300 w-full sm:w-auto">
                        <span>{t('brokerArea')}</span>
                        <span className="font-sans" aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </div>
          </section>

          <section id="destaques" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">{t('highlights')}</h2>

                {featuredProperties.length > 0 && (
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-12 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div>
                                <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                                <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="">Todos</option>
                                    {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filterCity" className="block text-sm font-medium text-gray-700">Cidade</label>
                                <select id="filterCity" value={filterCity} onChange={e => setFilterCity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="">Todas</option>
                                    {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filterNeighborhood" className="block text-sm font-medium text-gray-700">Bairro</label>
                                <select id="filterNeighborhood" value={filterNeighborhood} onChange={e => setFilterNeighborhood(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="">Todos</option>
                                    {uniqueNeighborhoods.map(hood => <option key={hood} value={hood}>{hood}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="filterPrice" className="block text-sm font-medium text-gray-700">Faixa de Valor</label>
                                <select id="filterPrice" value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option value="all">Qualquer Valor</option>
                                    <option value="0-200000">Até R$ 200.000</option>
                                    <option value="200001-400000">R$ 200.001 a R$ 400.000</option>
                                    <option value="400001-600000">R$ 400.001 a R$ 600.000</option>
                                    <option value="600001-">Acima de R$ 600.000</option>
                                </select>
                            </div>
                            <button onClick={handleClearFilters} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors sm:text-sm">
                                <i className="fa-solid fa-eraser"></i>
                                <span>Limpar</span>
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="relative">
                  {featuredProperties.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">{t('noProperties')}</p>
                  ) : filteredFeaturedProperties.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Nenhum imóvel encontrado com os filtros selecionados. Tente ajustar sua busca.</p>
                  ) : (
                      <>
                        <div className="flex space-x-8 pb-4 -mx-6 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide" ref={scrollContainerRef} onMouseEnter={stopAutoScroll} onMouseLeave={startAutoScroll}>
                              {filteredFeaturedProperties.map(property => (
                                  <PropertyCard key={property.id} property={property} onClick={() => setSelectedProperty(property)} />
                              ))}
                        </div>
                        <button onClick={() => { handleCarouselScroll('left'); stopAutoScroll(); }} className="absolute top-1/2 left-0 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 hidden sm:flex items-center justify-center shadow-md z-10 transition" aria-label="Previous Property">
                          <i className="fa-solid fa-chevron-left text-gray-700"></i>
                        </button>
                         <button onClick={() => { handleCarouselScroll('right'); stopAutoScroll(); }} className="absolute top-1/2 right-0 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 hidden sm:flex items-center justify-center shadow-md z-10 transition" aria-label="Next Property">
                          <i className="fa-solid fa-chevron-right text-gray-700"></i>
                        </button>
                      </>
                  )}
                </div>
              </div>
          </section>

          <section id="sobre" className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">{t('about')}</h2>
              <div className="grid md:grid-cols-5 gap-12">
                <div className="md:col-span-2">
                  <img src="https://i.postimg.cc/131QvDnS/Foto-Leandro.jpg" alt="Foto de Leandro Buscarioli Colares" className="rounded-lg shadow-xl w-full h-full object-cover"/>
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-3xl font-bold text-gray-800">{t('aboutName')}</h3>
                  <p className="text-md text-gray-600 mb-6">{t('aboutCreci')}</p>
                  <p className="mb-4 text-gray-700">{t('aboutText1')}</p>
                  <p className="mb-4 text-gray-700">{t('aboutText2')}</p>
                  <p className="mb-4 text-gray-700">{t('aboutText3')}</p>
                  <p className="mb-6 text-gray-700">{t('aboutText4')}</p>
                  <h4 className="text-2xl font-semibold text-gray-800 mt-8 mb-6">{t('whyChooseMe')}</h4>
                  <div className="grid sm:grid-cols-3 gap-6 text-center">
                      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <div className="flex justify-center mb-3 text-blue-600"> <UserIcon /> </div>
                          <h5 className="font-bold text-lg mb-2">{t('card1Title')}</h5>
                          <p className="text-sm text-gray-600">{t('card1Text')}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <div className="flex justify-center mb-3 text-blue-600"> <MapPinIcon /> </div>
                          <h5 className="font-bold text-lg mb-2">{t('card2Title')}</h5>
                          <p className="text-sm text-gray-600">{t('card2Text')}</p>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                          <div className="flex justify-center mb-3 text-blue-600"> <StarIcon /> </div>
                          <h5 className="font-bold text-lg mb-2">{t('card3Title')}</h5>
                          <p className="text-sm text-gray-600">{t('card3Text')}</p>
                      </div>
                  </div>
                  <div className="mt-10 text-center md:text-left">
                      <a href="#contato" className="bg-[#6c9a8b] hover:bg-[#5a8a7b] text-white font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center justify-center space-x-2 transition duration-300">
                          <span>{t('contactMe')}</span>
                          <span className="font-sans" aria-hidden="true">&rarr;</span>
                      </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer id="contato" className="bg-[#2C3E50] text-gray-300 py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('contactFooter')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <i className="fa-solid fa-mobile-screen-button w-5 text-center"></i>
                    <a href="tel:+5511991866739" className="hover:text-white transition-colors">Celular: (11) 99186-6739</a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <i className="fab fa-instagram w-5 text-center"></i>
                    <a href="https://www.instagram.com/lecocorretor" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram: @lecocorretor</a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <i className="fab fa-facebook w-5 text-center"></i>
                    <a href="https://www.facebook.com/corretorleco" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook: corretorleco</a>
                  </li>
                   <li className="flex items-center space-x-3">
                    <i className="fab fa-linkedin w-5 text-center"></i>
                    <a href="https://www.linkedin.com/in/leandro-buscarioli" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn: Leandro Buscarioli</a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <i className="fa-regular fa-envelope w-5 text-center"></i>
                    <a href="mailto:consultorimobiliarioleco@gmail.com" className="hover:text-white transition-colors">consultorimobiliarioleco@gmail.com</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('locationFooter')}</h3>
                <div className="rounded-lg overflow-hidden border-2 border-gray-600">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.695353177372!2d-46.56847868444317!3d-23.651064971617804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce43a393a577c9%3A0x671404617d93489!2sR.%20Pacaembu%2C%20297%20-%20Paulic%C3%A9ia%2C%20S%C3%A3o%20Bernardo%20do%20Campo%20-%20SP%2C%2009692-040!5e0!3m2!1spt-BR!2sbr!4v1678886450123!5m2!1spt-BR!2sbr" width="100%" height="250" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Endereço no Google Maps"></iframe>
                </div>
                <p className="mt-2 text-center text-sm">
                  Rua Pacaembu, 297 - Bairro Pauliceia, São Bernardo do Campo, SP, CEP 09692-040, Brasil
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
              &copy; 2025 Leandro Buscarioli Colares | CRECI-SP 283775F
            </div>
          </div>
        </footer>

        <a href="https://wa.me/5511991866739" target="_blank" rel="noopener noreferrer" aria-label="Fale conosco no WhatsApp" className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-50 transform hover:scale-110 transition-transform">
          <i className="fab fa-whatsapp text-4xl" aria-hidden="true"></i>
        </a>
      </div>
      {selectedProperty && <PropertyModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </>
  );
};


// --- ADMIN COMPONENTS ---

const PROPERTY_TYPES = [
  // Imóveis Residenciais
  "Casa", "Apartamento", "Sobrado", "Kitnet / Studio", "Loft", "Cobertura", "Duplex / Triplex", "Casa geminada", "Casa de condomínio", "Mansão", "Bangalô", "Chalé", "Flat", "Edícula", "Quitinete", "Casa térrea", "Casa de vila", "Casa de campo / Sítio residencial", "Fazenda com moradia", "Moradia estudantil / República",
  // Imóveis Comerciais
  "Sala comercial", "Loja / Ponto comercial", "Galpão", "Depósito / Armazém", "Escritório", "Andar comercial", "Quiosque", "Box comercial", "Auditório", "Salão comercial", "Centro empresarial", "Shopping center (loja ou espaço interno)", "Coworking",
  // Imóveis Industriais
  "Fábrica", "Galpão industrial", "Parque industrial", "Usina", "Hangar",
  // Imóveis Rurais
  "Sítio", "Fazenda", "Chácara", "Haras", "Granja", "Terreno rural", "Propriedade agropecuária",
  // Terrenos e Lotes
  "Lote urbano", "Terreno em condomínio", "Terreno comercial", "Terreno industrial", "Terreno agrícola", "Loteamento",
  // Imóveis de Lazer / Temporada
  "Casa de praia", "Casa de campo", "Chalé de montanha", "Pousada", "Resort", "Hotel / Motel", "Flat de temporada",
  // Imóveis Institucionais / Especiais
  "Escola", "Hospital / Clínica", "Igreja / Templo", "Teatro / Cinema", "Museu / Galeria", "Centro esportivo / Academia", "Estacionamento / Garagem", "Delegacia / Quartel / Prédio público"
];

const AutocompleteInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    id: string;
    name: string;
    required?: boolean;
    error?: boolean;
}> = ({ value, onChange, options, placeholder, id, name, required, error }) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isListVisible, setIsListVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsListVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);
    
    const filterAndSetSuggestions = (text: string) => {
        const filtered = options.filter(option =>
            option.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
        );
        setSuggestions(filtered);
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputValue(text);
        onChange(text);
        filterAndSetSuggestions(text);
        if (!isListVisible) {
            setIsListVisible(true);
        }
    };
    
    const handleFocus = () => {
        setIsListVisible(true);
        filterAndSetSuggestions(inputValue); // Filter based on current value, shows all if empty
    };

    const onSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        onChange(suggestion);
        setIsListVisible(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                id={id}
                name={name}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
            />
            {isListVisible && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg scrollbar-hide">
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onMouseDown={(e) => { e.preventDefault(); onSuggestionClick(suggestion); }}
                                className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                            >
                                {suggestion}
                            </li>
                        ))
                    ) : (
                         <li className="px-4 py-2 text-gray-500">Nenhuma opção encontrada</li>
                    )}
                </ul>
            )}
        </div>
    );
};

const PropertyForm: React.FC<{
  onSubmit: (property: Omit<Property, 'id'>) => void;
  onCancel: () => void;
  initialData?: Property | null;
}> = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', type: '', category: 'venda' as 'venda' | 'aluguel',
        price: 0, neighborhood: '', city: '', bedrooms: 0, bathrooms: 0, area: 0,
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
                city: initialData.city, bedrooms: initialData.bedrooms, bathrooms: initialData.bathrooms, 
                area: initialData.area,
                isFeatured: initialData.isFeatured,
            });
            setImageUrls(initialData.imageUrls);
            setMainImageIndex(initialData.mainImageIndex);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' 
                ? checked 
                : (name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'area' ? parseFloat(value) : value) 
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
            setMainImageIndex(prev => prev -1);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "O título é obrigatório.";
        if (!formData.neighborhood.trim()) newErrors.neighborhood = "O bairro é obrigatório.";
        if (!formData.city.trim()) newErrors.city = "A cidade é obrigatória.";
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
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{initialData ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">Bairro</label>
                            <input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleChange} required className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.neighborhood ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
                            {errors.neighborhood && <p className="mt-1 text-xs text-red-600">{errors.neighborhood}</p>}
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                            <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
                            {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}></textarea>
                        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="1" step="any" placeholder="Ex: 250000" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
                            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                             <AutocompleteInput
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={(value) => handleAutocompleteChange('type', value)}
                                options={PROPERTY_TYPES}
                                placeholder="Ex: Apartamento"
                                required
                                error={!!errors.type}
                            />
                            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="venda">Venda</option>
                                <option value="aluguel">Aluguel</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="area" className="block text-sm font-medium text-gray-700">Área (m²)</label>
                            <input type="number" name="area" id="area" value={formData.area} onChange={handleChange} required min="1" placeholder="Ex: 50" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.area ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
                            {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
                        </div>
                         <div>
                            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Quartos</label>
                            <input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms} onChange={handleChange} required min="0" step="1" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.bedrooms ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
                             {errors.bedrooms && <p className="mt-1 text-xs text-red-600">{errors.bedrooms}</p>}
                        </div>
                        <div>
                            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Banheiros</label>
                            <input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms} onChange={handleChange} required min="0" step="1" className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.bathrooms ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}/>
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
                                <label htmlFor="isFeatured" className="font-medium text-gray-700">Marcar como Destaque</label>
                                <p className="text-gray-500">Imóveis em destaque aparecem na página inicial.</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fotos (até 10)</label>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${errors.images ? 'border-red-500' : 'border-gray-300'}`}>
                            <div className="space-y-1 text-center">
                                <i className="fa-solid fa-image text-4xl text-gray-400 mx-auto"></i>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                        <span>Carregar arquivos</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} disabled={imageUrls.length >= 10}/>
                                    </label>
                                    <p className="pl-1">ou arraste e solte</p>
                                </div>
                                <p className="text-xs text-gray-500">{10 - imageUrls.length} restantes</p>
                            </div>
                        </div>
                         {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
                    </div>

                    {isUploading && <LoadingSpinner />}
                    {imageUrls.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Imagens Carregadas:</h4>
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
                        <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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


const AdminDashboard: React.FC<{
    properties: Property[];
    user: User;
    onDataChange: () => Promise<void>;
    onLogout: () => void;
}> = ({ properties, user, onDataChange, onLogout }) => {
    const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [filterCategory, setFilterCategory] = useState<'all' | 'venda' | 'aluguel'>('all');
    const [filterType, setFilterType] = useState<string>('');
    const [filterCity, setFilterCity] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [priceRange, setPriceRange] = useState<string>('all');
    const [minBedrooms, setMinBedrooms] = useState<string>('');
    const [maxBedrooms, setMaxBedrooms] = useState<string>('');

    const handleAddClick = () => {
        if (properties.length >= 100) {
            alert("Limite de 100 imóveis atingido. Exclua um imóvel para adicionar outro.");
            return;
        }
        setEditingProperty(null);
        setView('add');
    };

    const handleEditClick = (property: Property) => {
        setEditingProperty(property);
        setView('edit');
    };

    const handleDeleteClick = async (propertyId: number) => {
        if (window.confirm("Tem certeza que deseja excluir este imóvel? A ação não pode ser desfeita.")) {
            try {
                await deleteProperty(propertyId);
                await onDataChange();
            } catch (error) {
                console.error("Failed to delete property:", error);
                alert("Não foi possível excluir o imóvel.");
            }
        }
    };

    const handleFormSubmit = async (formData: Omit<Property, 'id'>) => {
        try {
            if (view === 'add') {
                await addProperty(formData);
            } else if (view === 'edit' && editingProperty) {
                await updateProperty(editingProperty.id, formData);
            }
            await onDataChange();
            setView('list');
            setEditingProperty(null);
        } catch(error) {
            console.error("Failed to save property:", error);
            alert("Não foi possível salvar o imóvel.");
        }
    };

    const propertyTypes = [...new Set(properties.map(p => p.type))];
    const propertyCities = [...new Set(properties.map(p => p.city))];
    const filteredProperties = properties.filter(p => {
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        const matchesType = filterType === '' || p.type === filterType;
        const matchesCity = filterCity === '' || p.city === filterCity;
        const matchesSearch = searchTerm === '' || 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.city.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPrice = (() => {
            if (priceRange === 'all') return true;
            if (priceRange === '0-100000') return p.price <= 100000;
            if (priceRange === '100001-300000') return p.price > 100000 && p.price <= 300000;
            if (priceRange === '300001-') return p.price > 300000;
            return true;
        })();

        const minBeds = minBedrooms !== '' ? parseInt(minBedrooms, 10) : -1;
        const maxBeds = maxBedrooms !== '' ? parseInt(maxBedrooms, 10) : Infinity;
        const matchesBedrooms = p.bedrooms >= minBeds && p.bedrooms <= maxBeds;
        
        return matchesCategory && matchesType && matchesCity && matchesSearch && matchesPrice && matchesBedrooms;
    });
    
    const stats = {
        total: properties.length,
        venda: properties.filter(p => p.category === 'venda').length,
        aluguel: properties.filter(p => p.category === 'aluguel').length,
        totalSalesValue: properties
            .filter(p => p.category === 'venda')
            .reduce((sum, property) => sum + property.price, 0)
    };

    if (view === 'add' || view === 'edit') {
        return (
            <PropertyForm
                onSubmit={handleFormSubmit}
                onCancel={() => { setView('list'); setEditingProperty(null); }}
                initialData={editingProperty}
            />
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                     <div className="flex items-center space-x-3">
                        <img src="https://i.postimg.cc/131QvDnS/Foto-Leandro.jpg" alt="Logo" className="w-10 h-10 rounded-full"/>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard de Imóveis</h1>
                     </div>
                    <div className="flex items-center space-x-4">
                        <img src={user.picture} alt={user.name} title={user.email} className="w-9 h-9 rounded-full" />
                        <a href="/#" className="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center space-x-2">
                           <i className="fa-solid fa-arrow-left"></i>
                           <span className="hidden sm:inline">Voltar ao Site</span>
                        </a>
                        <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center space-x-2">
                           <LogoutIcon />
                           <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total de Imóveis</p>
                            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                         <div className="bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center">
                            <i className="fa-solid fa-building"></i>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Imóveis à Venda</p>
                            <p className="text-3xl font-bold text-gray-800">{stats.venda}</p>
                        </div>
                         <div className="bg-green-100 text-green-600 rounded-full h-12 w-12 flex items-center justify-center">
                            <i className="fa-solid fa-tags"></i>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Imóveis para Aluguel</p>
                            <p className="text-3xl font-bold text-gray-800">{stats.aluguel}</p>
                        </div>
                         <div className="bg-orange-100 text-orange-600 rounded-full h-12 w-12 flex items-center justify-center">
                            <i className="fa-solid fa-key"></i>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Valor Total em Vendas</p>
                            <p className="text-2xl xl:text-3xl font-bold text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalSalesValue)}</p>
                        </div>
                         <div className="bg-purple-100 text-purple-600 rounded-full h-12 w-12 flex items-center justify-center">
                            <i className="fa-solid fa-sack-dollar"></i>
                        </div>
                    </div>
                </div>
                
                {/* Filters and Actions */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
                        <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
                            <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" placeholder="Buscar por título, local..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                        </div>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="all">Todas as Categorias</option>
                            <option value="venda">Venda</option>
                            <option value="aluguel">Aluguel</option>
                        </select>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">Todos os Tipos</option>
                            {propertyTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <button onClick={handleAddClick} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors">
                            <i className="fa-solid fa-plus"></i>
                            <span>Cadastrar Imóvel</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end border-t border-gray-200 mt-4 pt-4">
                        <div>
                            <label htmlFor="priceRangeFilter" className="block text-sm font-medium text-gray-700">Faixa de Preço</label>
                            <select id="priceRangeFilter" value={priceRange} onChange={e => setPriceRange(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="all">Todas</option>
                                <option value="0-100000">Até R$100.000</option>
                                <option value="100001-300000">R$100.001 - R$300.000</option>
                                <option value="300001-">Acima de R$300.000</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700">Cidade</label>
                            <select id="cityFilter" value={filterCity} onChange={e => setFilterCity(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Todas as Cidades</option>
                                {propertyCities.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="minBedroomsFilter" className="block text-sm font-medium text-gray-700">Quartos (Mín)</label>
                           <input type="number" id="minBedroomsFilter" placeholder="Ex: 1" min="0" value={minBedrooms} onChange={e => setMinBedrooms(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="maxBedroomsFilter" className="block text-sm font-medium text-gray-700">Quartos (Máx)</label>
                            <input type="number" id="maxBedroomsFilter" placeholder="Ex: 3" min="0" value={maxBedrooms} onChange={e => setMaxBedrooms(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                        </div>
                    </div>
                </div>

                {/* Property List */}
                {filteredProperties.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map(prop => (
                            <div key={prop.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col animate-fade-in">
                                <img src={prop.imageUrls[prop.mainImageIndex] || ''} alt={prop.title} className="w-full h-48 object-cover"/>
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start">
                                      <h3 className="text-lg font-bold text-gray-800 truncate pr-2">{prop.title}</h3>
                                      <div className="flex items-center space-x-2 flex-shrink-0">
                                        {prop.isFeatured && (
                                            <div title="Em destaque" className="text-yellow-500">
                                                <i className="fa-solid fa-star"></i>
                                            </div>
                                        )}
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${prop.category === 'venda' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{prop.category}</span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{prop.type} • {prop.neighborhood}, {prop.city}</p>
                                    <p className="text-gray-600 text-sm mb-4 flex-grow">{prop.description.substring(0, 80)}{prop.description.length > 80 ? '...' : ''}</p>
                                    <p className="text-xl font-semibold text-gray-900 mb-3">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}</p>
                                </div>
                                 <div className="border-t p-3 bg-gray-50 flex justify-end space-x-2">
                                     <button onClick={() => handleEditClick(prop)} className="text-sm text-blue-600 hover:text-blue-800 font-medium py-1 px-3 rounded-md hover:bg-blue-50 transition-colors" title="Editar"><i className="fa-solid fa-pen-to-square mr-1"></i>Editar</button>
                                     <button onClick={() => handleDeleteClick(prop.id)} className="text-sm text-red-600 hover:text-red-800 font-medium py-1 px-3 rounded-md hover:bg-red-50 transition-colors" title="Excluir"><i className="fa-solid fa-trash-can mr-1"></i>Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <i className="fa-solid fa-house-circle-xmark text-5xl text-gray-400 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-800">Nenhum imóvel encontrado</h3>
                        <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou cadastre um novo imóvel.</p>
                    </div>
                )}
            </main>
        </div>
    );
};


// --- ROUTER & MAIN APP ---

const App: React.FC = () => {
    const [location, setLocation] = useState(window.location.hash);
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Check for logged in user on mount
    useEffect(() => {
        // TODO: Firebase Integration - Replace localStorage with onAuthStateChanged
        // This is the recommended way to get the current user.
        // import { auth } from './services/firebase';
        // import { onAuthStateChanged } from "firebase/auth";
        // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        //   if (firebaseUser) {
        //     setUser({ name: firebaseUser.displayName!, email: firebaseUser.email!, picture: firebaseUser.photoURL! });
        //   } else {
        //     setUser(null);
        //   }
        //   setIsAuthLoading(false);
        // });
        // return () => unsubscribe();

        try {
            const storedUser = localStorage.getItem('leandroCorretorUser');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('leandroCorretorUser');
        }
        setIsAuthLoading(false);
    }, []);


    const loadProperties = useCallback(async () => {
        setIsLoading(true);
        try {
            const props = await getProperties();
            setAllProperties(props);
        } catch (error) {
            console.error("Failed to load properties:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    useEffect(() => {
        const handleHashChange = () => setLocation(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        // TODO: Firebase Integration - Sign out from Firebase
        // import { auth } from './services/firebase';
        // import { signOut } from "firebase/auth";
        // await signOut(auth);

        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
        }
        localStorage.removeItem('leandroCorretorUser');
        setUser(null);
        window.location.hash = '#/'; // Redirect to home after logout
    };

    if (location.startsWith('#/dashboard')) {
        // Login is temporarily bypassed to allow direct access to the dashboard.
        // A mock user is created for the AdminDashboard component.
        // To re-enable login, restore the original logic below.
        const mockUser: User = {
            name: "Leandro B. Colares",
            email: "admin@leandrocorretor.com.br",
            picture: "https://i.postimg.cc/131QvDnS/Foto-Leandro.jpg"
        };

        return <AdminDashboard 
            properties={allProperties}
            user={mockUser}
            onDataChange={loadProperties}
            onLogout={handleLogout}
        />;

        /* --- Original Login Logic ---
        if (isAuthLoading) {
             return <LoadingSpinner />;
        }
        if (user) {
            return <AdminDashboard 
                properties={allProperties}
                user={user}
                onDataChange={loadProperties}
                onLogout={handleLogout}
            />;
        }
        return <LoginScreen onLoginSuccess={handleLogin} />;
        */
    }
    
    if (isLoading && !location.startsWith('#/dashboard')) {
        return <LoadingSpinner />;
    }

    return <PublicSite properties={allProperties} />;
};

export default App;