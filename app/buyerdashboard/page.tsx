'use client';

import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';
import SettingsView from '@/components/SettingsView';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import { Country } from '@/types/country';
import { COUNTRIES } from '@/constants/countries';

interface Property {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  parking: number;
  imageUrl: string;
  images?: string[];
  isNew: boolean;
  timeAgo: string;
  isFavorite: boolean;
  status: 'For Sale' | 'For Rent' | 'Commercial';
}

interface PropertyDetail extends Property {
  description: string;
  features: string[];
  amenities: { name: string; value: string }[];
  propertyType: string;
  pricePerSqft: string;
  garage: string;
  address: string;
  builderName: string;
  builderEmail: string;
  monthlyEstimate: string;
  floodRisk: string;
  floodFactor: number;
  roomImages: { title: string; imageUrl: string; count: number }[];
  principalInterest: number;
  propertyTax: number;
  homeInsurance: number;
  otherCost: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const TABS = ['For Sale', 'For Rent', 'Commercial'] as const;
type Tab = (typeof TABS)[number];

const SORT_OPTIONS = ['Newest', 'Lowest Price', 'Highest Price'];

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Browse Listings',
    href: '/buyerdashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'requests',
    label: 'My Requests',
    href: '/my-requests',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved Properties',
    href: '/saved-properties',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'devices',
    label: 'Devices',
    href: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
];


const getTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const days = Math.floor(diffHours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}m ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch {
    return 'Recently';
  }
};

const formatPrice = (price: any): string => {
  if (!price && price !== 0) return '$0';
  
  let numPrice: number;
  if (typeof price === 'number') {
    numPrice = price;
  } else {
    const cleaned = String(price).replace(/[^0-9.-]/g, '');
    numPrice = parseFloat(cleaned);
    if (isNaN(numPrice)) numPrice = 0;
  }
  
  if (numPrice >= 1_000_000) {
    return `$${(numPrice / 1_000_000).toFixed(1)}M`;
  }
  if (numPrice >= 1_000) {
    return `$${(numPrice / 1_000).toFixed(0)}K`;
  }
  return `$${numPrice.toFixed(0)}`;
};

const formatPricePKR = (price: number): string => {
  return '₨ ' + price.toLocaleString('en-PK');
};

const getNumericPrice = (price: any): number => {
  if (!price && price !== 0) return 0;
  if (typeof price === 'number') return price;
  const cleaned = String(price).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const getPropertyImageUrl = (property: any): string => {
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    return property.images[0];
  }
  if (property.imageUrl && property.imageUrl.trim() !== '') {
    return property.imageUrl;
  }
  return 'https://picsum.photos/seed/default/800/500';
};

// ── API Functions ──────────────────────────────────────────────────────────
const fetchProperties = async (
  tab: Tab,
  page: number,
  limit: number = 6,
  sortBy: string = 'newest',
  selectedCountry?: string,
  selectedCity?: string
): Promise<{ properties: Property[]; pagination: PaginationData }> => {
  try {
    let sortParam = 'newest';
    if (sortBy === 'Lowest Price') sortParam = 'price_asc';
    if (sortBy === 'Highest Price') sortParam = 'price_desc';
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      type: tab,
      sortBy: sortParam,
    });
    
    // Add country and city to params if selected
    if (selectedCountry) params.append('country', selectedCountry);
    if (selectedCity) params.append('city', selectedCity);

    // Use dynamic endpoint with city parameter instead of hardcoded "New York"
    const endpoint = selectedCity ? `/property/city/${encodeURIComponent(selectedCity)}` : '/property/all';
    const response = await api.get(`${endpoint}?${params.toString()}`);
    
    if (response.data && response.data.success !== false) {
      const data = response.data;
      let propertiesList: any[] = [];
      let paginationData: PaginationData = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        limit: limit,
        hasNext: false,
        hasPrev: page > 1
      };
      
      if (data.data && Array.isArray(data.data)) {
        propertiesList = data.data;
        if (data.pagination) {
          paginationData = {
            currentPage: data.pagination.currentPage || page,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.total || 0,
            limit: data.pagination.limit || limit,
            hasNext: data.pagination.currentPage < data.pagination.totalPages,
            hasPrev: (data.pagination.currentPage || page) > 1
          };
        }
      } else if (Array.isArray(data)) {
        propertiesList = data;
        paginationData.totalItems = data.length;
        paginationData.totalPages = Math.ceil(data.length / limit);
        paginationData.hasNext = page * limit < data.length;
      }
      
      let favorites: string[] = [];
      try {
        favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      } catch (e) {
        favorites = [];
      }
      
      const uiProperties: Property[] = propertiesList.map((prop: any) => {
        let locationDisplay = 'Karachi';
        if (prop.location) {
          if (typeof prop.location === 'object') {
            locationDisplay = `${prop.location.city || ''}, ${prop.location.state || ''}`;
            if (locationDisplay === ', ') locationDisplay = prop.location.address || 'Karachi';
          } else {
            locationDisplay = prop.location;
          }
        }
        
        return {
          id: prop._id || prop.id,
          title: prop.title || 'Property',
          price: prop.priceDisplay || formatPrice(prop.price),
          priceValue: prop.priceValue || getNumericPrice(prop.price),
          location: locationDisplay,
          type: prop.type || tab,
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          area: prop.area?.display || (prop.area ? `${prop.area.value} sqft` : '0 sqft'),
          parking: prop.parking || 0,
          imageUrl: getPropertyImageUrl(prop),
          images: prop.images || (prop.imageUrl ? [prop.imageUrl] : []),
          isNew: prop.isNew || false,
          timeAgo: prop.timeAgo || getTimeAgo(prop.createdAt),
          isFavorite: favorites.includes(prop._id || prop.id),
          status: prop.type || tab,
        };
      });
      
      return {
        properties: uiProperties,
        pagination: paginationData,
      };
    }
    
    return { 
      properties: [], 
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 6, hasNext: false, hasPrev: false } 
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { 
      properties: [], 
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 6, hasNext: false, hasPrev: false } 
    };
  }
};

// ── Country and City Dropdown Components ──────────────────────────────────────────

