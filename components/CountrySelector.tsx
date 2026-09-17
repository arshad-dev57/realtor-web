'use client';

import { useState, useRef, useEffect } from 'react';
import { Country } from '@/types/country';
import { COUNTRIES } from '@/constants/countries';

interface CountrySelectorProps {
  onSelect: (country: Country) => void;
  selectedCountry?: Country | null;
  placeholder?: string;
  className?: string;
}

export default function CountrySelector({
  onSelect,
  selectedCountry,
  placeholder = 'Select country',
  className = '',
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        {selectedCountry ? (
          <>
            <img
              src={selectedCountry.flagUrl}
              alt={selectedCountry.name}
              className="w-6 h-4 object-cover rounded"
            />
            <span className="text-gray-900 font-medium">{selectedCountry.name}</span>
            <span className="text-gray-500 text-sm uppercase">({selectedCountry.code})</span>
          </>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <svg
          className={`w-5 h-5 ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-80">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                >
                  <img
                    src={country.flagUrl}
                    alt={country.name}
                    className="w-6 h-4 object-cover rounded"
                  />
                  <span className="text-gray-900 flex-1 text-left">{country.name}</span>
                  <span className="text-gray-400 text-sm uppercase">{country.code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
