'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { authService } from '@/lib/auth';

interface PropertyType {
  id: string;
  name: string;
}

const PROPERTY_TYPES: PropertyType[] = [
  { id: 'house', name: 'House' },
  { id: 'apartment', name: 'Apartment' },
  { id: 'condo', name: 'Condo' },
  { id: 'townhouse', name: 'Townhouse' },
  { id: 'villa', name: 'Villa' },
  { id: 'land', name: 'Land' },
  { id: 'commercial', name: 'Commercial' },
  { id: 'office', name: 'Office' },
];

// Searchable Country Dropdown Component
function CountryDropdown({ 
  value, 
  onSelect, 
  placeholder,
  error = false
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchCountries();
  }, []);
  
  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2');
      const data = await response.json();
      const sortedCountries = data
        .map((c: any) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags.png || c.flags.svg || '🌍'
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setCountries(sortedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
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
  
  const filteredCountries = countries.filter((country: any) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedCountry = countries.find((c: any) => c.name === value);
  
  return (
    <div style={{ flex: 1, position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 16px', height: '44px', border: `1.5px solid ${error ? '#EF4444' : '#E0DBD0'}`,
          borderRadius: '12px', background: '#fff', cursor: 'pointer', textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif", fontSize: '14px'
        }}
      >
        {selectedCountry && (
          <img src={selectedCountry.flag} alt="flag" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
        )}
        <span style={{ flex: 1, color: value ? '#1A1A1A' : '#999' }}>
          {value || placeholder || 'Select Country'}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute', zIndex: 50, marginTop: '4px', background: '#fff',
          border: '1px solid #E0DBD0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          width: '100%', minWidth: '250px', top: '100%', left: 0
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
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid #E0DBD0', borderTopColor: '#B49A64', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                Loading...
              </div>
            ) : filteredCountries.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                No countries found
              </div>
            ) : (
              filteredCountries.map((country: any) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: value === country.name ? 'rgba(180,154,100,0.08)' : 'transparent',
                    border: 'none', fontSize: '13px', color: value === country.name ? '#B49A64' : '#555',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                >
                  <img src={country.flag} alt="flag" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />
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

// Searchable City Dropdown Component
function CityDropdown({ 
  value, 
  countryName,
  onSelect, 
  placeholder,
  error = false,
  disabled = false
}: any) {
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
    <div style={{ flex: 1, position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && countryName && setIsOpen(!isOpen)}
        disabled={disabled || !countryName}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '0 16px', height: '44px', border: `1.5px solid ${error ? '#EF4444' : '#E0DBD0'}`,
          borderRadius: '12px', background: (disabled || !countryName) ? '#F5F2EC' : '#fff',
          cursor: (disabled || !countryName) ? 'not-allowed' : 'pointer', textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif", fontSize: '14px', opacity: (disabled || !countryName) ? 0.6 : 1
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#B49A64" strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="2.5" stroke="#B49A64" strokeWidth="1.5"/>
        </svg>
        <span style={{ flex: 1, color: value ? '#1A1A1A' : '#999' }}>
          {value || (!countryName ? 'Select country first' : (placeholder || 'Select City'))}
        </span>
        {countryName && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      
      {isOpen && countryName && (
        <div style={{
          position: 'absolute', zIndex: 50, marginTop: '4px', background: '#fff',
          border: '1px solid #E0DBD0', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          width: '100%', minWidth: '250px', top: '100%', left: 0
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
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid #E0DBD0', borderTopColor: '#B49A64', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
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
                  type="button"
                  onClick={() => {
                    onSelect(city);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    background: value === city ? 'rgba(180,154,100,0.08)' : 'transparent',
                    border: 'none', fontSize: '13px', color: value === city ? '#B49A64' : '#555',
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#B49A64" strokeWidth="1.5"/>
                    <circle cx="12" cy="9" r="2.5" stroke="#B49A64" strokeWidth="1.5"/>
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

export default function ProfileSetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const [agencyName, setAgencyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [bio, setBio] = useState('');
  const [serviceCountry, setServiceCountry] = useState('');
  const [serviceCity, setServiceCity] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const urlRole = searchParams.get('role');
    const storedRole = authService.getRole();
    const userId = authService.getUserId();

    if (!userId) {
      router.push('/signup');
      return;
    }

    const finalRole = urlRole || storedRole;

    if (!finalRole || finalRole === 'null' || finalRole === '') {
      router.push('/role-selection');
      return;
    }

    setRole(finalRole);

    if (storedRole !== finalRole) {
      authService.updateUserRole(finalRole);
    }
  }, [searchParams, router]);

  const togglePreference = (typeId: string) => {
    setSelectedPreferences(prev =>
      prev.includes(typeId) ? prev.filter(p => p !== typeId) : [...prev, typeId]
    );
  };

  const validateRealtorForm = () => {
    const newErrors: Record<string, string> = {};
    if (!agencyName.trim()) newErrors.agencyName = 'Agency name is required';
    if (!licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (!yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Experience is required';
    else if (isNaN(Number(yearsOfExperience))) newErrors.yearsOfExperience = 'Enter valid number';
    if (!serviceCountry) newErrors.serviceCountry = 'Select service country';
    if (!serviceCity) newErrors.serviceCity = 'Select service city';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBuyerForm = () => {
    const newErrors: Record<string, string> = {};
    if (!country) newErrors.country = 'Select country';
    if (!city) newErrors.city = 'Select city';
    if (selectedPreferences.length === 0) {
      newErrors.preferences = 'Select at least one property preference';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCountrySelect = (selectedCountry: any) => {
    if (role === 'realtor') {
      setServiceCountry(selectedCountry.name);
      setServiceCity('');
      if (errors.serviceCountry) setErrors(prev => ({ ...prev, serviceCountry: '' }));
    } else {
      setCountry(selectedCountry.name);
      setCity('');
      if (errors.country) setErrors(prev => ({ ...prev, country: '' }));
    }
  };

  const handleCitySelect = (selectedCity: string) => {
    if (role === 'realtor') {
      setServiceCity(selectedCity);
      if (errors.serviceCity) setErrors(prev => ({ ...prev, serviceCity: '' }));
    } else {
      setCity(selectedCity);
      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
    }
  };

  const handleSubmit = async () => {
    const userId = authService.getUserId();
    const currentRole = role || authService.getRole();

    if (!userId) {
      setError('User not found. Please login again.');
      return;
    }

    if (!currentRole || currentRole === 'null' || currentRole === '') {
      setError('Please select your role first');
      router.push('/role-selection');
      return;
    }

    if (currentRole === 'realtor' && !validateRealtorForm()) return;
    if (currentRole === 'buyer' && !validateBuyerForm()) return;

    setIsLoading(true);
    setError('');

    try {
      let response;
      if (currentRole === 'realtor') {
        const data = {
          agencyName,
          licenseNumber,
          yearsOfExperience: parseInt(yearsOfExperience),
          serviceCountry,
          serviceCity,
          country: serviceCountry,
          city: serviceCity,
          bio: bio || undefined,
        };
        response = await api.put(`/auth/complete-realtor/${userId}`, data);
      } else {
        const data = {
          preferences: selectedPreferences,
          country,
          city,
        };
        response = await api.put(`/auth/complete-buyer/${userId}`, data);
      }

      if (response.data.success) {
        authService.updateProfileComplete(true);
        router.replace('/subscription');
      } else {
        setError(response.data.message || 'Failed to complete profile');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A1A1A' }}>
      <div style={{ background: '#1A1A1A', padding: '24px 32px 48px 32px' }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#FFF" strokeWidth="2"/></svg>
        </button>
        <div style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#B49A64', marginBottom: '8px' }}>ALMOST THERE</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#FFF', margin: 0 }}>Complete your<br /><span style={{ color: '#B49A64' }}>{role === 'realtor' ? 'realtor profile' : 'buyer profile'}</span></h1>
      </div>

      <div style={{ background: '#F8F6F2', borderRadius: '28px 28px 0 0', padding: '32px', minHeight: 'calc(100vh - 160px)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#999' }}>Step 2 of 2</span>
              <span style={{ fontSize: '12px', color: '#B49A64' }}>100% complete</span>
            </div>
            <div style={{ height: '4px', background: '#E0DBD0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#B49A64' }} />
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px', marginBottom: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#DC2626' }}>{error}</span>
            </div>
          )}

          {isUpdatingRole && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px', marginBottom: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#D97706' }}>Setting up your role...</span>
            </div>
          )}

          {role === 'realtor' ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>Agency / Company Name</label>
                <input 
                  type="text" 
                  value={agencyName} 
                  onChange={(e) => setAgencyName(e.target.value)} 
                  placeholder="e.g. Prime Properties" 
                  style={{ 
                    width: '100%', 
                    height: '44px', 
                    padding: '0 16px', 
                    fontSize: '14px', 
                    color: '#1A1A1A',
                    background: '#FFF', 
                    border: `1.5px solid ${errors.agencyName ? '#EF4444' : '#E0DBD0'}`, 
                    borderRadius: '12px', 
                    outline: 'none' 
                  }} 
                />
                {errors.agencyName && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.agencyName}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>License Number</label>
                <input 
                  type="text" 
                  value={licenseNumber} 
                  onChange={(e) => setLicenseNumber(e.target.value)} 
                  placeholder="e.g. RE-2024-00123" 
                  style={{ 
                    width: '100%', 
                    height: '44px', 
                    padding: '0 16px', 
                    fontSize: '14px', 
                    color: '#1A1A1A',
                    background: '#FFF', 
                    border: `1.5px solid ${errors.licenseNumber ? '#EF4444' : '#E0DBD0'}`, 
                    borderRadius: '12px', 
                    outline: 'none' 
                  }} 
                />
                {errors.licenseNumber && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.licenseNumber}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>Years of Experience</label>
                <input 
                  type="number" 
                  value={yearsOfExperience} 
                  onChange={(e) => setYearsOfExperience(e.target.value)} 
                  placeholder="e.g. 5" 
                  style={{ 
                    width: '100%', 
                    height: '44px', 
                    padding: '0 16px', 
                    fontSize: '14px', 
                    color: '#1A1A1A',
                    background: '#FFF', 
                    border: `1.5px solid ${errors.yearsOfExperience ? '#EF4444' : '#E0DBD0'}`, 
                    borderRadius: '12px', 
                    outline: 'none' 
                  }} 
                />
                {errors.yearsOfExperience && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.yearsOfExperience}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>Service Location</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <CountryDropdown 
                    value={serviceCountry}
                    onSelect={handleCountrySelect}
                    placeholder="Select Country"
                    error={!!errors.serviceCountry}
                  />
                  <CityDropdown 
                    value={serviceCity}
                    countryName={serviceCountry}
                    onSelect={handleCitySelect}
                    placeholder="Select City"
                    error={!!errors.serviceCity}
                    disabled={!serviceCountry}
                  />
                </div>
                {(errors.serviceCountry || errors.serviceCity) && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>Service location is required</p>}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>Professional Bio (Optional)</label>
                <textarea 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={3} 
                  placeholder="Tell clients about yourself..." 
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    fontSize: '14px', 
                    color: '#1A1A1A',
                    background: '#FFF', 
                    border: '1.5px solid #E0DBD0', 
                    borderRadius: '12px', 
                    outline: 'none', 
                    resize: 'none' 
                  }} 
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>Location</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <CountryDropdown 
                    value={country}
                    onSelect={handleCountrySelect}
                    placeholder="Select Country"
                    error={!!errors.country}
                  />
                  <CityDropdown 
                    value={city}
                    countryName={country}
                    onSelect={handleCitySelect}
                    placeholder="Select City"
                    error={!!errors.city}
                    disabled={!country}
                  />
                </div>
                {(errors.country || errors.city) && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>Location is required</p>}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: '#999', marginBottom: '6px', display: 'block' }}>Property Preferences</label>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Select the types of properties you are interested in</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {PROPERTY_TYPES.map((type) => {
                    const isSelected = selectedPreferences.includes(type.id);
                    return (
                      <button key={type.id} type="button" onClick={() => togglePreference(type.id)} style={{ padding: '8px 16px', background: isSelected ? '#B49A64' : '#FFF', color: isSelected ? '#FFF' : '#555', border: `1.5px solid ${isSelected ? '#B49A64' : '#E0DBD0'}`, borderRadius: '30px', fontSize: '13px', fontWeight: isSelected ? '600' : '500', cursor: 'pointer', transition: 'all 0.2s' }}>
                        {type.name}
                      </button>
                    );
                  })}
                </div>
                {errors.preferences && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '12px' }}>{errors.preferences}</p>}
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || isUpdatingRole}
            style={{ width: '100%', padding: '16px', background: (isLoading || isUpdatingRole) ? '#CCC' : '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600', cursor: (isLoading || isUpdatingRole) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
          >
            {(isLoading || isUpdatingRole) ? (
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>Complete Profile <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2"/><polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2"/></svg></>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}