// Country Dropdown Component (using static data)
function CountryDropdown({ value, onSelect, placeholder }: { value: string; onSelect: (country: Country) => void; placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(c => c.name === value);

  return (
    <div style={{ position: 'relative', minWidth: '200px' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          height: '36px',
          background: '#fff',
          border: '1px solid #E0DBD0',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          color: value ? '#1A1A1A' : '#999',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        {selectedCountry && (
          <img src={selectedCountry.flagUrl} alt="flag" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
        )}
        <span style={{ flex: 1, textAlign: 'left' }}>
          {value || placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          background: '#fff',
          border: '1px solid #E0DBD0',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          minWidth: '250px',
          maxHeight: '300px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F0EBE1' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #E0DBD0',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {filteredCountries.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: value === country.name ? 'rgba(180,154,100,0.08)' : 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: value === country.name ? '#B49A64' : '#555',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <img src={country.flagUrl} alt="flag" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: 2 }} />
                  <span>{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// City Dropdown Component
function CityDropdown({ value, countryName, onSelect, placeholder, disabled }: { value: string; countryName: string; onSelect: (city: string) => void; placeholder: string; disabled: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (countryName) {
      fetchCities();
    } else {
      setCities([]);
    }
  }, [countryName]);
  
  const fetchCities = async () => {
    if (!countryName) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://countriesnow.space/api/v0.1/countries/cities/q?country=${encodeURIComponent(countryName)}`);
      const data = await response.json();
      if (data.error === false && data.data) {
        const sortedCities = [...data.data].sort();
        setCities(sortedCities);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div style={{ position: 'relative', minWidth: '200px' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && countryName && setIsOpen(!isOpen)}
        disabled={disabled || !countryName}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          height: '36px',
          background: (disabled || !countryName) ? '#F5F2EC' : '#fff',
          border: '1px solid #E0DBD0',
          borderRadius: '10px',
          cursor: (disabled || !countryName) ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          color: value ? '#1A1A1A' : '#999',
          fontFamily: "'DM Sans', sans-serif",
          opacity: (disabled || !countryName) ? 0.6 : 1
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#B49A64" strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="2.5" stroke="#B49A64" strokeWidth="1.5"/>
        </svg>
        <span style={{ flex: 1, textAlign: 'left' }}>
          {value || (!countryName ? 'Select country first' : placeholder)}
        </span>
        {countryName && !disabled && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      
      {isOpen && countryName && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          background: '#fff',
          border: '1px solid #E0DBD0',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          minWidth: '200px',
          maxHeight: '300px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F0EBE1' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #E0DBD0',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                Loading...
              </div>
            ) : filteredCities.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                {searchTerm ? 'No cities found' : 'No cities available'}
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onSelect(city);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: value === city ? 'rgba(180,154,100,0.08)' : 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: value === city ? '#B49A64' : '#555',
                    cursor: 'pointer'
                  }}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const fetchPropertyDetail = async (id: string): Promise<PropertyDetail | null> => {
  try {
    const response = await api.get(`/property/public/${id}`);
    
    if (response.data && response.data.success !== false) {
      const data = response.data.data || response.data;
      
      let favorites: string[] = [];
      try {
        favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      } catch (e) {
        favorites = [];
      }
      
      const monthlyEstimate = formatPricePKR(Math.round(data.price / 12));
      const areaValue = data.area?.value || 0;
      const pricePerSqft = areaValue > 0 ? formatPricePKR(Math.round(data.price / areaValue)) : 'N/A';
      
      const address = data.location 
        ? `${data.location.address || ''}, ${data.location.city || ''}, ${data.location.state || ''}`
        : 'Address not available';
      
      const allImages = [];
      if (data.images && Array.isArray(data.images)) {
        allImages.push(...data.images);
      }
      if (data.imageUrl && !allImages.includes(data.imageUrl)) {
        allImages.unshift(data.imageUrl);
      }
      if (allImages.length === 0) {
        allImages.push('https://picsum.photos/seed/default/1200/700');
      }
      
      const roomImages = [];
      if (data.bedroomImages && data.bedroomImages.length) {
        roomImages.push({ title: 'Bedrooms', imageUrl: data.bedroomImages[0], count: data.bedroomImages.length });
      }
      if (data.bathroomImages && data.bathroomImages.length) {
        roomImages.push({ title: 'Bathrooms', imageUrl: data.bathroomImages[0], count: data.bathroomImages.length });
      }
      if (data.kitchenImages && data.kitchenImages.length) {
        roomImages.push({ title: 'Kitchen', imageUrl: data.kitchenImages[0], count: data.kitchenImages.length });
      }
      if (data.livingImages && data.livingImages.length) {
        roomImages.push({ title: 'Living Room', imageUrl: data.livingImages[0], count: data.livingImages.length });
      }
      if (data.exteriorImages && data.exteriorImages.length) {
        roomImages.push({ title: 'Exterior', imageUrl: data.exteriorImages[0], count: data.exteriorImages.length });
      }
      
      let amenitiesArray: { name: string; value: string }[] = [];
      if (data.amenities) {
        if (Array.isArray(data.amenities)) {
          amenitiesArray = data.amenities.map((a: any) => ({ name: a, value: 'Available' }));
        } else if (typeof data.amenities === 'object') {
          amenitiesArray = Object.entries(data.amenities).map(([key, val]) => ({ name: key, value: String(val) }));
        }
      }
      
      let locationDisplay = 'Karachi';
      if (data.location) {
        if (typeof data.location === 'object') {
          locationDisplay = `${data.location.city || ''}, ${data.location.state || ''}`;
          if (locationDisplay === ', ') locationDisplay = data.location.address || 'Karachi';
        } else {
          locationDisplay = data.location;
        }
      }
      
      const principalInterest = Math.round(data.price * 0.008 / 12);
      const propertyTax = Math.round(data.price * 0.0012 / 12);
      const homeInsurance = Math.round(data.price * 0.0004 / 12);
      const otherCost = Math.round((data.hoaFees || 0) + (data.principalInterest || 0) * 0.1);
      
      return {
        id: data._id,
        title: data.title || 'Property',
        price: data.priceDisplay || formatPrice(data.price),
        priceValue: data.price,
        monthlyEstimate: monthlyEstimate,
        builderName: data.builderName || data.realtorId?.name || 'Property Owner',
        builderEmail: data.builderEmail || data.realtorId?.email || 'contact@example.com',
        address: address,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        area: data.area?.display || `${data.area?.value || 0} sqft`,
        parking: data.parking || 0,
        imageUrl: allImages[0],
        images: allImages,
        isNew: data.isNew || false,
        timeAgo: getTimeAgo(data.createdAt),
        isFavorite: favorites.includes(data._id),
        status: data.type || 'For Sale',
        type: data.type || 'For Sale',
        location: locationDisplay,
        description: data.description || 'No description available.',
        features: data.features || [],
        amenities: amenitiesArray,
        propertyType: data.propertyType || 'House',
        pricePerSqft: pricePerSqft,
        garage: `${data.garageSpaces || data.parking || 0} Car Garage`,
        roomImages: roomImages,
        floodRisk: data.floodRisk || 'Minimal Risk',
        floodFactor: data.floodFactor || 0.15,
        principalInterest: principalInterest,
        propertyTax: propertyTax,
        homeInsurance: homeInsurance,
        otherCost: otherCost,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching property detail:', error);
    return null;
  }
};

// ── Mortgage Calculator Hook ─────────────────────────────────────────────────
function useMortgage(priceValue: number) {
  const [downPayment, setDownPayment] = useState(0);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(5.849);
  const [monthly, setMonthly] = useState(0);

  useEffect(() => {
    const loan = Math.max(0, priceValue - downPayment);
    if (interestRate === 0) { setMonthly(loan / (loanTerm * 12)); return; }
    const mr = interestRate / 100 / 12;
    const n = loanTerm * 12;
    const mp = loan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    setMonthly(isNaN(mp) ? 0 : mp);
  }, [priceValue, downPayment, loanTerm, interestRate]);

  return { downPayment, setDownPayment, loanTerm, setLoanTerm, interestRate, setInterestRate, monthly };
}

function DonutChart({ sections }: { sections: { value: number; color: string; label: string }[] }) {
  const total = sections.reduce((s, x) => s + x.value, 0);
  const r = 52, cx = 64, cy = 64, stroke = 22;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;

  if (total === 0) return null;

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F5F2EC" strokeWidth={stroke} />
      {sections.map((s, i) => {
        const pct = s.value / total;
        const dash = pct * circ;
        const offset = circ * (0.25 - cumulative);
        cumulative += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A1A1A">Total</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#888">Monthly</text>
    </svg>
  );
}

// ── Schedule Tour Modal Component ───────────────────────────────────────────
function ScheduleTourModal({ 
  isOpen, 
  onClose, 
  propertyId, 
  propertyTitle,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  propertyId: string; 
  propertyTitle: string;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];
  
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);
  
  const handleSchedule = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/tours/schedule', {
        propertyId,
        propertyTitle,
        date: selectedDate,
        time: selectedTime,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      
      if (response.data && response.data.success !== false) {
        setIsScheduled(true);
        onSuccess();
        setTimeout(() => {
          onClose();
          setIsScheduled(false);
          setSelectedDate('');
          setSelectedTime('10:00 AM');
        }, 2000);
      } else {
        alert(response.data?.message || 'Failed to schedule tour');
      }
    } catch (error: any) {
      console.error('Error scheduling tour:', error);
      alert(error?.response?.data?.message || 'Failed to schedule tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isScheduled) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.25s ease',
          margin: isMobile ? 'auto 16px' : 'auto',
        }}
      >
        {!isScheduled ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F0EBE1', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Schedule a Tour</h3>
              <button onClick={onClose} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '18px' }}>✕</button>
            </div>
            
            <div style={{ margin: '20px 24px', padding: '16px', background: '#F5F2EC', borderRadius: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="#B49A64" strokeWidth="1.8"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>You want to tour:</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{propertyTitle}</div>
              </div>
            </div>
            
            <div style={{ padding: '0 24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '8px' }}>Select Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '8px' }}>Select Time</label>
                <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                  {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '8px' }}>Your Information</label>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }} />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }} />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #F0EBE1', marginTop: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={onClose} style={{ flex: 1, height: '48px', background: '#F5F2EC', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSchedule} disabled={isLoading} style={{ flex: 2, height: '48px', background: isLoading ? '#999' : '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#B49A64', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isLoading ? <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} /> : 'Schedule Tour'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Tour Scheduled!</div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>{selectedDate} at {selectedTime}</div>
            <div style={{ fontSize: '12px', color: '#B49A64' }}>We'll send you a confirmation email shortly.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Contact Modal Component ─────────────────────────────────────────────────
function ContactModal({ 
  isOpen, 
  onClose, 
  propertyTitle, 
  propertyPrice, 
  propertyLocation, 
  builderEmail, 
  builderName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  propertyTitle: string; 
  propertyPrice: string; 
  propertyLocation: string; 
  builderEmail: string; 
  builderName: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || '');
        setEmail(user.email || '');
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);
  
  const handleSend = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      alert('Please enter a valid email address');
      return;
    }
    if (!message.trim()) {
      alert('Please enter your message');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const subject = `Inquiry about: ${propertyTitle}`;
      const body = `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nProperty: ${propertyTitle}\nPrice: ${propertyPrice}\nLocation: ${propertyLocation}\n\nMessage:\n${message.trim()}\n\n---\nThis message was sent from Estate App.`;
      
      const response = await api.post('/contact/send-email', {
        to: builderEmail,
        subject: subject,
        body: body,
        fromEmail: email.trim(),
        fromName: name.trim(),
      });
      
      if (response.data && response.data.success !== false) {
        setIsSent(true);
        setTimeout(() => {
          onClose();
          setIsSent(false);
          setMessage('');
        }, 2000);
      } else {
        alert(response.data?.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSent) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.25s ease',
          margin: isMobile ? 'auto 16px' : 'auto',
        }}
      >
        {!isSent ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F0EBE1', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Contact Builder</h3>
              <button onClick={onClose} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '18px' }}>✕</button>
            </div>
            
            {/* Builder Info Card */}
            <div style={{ margin: '20px 24px', padding: '16px', background: '#F5F2EC', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#B49A64' }}>
                {builderName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>{builderName}</div>
                <div style={{ fontSize: '11px', color: '#B49A64' }}>✓ Verified Builder</div>
                {!isMobile && <div style={{ fontSize: '11px', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 4L14 13 9 9L2 17" stroke="#B49A64" strokeWidth="1.5"/><rect x="2" y="4" width="20" height="16" rx="2" stroke="#B49A64" strokeWidth="1.5"/></svg>
                  {builderEmail}
                </div>}
              </div>
            </div>
            
            {/* Property Info Card */}
            <div style={{ margin: '0 24px 20px 24px', padding: '12px', background: '#FAFAF8', borderRadius: '12px', border: '1px solid #F0EBE1' }}>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>You are inquiring about:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{propertyTitle}</div>
              <div style={{ fontSize: '12px', color: '#B49A64', marginTop: '2px' }}>{propertyPrice} · {propertyLocation}</div>
            </div>
            
            {/* Form Fields */}
            <div style={{ padding: '0 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Your Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Your Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Message *</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder={`Hi, I'm interested in ${propertyTitle}. Could you provide more information?`} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              </div>
            </div>
            
            {isMobile && builderEmail && (
              <div style={{ margin: '0 24px 16px 24px', padding: '10px', background: 'rgba(180,154,100,0.08)', borderRadius: '10px', wordBreak: 'break-all' }}>
                <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>Builder Email:</div>
                <div style={{ fontSize: '11px', color: '#B49A64' }}>{builderEmail}</div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #F0EBE1', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={onClose} style={{ flex: 1, height: '48px', background: '#F5F2EC', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSend} disabled={isLoading} style={{ flex: 2, height: '48px', background: isLoading ? '#999' : '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#B49A64', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isLoading ? <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} /> : `Send Message to ${builderName}`}
              </button>
            </div>
            
            {!isMobile && (
              <div style={{ padding: '0 24px 20px 24px' }}>
                <div style={{ padding: '10px', background: 'rgba(180,154,100,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#B49A64" strokeWidth="1.5"/></svg>
                  <span style={{ fontSize: '11px', color: '#B49A64' }}>Your message will be sent directly to {builderName}.</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Message Sent!</div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Your message has been sent to {builderName}.</div>
            <div style={{ fontSize: '12px', color: '#B49A64' }}>We'll notify you when they reply.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Components ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'hidden' }}>
      <div style={{ height: isMobile ? '160px' : '200px', background: '#F5F0E8' }} />
      <div style={{ padding: isMobile ? '12px' : '16px' }}>
        <div style={{ height: '14px', width: '70%', background: '#F0EBE1', borderRadius: '6px', marginBottom: '10px' }} />
        <div style={{ height: '12px', width: '50%', background: '#F0EBE1', borderRadius: '6px', marginBottom: '10px' }} />
        <div style={{ height: '36px', width: '100%', background: '#F0EBE1', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

function PropertyCard({ property, onCardClick, onFavorite }: { property: Property; onCardClick: (id: string) => void; onFavorite: (id: string) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div onClick={() => onCardClick(property.id)} onMouseEnter={() => !isMobile && setHovered(true)} onMouseLeave={() => !isMobile && setHovered(false)} style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${hovered ? 'rgba(180,154,100,0.3)' : '#F0EBE1'}`, overflow: 'hidden', transition: 'all 0.25s ease', transform: hovered ? 'translateY(-3px)' : 'translateY(0)', boxShadow: hovered ? '0 12px 32px rgba(180,154,100,0.12)' : '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
      <div style={{ position: 'relative', height: isMobile ? '180px' : '200px', overflow: 'hidden', background: '#F5F0E8' }}>
        {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,#F5F0E8 30%,#EDE7D9 50%,#F5F0E8 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />}
        <img src={property.imageUrl} alt={property.title} onLoad={() => setImgLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.4s ease, opacity 0.4s ease' }} />
        {property.isNew && <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(26,26,26,0.85)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 10px', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', color: '#B49A64', zIndex: 5 }}>NEW · {property.timeAgo.toUpperCase()}</div>}
        <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(26,26,26,0.8)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '6px 12px', zIndex: 5 }}>
          <div style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{property.price}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>{property.type}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onFavorite(property.id); }} style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 5 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={property.isFavorite ? '#EF4444' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={property.isFavorite ? '#EF4444' : '#999'} strokeWidth="2" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div style={{ padding: isMobile ? '12px' : '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: '#1A1A1A', marginBottom: '4px', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg>
          <span style={{ fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.location}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1', padding: '10px 0', marginBottom: '14px', gap: '4px' }}>
          {[{ val: property.bedrooms, label: 'Beds' }, { val: property.bathrooms, label: 'Baths' }, { val: property.area, label: 'Area' }, { val: property.parking, label: 'Park' }].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid #F0EBE1' : 'none' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <button style={{ width: '100%', height: '40px', background: 'transparent', border: '1.5px solid #E0DBD0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif", marginTop: 'auto' }} onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#1A1A1A'; (e.target as HTMLButtonElement).style.color = '#B49A64'; (e.target as HTMLButtonElement).style.borderColor = '#1A1A1A'; }} onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.color = '#1A1A1A'; (e.target as HTMLButtonElement).style.borderColor = '#E0DBD0'; }}>View Details</button>
      </div>
    </div>
  );
}

// Detail View Component
function PropertyDetailView({ property, onBack, onFavorite }: { property: PropertyDetail; onBack: () => void; onFavorite: (id: string) => void }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  const mortgage = useMortgage(property.priceValue);
  
  const prevImg = () => setCurrentImg(i => i === 0 ? ((property.images?.length ?? 1) - 1) : i - 1);
  const nextImg = () => setCurrentImg(i => (i + 1) % (property.images?.length ?? 1));
  
  const fmt = (n: number) => '₨ ' + n.toLocaleString('en-PK');
  
  const totalMonthly = property.principalInterest + property.propertyTax + property.homeInsurance + property.otherCost;
  const costSections = [
    { value: property.principalInterest, color: '#3B82F6', label: 'Principal & Interest' },
    { value: property.propertyTax, color: '#F59E0B', label: 'Property Tax' },
    { value: property.homeInsurance, color: '#10B981', label: 'Insurance' },
    { value: property.otherCost, color: '#8B5CF6', label: 'Other' },
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', color: '#B49A64', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>← Back to Listings</button>
        <span style={{ color: '#CCC' }}>/</span>
        <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#1A1A1A', fontWeight: '500' }}>{property.title}</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '24px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Image Gallery */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#1A1A1A', marginBottom: '20px', position: 'relative' }}>
            <div style={{ position: 'relative', height: isMobile ? '280px' : '420px', overflow: 'hidden' }}>
              {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,#1A1A1A 30%,#2C2415 50%,#1A1A1A 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />}
              <img src={(property.images || [property.imageUrl])[currentImg]} alt={property.title} onLoad={() => setImgLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#B49A64', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{property.type.toUpperCase()}</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#fff', fontWeight: '500' }}>{currentImg + 1} / {(property.images || [property.imageUrl]).length}</div>
              <button onClick={prevImg} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
              <button onClick={nextImg} style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                {(property.images || [property.imageUrl]).slice(0, 9).map((_, i) => (<button key={i} onClick={() => setCurrentImg(i)} style={{ border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}><div style={{ width: i === currentImg ? '22px' : '6px', height: '6px', borderRadius: '3px', background: i === currentImg ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }} /></button>))}
              </div>
            </div>
            {property.roomImages.length > 0 && (<div style={{ display: 'flex', gap: '4px', padding: '6px', background: 'rgba(0,0,0,0.3)', overflowX: 'auto' }}>{property.roomImages.map((room, i) => (<div key={i} style={{ flex: 1, minWidth: '80px', position: 'relative', height: '72px', borderRadius: '8px', overflow: 'hidden' }}><img src={room.imageUrl} alt={room.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '4px' }}><span style={{ fontSize: '9px', fontWeight: '700', color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>{room.title}</span><span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>({room.count})</span></div></div>))}</div>)}
          </div>

          {/* Price & Core Info */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div><div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>{property.price}</div><div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>Est. {property.monthlyEstimate}</div></div>
              {property.isNew && <div style={{ background: 'rgba(180,154,100,0.1)', border: '1px solid rgba(180,154,100,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', color: '#B49A64', letterSpacing: '1px' }}>NEW · {property.timeAgo.toUpperCase()}</div>}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginTop: '14px', marginBottom: '12px' }}>Built by {property.builderName}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>{[`${property.bedrooms} Beds`, `${property.bathrooms} Baths`, property.area, `${property.parking} Parking`].map(c => (<div key={c} style={{ background: '#F5F2EC', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '500', color: '#555' }}>{c}</div>))}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg><span style={{ fontSize: '13px', color: '#777' }}>{property.address}</span></div>
          </div>

          {/* Property Details */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '16px' }}>Property Details</h2>
            {[['Property Type', property.propertyType], ['Price per Sqft', property.pricePerSqft], ['Garage', property.garage], ['Status', property.type]].map(([k, v]) => (<div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F2EC' }}><span style={{ fontSize: '13px', color: '#888' }}>{k}</span><span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{v}</span></div>))}
          </div>

          {/* Description */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '12px' }}>Description</h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{property.description}</p>
          </div>

          {/* Features */}
          {property.features.length > 0 && (<div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}><h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '14px' }}>Features & Amenities</h2><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{property.features.map(f => (<div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F5F2EC', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: '#555', border: '1px solid #EDE7D9' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#B49A64" strokeWidth="2.5" strokeLinecap="round"/></svg>{f}</div>))}</div></div>)}

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '14px' }}>Amenities</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0' }}>{property.amenities.map((a, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: i % 4 < 2 ? '#FAFAF8' : '#fff' }}><span style={{ fontSize: '13px', color: '#888' }}>{a.name}</span><span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{a.value}</span></div>))}</div>
            </div>
          )}

          {/* Monthly Cost Breakdown */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '20px' }}>Monthly Cost Breakdown</h2>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ flexShrink: 0 }}><DonutChart sections={costSections} /><div style={{ textAlign: 'center', marginTop: '8px' }}><div style={{ fontSize: '18px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{fmt(totalMonthly)}</div><div style={{ fontSize: '11px', color: '#999' }}>/ month est.</div></div></div>
              <div style={{ flex: 1, minWidth: '180px' }}>{costSections.map((s, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} /><span style={{ fontSize: '12px', color: '#555' }}>{s.label}</span></div><span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{fmt(s.value)}</span></div>))}<div style={{ borderTop: '1px solid #F0EBE1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '12px', fontWeight: '700', color: '#555' }}>Total</span><span style={{ fontSize: '14px', fontWeight: '700', color: '#B49A64' }}>{fmt(totalMonthly)}</span></div></div>
              </div>
              <button onClick={() => setShowCalc(true)} style={{ width: '100%', marginTop: '16px', height: '42px', background: '#F5F2EC', border: '1.5px solid #E0DBD0', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>Open Mortgage Calculator</button>
            </div>
          </div>

        {/* RIGHT COLUMN */}
        <div style={{ position: 'sticky', top: '0' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999', marginBottom: '14px' }}>Listed By</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#B49A64', flexShrink: 0 }}>{property.builderName[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>{property.builderName}</div><div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500' }}>✓ Verified</div></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => setShowSchedule(true)} style={{ flex: 1, height: '44px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>Schedule Tour</button>
              <button onClick={() => setShowContact(true)} style={{ flex: 1, height: '44px', background: '#fff', border: '1.5px solid #E0DBD0', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>Contact</button>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(180,154,100,0.7)', marginBottom: '14px' }}>Quick Summary</div>
            {[{ label: 'List Price', value: property.price, highlight: true }, { label: 'Est. Monthly', value: property.monthlyEstimate }, { label: 'Price/sqft', value: property.pricePerSqft }, { label: 'Lot Size', value: property.area }].map(item => (<div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{item.label}</span><span style={{ fontSize: item.highlight ? '16px' : '13px', fontWeight: '700', color: item.highlight ? '#B49A64' : 'rgba(255,255,255,0.85)', fontFamily: item.highlight ? "'Cormorant Garamond', serif" : 'inherit' }}>{item.value}</span></div>))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999', marginBottom: '14px' }}>Mortgage Preview</div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{fmt(Math.round(mortgage.monthly))}</div>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '14px' }}>per month · {mortgage.loanTerm}yr @ {mortgage.interestRate}%</div>
            <div style={{ marginBottom: '10px' }}><label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '5px' }}>Down Payment</label><input type="number" value={mortgage.downPayment} onChange={e => mortgage.setDownPayment(Number(e.target.value))} style={{ width: '100%', height: '38px', paddingInline: '12px', fontSize: '13px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '9px', outline: 'none' }} /></div>
            <button onClick={() => setShowCalc(true)} style={{ width: '100%', height: '38px', background: '#F5F2EC', border: '1px solid #E0DBD0', borderRadius: '9px', fontSize: '12px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Full Calculator →</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleTourModal isOpen={showSchedule} onClose={() => { setShowSchedule(false); }} propertyId={property.id} propertyTitle={property.title} onSuccess={() => {}} />
      <ContactModal isOpen={showContact} onClose={() => { setShowContact(false); }} propertyTitle={property.title} propertyPrice={property.price} propertyLocation={property.location} builderEmail={property.builderEmail} builderName={property.builderName} />

      {/* Mortgage Calculator Modal */}
      {showCalc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowCalc(false); }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '28px', margin: isMobile ? 'auto 16px' : 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}><h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Mortgage Calculator</h3><button onClick={() => setShowCalc(false)} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button></div>
            <div style={{ background: 'linear-gradient(135deg, #1A1A1A, #2C2415)', borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}><div style={{ fontSize: '11px', color: 'rgba(180,154,100,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Estimated Monthly Payment</div><div style={{ fontSize: '40px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{fmt(Math.round(mortgage.monthly))}</div></div>
            <div style={{ marginTop: '14px' }}><label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Down Payment (₨)</label><input type="number" value={mortgage.downPayment} onChange={e => mortgage.setDownPayment(Number(e.target.value))} style={{ width: '100%', height: '44px', paddingInline: '14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }} /></div>
            <div style={{ marginTop: '14px' }}><label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Interest Rate (%)</label><input type="number" step="0.1" value={mortgage.interestRate} onChange={e => mortgage.setInterestRate(Number(e.target.value))} style={{ width: '100%', height: '44px', paddingInline: '14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }} /></div>
            <div style={{ marginTop: '14px' }}><label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Loan Term</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{[15, 20, 25, 30].map(y => (<button key={y} onClick={() => mortgage.setLoanTerm(y)} style={{ flex: 1, height: '40px', background: mortgage.loanTerm === y ? '#1A1A1A' : '#F5F2EC', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '600', color: mortgage.loanTerm === y ? '#B49A64' : '#555', cursor: 'pointer' }}>{y}yr</button>))}</div></div>
            <button onClick={() => setShowCalc(false)} style={{ width: '100%', marginTop: '16px', height: '44px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard Component ────────────────────────────────────────────────
export default function BuyerDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('home');
  const [activeTab, setActiveTab] = useState<Tab>('For Sale');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [showSort, setShowSort] = useState(false);
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 6,
    hasNext: false,
    hasPrev: false
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Country and City filter states
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);
  const [showDevices, setShowDevices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const sortRef = useRef<HTMLDivElement>(null);

  // ✅ AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = authService.getRole();
    
    if (!token) {
      router.replace('/login');
      return;
    }
    
    if (role !== 'buyer') {
      router.replace('/role-selection');
      return;
    }
  }, []);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setViewMode('grid');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadProperties = useCallback(async (pageNum: number, tab: Tab) => {
    if (!selectedCity && !selectedCountry) {
      setProperties([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: isMobile ? 4 : 6,
        hasNext: false,
        hasPrev: false
      });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await fetchProperties(tab, pageNum, isMobile ? 4 : 6, selectedSort, selectedCountry, selectedCity);
      setProperties(result.properties);
      setPagination(result.pagination);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSort, isMobile, selectedCountry, selectedCity]);

  const loadPropertyDetail = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await fetchPropertyDetail(id);
      if (detail) {
        setSelectedProperty(detail);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to load property detail:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handlePropertyClick = (id: string) => { loadPropertyDetail(id); };
  const handleBackToListings = () => { setSelectedProperty(null); };

  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setSavedCount(favorites.length);
    } catch (e) { setSavedCount(0); }
  }, []);

  // Load properties when location or tab changes
  useEffect(() => {
    if (activeNav === 'home' && !selectedProperty && !showDevices && !showSettings && (selectedCity || selectedCountry)) {
      setCurrentPage(1);
      loadProperties(1, activeTab);
      setHasSearched(true);
    }
  }, [activeTab, selectedSort, selectedCountry, selectedCity, loadProperties, activeNav, selectedProperty, showDevices, showSettings]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleFavorite = (id: string) => {
    setProperties(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nextIsFavorite = !p.isFavorite;
      try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (nextIsFavorite) { if (!favorites.includes(id)) favorites.push(id); } 
        else { const index = favorites.indexOf(id); if (index > -1) favorites.splice(index, 1); }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        setSavedCount(favorites.length);
      } catch (e) { console.error('Error updating favorites:', e); }
      return { ...p, isFavorite: nextIsFavorite };
    }));
    if (selectedProperty && selectedProperty.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      loadProperties(newPage, activeTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredProperties = properties.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));
  
  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(280px, 1fr))';
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country.name);
    setSelectedCity('');
    setHasSearched(false);
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  // Handle search button click
  const handleSearchLocation = () => {
    if (selectedCity) {
      setCurrentPage(1);
      loadProperties(1, activeTab);
      setHasSearched(true);
    } else if (selectedCountry) {
      setCurrentPage(1);
      loadProperties(1, activeTab);
      setHasSearched(true);
    }
  };

  // Handle navigation clicks
  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    setActiveNav(item.id);
    setSelectedProperty(null);
    setShowDevices(false);
    setShowSettings(false);
    
    if (item.id === 'home') {
      setActiveTab('For Sale');
      // loadProperties will be triggered by useEffect
    } else if (item.id === 'devices') {
      setShowDevices(true);
    } else if (item.id === 'settings') {
      setShowSettings(true);
    } else if (item.href) {
      router.push(item.href);
    }
    
    if (isMobile) setMobileSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: '#F5F2EC' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E0DBD0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #B49A64; }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .filter-panel {
            grid-template-columns: 1fr !important;
          }
          .table-container {
            overflow-x: auto !important;
          }
          .location-filters {
            flex-direction: column !important;
            width: 100% !important;
          }
          .location-filters > div {
            width: 100% !important;
          }
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 25,
          }}
        />
      )}
      {/* Sidebar - Responsive */}
      <aside style={{
        width: isMobile 
          ? (mobileSidebarOpen ? '240px' : '0px') 
          : (sidebarCollapsed ? '72px' : '240px'),
        background: 'linear-gradient(180deg, #1A1A1A 0%, #1F1C14 100%)',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 30,
        flexShrink: 0,
        borderRight: '1px solid rgba(180,154,100,0.1)',
        overflowX: 'hidden',
        height: '100vh',
        left: isMobile ? (mobileSidebarOpen ? '0' : '-240px') : '0',
      }}>
        <div style={{ 
          padding: sidebarCollapsed && !isMobile ? '24px 0' : '24px 20px', 
          borderBottom: '1px solid rgba(255,255,255,0.06)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between', 
          gap: '12px' 
        }}>
          {(!sidebarCollapsed || isMobile) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px' }}>Estatex</span>
            </div>
          )}
          {sidebarCollapsed && !isMobile && (
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
            </div>
          )}
          {!isMobile && (
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', flexShrink: 0, ...(sidebarCollapsed ? { position: 'absolute', right: '-14px', top: '30px', background: '#2C2415', border: '1px solid rgba(180,154,100,0.2)', borderRadius: '50%', width: '28px', height: '28px', zIndex: 20 } : {}) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d={sidebarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {(!sidebarCollapsed || isMobile) && <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', padding: '0 20px', marginBottom: '8px' }}>Main Menu</div>}
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item)} 
                title={sidebarCollapsed && !isMobile ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: (sidebarCollapsed && !isMobile) ? '12px 0' : '11px 20px',
                  justifyContent: (sidebarCollapsed && !isMobile) ? 'center' : 'flex-start',
                  background: isActive ? 'rgba(180,154,100,0.12)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #B49A64' : '3px solid transparent',
                  cursor: 'pointer',
                  color: isActive ? '#B49A64' : 'rgba(255,255,255,0.45)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && (
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}
                {(!sidebarCollapsed || isMobile) && item.id === 'saved' && savedCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', borderRadius: '20px', padding: '1px 7px', fontSize: '10px', fontWeight: '700' }}>
                    {savedCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        {(!sidebarCollapsed || isMobile) && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #B49A64, #9A8254)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>AR</div>
            <div><div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Ahmad Raza</div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Buyer</div></div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Toggle Button */}
      {isMobile && !mobileSidebarOpen && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: '16px',
            top: '16px',
            zIndex: 15,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#B49A64',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ 
          minHeight: '64px', 
          background: '#FFFFFF', 
          borderBottom: '1px solid #F0EBE1', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: isMobile ? '12px 16px' : '0 24px',
          gap: '12px', 
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          <div style={{ marginRight: 'auto' }}>
            <div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Welcome back</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>Ahmad Raza</div>
          </div>
          
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 320px', order: isMobile ? 1 : 0 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx  ="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isMobile ? "Search..." : "Search properties, locations…"} style={{ width: '100%', height: '38px', paddingLeft: '36px', paddingRight: '12px', fontSize: '13px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }} onFocus={e => { e.target.style.borderColor = '#B49A64'; e.target.style.background = '#fff'; }} onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F2EC'; }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {showDevices ? (
            <DevicesView onBack={() => {
              setShowDevices(false);
              setActiveNav('home');
            }} />
          ) : showSettings ? (
            <SettingsView onBack={() => {
              setShowSettings(false);
              setActiveNav('home');
            }} />
          ) : isDetailLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '13px', color: '#999' }}>Loading property details...</div>
            </div>
          ) : selectedProperty ? (
            <PropertyDetailView property={selectedProperty} onBack={handleBackToListings} onFavorite={toggleFavorite} />
          ) : (
            <>
              {/* Location Filters Row */}
              <div className="location-filters" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px',
                flexWrap: 'wrap',
                background: '#fff',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid #F0EBE1'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>🌍 Browse Properties by Location:</div>
                <CountryDropdown 
                  value={selectedCountry}
                  onSelect={handleCountrySelect}
                  placeholder="Select Country"
                />
                <CityDropdown 
                  value={selectedCity}
                  countryName={selectedCountry}
                  onSelect={handleCitySelect}
                  placeholder="Select City"
                  disabled={!selectedCountry}
                />
                <button
                  onClick={handleSearchLocation}
                  disabled={!selectedCity && !selectedCountry}
                  style={{
                    padding: '0 20px',
                    height: '36px',
                    background: (selectedCity || selectedCountry) ? '#1A1A1A' : '#E0DBD0',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: (selectedCity || selectedCountry) ? '#B49A64' : '#999',
                    cursor: (selectedCity || selectedCountry) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                  Search Properties
                </button>
                {(selectedCountry || selectedCity) && (
                  <button
                    onClick={() => {
                      setSelectedCountry('');
                      setSelectedCity('');
                      setProperties([]);
                      setHasSearched(false);
                      setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalItems: 0,
                        limit: isMobile ? 4 : 6,
                        hasNext: false,
                        hasPrev: false
                      });
                    }}
                    style={{
                      padding: '0 12px',
                      height: '36px',
                      background: 'transparent',
                      border: '1px solid #E0DBD0',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#EF4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
                    Clear
                  </button>
                )}
              </div>

              {!hasSearched && !selectedCity && !selectedCountry ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 20px',
                  background: '#fff',
                  borderRadius: '20px',
                  border: '1px solid #F0EBE1',
                  marginTop: '40px'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌍</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px', fontFamily: "'Cormorant Garamond', serif" }}>
                    Select a Location to Get Started
                  </div>
                  <div style={{ fontSize: '14px', color: '#999', maxWidth: '400px', margin: '0 auto' }}>
                    Please select a country and city from the dropdown above to browse properties in your desired location.
                  </div>
                </div>
              ) : isLoading && !hasSearched ? (
                <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                  {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '2px' }}>Browse Properties</h1>
                      <p style={{ fontSize: '13px', color: '#999', fontWeight: '300' }}>
                        {pagination.totalItems} listings found
                        {selectedCountry && <span style={{ color: '#B49A64' }}> in {selectedCountry}{selectedCity ? `, ${selectedCity}` : ''}</span>}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* View Toggle - Hide on mobile */}
                      {!isMobile && (
                        <div style={{ display: 'flex', background: '#fff', border: '1px solid #F0EBE1', borderRadius: '10px', overflow: 'hidden' }}>
                          <button onClick={() => setViewMode('grid')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#1A1A1A' : 'transparent', color: viewMode === 'grid' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/></svg>
                          </button>
                          <button onClick={() => setViewMode('list')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#1A1A1A' : 'transparent', color: viewMode === 'list' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      )}
                      
                      <button onClick={() => setShowFilterPanel(!showFilterPanel)} style={{ height: '36px', paddingInline: '14px', background: showFilterPanel ? '#1A1A1A' : '#fff', border: `1px solid ${showFilterPanel ? '#1A1A1A' : '#F0EBE1'}`, borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: showFilterPanel ? '#B49A64' : '#555', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        {!isMobile && "Filters"}
                      </button>
                      
                      <div style={{ position: 'relative' }} ref={sortRef}>
                        <button onClick={() => setShowSort(!showSort)} style={{ height: '36px', paddingInline: '14px', background: '#fff', border: '1px solid #F0EBE1', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: '#555', fontFamily: "'DM Sans', sans-serif" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          {isMobile ? selectedSort.substring(0, 3) : selectedSort}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transition: 'transform 0.2s', transform: showSort ? 'rotate(180deg)' : 'none' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        {showSort && (
                          <div style={{ position: 'absolute', top: '42px', right: 0, background: '#fff', border: '1px solid #F0EBE1', borderRadius: '12px', padding: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: isMobile ? '140px' : '160px' }}>
                            {SORT_OPTIONS.map(opt => (
                              <button key={opt} onClick={() => { setSelectedSort(opt); setShowSort(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: selectedSort === opt ? 'rgba(180,154,100,0.08)' : 'transparent', border: 'none', borderRadius: '8px', fontSize: isMobile ? '12px' : '13px', fontWeight: selectedSort === opt ? '600' : '400', color: selectedSort === opt ? '#B49A64' : '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {opt}
                                {selectedSort === opt && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#B49A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filter Panel */}
                  {showFilterPanel && (
                    <div className="filter-panel" style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: '20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                      {[{ label: 'Min Price ($)', placeholder: 'e.g. 50000' }, { label: 'Max Price ($)', placeholder: 'e.g. 5000000' }, { label: 'Min Bedrooms', placeholder: 'e.g. 2' }, { label: 'Min Bathrooms', placeholder: 'e.g. 1' }, { label: 'Min Area (sqft)', placeholder: 'e.g. 1000' }, { label: 'Max Area (sqft)', placeholder: 'e.g. 5000' }].map(f => (
                        <div key={f.label}>
                          <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                          <input placeholder={f.placeholder} style={{ width: '100%', height: '38px', paddingInline: '12px', fontSize: '13px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '9px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tabs */}
                  <div style={{ display: 'flex', background: '#fff', borderRadius: '12px', padding: '4px', border: '1px solid #F0EBE1', marginBottom: '20px', width: 'fit-content', overflowX: 'auto' }}>
                    {TABS.map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: isMobile ? '6px 14px' : '8px 22px', borderRadius: '9px', background: activeTab === tab ? '#1A1A1A' : 'transparent', border: 'none', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', fontWeight: '600', color: activeTab === tab ? '#B49A64' : '#999', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="stats-grid" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
                    gap: '12px', 
                    marginBottom: '24px' 
                  }}>
                    {[{ label: 'Total Listings', value: pagination.totalItems.toString(), delta: 'Active listings' }, { label: 'Saved', value: String(savedCount), delta: 'Your favorites' }, { label: 'Currency', value: 'USD $', delta: 'US Dollars' }, { label: 'Page', value: `${currentPage}/${pagination.totalPages}`, delta: 'Pagination' }].map(stat => (
                      <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: '16px' }}>
                        <div style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '2px' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
                        <div style={{ fontSize: '10px', color: '#B49A64', marginTop: '2px' }}>{stat.delta}</div>
                      </div>
                    ))}
                  </div>

                  {/* Properties Grid/List */}
                  {isLoading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                      {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : filteredProperties.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>No properties found</div>
                      <div style={{ fontSize: '13px', color: '#999' }}>Try adjusting your search, filters, or location</div>
                      {(selectedCountry || selectedCity) && (
                        <button
                          onClick={() => {
                            setSelectedCountry('');
                            setSelectedCity('');
                            setProperties([]);
                            setHasSearched(false);
                          }}
                          style={{ marginTop: '16px', padding: '8px 20px', background: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}
                        >
                          Clear Location Filters
                        </button>
                      )}
                    </div>
                  ) : viewMode === 'grid' || isMobile ? (
                    <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                      {filteredProperties.map(property => (
                        <PropertyCard key={property.id} property={property} onCardClick={handlePropertyClick} onFavorite={toggleFavorite} />
                      ))}
                    </div>
                  ) : (
                    // Table View - Desktop only
                    <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                          <tr style={{ background: '#1A1A1A' }}>
                            <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px' }}>Property</th>
                            <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Type</th>
                            <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Price</th>
                            <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Beds/Baths</th>
                            <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Area</th>
                            <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                          {filteredProperties.map((property, index) => (
                            <tr key={property.id} style={{ borderBottom: '1px solid #F0EBE1', background: index % 2 === 0 ? '#fff' : '#FAFAF8', cursor: 'pointer' }} onClick={() => handlePropertyClick(property.id)}>
                              <td style={{ padding: '12px' }}>
                                <div style={{ fontWeight: '600', color: '#1A1A1A' }}>{property.title}</div>
                                <div style={{ fontSize: '11px', color: '#999' }}>{property.location}</div>
                               </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span style={{ background: property.type === 'For Sale' ? 'rgba(34,197,94,0.1)' : property.type === 'For Rent' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', color: property.type === 'For Sale' ? '#22C55E' : property.type === 'For Rent' ? '#3B82F6' : '#F59E0B', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                  {property.type}
                                </span>
                               </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#B49A64' }}>{property.price}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>{property.bedrooms} / {property.bathrooms}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>{property.area}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill={property.isFavorite ? '#EF4444' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={property.isFavorite ? '#EF4444' : '#999'} strokeWidth="2"/></svg>
                                </button>
                               </td>
                             </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {!isLoading && pagination.totalPages > 1 && !isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px', padding: '16px 0' }}>
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={!pagination.hasPrev} style={{ padding: '8px 20px', background: pagination.hasPrev ? '#1A1A1A' : '#E0DBD0', color: pagination.hasPrev ? '#B49A64' : '#999', border: 'none', borderRadius: '10px', cursor: pagination.hasPrev ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '600' }}>← Previous</button>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          if (pageNum < 1 || pageNum > pagination.totalPages) return null;
                          return (
                            <button key={pageNum} onClick={() => handlePageChange(pageNum)} style={{ width: '40px', height: '40px', background: pageNum === currentPage ? '#B49A64' : '#fff', color: pageNum === currentPage ? '#fff' : '#555', border: pageNum === currentPage ? 'none' : '1px solid #F0EBE1', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: pageNum === currentPage ? '700' : '500' }}>
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination.hasNext} style={{ padding: '8px 20px', background: pagination.hasNext ? '#1A1A1A' : '#E0DBD0', color: pagination.hasNext ? '#B49A64' : '#999', border: 'none', borderRadius: '10px', cursor: pagination.hasNext ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: '600' }}>Next →</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          <div style={{ height: '32px' }} />
        </div>
      </div>
    </div>
  );
}