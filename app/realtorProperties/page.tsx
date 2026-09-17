'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';

// ── Custom Hook for Device Detection ──
function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet };
}
 
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
  propertyStatus?: 'available' | 'pending' | 'sold';   
  views: number;
  inquiries: number;
  listedDate: string;
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

const TABS = ['All', 'available', 'pending', 'sold'] as const;
type Tab = (typeof TABS)[number];
const SORT_OPTIONS = ['Newest', 'Oldest', 'Most Viewed', 'Most Inquired'];

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Dashboard',
    href: '/realtor-dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'properties',
    label: 'Properties',
    href: '/realtorProperties',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'leads',
    label: 'Assigned Leads',
    href: '/assigned-leads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'requests',
    label: 'Lead Requests',
    href: '/lead-request',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'tours',
    label: 'Tours',
    href: 'a/tours',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'add-property',
    label: 'Add Property',
    href: '/add-property',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  },
];

// ── Helper Functions ───────────────────────────────────────────────────────
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

const getPropertyStatusColor = (status: string): string => {
  switch (status) {
    case 'available': return '#10B981';
    case 'pending': return '#F59E0B';
    case 'sold': return '#3B82F6';
    default: return '#6B7280';
  }
};

const getPropertyStatusBgColor = (status: string): string => {
  switch (status) {
    case 'Active': return '#D1FAE5';
    case 'Pending': return '#FEF3C7';
    case 'Sold': return '#DBEAFE';
    default: return '#F3F4F6';
  }
};

