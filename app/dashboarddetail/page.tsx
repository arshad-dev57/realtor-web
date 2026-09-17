'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

interface PropertyDetail {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  monthlyEstimate: string;
  builderName: string;
  builderEmail: string;
  builderExperience: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  lotArea: string;
  propertyType: string;
  pricePerSqft: string;
  garage: string;
  listingType: string;
  description: string;
  features: string[];
  amenities: { name: string; value: string }[];
  floodRisk: string;
  floodFactor: number;
  images: string[];
  roomImages: { title: string; imageUrl: string; count: number }[];
  principalInterest: number;
  propertyTax: number;
  homeInsurance: number;
  otherCost: number;
  status: string;
  parking: number;
  area: string;
  timeAgo: string;
  isNew: boolean;
}

// Helper functions
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

const formatPrice = (price: number): string => {
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(0)}K`;
  }
  return `$${price.toFixed(0)}`;
};

const formatPricePKR = (price: number): string => {
  return '₨ ' + price.toLocaleString('en-PK');
};

// ── Sidebar (same as dashboard) ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home', label: 'Browse Listings', href: '/buyerdashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
  { id: 'requests', label: 'My Requests', href: '/buyer/requests', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
  { id: 'saved', label: 'Saved Properties', href: '/buyer/saved', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
  { id: 'settings', label: 'Settings', href: '/buyer/settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

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

// ── Donut Chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ sections }: { sections: { value: number; color: string; label: string }[] }) {
  const total = sections.reduce((s, x) => s + x.value, 0);
  const r = 52, cx = 64, cy = 64, stroke = 22;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;

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

// ── Main Component ───────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = (params?.id as string);

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleSent, setScheduleSent] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const mortgage = useMortgage(property?.priceValue ?? 0);

  // Fetch property from API
  useEffect(() => {
    if (!propertyId) return;
    
    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`🔍 Fetching property with ID: ${propertyId}`);
        const response = await api.get(`/property/${propertyId}`);
        
        console.log('📦 API Response:', response.data);
        
        if (response.data && response.data.success !== false) {
          const data = response.data.data || response.data;
          
          // Get favorites from localStorage
          let favorites: string[] = [];
          try {
            favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          } catch (e) {
            favorites = [];
          }
          
          // Calculate monthly estimate (simple: price/12 for demo, actual calculation can be added)
          const monthlyEstimate = formatPricePKR(Math.round(data.price / 12));
          
          // Calculate price per sqft
          const areaValue = data.area?.value || 0;
          const pricePerSqft = areaValue > 0 ? formatPricePKR(Math.round(data.price / areaValue)) : 'N/A';
          
          // Format address
          const address = data.location 
            ? `${data.location.address || ''}, ${data.location.city || ''}, ${data.location.state || ''}`
            : 'Address not available';
          
          // Get all images
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
          
          // Create room images from categories
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
          
          // Format amenities
          let amenitiesArray: { name: string; value: string }[] = [];
          if (data.amenities) {
            if (Array.isArray(data.amenities)) {
              amenitiesArray = data.amenities.map((a: any) => ({ name: a, value: 'Available' }));
            } else if (typeof data.amenities === 'object') {
              amenitiesArray = Object.entries(data.amenities).map(([key, val]) => ({ name: key, value: String(val) }));
            }
          }
          
          // If no amenities, add default ones
          if (amenitiesArray.length === 0) {
            amenitiesArray = [
              { name: 'Swimming Pool', value: 'Community' },
              { name: 'Gym', value: 'Community' },
              { name: 'Parking', value: `${data.parking || 0} spaces` },
              { name: 'Security', value: '24/7' },
            ];
          }
          
          // Calculate monthly costs (estimate)
          const principalInterest = Math.round(mortgage.monthly);
          const propertyTax = Math.round(data.price * 0.0012 / 12);
          const homeInsurance = Math.round(data.price * 0.0004 / 12);
          const otherCost = Math.round((data.hoaFees || 0) + (data.principalInterest || 0) * 0.1);
          
          const detail: PropertyDetail = {
            id: data._id,
            title: data.title || 'Property',
            price: data.priceDisplay || formatPrice(data.price),
            priceValue: data.price,
            monthlyEstimate: monthlyEstimate,
            builderName: data.builderName || data.realtorId?.name || 'Property Owner',
            builderEmail: data.builderEmail || data.realtorId?.email || 'contact@example.com',
            builderExperience: '10+ years',
            address: address,
            bedrooms: data.bedrooms || 0,
            bathrooms: data.bathrooms || 0,
            lotArea: data.area?.display || `${data.area?.value || 0} sqft`,
            propertyType: data.propertyType || 'House',
            pricePerSqft: pricePerSqft,
            garage: `${data.garageSpaces || data.parking || 0} Car Garage`,
            listingType: data.type || 'For Sale',
            description: data.description || 'No description available.',
            features: data.features || [],
            amenities: amenitiesArray,
            floodRisk: data.floodRisk || 'Minimal Risk',
            floodFactor: data.floodFactor || 0.15,
            images: allImages,
            roomImages: roomImages,
            principalInterest: principalInterest,
            propertyTax: propertyTax,
            homeInsurance: homeInsurance,
            otherCost: otherCost,
            status: data.status || 'available',
            parking: data.parking || 0,
            area: data.area?.display || `${data.area?.value || 0} sqft`,
            timeAgo: getTimeAgo(data.createdAt),
            isNew: data.isNew || false,
          };
          
          setProperty(detail);
          setIsFavorite(favorites.includes(data._id));
        } else {
          setError(response.data?.message || 'Failed to load property');
        }
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProperty();
  }, [propertyId]);

  const prevImg = () => setCurrentImg(i => i === 0 ? (property?.images.length ?? 1) - 1 : i - 1);
  const nextImg = () => setCurrentImg(i => (i + 1) % (property?.images.length ?? 1));

  const toggleFavorite = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (newFavorite) {
        if (!favorites.includes(propertyId)) favorites.push(propertyId);
      } else {
        const index = favorites.indexOf(propertyId);
        if (index > -1) favorites.splice(index, 1);
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Error updating favorites:', e);
    }
  };

  const fmt = (n: number) => '₨ ' + n.toLocaleString('en-PK');

  if (isLoading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: '13px', color: '#999' }}>Loading property…</div>
      </div>
    </div>
  );

  if (error || !property) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏚</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>Property Not Found</div>
        <div style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>{error || 'The property you\'re looking for doesn\'t exist or has been removed.'}</div>
        <button onClick={() => router.push('/buyerdashboard')} style={{ padding: '10px 24px', background: '#1A1A1A', color: '#B49A64', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '600' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const totalMonthly = property.principalInterest + property.propertyTax + property.homeInsurance + property.otherCost;
  const costSections = [
    { value: property.principalInterest, color: '#3B82F6', label: 'Principal & Interest' },
    { value: property.propertyTax, color: '#F59E0B', label: 'Property Tax' },
    { value: property.homeInsurance, color: '#10B981', label: 'Insurance' },
    { value: property.otherCost, color: '#8B5CF6', label: 'Other' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: '#F5F2EC' }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside style={{
        width: sidebarCollapsed ? '72px' : '240px',
        background: 'linear-gradient(180deg, #1A1A1A 0%, #1F1C14 100%)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative', zIndex: 10, flexShrink: 0,
        borderRight: '1px solid rgba(180,154,100,0.1)',
      }}>
        <div style={{ padding: sidebarCollapsed ? '24px 0' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.5px' }}>Estatex</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
            </div>
          )}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', flexShrink: 0, ...(sidebarCollapsed ? { position: 'absolute', right: '-14px', top: '30px', background: '#2C2415', border: '1px solid rgba(180,154,100,0.2)', borderRadius: '50%', zIndex: 20 } : {}) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d={sidebarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {!sidebarCollapsed && <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', padding: '0 20px', marginBottom: '8px' }}>Main Menu</div>}
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => router.push(item.href)} title={sidebarCollapsed ? item.label : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: sidebarCollapsed ? '12px 0' : '11px 20px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', background: 'transparent', border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}>
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && <span style={{ fontSize: '13px', fontWeight: '400', whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: sidebarCollapsed ? '16px 0' : '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #B49A64, #9A8254)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>AR</div>
          {!sidebarCollapsed && <div><div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Ahmad Raza</div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Buyer</div></div>}
        </div>
      </aside>

      {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header style={{ height: '56px', background: '#FFFFFF', borderBottom: '1px solid #F0EBE1', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px', flexShrink: 0 }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <button onClick={() => router.push('/buyerdashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#999', padding: '4px 8px', borderRadius: '7px', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8"/></svg>
              Dashboard
            </button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#CCC" strokeWidth="2" strokeLinecap="round"/></svg>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#999', padding: '4px 8px', borderRadius: '7px', fontFamily: "'DM Sans', sans-serif" }}>Browse Listings</button>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#CCC" strokeWidth="2" strokeLinecap="round"/></svg>
            <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '600', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.title}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleFavorite} style={{ width: '36px', height: '36px', borderRadius: '9px', background: isFavorite ? '#FEF2F2' : '#F5F2EC', border: `1px solid ${isFavorite ? '#FECACA' : 'transparent'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? '#EF4444' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={isFavorite ? '#EF4444' : '#888'} strokeWidth="2" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A1A, #2C2415)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#B49A64', cursor: 'pointer' }}>AR</div>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>

            {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
            <div>

              {/* Image Gallery */}
              <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#1A1A1A', marginBottom: '20px', position: 'relative' }}>
                <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
                  {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,#1A1A1A 30%,#2C2415 50%,#1A1A1A 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />}
                  <img src={property.images[currentImg]} alt={property.title} onLoad={() => setImgLoaded(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#B49A64', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{property.listingType.toUpperCase()}</div>
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#fff', fontWeight: '500' }}>
                    {currentImg + 1} / {property.images.length}
                  </div>
                  {[{ dir: 'left', action: prevImg }, { dir: 'right', action: nextImg }].map(({ dir, action }) => (
                    <button key={dir} onClick={action} style={{ position: 'absolute', top: '50%', [dir]: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.2s' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    </button>
                  ))}
                  <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
                    {property.images.slice(0, 9).map((_, i) => (
                      <button key={i} onClick={() => setCurrentImg(i)} style={{ border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}>
                        <div style={{ width: i === currentImg ? '22px' : '6px', height: '6px', borderRadius: '3px', background: i === currentImg ? '#fff' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room thumbnails row */}
                {property.roomImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', padding: '6px', background: 'rgba(0,0,0,0.3)' }}>
                    {property.roomImages.map((room, i) => (
                      <button key={i} style={{ flex: 1, position: 'relative', height: '72px', borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent', cursor: 'pointer', padding: 0, background: 'none', transition: 'border-color 0.2s' }}>
                        <img src={room.imageUrl} alt={room.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '4px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '700', color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>{room.title}</span>
                          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>({room.count})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Core Info */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>{property.price}</div>
                    <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>Est. {property.monthlyEstimate}</div>
                  </div>
                  {property.isNew && <div style={{ background: 'rgba(180,154,100,0.1)', border: '1px solid rgba(180,154,100,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', color: '#B49A64', letterSpacing: '1px' }}>NEW · {property.timeAgo.toUpperCase()}</div>}
                </div>

                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginTop: '14px', marginBottom: '12px' }}>Built by {property.builderName}</div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {[`${property.bedrooms} Beds`, `${property.bathrooms} Baths`, property.lotArea, `${property.parking} Parking`].map(c => (
                    <div key={c} style={{ background: '#F5F2EC', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '500', color: '#555' }}>{c}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: '2px', flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg>
                  <span style={{ fontSize: '13px', color: '#777' }}>{property.address}</span>
                </div>
              </div>

              {/* Property Details */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '16px' }}>Property Details</h2>
                {[['Property Type', property.propertyType], ['Price per Sqft', property.pricePerSqft], ['Garage', property.garage], ['Status', property.listingType]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F2EC' }}>
                    <span style={{ fontSize: '13px', color: '#888' }}>{k}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '12px' }}>Description</h2>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{property.description}</p>
              </div>

              {/* Features */}
              {property.features.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '14px' }}>Features & Amenities</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {property.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F5F2EC', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '500', color: '#555', border: '1px solid #EDE7D9' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#B49A64" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities table */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '14px' }}>Amenities</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {property.amenities.map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: i % 4 < 2 ? '#FAFAF8' : '#fff' }}>
                      <span style={{ fontSize: '13px', color: '#888' }}>{a.name}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Cost Breakdown */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '20px' }}>Monthly Cost Breakdown</h2>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0 }}>
                    <DonutChart sections={costSections} />
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{fmt(totalMonthly)}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>/ month est.</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {costSections.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: '#555' }}>{s.label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{fmt(s.value)}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #F0EBE1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#555' }}>Total</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#B49A64' }}>{fmt(totalMonthly)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowCalc(true)} style={{ width: '100%', marginTop: '16px', height: '42px', background: '#F5F2EC', border: '1.5px solid #E0DBD0', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Open Mortgage Calculator
                </button>
              </div>

              <div style={{ height: '32px' }} />
            </div>

            {/* ── RIGHT COLUMN (Sticky) ──────────────────────────────────── */}
            <div style={{ position: 'sticky', top: '0' }}>

              {/* Builder Card */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999', marginBottom: '14px' }}>Ad Posted By</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#B49A64', flexShrink: 0 }}>
                    {property.builderName[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>{property.builderName}</div>
                    <div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500' }}>✓ Verified Builder</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>{property.builderExperience} experience</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setShowSchedule(true)} style={{ flex: 1, height: '44px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
                    Schedule Tour
                  </button>
                  <button onClick={() => setShowContact(true)} style={{ flex: 1, height: '44px', background: '#fff', border: '1.5px solid #E0DBD0', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
                    Contact
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#BBB' }}>Response usually within 2 hours</div>
              </div>

              {/* Quick Stats Card */}
              <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(180,154,100,0.7)', marginBottom: '14px' }}>Quick Summary</div>
                {[
                  { label: 'List Price', value: property.price, highlight: true },
                  { label: 'Est. Monthly', value: property.monthlyEstimate },
                  { label: 'Price/sqft', value: property.pricePerSqft },
                  { label: 'Lot Size', value: property.lotArea },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
                    <span style={{ fontSize: item.highlight ? '16px' : '13px', fontWeight: '700', color: item.highlight ? '#B49A64' : 'rgba(255,255,255,0.85)', fontFamily: item.highlight ? "'Cormorant Garamond', serif" : 'inherit' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Mortgage mini-preview */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#999', marginBottom: '14px' }}>Mortgage Preview</div>
                <div style={{ fontSize: '26px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>
                  {fmt(Math.round(mortgage.monthly))}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '14px' }}>per month · {mortgage.loanTerm}yr @ {mortgage.interestRate}%</div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '5px' }}>Down Payment</label>
                  <input type="number" value={mortgage.downPayment} onChange={e => mortgage.setDownPayment(Number(e.target.value))} style={{ width: '100%', height: '38px', paddingInline: '12px', fontSize: '13px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '9px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '5px' }}>Term</label>
                    <select value={mortgage.loanTerm} onChange={e => mortgage.setLoanTerm(Number(e.target.value))} style={{ width: '100%', height: '38px', paddingInline: '10px', fontSize: '13px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '9px', outline: 'none', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                      {[15, 20, 25, 30].map(y => <option key={y} value={y}>{y} yrs</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '5px' }}>Rate %</label>
                    <input type="number" step="0.1" value={mortgage.interestRate} onChange={e => mortgage.setInterestRate(Number(e.target.value))} style={{ width: '100%', height: '38px', paddingInline: '10px', fontSize: '13px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '9px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                  </div>
                </div>
                <button onClick={() => setShowCalc(true)} style={{ width: '100%', height: '38px', background: '#F5F2EC', border: '1px solid #E0DBD0', borderRadius: '9px', fontSize: '12px', fontWeight: '600', color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Full Calculator →</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALS (same as before) ═══════════════════════════════════════════════ */}
      {/* Schedule Tour Modal */}
      {showSchedule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowSchedule(false); }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '28px', animation: 'slideUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Schedule a Tour</h3>
              <button onClick={() => setShowSchedule(false)} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>{property.title}</p>
            {!scheduleSent ? (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Preferred Date</label>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: '100%', height: '42px', paddingInline: '14px', fontSize: '13px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Preferred Time</label>
                  <select value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={{ width: '100%', height: '42px', paddingInline: '14px', fontSize: '13px', background: '#F5F2EC', border: 'none', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                    <option value="">Select a time</option>
                    {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowSchedule(false)} style={{ flex: 1, height: '44px', background: '#F5F2EC', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { if (scheduleDate && scheduleTime) setScheduleSent(true); }} style={{ flex: 2, height: '44px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Confirm Tour</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Tour Scheduled!</div>
                <div style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>{scheduleDate} at {scheduleTime}</div>
                <button onClick={() => { setShowSchedule(false); setScheduleSent(false); }} style={{ padding: '10px 28px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowContact(false); }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '28px', animation: 'slideUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Contact Builder</h3>
              <button onClick={() => setShowContact(false)} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>✕</button>
            </div>
            {!contactSent ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F5F2EC', borderRadius: '12px', padding: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: '#B49A64' }}>{property.builderName[0]}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{property.builderName}</div>
                    <div style={{ fontSize: '11px', color: '#B49A64' }}>✓ Verified · Responds in ~2hrs</div>
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Your Message</label>
                  <textarea value={contactMsg} onChange={e => setContactMsg(e.target.value)} rows={4} placeholder={`Hi, I'm interested in ${property.title}. Could we arrange a viewing?`} style={{ width: '100%', padding: '12px 14px', fontSize: '13px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', resize: 'none', fontFamily: "'DM Sans', sans-serif", lineHeight: '1.6', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowContact(false)} style={{ flex: 1, height: '44px', background: '#F5F2EC', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { if (contactMsg.trim()) setContactSent(true); }} style={{ flex: 2, height: '44px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Send Message</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Message Sent!</div>
                <div style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>We'll notify you when {property.builderName} replies.</div>
                <button onClick={() => { setShowContact(false); setContactSent(false); setContactMsg(''); }} style={{ padding: '10px 28px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Mortgage Calculator Modal */}
      {showCalc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={e => { if (e.target === e.currentTarget) setShowCalc(false); }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '28px', animation: 'slideUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Mortgage Calculator</h3>
              <button onClick={() => setShowCalc(false)} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>✕</button>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1A1A1A, #2C2415)', borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(180,154,100,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Estimated Monthly Payment</div>
              <div style={{ fontSize: '40px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{fmt(Math.round(mortgage.monthly))}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Principal + Interest only</div>
            </div>
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Down Payment (₨)</label>
              <input type="number" value={mortgage.downPayment} onChange={e => mortgage.setDownPayment(Number(e.target.value))} style={{ width: '100%', height: '44px', paddingInline: '14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Interest Rate (%)</label>
              <input type="number" step="0.1" value={mortgage.interestRate} onChange={e => mortgage.setInterestRate(Number(e.target.value))} style={{ width: '100%', height: '44px', paddingInline: '14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <label style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '6px' }}>Loan Term</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[15, 20, 25, 30].map(y => (
                  <button key={y} onClick={() => mortgage.setLoanTerm(y)} style={{ flex: 1, height: '40px', background: mortgage.loanTerm === y ? '#1A1A1A' : '#F5F2EC', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '600', color: mortgage.loanTerm === y ? '#B49A64' : '#555', cursor: 'pointer' }}>{y}yr</button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', background: '#F5F2EC', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>Loan Amount</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{fmt(Math.max(0, property.priceValue - mortgage.downPayment))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>Total Interest Paid</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{fmt(Math.round(Math.max(0, mortgage.monthly * mortgage.loanTerm * 12 - Math.max(0, property.priceValue - mortgage.downPayment))))}</span>
              </div>
            </div>
            <button onClick={() => setShowCalc(false)} style={{ width: '100%', marginTop: '16px', height: '44px', background: '#1A1A1A', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
}