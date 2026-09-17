'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';
import { Country } from '@/types/country';
import { COUNTRIES } from '@/constants/countries';

const COLORS = {
  gold: '#B49A64',
  darkBg: '#F5F2EC',
  white: '#FFFFFF',
  border: '#F0EBE1',
  textDark: '#1A1A1A',
  textLight: '#999',
};

// Home Icon Component
function HomeIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

// Navigation Items
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/realtor-dashboard', icon: <HomeIcon color="currentColor" size={18} /> },
  { id: 'properties', label: 'Properties', href: '/realtorProperties', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'leads', label: 'Assigned Leads', href: '/assigned-leads', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'requests', label: 'Lead Requests', href: '/lead-request', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'tours', label: 'Tours', href: '/tours', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'add-property', label: 'Add Property', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'devices', label: 'Devices', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'settings', label: 'Settings', href: '/settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

// Types
interface PropertyFormData {
  title: string;
  propertyType: string;
  listingType: string;
  salePrice: string;
  rentMinPrice: string;
  rentMaxPrice: string;
  commercialPrice: string;
  address: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string;
  garageSpaces: string;
  yearBuilt: string;
  stories: string;
  propertyUse: string;
  buildingSize: string;
  zoning: string;
  yearRenovated: string;
  floodRisk: string;
  floodFactor: number;
  selectedFeatures: string[];
  selectedCommercialFeatures: string[];
  description: string;
  principalInterest: string;
  propertyTax: string;
  homeInsurance: string;
  hoaFees: string;
  amenitiesCommunityCenter: string;
  amenitiesPark: string;
  amenitiesPool: string;
  veteransBenefits: boolean;
}

const STEPS = [
  { id: 0, title: 'Basic Info', subtitle: 'Property details & location' },
  { id: 1, title: 'Property Details', subtitle: 'Specifications & features' },
  { id: 2, title: 'Features & Images', subtitle: 'Amenities & photos' },
  { id: 3, title: 'Additional Info', subtitle: 'Extra details & costs' },
  { id: 4, title: 'Review', subtitle: 'Confirm & submit' },
];

const PROPERTY_TYPES = ['House', 'Condo', 'Townhome', 'Multi Family', 'Mobile', 'Farm', 'Land', 'Co-op', 'Condop'];
const LISTING_TYPES = ['For Sale', 'For Rent', 'Commercial'];
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5+'];
const BATHROOM_OPTIONS = ['1', '2', '3', '4', '5+'];
const GARAGE_OPTIONS = ['0', '1', '2', '3', '4+'];
const STORIES_OPTIONS = ['Single', 'Multi'];
const COMMERCIAL_USE_OPTIONS = ['Retail', 'Office', 'Industrial', 'Warehouse', 'Mixed-Use', 'Medical', 'Restaurant'];
const AVAILABLE_FEATURES = ['Central AC', 'Hardwood Floors', 'Swimming Pool', 'Smart Home', 'Security System', 'Garden', 'Parking', 'Pet Friendly', 'Fireplace', 'Balcony', 'Elevator', 'Gym', 'Sauna', 'Wheelchair Access'];
const COMMERCIAL_FEATURES = ['Loading Dock', 'Sprinkler System', 'Security Cameras', 'Elevator', 'Parking Garage', '24/7 Access', 'Kitchenette', 'Conference Room'];

// Searchable Country Dropdown Component (using static data)
function CountryDropdown({
  label,
  value,
  onSelect,
  icon,
  required = false,
  error = ''
}: any) {
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
    <div style={{ marginBottom: '16px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px', border: `1.5px solid ${error ? '#EF4444' : '#E0DBD0'}`,
          borderRadius: '10px', background: '#fff', cursor: 'pointer', textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        {icon && <span style={{ color: COLORS.gold }}>{icon}</span>}
        {selectedCountry && (
          <img src={selectedCountry.flagUrl} alt="flag" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
        )}
        <span style={{ flex: 1, fontSize: '13px', color: value ? '#1A1A1A' : '#999' }}>
          {value || `Select ${label}`}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      {error && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{error}</div>}

      {isOpen && (
        <div style={{
          position: 'absolute', zIndex: 50, marginTop: '4px', background: '#fff',
          border: '1px solid #E0DBD0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          width: '100%', minWidth: '280px'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F0EBE1' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #E0DBD0',
                borderRadius: '8px', fontSize: '13px', outline: 'none',
                fontFamily: "'DM Sans', sans-serif"
              }}
            />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: value === country.name ? 'rgba(180,154,100,0.08)' : 'transparent',
                    border: 'none', fontSize: '13px', color: value === country.name ? COLORS.gold : '#555',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                >
                  <img src={country.flagUrl} alt="flag" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
                  <span>{country.name}</span>
                  <span style={{ fontSize: '11px', color: '#999', marginLeft: 'auto' }}>{country.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Searchable City Dropdown Component
function CityDropdown({ 
  label, 
  value, 
  countryName,
  onSelect, 
  icon, 
  required = false,
  error = '',
  disabled = false
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch cities when country changes
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
    <div style={{ marginBottom: '16px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <button
        onClick={() => !disabled && countryName && setIsOpen(!isOpen)}
        disabled={disabled || !countryName}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px', border: `1.5px solid ${error ? '#EF4444' : '#E0DBD0'}`,
          borderRadius: '10px', background: (disabled || !countryName) ? '#F5F2EC' : '#fff',
          cursor: (disabled || !countryName) ? 'not-allowed' : 'pointer', textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif", opacity: (disabled || !countryName) ? 0.6 : 1
        }}
      >
        {icon && <span style={{ color: COLORS.gold }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: '13px', color: value ? '#1A1A1A' : '#999' }}>
          {value || (!countryName ? 'Select country first' : `Select ${label}`)}
        </span>
        {countryName && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      {error && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{error}</div>}
      
      {isOpen && countryName && (
        <div style={{
          position: 'absolute', zIndex: 50, marginTop: '4px', background: '#fff',
          border: '1px solid #E0DBD0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          width: '100%', minWidth: '250px'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F0EBE1' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', border: '1px solid #E0DBD0',
                borderRadius: '8px', fontSize: '13px', outline: 'none',
                fontFamily: "'DM Sans', sans-serif"
              }}
            />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid #E0DBD0', borderTopColor: COLORS.gold, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                Loading cities...
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
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: value === city ? 'rgba(180,154,100,0.08)' : 'transparent',
                    border: 'none', fontSize: '13px', color: value === city ? COLORS.gold : '#555',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span>{city}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Regular Dropdown (without search)
function DropdownField({ label, value, options, onChange, icon, required = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div style={{ marginBottom: '16px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1.5px solid #E0DBD0', borderRadius: '10px', background: '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif" }}>
        {icon && <span style={{ color: COLORS.gold }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: '13px', color: value ? '#1A1A1A' : '#999' }}>{value || `Select ${label}`}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 50, marginTop: '4px', background: '#fff', border: '1px solid #E0DBD0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto', minWidth: '200px' }}>
          {options.map((opt: string) => (
            <button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: value === opt ? 'rgba(180,154,100,0.08)' : 'transparent', border: 'none', fontSize: '13px', color: value === opt ? COLORS.gold : '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{opt}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function InputField({ label, hint, value, onChange, icon, isPrice = false, isNumeric = false, maxLines = 1, required = false, error = '' }: any) {
  const [isFocused, setIsFocused] = useState(false);
  const handleChange = (e: any) => {
    let val = e.target.value;
    if (isNumeric) val = val.replace(/[^0-9]/g, '');
    onChange(val);
  };
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <div style={{ display: 'flex', alignItems: 'flex-start', border: `1.5px solid ${error ? '#EF4444' : isFocused ? COLORS.gold : '#E0DBD0'}`, borderRadius: '10px', background: '#fff', transition: 'all 0.2s', overflow: 'hidden' }}>
        {icon && <div style={{ padding: '12px 0 12px 12px', color: COLORS.gold, flexShrink: 0 }}>{icon}</div>}
        {isPrice && <div style={{ padding: '12px 0 12px 8px', color: COLORS.gold, fontWeight: '600', flexShrink: 0 }}>$</div>}
        {maxLines === 1 ? (
          <input type="text" value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={hint} style={{ flex: 1, padding: '12px 12px', border: 'none', outline: 'none', fontSize: '13px', color: '#1A1A1A', background: 'transparent', fontFamily: "'DM Sans', sans-serif" }} />
        ) : (
          <textarea value={value} onChange={handleChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={hint} rows={maxLines} style={{ flex: 1, padding: '12px 12px', border: 'none', outline: 'none', fontSize: '13px', color: '#1A1A1A', background: 'transparent', fontFamily: "'DM Sans', sans-serif", resize: 'vertical' }} />
        )}
      </div>
      {error && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

function MultiSelectChips({ selected, options, onToggle }: any) {
  const [isMobileMulti, setIsMobileMulti] = useState(false);
  
  useEffect(() => {
    setIsMobileMulti(window.innerWidth < 768);
  }, []);
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
      {options.map((option: string) => (
        <button key={option} onClick={() => onToggle(option)} style={{ padding: isMobileMulti ? '5px 12px' : '6px 14px', borderRadius: '20px', fontSize: isMobileMulti ? '11px' : '12px', fontWeight: '500', background: selected.includes(option) ? COLORS.gold : '#fff', color: selected.includes(option) ? '#fff' : '#555', border: selected.includes(option) ? 'none' : '1px solid #E0DBD0', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>{option}</button>
      ))}
    </div>
  );
}

function ImageUploadCard({ title, subtitle, images, onAdd, onRemove }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileImg, setIsMobileImg] = useState(false);
  
  useEffect(() => {
    setIsMobileImg(window.innerWidth < 768);
  }, []);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onAdd(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  return (
    <div style={{ padding: '14px', background: '#FAFAF8', borderRadius: '12px', border: '1px solid #F0EBE1', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="2" stroke={COLORS.gold} strokeWidth="1.8"/><circle cx="8.5" cy="8.5" r="2.5" stroke={COLORS.gold} strokeWidth="1.8"/></svg>
          <span style={{ fontWeight: '600', fontSize: '13px', color: '#1A1A1A' }}>{title}</span>
        </div>
        <span style={{ fontSize: '11px', color: COLORS.gold }}>{images.length} uploaded</span>
      </div>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>{subtitle}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        {images.slice(0, isMobileImg ? 4 : 8).map((img: File, idx: number) => (
          <div key={idx} style={{ position: 'relative', width: isMobileImg ? '60px' : '80px', height: isMobileImg ? '60px' : '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E0DBD0' }}>
            <img src={URL.createObjectURL(img)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => onRemove(idx)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
        {images.length > (isMobileImg ? 4 : 8) && (
          <div style={{ width: isMobileImg ? '60px' : '80px', height: isMobileImg ? '60px' : '80px', borderRadius: '8px', background: '#F0EBE1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#666' }}>
            +{images.length - (isMobileImg ? 4 : 8)}
          </div>
        )}
      </div>
      <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', height: '60px', background: '#fff', border: '1px dashed #E0DBD0', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={COLORS.gold} strokeWidth="1.8" strokeLinecap="round"/></svg>
        <span style={{ fontSize: '11px', color: '#999' }}>Tap to upload</span>
      </button>
      <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
    </div>
  );
}

function Slider({ label, value, onChange }: any) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input type="range" min="0" max="10" step="1" value={value} onChange={(e) => onChange(parseInt(e.target.value))} style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#E0DBD0', accentColor: COLORS.gold }} />
        <span style={{ padding: '4px 10px', background: 'rgba(180,154,100,0.1)', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: COLORS.gold }}>{value}/10</span>
      </div>
    </div>
  );
}

function SwitchField({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#FAFAF8', borderRadius: '12px', border: '1px solid #F0EBE1', marginBottom: '16px' }}>
      <span style={{ fontSize: '13px', color: '#1A1A1A' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? COLORS.gold : '#E0DBD0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
        <div style={{ position: 'absolute', top: '2px', left: value ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}

function ReviewTile({ title, items }: any) {
  return (
    <div style={{ padding: '14px', background: '#FAFAF8', borderRadius: '12px', border: '1px solid #F0EBE1', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A', marginBottom: '10px' }}>{title}</h3>
      {items.map((item: string, idx: number) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <svg width="4" height="4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill={COLORS.gold} /></svg>
          <span style={{ fontSize: '12px', color: '#666' }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// Main Component
export default function AddPropertyPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('add-property');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  
  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '', propertyType: 'House', listingType: 'For Sale', salePrice: '', rentMinPrice: '', rentMaxPrice: '', commercialPrice: '',
    address: '', country: '', countryCode: '', countryFlag: '', city: '', state: 'NY', zipCode: '', latitude: 0, longitude: 0,
    bedrooms: '3', bathrooms: '2', squareFeet: '', lotSize: '', garageSpaces: '2', yearBuilt: '', stories: 'Single',
    propertyUse: 'Retail', buildingSize: '', zoning: '', yearRenovated: '', floodRisk: '', floodFactor: 1,
    selectedFeatures: [], selectedCommercialFeatures: [], description: '',
    principalInterest: '', propertyTax: '', homeInsurance: '', hoaFees: '',
    amenitiesCommunityCenter: '', amenitiesPark: '', amenitiesPool: '', veteransBenefits: false,
  });
  
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [bedroomImages, setBedroomImages] = useState<File[]>([]);
  const [bathroomImages, setBathroomImages] = useState<File[]>([]);
  const [kitchenImages, setKitchenImages] = useState<File[]>([]);
  const [livingImages, setLivingImages] = useState<File[]>([]);
  const [exteriorImages, setExteriorImages] = useState<File[]>([]);
  
  const updateField = <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field as string]; return newErrors; });
    }
  };
  
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Property title is required';
      if (!formData.address.trim()) newErrors.address = 'Street address is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (formData.listingType === 'For Sale' && !formData.salePrice) newErrors.salePrice = 'Sale price is required';
      if (formData.listingType === 'For Rent') {
        if (!formData.rentMinPrice) newErrors.rentMinPrice = 'Minimum rent is required';
        if (!formData.rentMaxPrice) newErrors.rentMaxPrice = 'Maximum rent is required';
      }
      if (formData.listingType === 'Commercial' && !formData.commercialPrice) newErrors.commercialPrice = 'Commercial price is required';
    }
    if (step === 1 && !formData.squareFeet) newErrors.squareFeet = 'Square feet is required';
    if (step === 2 && !mainImage) newErrors.mainImage = 'Main image is required';
    if (step === 3 && !formData.description.trim()) newErrors.description = 'Property description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => { if (validateStep(currentStep) && currentStep < 4) { setCurrentStep(currentStep + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const prevStep = () => { if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  
  const handleCountrySelect = (country: Country) => {
    updateField('country', country.name);
    updateField('countryCode', country.code);
    updateField('countryFlag', country.flag);
    updateField('city', ''); // Reset city when country changes
  };
  
  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    setIsLoading(true);
    try {
      const submitData = new FormData();
      let price = 0, priceDisplay = '';
      if (formData.listingType === 'For Sale') { price = parseInt(formData.salePrice) || 0; priceDisplay = `$${price.toLocaleString()}`; }
      else if (formData.listingType === 'For Rent') { price = parseInt(formData.rentMinPrice) || 0; const maxRent = parseInt(formData.rentMaxPrice) || 0; priceDisplay = maxRent > price ? `$${price.toLocaleString()} - $${maxRent.toLocaleString()}/month` : `$${price.toLocaleString()}/month`; }
      else { price = parseInt(formData.commercialPrice) || 0; priceDisplay = `$${price.toLocaleString()}`; }
      const squareFeet = parseInt(formData.squareFeet) || 0;
      const propertyData = {
        title: formData.title, description: formData.description, type: formData.listingType, propertyType: formData.propertyType,
        price, priceDisplay, location: { address: formData.address, city: formData.city, state: formData.state, country: formData.country, countryCode: formData.countryCode },
        bedrooms: parseInt(formData.bedrooms) || 0, bathrooms: parseInt(formData.bathrooms) || 0,
        area: { value: squareFeet, unit: 'sqft', display: `${squareFeet} sqft` }, parking: parseInt(formData.garageSpaces) || 0,
        features: formData.selectedFeatures, amenities: { communityCenter: formData.amenitiesCommunityCenter, park: formData.amenitiesPark, pool: formData.amenitiesPool },
        isNew: true, status: 'available', ...(formData.yearBuilt && { yearBuilt: parseInt(formData.yearBuilt) }), ...(formData.stories && { stories: formData.stories }),
        ...(formData.floodRisk && { floodRisk: formData.floodRisk }), ...(formData.floodFactor > 0 && { floodFactor: formData.floodFactor }),
        ...(formData.veteransBenefits && { veteransBenefits: formData.veteransBenefits }), ...(formData.lotSize && { lotSize: formData.lotSize }),
      };
      submitData.append('propertyData', JSON.stringify(propertyData));
      if (mainImage) submitData.append('mainImage', mainImage);
      bedroomImages.forEach(img => submitData.append('bedroomImages', img));
      bathroomImages.forEach(img => submitData.append('bathroomImages', img));
      kitchenImages.forEach(img => submitData.append('kitchenImages', img));
      livingImages.forEach(img => submitData.append('livingImages', img));
      exteriorImages.forEach(img => submitData.append('exteriorImages', img));
      const response = await api.post('/property/add', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data && response.data.success !== false) router.push('/realtorProperties');
      else alert(response.data?.message || 'Failed to add property');
    } catch (error: any) { console.error('Error:', error); alert(error.response?.data?.message || 'Failed to add property'); }
    finally { setIsLoading(false); }
  };
  
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: COLORS.darkBg }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .stepper-container {
            overflow-x: auto !important;
            padding-bottom: 8px !important;
          }
          .stepper-item {
            min-width: 100px !important;
          }
          .two-columns {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .review-tiles {
            margin-bottom: 16px;
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
          : (sidebarCollapsed ? 68 : 232),
        background: 'linear-gradient(180deg, #141210 0%, #1E1A10 60%, #1A1710 100%)',
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 30,
        flexShrink: 0,
        borderRight: '1px solid rgba(180,154,100,0.08)',
        overflowX: 'hidden',
        height: '100vh',
        left: isMobile ? (mobileSidebarOpen ? '0' : '-240px') : '0',
      }}>
        <div style={{
          padding: sidebarCollapsed && !isMobile ? '22px 0' : '22px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center',
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.gold}, #9A8050)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HomeIcon color="#fff" size={16} />
            </div>
            {(!sidebarCollapsed || isMobile) && <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'Cormorant Garamond', serif", letterSpacing: 0.5 }}>Estatex</span>}
          </div>
          {!isMobile && (
            <>
              {!sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(true)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              )}
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} style={{ position: 'absolute', right: -12, top: 28, background: '#2A2310', border: '1px solid rgba(180,154,100,0.25)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: COLORS.gold, zIndex: 20 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              )}
            </>
          )}
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {(!sidebarCollapsed || isMobile) && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', padding: '8px 18px 6px', marginBottom: 4 }}>Navigation</div>}
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button key={item.id}
                onClick={() => { 
                  setActiveNav(item.id);
                  setShowDevices(false);
                  if (item.id === 'devices') {
                    setShowDevices(true);
                  } else if (item.id === 'add-property') {
                    // Stay on current page
                  } else if (item.href) {
                    router.push(item.href);
                  }
                  if (isMobile) setMobileSidebarOpen(false);
                }}
                title={sidebarCollapsed && !isMobile ? item.label : undefined}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: (sidebarCollapsed && !isMobile) ? '11px 0' : '10px 18px', justifyContent: (sidebarCollapsed && !isMobile) ? 'center' : 'flex-start', background: isActive ? 'rgba(180,154,100,0.1)' : 'transparent', border: 'none', borderLeft: isActive ? `3px solid ${COLORS.gold}` : '3px solid transparent', cursor: 'pointer', color: isActive ? COLORS.gold : 'rgba(255,255,255,0.38)', transition: 'all 0.2s' }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        {(!sidebarCollapsed || isMobile) && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.gold}, #9A8050)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AR</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Ahmad Raza</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Senior Realtor</div>
            </div>
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
            background: COLORS.gold,
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
          background: '#fff', 
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
            <div style={{ fontSize: '11px', color: COLORS.gold, fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Add New</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Add Property</div>
          </div>
          <button onClick={() => router.push('/realtor/properties')} style={{ padding: isMobile ? '6px 14px' : '8px 20px', background: '#1A1A1A', border: 'none', borderRadius: '10px', fontSize: isMobile ? '12px' : '13px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer' }}>Cancel</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </header>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {showDevices ? (
            <DevicesView onBack={() => {
              setShowDevices(false);
              setActiveNav('add-property');
            }} />
          ) : (
            <>
              {/* Stepper Header - Responsive */}
              <div className="stepper-container" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '32px', 
                padding: '0 20px',
                overflowX: 'auto',
              }}>
                {STEPS.map((step, idx) => (
                  <div key={step.id} className="stepper-item" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: isMobile ? '90px' : 'auto' }}>
                    <button onClick={() => { if (idx <= currentStep) setCurrentStep(idx); }} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', background: 'transparent', border: 'none', cursor: idx <= currentStep ? 'pointer' : 'default', opacity: idx <= currentStep ? 1 : 0.5 }}>
                      <div style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', borderRadius: '50%', background: idx === currentStep ? COLORS.gold : (idx < currentStep ? '#10B981' : '#E0DBD0'), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}>
                        {idx < currentStep ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg> : idx + 1}
                      </div>
                      {!isMobile && (
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '11px', color: '#999' }}>Step {idx + 1}</div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: idx === currentStep ? COLORS.gold : '#555' }}>{step.title}</div>
                        </div>
                      )}
                    </button>
                    {idx < STEPS.length - 1 && !isMobile && <div style={{ flex: 1, height: '2px', background: idx < currentStep ? '#10B981' : '#E0DBD0', margin: '0 16px' }} />}
                  </div>
                ))}
              </div>
              
              {/* Step Content */}
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Step 0: Basic Info */}
                {currentStep === 0 && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1', padding: isMobile ? '16px' : '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Basic Information</h2>
                    <InputField label="Property Title" hint="e.g., Modern Luxury Villa" value={formData.title} onChange={(v: string) => updateField('title', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.8"/></svg>} required error={errors.title} />
                    <DropdownField label="Property Type" value={formData.propertyType} options={PROPERTY_TYPES} onChange={(v: string) => updateField('propertyType', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>} />
                    <DropdownField label="Listing Type" value={formData.listingType} options={LISTING_TYPES} onChange={(v: string) => updateField('listingType', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/></svg>} />
                    {formData.listingType === 'For Sale' && <InputField label="Sale Price" hint="e.g., 850000" value={formData.salePrice} onChange={(v: string) => updateField('salePrice', v)} isPrice required error={errors.salePrice} />}
                    {formData.listingType === 'For Rent' && (<><InputField label="Minimum Rent (per month)" hint="e.g., 2000" value={formData.rentMinPrice} onChange={(v: string) => updateField('rentMinPrice', v)} isPrice required error={errors.rentMinPrice} /><InputField label="Maximum Rent (per month)" hint="e.g., 3000" value={formData.rentMaxPrice} onChange={(v: string) => updateField('rentMaxPrice', v)} isPrice required error={errors.rentMaxPrice} /></>)}
                    {formData.listingType === 'Commercial' && <InputField label="Commercial Price" hint="e.g., 1500000" value={formData.commercialPrice} onChange={(v: string) => updateField('commercialPrice', v)} isPrice required error={errors.commercialPrice} />}
                    <div style={{ height: '2px', background: '#F0EBE1', margin: '24px 0' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Location</h2>
                    <InputField label="Street Address" hint="e.g., 6435 Green Pedal Ln" value={formData.address} onChange={(v: string) => updateField('address', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8"/></svg>} required error={errors.address} />
                    
                    {/* Country Dropdown with Search */}
                    <CountryDropdown 
                      label="Country" 
                      value={formData.country}
                      onSelect={handleCountrySelect}
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5"/></svg>}
                      required 
                      error={errors.country}
                    />
                    
                    {/* City Dropdown with Search */}
                    <CityDropdown 
                      label="City" 
                      value={formData.city}
                      countryName={formData.country}
                      onSelect={(city: string) => updateField('city', city)}
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5"/></svg>}
                      required 
                      error={errors.city}
                      disabled={!formData.country}
                    />
                    
                    <div className="two-columns" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                      <InputField label="State" hint="e.g., California" value={formData.state} onChange={(v: string) => updateField('state', v)} />
                      <InputField label="ZIP Code" hint="e.g., 77493" value={formData.zipCode} onChange={(v: string) => updateField('zipCode', v)} />
                    </div>
                  </div>
                )}
                
                {/* Step 1: Property Details */}
                {currentStep === 1 && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1', padding: isMobile ? '16px' : '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Property Details</h2>
                    {formData.listingType !== 'Commercial' && (<>
                      <div className="two-columns" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                        <DropdownField label="Bedrooms" value={formData.bedrooms} options={BEDROOM_OPTIONS} onChange={(v: string) => updateField('bedrooms', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg>} />
                        <DropdownField label="Bathrooms" value={formData.bathrooms} options={BATHROOM_OPTIONS} onChange={(v: string) => updateField('bathrooms', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.8"/></svg>} />
                      </div>
                      <div style={{ height: '16px' }} />
                    </>)}
                    <InputField label="Square Feet" hint="e.g., 2817" value={formData.squareFeet} onChange={(v: string) => updateField('squareFeet', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg>} isNumeric required error={errors.squareFeet} />
                    <InputField label="Lot Size" hint="e.g., 5000 sqft" value={formData.lotSize} onChange={(v: string) => updateField('lotSize', v)} />
                    <DropdownField label="Garage Spaces" value={formData.garageSpaces} options={GARAGE_OPTIONS} onChange={(v: string) => updateField('garageSpaces', v)} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg>} />
                    <InputField label="Year Built" hint="e.g., 2020" value={formData.yearBuilt} onChange={(v: string) => updateField('yearBuilt', v)} isNumeric />
                    {formData.listingType === 'Commercial' ? (<>
                      <DropdownField label="Property Use" value={formData.propertyUse} options={COMMERCIAL_USE_OPTIONS} onChange={(v: string) => updateField('propertyUse', v)} />
                      <InputField label="Building Size" hint="e.g., 10000 sqft" value={formData.buildingSize} onChange={(v: string) => updateField('buildingSize', v)} />
                      <InputField label="Zoning" hint="e.g., Commercial C-1" value={formData.zoning} onChange={(v: string) => updateField('zoning', v)} />
                      <InputField label="Year Renovated" hint="e.g., 2022" value={formData.yearRenovated} onChange={(v: string) => updateField('yearRenovated', v)} isNumeric />
                    </>) : (<DropdownField label="Stories" value={formData.stories} options={STORIES_OPTIONS} onChange={(v: string) => updateField('stories', v)} />)}
                    <div style={{ height: '2px', background: '#F0EBE1', margin: '24px 0' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Neighborhood</h2>
                    <InputField label="Flood Risk" hint="e.g., FEMA Flood Risk x" value={formData.floodRisk} onChange={(v: string) => updateField('floodRisk', v)} />
                    <Slider label="Flood Factor" value={formData.floodFactor} onChange={(v: number) => updateField('floodFactor', v)} />
                  </div>
                )}
                
                {/* Step 2: Features & Images */}
                {currentStep === 2 && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1', padding: isMobile ? '16px' : '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '16px', fontFamily: "'Cormorant Garamond', serif" }}>Features & Amenities</h2>
                    <MultiSelectChips selected={formData.selectedFeatures} options={AVAILABLE_FEATURES} onToggle={(val: string) => { const newSelected = formData.selectedFeatures.includes(val) ? formData.selectedFeatures.filter((f: string) => f !== val) : [...formData.selectedFeatures, val]; updateField('selectedFeatures', newSelected); }} />
                    {formData.listingType === 'Commercial' && (<><h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '12px', marginTop: '16px' }}>Commercial Features</h2><MultiSelectChips selected={formData.selectedCommercialFeatures} options={COMMERCIAL_FEATURES} onToggle={(val: string) => { const newSelected = formData.selectedCommercialFeatures.includes(val) ? formData.selectedCommercialFeatures.filter((f: string) => f !== val) : [...formData.selectedCommercialFeatures, val]; updateField('selectedCommercialFeatures', newSelected); }} /></>)}
                    <div style={{ height: '2px', background: '#F0EBE1', margin: '24px 0' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Property Photos</h2>
                    {errors.mainImage && <div style={{ fontSize: '12px', color: '#EF4444', marginBottom: '12px' }}>{errors.mainImage}</div>}
                    <ImageUploadCard title="Main Photo" subtitle="Upload the main property image (required)" images={mainImage ? [mainImage] : []} onAdd={(files: File[]) => setMainImage(files[0])} onRemove={() => setMainImage(null)} />
                    <ImageUploadCard title="Bedroom Photos" subtitle="Upload bedroom images" images={bedroomImages} onAdd={(files: File[]) => setBedroomImages([...bedroomImages, ...files])} onRemove={(idx: number) => setBedroomImages(bedroomImages.filter((_, i) => i !== idx))} />
                    <ImageUploadCard title="Bathroom Photos" subtitle="Upload bathroom images" images={bathroomImages} onAdd={(files: File[]) => setBathroomImages([...bathroomImages, ...files])} onRemove={(idx: number) => setBathroomImages(bathroomImages.filter((_, i) => i !== idx))} />
                    <ImageUploadCard title="Kitchen Photos" subtitle="Upload kitchen images" images={kitchenImages} onAdd={(files: File[]) => setKitchenImages([...kitchenImages, ...files])} onRemove={(idx: number) => setKitchenImages(kitchenImages.filter((_, i) => i !== idx))} />
                    <ImageUploadCard title="Living Room Photos" subtitle="Upload living room images" images={livingImages} onAdd={(files: File[]) => setLivingImages([...livingImages, ...files])} onRemove={(idx: number) => setLivingImages(livingImages.filter((_, i) => i !== idx))} />
                    <ImageUploadCard title="Exterior Photos" subtitle="Upload exterior images" images={exteriorImages} onAdd={(files: File[]) => setExteriorImages([...exteriorImages, ...files])} onRemove={(idx: number) => setExteriorImages(exteriorImages.filter((_, i) => i !== idx))} />
                  </div>
                )}
                
                {/* Step 3: Additional Info */}
                {currentStep === 3 && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1', padding: isMobile ? '16px' : '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Property Description</h2>
                    <InputField label="Property Description" hint="Describe the property in detail..." value={formData.description} onChange={(v: string) => updateField('description', v)} maxLines={4} required error={errors.description} />
                    <div style={{ height: '2px', background: '#F0EBE1', margin: '24px 0' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Monthly Costs</h2>
                    <InputField label="Principal & Interest" hint="e.g., 1858" value={formData.principalInterest} onChange={(v: string) => updateField('principalInterest', v)} isPrice />
                    <InputField label="Property Tax" hint="e.g., 570" value={formData.propertyTax} onChange={(v: string) => updateField('propertyTax', v)} isPrice />
                    <InputField label="Home Insurance" hint="e.g., 850" value={formData.homeInsurance} onChange={(v: string) => updateField('homeInsurance', v)} isPrice />
                    <InputField label="HOA Fees (per month)" hint="e.g., 200" value={formData.hoaFees} onChange={(v: string) => updateField('hoaFees', v)} isPrice />
                    <div style={{ height: '2px', background: '#F0EBE1', margin: '24px 0' }} />
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Amenities</h2>
                    <InputField label="Community Center" hint="e.g., Lake, Clubhouse" value={formData.amenitiesCommunityCenter} onChange={(v: string) => updateField('amenitiesCommunityCenter', v)} />
                    <InputField label="Park" hint="e.g., Pond, Garden" value={formData.amenitiesPark} onChange={(v: string) => updateField('amenitiesPark', v)} />
                    <InputField label="Pool" hint="e.g., Swimming Pool, Trails" value={formData.amenitiesPool} onChange={(v: string) => updateField('amenitiesPool', v)} />
                    <SwitchField label="Veterans Benefits Available" value={formData.veteransBenefits} onChange={(v: boolean) => updateField('veteransBenefits', v)} />
                  </div>
                )}
                
                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1', padding: isMobile ? '16px' : '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Review Your Property</h2>
                    <ReviewTile title="Basic Information" items={[`Property Title: ${formData.title || 'Not provided'}`, `Property Type: ${formData.propertyType}`, `Listing Type: ${formData.listingType}`, `Price: ${formData.listingType === 'For Sale' ? `$${formData.salePrice || 0}` : formData.listingType === 'For Rent' ? `$${formData.rentMinPrice} - $${formData.rentMaxPrice}/month` : `$${formData.commercialPrice || 0}`}`]} />
                    <ReviewTile title="Location" items={[`Address: ${formData.address || 'Not provided'}`, `Country: ${formData.country || 'Not selected'}`, `City: ${formData.city || 'Not provided'}`, `State: ${formData.state}`]} />
                    <ReviewTile title="Property Details" items={[`Bedrooms: ${formData.bedrooms}`, `Bathrooms: ${formData.bathrooms}`, `Square Feet: ${formData.squareFeet || 'Not provided'}`, `Garage: ${formData.garageSpaces} cars`]} />
                    {formData.selectedFeatures.length > 0 && <ReviewTile title="Features" items={formData.selectedFeatures} />}
                    <ReviewTile title="Images" items={[`Main Image: ${mainImage ? '✓ Uploaded' : '✗ Not uploaded'}`, `Bedroom Photos: ${bedroomImages.length} uploaded`, `Bathroom Photos: ${bathroomImages.length} uploaded`, `Kitchen Photos: ${kitchenImages.length} uploaded`, `Living Room Photos: ${livingImages.length} uploaded`, `Exterior Photos: ${exteriorImages.length} uploaded`]} />
                  </div>
                )}
                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', gap: '16px', flexWrap: 'wrap' }}>
                  {currentStep > 0 && <button onClick={prevStep} style={{ padding: isMobile ? '10px 20px' : '12px 24px', background: '#fff', border: '1.5px solid #E0DBD0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>← Back</button>}
                  <div style={{ flex: 1 }} />
                  {currentStep < 4 ? <button onClick={nextStep} style={{ padding: isMobile ? '10px 24px' : '12px 32px', background: '#1A1A1A', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer' }}>Next →</button> : <button onClick={handleSubmit} disabled={isLoading} style={{ padding: isMobile ? '10px 24px' : '12px 32px', background: isLoading ? '#999' : '#1A1A1A', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: COLORS.gold, cursor: isLoading ? 'not-allowed' : 'pointer' }}>{isLoading ? 'Submitting...' : 'Submit Property'}</button>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}