// ── API Functions ──────────────────────────────────────────────────────────
const fetchProperties = async (
  tab: Tab,
  page: number,
  limit: number = 6,
  sortBy: string = 'newest'
): Promise<{ properties: Property[]; pagination: PaginationData }> => {
  try {
    let sortParam = 'newest';
    if (sortBy === 'Newest') sortParam = 'newest';
    if (sortBy === 'Oldest') sortParam = 'oldest';
    if (sortBy === 'Most Viewed') sortParam = 'most_viewed';
    if (sortBy === 'Most Inquired') sortParam = 'most_inquired';
    
    const status = tab === 'All' ? '' : tab;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy: sortParam,
      ...(status && { status }),
    });

    const response = await api.get(`/property/my-properties?${params.toString()}`);
    
    if (response.data && response.data.success !== false) {
      const data = response.data.data || response.data;
      let propertiesList: any[] = [];
      let paginationData: PaginationData = {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        limit: limit,
        hasNext: false,
        hasPrev: page > 1
      };
      
      if (data.properties && Array.isArray(data.properties)) {
        propertiesList = data.properties;
        if (data.pagination) {
          paginationData = {
            currentPage: data.pagination.currentPage || page,
            totalPages: data.pagination.totalPages || 1,
            totalItems: data.pagination.totalItems || 0,
            limit: data.pagination.limit || limit,
            hasNext: data.pagination.hasNext || false,
            hasPrev: page > 1
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
        let priceDisplay = '';
        let priceValue = 0;
        
        if (prop.listingType === 'For Sale') {
          priceDisplay = formatPrice(prop.salePrice);
          priceValue = prop.salePrice || 0;
        } else if (prop.listingType === 'For Rent') {
          priceDisplay = `${formatPrice(prop.rentMinPrice)} - ${formatPrice(prop.rentMaxPrice)}/month`;
          priceValue = prop.rentMinPrice || 0;
        } else {
          priceDisplay = formatPrice(prop.commercialPrice);
          priceValue = prop.commercialPrice || 0;
        }
        
        let locationDisplay = '';
        if (prop.city && prop.state) {
          locationDisplay = `${prop.city}, ${prop.state}`;
        } else if (prop.city) {
          locationDisplay = prop.city;
        } else if (prop.location) {
          if (typeof prop.location === 'object') {
            locationDisplay = `${prop.location.city || ''}, ${prop.location.state || ''}`;
          } else {
            locationDisplay = prop.location;
          }
        }
        
        return {
          id: prop._id || prop.id,
          title: prop.propertyTitle || prop.title || 'Property',
          price: priceDisplay,
          priceValue: priceValue,
          location: locationDisplay || 'Location not specified',
          type: prop.listingType || 'For Sale',
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          area: prop.squareFeet ? `${prop.squareFeet} sqft` : (prop.area?.display || `${prop.area?.value || 0} sqft`),
          parking: prop.parking || 0,
          imageUrl: prop.mainImage || prop.imageUrl || 'https://picsum.photos/seed/default/800/500',
          images: prop.images || (prop.imageUrl ? [prop.imageUrl] : []),
          isNew: prop.isNew || false,
          timeAgo: getTimeAgo(prop.createdAt),
          isFavorite: favorites.includes(prop._id || prop.id),
          status: prop.listingType || 'For Sale',
          propertyStatus: prop.status || 'Active',
          views: prop.views || 0,
          inquiries: prop.inquiries || 0,
          listedDate: prop.createdAt ? new Date(prop.createdAt).toLocaleDateString() : 'Recently',
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

const fetchPropertyDetail = async (id: string): Promise<PropertyDetail | null> => {
  try {
    const response = await api.get(`/property/my-properties/${id}`);
    
    if (response.data && response.data.success !== false) {
      const data = response.data.data || response.data;
      
      let favorites: string[] = [];
      try {
        favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      } catch (e) {
        favorites = [];
      }
      
      let priceDisplay = '';
      let priceValue = 0;
      
      if (data.listingType === 'For Sale') {
        priceDisplay = formatPrice(data.salePrice);
        priceValue = data.salePrice || 0;
      } else if (data.listingType === 'For Rent') {
        priceDisplay = `${formatPrice(data.rentMinPrice)} - ${formatPrice(data.rentMaxPrice)}/month`;
        priceValue = data.rentMinPrice || 0;
      } else {
        priceDisplay = formatPrice(data.commercialPrice);
        priceValue = data.commercialPrice || 0;
      }
      
      const monthlyEstimate = formatPrice(Math.round(priceValue / 12));
      const areaValue = data.squareFeet || data.area?.value || 0;
      const pricePerSqft = areaValue > 0 ? formatPrice(Math.round(priceValue / areaValue)) : 'N/A';
      
      const address = data.location 
        ? `${data.location.address || ''}, ${data.location.city || ''}, ${data.location.state || ''}`
        : (data.city && data.state ? `${data.city}, ${data.state}` : 'Address not available');
      
      const allImages = [];
      if (data.images && Array.isArray(data.images)) {
        allImages.push(...data.images);
      }
      if (data.mainImage && !allImages.includes(data.mainImage)) {
        allImages.unshift(data.mainImage);
      }
      if (data.imageUrl && !allImages.includes(data.imageUrl)) {
        allImages.unshift(data.imageUrl);
      }
      if (allImages.length === 0) {
        allImages.push('https://picsum.photos/seed/default/1200/700');
      }
      
      let locationDisplay = '';
      if (data.city && data.state) {
        locationDisplay = `${data.city}, ${data.state}`;
      } else if (data.location) {
        if (typeof data.location === 'object') {
          locationDisplay = `${data.location.city || ''}, ${data.location.state || ''}`;
        } else {
          locationDisplay = data.location;
        }
      }
      
      return {
        id: data._id,
        title: data.propertyTitle || data.title || 'Property',
        price: priceDisplay,
        priceValue: priceValue,
        monthlyEstimate: monthlyEstimate,
        builderName: data.builderName || data.realtorId?.name || 'Property Owner',
        builderEmail: data.builderEmail || data.realtorId?.email || 'contact@example.com',
        address: address,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        area: data.squareFeet ? `${data.squareFeet} sqft` : (data.area?.display || `${data.area?.value || 0} sqft`),
        parking: data.parking || 0,
        imageUrl: allImages[0],
        images: allImages,
        isNew: data.isNew || false,
        timeAgo: getTimeAgo(data.createdAt),
        isFavorite: favorites.includes(data._id),
        status: data.listingType || 'For Sale',
        type: data.listingType || 'For Sale',
        location: locationDisplay,
        description: data.description || 'No description available.',
        features: data.features || [],
        amenities: data.amenities || [],
        propertyType: data.propertyType || 'House',
        pricePerSqft: pricePerSqft,
        garage: `${data.parking || 0} Car Garage`,
        roomImages: [],
        floodRisk: data.floodRisk || 'Minimal Risk',
        floodFactor: data.floodFactor || 0.15,
        principalInterest: Math.round(priceValue * 0.008 / 12),
        propertyTax: Math.round(priceValue * 0.0012 / 12),
        homeInsurance: Math.round(priceValue * 0.0004 / 12),
        otherCost: Math.round((data.hoaFees || 0) + (data.principalInterest || 0) * 0.1),
        views: data.views || 0,
        inquiries: data.inquiries || 0,
        listedDate: data.listedDate || data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching property detail:', error);
    return null;
  }
};

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'hidden' }}>
      <div style={{ height: '200px', background: '#F5F0E8' }} />
      <div style={{ padding: '16px' }}>
        <div style={{ height: '14px', width: '70%', background: '#F0EBE1', borderRadius: '6px', marginBottom: '10px' }} />
        <div style={{ height: '12px', width: '50%', background: '#F0EBE1', borderRadius: '6px', marginBottom: '10px' }} />
        <div style={{ height: '36px', width: '100%', background: '#F0EBE1', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

function PropertyCard({ property, onCardClick, onFavorite, onUpdateStatus }: { 
  property: Property; 
  onCardClick: (id: string) => void; 
  onFavorite: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const statusColor = getPropertyStatusColor(property.propertyStatus || 'Active');
  const statusBgColor = getPropertyStatusBgColor(property.propertyStatus || 'Active');
  const statusOptions = ['available', 'pending', 'sold'];

  return (
    <div
      onClick={() => onCardClick(property.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: `1px solid ${hovered ? 'rgba(180,154,100,0.3)' : '#F0EBE1'}`,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(180,154,100,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', background: '#F5F0E8' }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg,#F5F0E8 30%,#EDE7D9 50%,#F5F0E8 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }} />
        )}
        <img
          src={property.imageUrl}
          alt={property.title}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: imgLoaded ? 1 : 0,
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.4s ease, opacity 0.4s ease',
          }}
        />
        
        {/* Status Badge */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: statusBgColor,
          borderRadius: '20px', padding: '4px 10px',
          fontSize: '10px', fontWeight: '700', letterSpacing: '1px',
          color: statusColor, zIndex: 5,
        }}>
          {property.propertyStatus || 'Active'}
        </div>
        
        {/* Status Dropdown (on hover) */}
        {hovered && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            zIndex: 10,
          }}>
            <select
              value={property.propertyStatus || 'Active'}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateStatus(property.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: '4px 8px',
                borderRadius: '20px',
                background: '#fff',
                border: `1px solid ${statusColor}`,
                fontSize: '10px',
                fontWeight: '600',
                color: statusColor,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Price overlay */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: 'rgba(26,26,26,0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px', padding: '6px 12px', zIndex: 5,
        }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>
            {property.price}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
            {property.type}
          </div>
        </div>
        
        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(property.id); }}
          style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', zIndex: 5,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={property.isFavorite ? '#EF4444' : 'none'}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke={property.isFavorite ? '#EF4444' : '#999'} strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '15px', fontWeight: '700', color: '#1A1A1A',
          marginBottom: '4px', fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {property.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/>
            <circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/>
          </svg>
          <span style={{ fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {property.location}
          </span>
        </div>
        
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1',
          padding: '10px 0', marginBottom: '14px', gap: '4px',
        }}>
          {[
            { val: property.bedrooms, label: 'Beds' },
            { val: property.bathrooms, label: 'Baths' },
            { val: property.area, label: 'Area' },
            { val: property.parking, label: 'Park' },
          ].map((stat, i) => (
            <div key={i} style={{
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid #F0EBE1' : 'none',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Stats Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          padding: '8px 0', marginBottom: '14px',
          background: '#FAFAF8', borderRadius: '10px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{property.views?.toLocaleString() || 0}</div>
            <div style={{ fontSize: '10px', color: '#999' }}>Views</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{property.inquiries || 0}</div>
            <div style={{ fontSize: '10px', color: '#999' }}>Inquiries</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#666' }}>{property.listedDate}</div>
            <div style={{ fontSize: '10px', color: '#999' }}>Listed</div>
          </div>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); onCardClick(property.id); }}
          style={{
            width: '100%', height: '40px',
            background: 'transparent',
            border: '1.5px solid #E0DBD0',
            borderRadius: '10px',
            fontSize: '13px', fontWeight: '600', color: '#1A1A1A',
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 'auto',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.background = '#1A1A1A';
            (e.target as HTMLButtonElement).style.color = '#B49A64';
            (e.target as HTMLButtonElement).style.borderColor = '#1A1A1A';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.background = 'transparent';
            (e.target as HTMLButtonElement).style.color = '#1A1A1A';
            (e.target as HTMLButtonElement).style.borderColor = '#E0DBD0';
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Detail View Component
function PropertyDetailView({ property, onBack, onFavorite }: { property: PropertyDetail; onBack: () => void; onFavorite: (id: string) => void }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const prevImg = () => setCurrentImg(i => i === 0 ? ((property.images?.length ?? 1) - 1) : i - 1);
  const nextImg = () => setCurrentImg(i => (i + 1) % (property.images?.length ?? 1));
  
  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#B49A64', padding: '6px 12px', borderRadius: '8px' }}>
          ← Back to Properties
        </button>
        <span style={{ color: '#CCC' }}>/</span>
        <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '500' }}>{property.title}</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>
        <div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#1A1A1A', marginBottom: '20px' }}>
            <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
              {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,#1A1A1A 30%,#2C2415 50%,#1A1A1A 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />}
              <img src={(property.images || [property.imageUrl])[currentImg]} alt={property.title} onLoad={() => setImgLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0 }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#B49A64', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: '700', color: '#fff' }}>{property.type.toUpperCase()}</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#fff' }}>{currentImg + 1} / {(property.images || [property.imageUrl]).length}</div>
              <button onClick={prevImg} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5"/></svg></button>
              <button onClick={nextImg} style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5"/></svg></button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div><div style={{ fontSize: '36px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{property.price}</div><div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>Est. {property.monthlyEstimate}</div></div>
              {property.isNew && <div style={{ background: 'rgba(180,154,100,0.1)', border: '1px solid rgba(180,154,100,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', color: '#B49A64' }}>NEW · {property.timeAgo.toUpperCase()}</div>}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginTop: '14px', marginBottom: '12px' }}>Built by {property.builderName}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>{[`${property.bedrooms} Beds`, `${property.bathrooms} Baths`, property.area, `${property.parking} Parking`].map(c => (<div key={c} style={{ background: '#F5F2EC', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '500', color: '#555' }}>{c}</div>))}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg><span style={{ fontSize: '13px', color: '#777' }}>{property.address}</span></div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '16px' }}>Property Details</h2>
            {[['Property Type', property.propertyType], ['Price per Sqft', property.pricePerSqft], ['Garage', property.garage], ['Status', property.type]].map(([k, v]) => (<div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F2EC' }}><span style={{ fontSize: '13px', color: '#888' }}>{k}</span><span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{v}</span></div>))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '12px' }}>Description</h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{property.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={() => {/* Edit property */}} style={{ flex: 1, height: '48px', background: '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Edit Property</button>
            <button onClick={() => {/* View analytics */}} style={{ flex: 1, height: '48px', background: '#fff', border: '1.5px solid #E0DBD0', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer' }}>View Analytics</button>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '0' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999', marginBottom: '14px' }}>Performance</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F0EBE1' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Total Views</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#B49A64' }}>{property.views?.toLocaleString() || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F0EBE1' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Total Inquiries</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#B49A64' }}>{property.inquiries || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Listed Date</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{property.listedDate}</span>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(180,154,100,0.7)', marginBottom: '14px' }}>Quick Summary</div>
            {[{ label: 'List Price', value: property.price, highlight: true }, { label: 'Est. Monthly', value: property.monthlyEstimate }, { label: 'Price/sqft', value: property.pricePerSqft }, { label: 'Lot Size', value: property.area }].map(item => (<div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{item.label}</span><span style={{ fontSize: item.highlight ? '16px' : '13px', fontWeight: '700', color: item.highlight ? '#B49A64' : 'rgba(255,255,255,0.85)', fontFamily: item.highlight ? "'Cormorant Garamond', serif" : 'inherit' }}>{item.value}</span></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────
export default function RealtorPropertiesPage() {
  const router = useRouter();
  const { isMobile, isTablet } = useDeviceType(); // Device detection hook
  
  const [activeNav, setActiveNav] = useState('properties');
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [showSort, setShowSort] = useState(false);
  const [search, setSearch] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [savedCount, setSavedCount] = useState(0);
  
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);
  const [showDevices, setShowDevices] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const sortRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Mobile par sidebar initially collapsed rakho
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const loadProperties = useCallback(async (pageNum: number, tab: Tab) => {
    setIsLoading(true);
    try {
      const result = await fetchProperties(tab, pageNum, 6, selectedSort);
      setProperties(result.properties);
      setPagination(result.pagination);
      setCurrentPage(pageNum);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSort]);

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

  const updatePropertyStatus = async (id: string, newStatus: string) => {
    try {
      const response = await api.put(`/property/my-properties/${id}`, { status: newStatus });
      if (response.data && response.data.success !== false) {
        setProperties(prev => prev.map(p => 
          p.id === id ? { ...p, propertyStatus: newStatus as any } : p
        ));
        alert(`Property status updated to ${newStatus}`);
      } else {
        alert(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
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

  useEffect(() => {
    setCurrentPage(1);
    loadProperties(1, activeTab);
  }, [activeTab, selectedSort, loadProperties]);

  // ── Infinite Scroll (Mobile Only) ──
  useEffect(() => {
    if (!isMobile) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination.hasNext && !isLoading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          loadProperties(nextPage, activeTab);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [pagination.hasNext, isLoading, currentPage, activeTab, loadProperties, isMobile]);

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

  const filteredProperties = properties.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  // Responsive grid columns based on device
  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(300px, 1fr))';
  };

  // Mobile menu toggle button
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: '#F5F2EC' }}>
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
          justifyContent: (sidebarCollapsed && !isMobile) ? 'center' : 'space-between', 
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
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              style={{ 
                background: 'rgba(255,255,255,0.06)', 
                border: 'none', 
                borderRadius: '8px', 
                width: '28px', 
                height: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                color: 'rgba(255,255,255,0.4)', 
                flexShrink: 0, 
                ...(sidebarCollapsed ? { 
                  position: 'absolute', 
                  right: '-14px', 
                  top: '30px', 
                  background: '#2C2415', 
                  border: '1px solid rgba(180,154,100,0.2)', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  zIndex: 20 
                } : {}),
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d={sidebarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {(!sidebarCollapsed || isMobile) && (
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', padding: '0 20px', marginBottom: '8px' }}>
              Main Menu
            </div>
          )}
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { 
                  setActiveNav(item.id); 
                  setSelectedProperty(null);
                  setShowDevices(false);
                  if (item.id === 'home') {
                    router.push('/realtor-dashboard');
                  } else if (item.id === 'devices') {
                    setShowDevices(true);
                  } else if (item.href) {
                    router.push(item.href);
                  }
                  if (isMobile) setMobileSidebarOpen(false);
                }} 
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
                  position: 'relative' 
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && (
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        {(!sidebarCollapsed || isMobile) && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #B49A64, #9A8254)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>AR</div>
            <div><div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Ahmad Raza</div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Realtor</div></div>
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
            <div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Property Management</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>My Properties</div>
          </div>
          
          <button 
            onClick={() => router.push('/add-property')} 
            style={{ 
              padding: isMobile ? '6px 14px' : '8px 20px', 
              background: '#1A1A1A', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: isMobile ? '12px' : '13px', 
              fontWeight: '600', 
              color: '#B49A64', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            {!isMobile && "Add Property"}
            {isMobile && "Add"}
          </button>
          
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 320px', order: isMobile ? 1 : 0 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={isMobile ? "Search..." : "Search properties..."} 
              style={{ 
                width: '100%', 
                height: '38px', 
                paddingLeft: '36px', 
                paddingRight: '12px', 
                fontSize: '13px', 
                color: '#1A1A1A', 
                background: '#F5F2EC', 
                border: '1.5px solid transparent', 
                borderRadius: '10px', 
                outline: 'none', 
                fontFamily: "'DM Sans', sans-serif", 
                transition: 'all 0.2s' 
              }} 
            />
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
              setActiveNav('properties');
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
              {/* Page Title + Controls */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '2px' }}>My Properties</h1>
                  <p style={{ fontSize: '13px', color: '#999', fontWeight: '300' }}>{pagination.totalItems} total properties</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* View Mode Toggle - Hide on mobile */}
                  {!isMobile && (
                    <div style={{ display: 'flex', background: '#fff', border: '1px solid #F0EBE1', borderRadius: '10px', overflow: 'hidden' }}>
                      <button onClick={() => setViewMode('grid')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#1A1A1A' : 'transparent', color: viewMode === 'grid' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/></svg>
                      </button>
                      <button onClick={() => setViewMode('list')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#1A1A1A' : 'transparent', color: viewMode === 'list' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Sort Dropdown */}
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
                            {selectedSort === opt && (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#B49A64" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab Bar - Responsive scrollable */}
              <div style={{ 
                display: 'flex', 
                background: '#fff', 
                borderRadius: '12px', 
                padding: '4px', 
                border: '1px solid #F0EBE1', 
                marginBottom: '20px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}>
                {TABS.map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    style={{ 
                      padding: isMobile ? '6px 14px' : '8px 22px', 
                      borderRadius: '9px', 
                      background: activeTab === tab ? '#1A1A1A' : 'transparent', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: isMobile ? '12px' : '13px', 
                      fontWeight: '600', 
                      color: activeTab === tab ? '#B49A64' : '#999', 
                      fontFamily: "'DM Sans', sans-serif", 
                      transition: 'all 0.2s', 
                      whiteSpace: 'nowrap' 
                    }}
                  >
                    {tab}
                    {tab !== 'All' && (
                      <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(180,154,100,0.15)', borderRadius: '20px', fontSize: '10px' }}>
                        {properties.filter(p => p.propertyStatus === tab).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Stats Row - Responsive grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                {[
                  { label: 'Total Properties', value: pagination.totalItems.toString(), icon: '🏠', color: '#B49A64' },
                  { label: 'Total Views', value: properties.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString(), icon: '👁️', color: '#3B82F6' },
                  { label: 'Total Inquiries', value: properties.reduce((sum, p) => sum + (p.inquiries || 0), 0).toString(), icon: '💬', color: '#10B981' },
                  { label: 'Page', value: `${currentPage}/${pagination.totalPages}`, icon: '📄', color: '#F59E0B' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Properties Grid/List */}
              {isLoading && properties.length === 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                  {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredProperties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>No properties found</div>
                  <div style={{ fontSize: '13px' }}>Try adjusting your filters or add a new property</div>
                  <button onClick={() => router.push('/add-property')} style={{ marginTop: '24px', padding: '10px 24px', background: '#1A1A1A', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Add Your First Property</button>
                </div>
              ) : viewMode === 'grid' || isMobile ? (
                // Grid View (default on mobile)
                <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                  {filteredProperties.map(property => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      onCardClick={handlePropertyClick}
                      onFavorite={toggleFavorite}
                      onUpdateStatus={updatePropertyStatus}
                    />
                  ))}
                </div>
              ) : (
                // List View (desktop only)
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#1A1A1A' }}>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px' }}>Property</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Type</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Status</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Price</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Beds/Baths</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Views</th>
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
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: getPropertyStatusBgColor(property.propertyStatus || 'Active'), color: getPropertyStatusColor(property.propertyStatus || 'Active'), padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {property.propertyStatus || 'Active'}
                            </span>
                           </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#B49A64' }}>{property.price}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{property.bedrooms} / {property.bathrooms}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{property.views?.toLocaleString() || 0}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button onClick={(e) => { e.stopPropagation(); handlePropertyClick(property.id); }} style={{ padding: '6px 12px', background: '#1A1A1A', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>View</button>
                              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={property.isFavorite ? '#EF4444' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={property.isFavorite ? '#EF4444' : '#999'} strokeWidth="2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              )}

              {/* ── Pagination Buttons (Desktop Only) ── */}
              {!isLoading && pagination.totalPages > 1 && !isMobile && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px', padding: '16px 0' }}>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={!pagination.hasPrev} 
                    style={{
                      padding: '8px 20px',
                      background: pagination.hasPrev ? '#1A1A1A' : '#E0DBD0',
                      color: pagination.hasPrev ? '#B49A64' : '#999',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    ← Previous
                  </button>
                  
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
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            width: '40px',
                            height: '40px',
                            background: pageNum === currentPage ? '#B49A64' : '#fff',
                            color: pageNum === currentPage ? '#fff' : '#555',
                            border: pageNum === currentPage ? 'none' : '1px solid #F0EBE1',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: pageNum === currentPage ? '700' : '500'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={!pagination.hasNext} 
                    style={{
                      padding: '8px 20px',
                      background: pagination.hasNext ? '#1A1A1A' : '#E0DBD0',
                      color: pagination.hasNext ? '#B49A64' : '#999',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* ── Infinite Scroll Trigger (Mobile Only) ── */}
              {isMobile && !isLoading && pagination.hasNext && (
                <div ref={observerRef} style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
                </div>
              )}
            </>
          )}
          <div style={{ height: '32px' }} />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E0DBD0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #B49A64; }
      `}</style>
    </div>
  );
}