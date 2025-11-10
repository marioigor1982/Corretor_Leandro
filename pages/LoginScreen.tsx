import React, { useCallback, useEffect } from 'react';
import { User } from '../types';
import { HomeIcon } from '../components/icons';

export const LoginScreen: React.FC<{ onLoginSuccess: (user: User) => void; }> = ({ onLoginSuccess }) => {
    
    const handleLoginSuccess = useCallback((credentialResponse: any) => {
        try {
            const idToken = credentialResponse.credential;
            const userObject = JSON.parse(atob(idToken.split('.')[1]));
            const user: User = {
                name: userObject.name,
                email: userObject.email,
                picture: userObject.picture,
            };
            
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
                client_id: '396869408013-4h18v6c4jb99f8s1qc3h2csj5ed5mq1f.apps.googleusercontent.com',
                callback: handleLoginSuccess,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                { theme: 'outline', size: 'large', width: '250', logo_alignment: 'left' }
            );
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
