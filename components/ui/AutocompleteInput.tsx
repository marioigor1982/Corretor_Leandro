import React, { useState, useEffect, useRef } from 'react';

export const AutocompleteInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    id: string;
    name: string;
    required?: boolean;
    error?: boolean;
    theme: 'light' | 'dark';
}> = ({ value, onChange, options, placeholder, id, name, required, error, theme }) => {
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

    const lightThemeClasses = "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
    const darkThemeClasses = "bg-slate-700 border-slate-600 text-white placeholder-gray-400";
    
    const lightThemeDropdownClasses = "bg-white border-gray-300";
    const darkThemeDropdownClasses = "bg-slate-700 border-slate-600";
    
    const lightThemeItemClasses = "text-gray-900 hover:bg-gray-100";
    const darkThemeItemClasses = "text-white hover:bg-slate-600";

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
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${theme === 'dark' ? darkThemeClasses : lightThemeClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
            />
            {isListVisible && (
                <ul className={`absolute z-10 w-full border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg scrollbar-hide ${theme === 'dark' ? darkThemeDropdownClasses : lightThemeDropdownClasses}`}>
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                onMouseDown={(e) => { e.preventDefault(); onSuggestionClick(suggestion); }}
                                className={`px-4 py-2 cursor-pointer ${theme === 'dark' ? darkThemeItemClasses : lightThemeItemClasses}`}
                            >
                                {suggestion}
                            </li>
                        ))
                    ) : (
                         <li className={`px-4 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Nenhuma opção encontrada</li>
                    )}
                </ul>
            )}
        </div>
    );
};
