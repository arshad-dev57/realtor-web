'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DevicesView from '@/components/DevicesView';
import SettingsView from '@/components/SettingsView';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';

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
      
      const monthlyEstimate = formatPrice(Math.round(data.price / 12));
      const areaValue = data.area?.value || 0;
      const pricePerSqft = areaValue > 0 ? formatPrice(Math.round(data.price / areaValue)) : 'N/A';
      
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
      }, { timeout: 30000 });
      
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
      if (error.code === 'ECONNABORTED') {
        setIsScheduled(true);
        onSuccess();
        setTimeout(() => {
          onClose();
          setIsScheduled(false);
        }, 2000);
      } else {
        alert(error?.response?.data?.message || 'Failed to schedule tour. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget && !isScheduled) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.25s ease', margin: isMobile ? 'auto 16px' : 'auto' }}>
        {!isScheduled ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F0EBE1', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Schedule a Tour</h3>
              <button onClick={onClose} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ margin: '20px 24px', padding: '16px', background: '#F5F2EC', borderRadius: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="#B49A64" strokeWidth="1.8"/></svg></div>
              <div><div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>You want to tour:</div><div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{propertyTitle}</div></div>
            </div>
            <div style={{ padding: '0 24px' }}>
              <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '8px' }}>Select Date</label><input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }} /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '8px' }}>Select Time</label><select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }}>{timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}</select></div>
              <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '8px' }}>Your Information</label><input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', marginBottom: '12px' }} /><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', marginBottom: '12px' }} /><input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #F0EBE1', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={onClose} style={{ flex: 1, height: '48px', background: '#F5F2EC', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSchedule} disabled={isLoading} style={{ flex: 2, height: '48px', background: isLoading ? '#999' : '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#B49A64', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{isLoading ? <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} /> : 'Schedule Tour'}</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
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
function ContactModal({ isOpen, onClose, propertyTitle, propertyPrice, propertyLocation, builderEmail, builderName }: { isOpen: boolean; onClose: () => void; propertyTitle: string; propertyPrice: string; propertyLocation: string; builderEmail: string; builderName: string; }) {
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
    } catch (e) {}
  }, []);
  
  const handleSend = async () => {
    if (!name.trim()) { alert('Please enter your name'); return; }
    if (!email.trim()) { alert('Please enter your email'); return; }
    if (!email.includes('@')) { alert('Please enter a valid email'); return; }
    if (!message.trim()) { alert('Please enter your message'); return; }
    
    setIsLoading(true);
    try {
      const subject = `Inquiry about: ${propertyTitle}`;
      const body = `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nProperty: ${propertyTitle}\nPrice: ${propertyPrice}\nLocation: ${propertyLocation}\n\nMessage:\n${message.trim()}`;
      await api.post('/contact/send-email', { to: builderEmail, subject, body, fromEmail: email.trim(), fromName: name.trim() }, { timeout: 30000 });
      setIsSent(true);
      setTimeout(() => { onClose(); setIsSent(false); setMessage(''); }, 2000);
    } catch (error) { alert('Failed to send message. Please try again.'); } 
    finally { setIsLoading(false); }
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget && !isSent) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.25s ease', margin: isMobile ? 'auto 16px' : 'auto' }}>
        {!isSent ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F0EBE1' }}>
              <h3 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif" }}>Contact Builder</h3>
              <button onClick={onClose} style={{ background: '#F5F2EC', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ margin: '20px 24px', padding: '16px', background: '#F5F2EC', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#B49A64' }}>{builderName.charAt(0).toUpperCase()}</div>
              <div><div style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>{builderName}</div><div style={{ fontSize: '11px', color: '#B49A64' }}>✓ Verified Builder</div>{!isMobile && <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>{builderEmail}</div>}</div>
            </div>
            {isMobile && <div style={{ margin: '0 24px 16px 24px', padding: '8px', background: 'rgba(180,154,100,0.08)', borderRadius: '8px', wordBreak: 'break-all' }}><div style={{ fontSize: '10px', color: '#999' }}>Email:</div><div style={{ fontSize: '11px', color: '#B49A64' }}>{builderEmail}</div></div>}
            <div style={{ margin: '0 24px 20px 24px', padding: '12px', background: '#FAFAF8', borderRadius: '12px', border: '1px solid #F0EBE1' }}>
              <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>You are inquiring about:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{propertyTitle}</div>
              <div style={{ fontSize: '12px', color: '#B49A64', marginTop: '2px' }}>{propertyPrice} · {propertyLocation}</div>
            </div>
            <div style={{ padding: '0 24px' }}>
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', marginBottom: '12px' }} />
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', height: '44px', padding: '0 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', marginBottom: '12px' }} />
              <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} style={{ width: '100%', padding: '12px 14px', fontSize: '14px', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', resize: 'none', marginBottom: '20px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #F0EBE1', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={onClose} style={{ flex: 1, height: '48px', background: '#F5F2EC', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSend} disabled={isLoading} style={{ flex: 2, height: '48px', background: isLoading ? '#999' : '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#B49A64', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{isLoading ? <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} /> : `Send Message`}</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>Message Sent!</div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Your message has been sent to {builderName}.</div>
            <div style={{ fontSize: '12px', color: '#B49A64' }}>We'll notify you when they reply.</div>
          </div>
        )}
      </div>
    </div>
  );
}
function PropertyCard({ property, onCardClick, onFavorite, onScheduleTour, onContact, isMobile }: { property: Property; onCardClick: (id: string) => void; onFavorite: (id: string) => void; onScheduleTour: (property: Property) => void; onContact: (property: Property) => void; isMobile: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg><span style={{ fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.location}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1', padding: '10px 0', marginBottom: '14px', gap: '4px' }}>
          {[{ val: property.bedrooms, label: 'Beds' }, { val: property.bathrooms, label: 'Baths' }, { val: property.area, label: 'Area' }, { val: property.parking, label: 'Park' }].map((stat, i) => (<div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid #F0EBE1' : 'none' }}><div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{stat.val}</div><div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }}>{stat.label}</div></div>))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
          <button onClick={(e) => { e.stopPropagation(); onScheduleTour(property); }} style={{ flex: 1, height: isMobile ? '34px' : '36px', background: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: '#B49A64', cursor: 'pointer', transition: 'all 0.2s' }}>Tour</button>
          <button onClick={(e) => { e.stopPropagation(); onContact(property); }} style={{ flex: 1, height: isMobile ? '34px' : '36px', background: 'transparent', border: '1.5px solid #E0DBD0', borderRadius: '8px', fontSize: isMobile ? '11px' : '12px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer', transition: 'all 0.2s' }}>Contact</button>
        </div>
      </div>
    </div>
  );
}
function PropertyDetailView({ property, onBack, onFavorite, onScheduleTour, onContact, isMobile }: { property: PropertyDetail; onBack: () => void; onFavorite: (id: string) => void; onScheduleTour: (property: PropertyDetail) => void; onContact: (property: PropertyDetail) => void; isMobile: boolean }) {
  const [currentImg, setCurrentImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const prevImg = () => setCurrentImg(i => i === 0 ? ((property.images?.length ?? 1) - 1) : i - 1);
  const nextImg = () => setCurrentImg(i => (i + 1) % (property.images?.length ?? 1));
  const fmt = (n: number) => '₨ ' + n.toLocaleString('en-PK');
  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', color: '#B49A64', padding: '6px 12px', borderRadius: '8px' }}>← Back to Favorites</button>
        <span style={{ color: '#CCC' }}>/</span>
        <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#1A1A1A', fontWeight: '500' }}>{property.title}</span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '24px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>
        <div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#1A1A1A', marginBottom: '20px' }}>
            <div style={{ position: 'relative', height: isMobile ? '280px' : '420px', overflow: 'hidden' }}>
              {!imgLoaded && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,#1A1A1A 30%,#2C2415 50%,#1A1A1A 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />}
              <img src={(property.images || [property.imageUrl])[currentImg]} alt={property.title} onLoad={() => setImgLoaded(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0 }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#B49A64', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', fontWeight: '700', color: '#fff' }}>{property.type.toUpperCase()}</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#fff' }}>{currentImg + 1} / {(property.images || [property.imageUrl]).length}</div>
              <button onClick={prevImg} style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5"/></svg></button>
              <button onClick={nextImg} style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5"/></svg></button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div><div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#B49A64', fontFamily: "'Cormorant Garamond', serif" }}>{property.price}</div><div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>Est. {property.monthlyEstimate}</div></div>
              {property.isNew && <div style={{ background: 'rgba(180,154,100,0.1)', border: '1px solid rgba(180,154,100,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: '700', color: '#B49A64' }}>NEW · {property.timeAgo.toUpperCase()}</div>}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginTop: '14px', marginBottom: '12px' }}>Built by {property.builderName}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>{[`${property.bedrooms} Beds`, `${property.bathrooms} Baths`, property.area, `${property.parking} Parking`].map(c => (<div key={c} style={{ background: '#F5F2EC', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '500', color: '#555' }}>{c}</div>))}</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg><span style={{ fontSize: '13px', color: '#777' }}>{property.address}</span></div>
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '16px' }}>Property Details</h2>
            {[['Property Type', property.propertyType], ['Price per Sqft', property.pricePerSqft], ['Garage', property.garage], ['Status', property.type]].map(([k, v]) => (<div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F2EC' }}><span style={{ fontSize: '13px', color: '#888' }}>{k}</span><span style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A1A' }}>{v}</span></div>))}
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: isMobile ? '20px' : '24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '12px' }}>Description</h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.7' }}>{property.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
            <button onClick={() => onScheduleTour(property)} style={{ flex: 1, height: '48px', background: '#1A1A1A', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Schedule Tour</button>
            <button onClick={() => onContact(property)} style={{ flex: 1, height: '48px', background: '#fff', border: '1.5px solid #E0DBD0', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#1A1A1A', cursor: 'pointer' }}>Contact Builder</button>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '0' }}>
          <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(180,154,100,0.7)', marginBottom: '14px' }}>Quick Summary</div>
            {[{ label: 'List Price', value: property.price, highlight: true }, { label: 'Est. Monthly', value: property.monthlyEstimate }, { label: 'Price/sqft', value: property.pricePerSqft }, { label: 'Lot Size', value: property.area }].map(item => (<div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{item.label}</span><span style={{ fontSize: item.highlight ? '16px' : '13px', fontWeight: '700', color: item.highlight ? '#B49A64' : 'rgba(255,255,255,0.85)', fontFamily: item.highlight ? "'Cormorant Garamond', serif" : 'inherit' }}>{item.value}</span></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'hidden' }}>
      <div style={{ height: isMobile ? '160px' : '200px', background: '#F5F0E8' }} />
      <div style={{ padding: isMobile ? '12px' : '16px' }}>
        <div style={{ height: '14px', width: '70%', background: '#F0EBE1', borderRadius: '6px', marginBottom: '10px' }} />
        <div style={{ height: '12px', width: '50%', background: '#F0EBE1', borderRadius: '6px', marginBottom: '10px' }} />
        <div style={{ height: '60px', width: '100%', background: '#F0EBE1', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #F0EBE1' }}>
      <td style={{ padding: '12px' }}><div style={{ height: '16px', width: '120px', background: '#F0EBE1', borderRadius: '4px' }} /><div style={{ height: '12px', width: '80px', background: '#F0EBE1', borderRadius: '4px', marginTop: '6px' }} /></td>
      <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '24px', width: '60px', background: '#F0EBE1', borderRadius: '20px', margin: '0 auto' }} /></td>
      <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '20px', width: '60px', background: '#F0EBE1', borderRadius: '4px', margin: '0 auto' }} /></td>
      <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '20px', width: '50px', background: '#F0EBE1', borderRadius: '4px', margin: '0 auto' }} /></td>
      <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '28px', width: '100px', background: '#F0EBE1', borderRadius: '6px', margin: '0 auto' }} /></td>
    </tr>
  );
}

// ── Navigation Items ───────────────────────────────────────────────────────
function HomeIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Browse Listings', href: '/buyerdashboard', icon: <HomeIcon color="currentColor" size={18} /> },
  { id: 'requests', label: 'My Requests', href: '/my-requests', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>) },
  { id: 'saved', label: 'Saved Properties', href: null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { id: 'devices', label: 'Devices', href: null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg>) },
  { id: 'settings', label: 'Settings', href: null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg>) },
];

// ── Main Page Component ────────────────────────────────────────────────────
export default function SavedPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('saved');
  const [savedCount, setSavedCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDevices, setShowDevices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Detail view states
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedForAction, setSelectedForAction] = useState<Property | PropertyDetail | null>(null);

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

  // Fetch favorite properties from localStorage
  const loadFavoriteProperties = async () => {
    setIsLoading(true);
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setSavedCount(favorites.length);
      
      if (favorites.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }
      
      const propertyPromises = favorites.map(async (id: string) => {
        try {
          const response = await api.get(`/property/public/${id}`);
          if (response.data && response.data.success !== false) {
            const data = response.data.data || response.data;
            let locationDisplay = 'Karachi';
            if (data.location) {
              if (typeof data.location === 'object') {
                locationDisplay = `${data.location.city || ''}, ${data.location.state || ''}`;
                if (locationDisplay === ', ') locationDisplay = data.location.address || 'Karachi';
              } else {
                locationDisplay = data.location;
              }
            }
            return {
              id: data._id,
              title: data.title || 'Property',
              price: data.priceDisplay || formatPrice(data.price),
              priceValue: data.price,
              location: locationDisplay,
              type: data.type || 'For Sale',
              bedrooms: data.bedrooms || 0,
              bathrooms: data.bathrooms || 0,
              area: data.area?.display || `${data.area?.value || 0} sqft`,
              parking: data.parking || 0,
              imageUrl: getPropertyImageUrl(data),
              images: data.images || (data.imageUrl ? [data.imageUrl] : []),
              isNew: data.isNew || false,
              timeAgo: getTimeAgo(data.createdAt),
              isFavorite: true,
              status: data.type || 'For Sale',
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching property ${id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(propertyPromises);
      const validProperties = results.filter((p): p is Property => p !== null);
      setProperties(validProperties);
    } catch (error) {
      console.error('Error loading favorite properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const toggleFavorite = (id: string) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = favorites.filter((f: string) => f !== id);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setSavedCount(newFavorites.length);
    setProperties(prev => prev.filter(p => p.id !== id));
    
    if (selectedProperty && selectedProperty.id === id) {
      setSelectedProperty(null);
    }
  };

  const handlePropertyClick = (id: string) => {
    loadPropertyDetail(id);
  };

  const handleBackToListings = () => {
    setSelectedProperty(null);
  };

  const handleScheduleTour = (property: Property | PropertyDetail) => {
    setSelectedForAction(property);
    setShowScheduleModal(true);
  };

  const handleContact = (property: Property | PropertyDetail) => {
    setSelectedForAction(property);
    setShowContactModal(true);
  };

  // Handle navigation click
  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    setActiveNav(item.id);
    setSelectedProperty(null);
    setShowDevices(false);
    setShowSettings(false);
    
    if (item.id === 'home') {
      router.push('/buyerdashboard');
    } else if (item.id === 'devices') {
      setShowDevices(true);
    } else if (item.id === 'settings') {
      setShowSettings(true);
    } else if (item.id === 'saved') {
      // Stay on saved properties page
    } else if (item.href) {
      router.push(item.href);
    }
    
    if (isMobile) setMobileSidebarOpen(false);
  };

  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const paginatedProperties = properties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    loadFavoriteProperties();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

const getGridColumns = () => {
  if (isMobile) return '1fr';
  // Check if window is defined (client-side only)
  if (typeof window !== 'undefined') {
    if (window.innerWidth >= 768 && window.innerWidth < 1024) return 'repeat(2, 1fr)';
  }
  return 'repeat(auto-fill, minmax(300px, 1fr))';
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
          .table-container {
            overflow-x: auto !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
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
              <button key={item.id} onClick={() => handleNavClick(item)} title={sidebarCollapsed && !isMobile ? item.label : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: (sidebarCollapsed && !isMobile) ? '12px 0' : '11px 20px', justifyContent: (sidebarCollapsed && !isMobile) ? 'center' : 'flex-start', background: isActive ? 'rgba(180,154,100,0.12)' : 'transparent', border: 'none', borderLeft: isActive ? '3px solid #B49A64' : '3px solid transparent', cursor: 'pointer', color: isActive ? '#B49A64' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s', position: 'relative' }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap' }}>{item.label}</span>}
                {(!sidebarCollapsed || isMobile) && item.id === 'saved' && savedCount > 0 && <span style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', borderRadius: '20px', padding: '1px 7px', fontSize: '10px', fontWeight: '700' }}>{savedCount}</span>}
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
            <div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>My Account</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>Saved Properties</div>
          </div>
          
          {/* View Toggle - Hide on mobile */}
          {!isMobile && (
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #F0EBE1', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#1A1A1A' : 'transparent', color: viewMode === 'grid' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/></svg></button>
              <button onClick={() => setViewMode('list')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#1A1A1A' : 'transparent', color: viewMode === 'list' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
          )}
          
          <NotificationDropdown />
          <ProfileDropdown />
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {showDevices ? (
            <DevicesView onBack={() => {
              setShowDevices(false);
              setActiveNav('saved');
            }} />
          ) : showSettings ? (
            <SettingsView onBack={() => {
              setShowSettings(false);
              setActiveNav('saved');
            }} />
          ) : isDetailLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} /><div style={{ fontSize: '13px', color: '#999' }}>Loading property details...</div></div>
          ) : selectedProperty ? (
            <PropertyDetailView property={selectedProperty} onBack={handleBackToListings} onFavorite={toggleFavorite} onScheduleTour={handleScheduleTour} onContact={handleContact} isMobile={isMobile} />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div><h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", marginBottom: '2px' }}>Saved Properties</h1><p style={{ fontSize: '13px', color: '#999', fontWeight: '300' }}>{properties.length} saved properties</p></div>
              </div>

              {/* Stats Grid - Responsive */}
              <div className="stats-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                {[
                  { label: 'Total Saved', value: properties.length.toString(), icon: '❤️', color: '#EF4444' },
                  { label: 'For Sale', value: properties.filter(p => p.type === 'For Sale').length.toString(), icon: '🏠', color: '#22C55E' },
                  { label: 'For Rent', value: properties.filter(p => p.type === 'For Rent').length.toString(), icon: '🔑', color: '#3B82F6' },
                  { label: 'Commercial', value: properties.filter(p => p.type === 'Commercial').length.toString(), icon: '🏢', color: '#F59E0B' },
                ].map(stat => (<div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: isMobile ? '12px' : '16px', textAlign: 'center' }}><div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{stat.icon}</div><div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div><div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div></div>))}
              </div>

              {isLoading ? (
                viewMode === 'list' && !isMobile ? (
                  <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#1A1A1A' }}>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px' }}>Property</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Type</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Price</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Beds/Baths</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '20px' }}>
                    {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => <SkeletonCard key={i} isMobile={isMobile} />)}
                  </div>
                )
              ) : properties.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>❤️</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>No Saved Properties</div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '24px' }}>Click the heart icon on any property to save it here</div>
                  <button onClick={() => router.push('/buyerdashboard')} style={{ padding: '10px 24px', background: '#1A1A1A', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Browse Properties</button>
                </div>
              ) : viewMode === 'grid' || isMobile ? (
                <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '20px' }}>
                  {paginatedProperties.map((property) => (<PropertyCard key={property.id} property={property} onCardClick={handlePropertyClick} onFavorite={toggleFavorite} onScheduleTour={handleScheduleTour} onContact={handleContact} isMobile={isMobile} />))}
                </div>
              ) : (
                <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: '#1A1A1A' }}>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px' }}>Property</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Type</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Price</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Beds/Baths</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProperties.map((property, index) => (
                        <tr key={property.id} style={{ borderBottom: '1px solid #F0EBE1', background: index % 2 === 0 ? '#fff' : '#FAFAF8', cursor: 'pointer' }} onClick={() => handlePropertyClick(property.id)}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '600', color: '#1A1A1A' }}>{property.title}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{property.location}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: property.type === 'For Sale' ? 'rgba(34,197,94,0.1)' : property.type === 'For Rent' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)', color: property.type === 'For Sale' ? '#22C55E' : property.type === 'For Rent' ? '#3B82F6' : '#F59E0B', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{property.type}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#B49A64' }}>{property.price}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{property.bedrooms} / {property.bathrooms}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button onClick={(e) => { e.stopPropagation(); handleScheduleTour(property); }} style={{ padding: '6px 12px', background: '#1A1A1A', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Tour</button>
                              <button onClick={(e) => { e.stopPropagation(); handleContact(property); }} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #E0DBD0', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Contact</button>
                              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill={property.isFavorite ? '#EF4444' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={property.isFavorite ? '#EF4444' : '#999'} strokeWidth="2" strokeLinejoin="round"/></svg></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginTop: '32px', padding: '16px 0', flexWrap: 'wrap' }}>
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ padding: isMobile ? '6px 16px' : '8px 20px', background: currentPage > 1 ? '#1A1A1A' : '#E0DBD0', color: currentPage > 1 ? '#B49A64' : '#999', border: 'none', borderRadius: '10px', cursor: currentPage > 1 ? 'pointer' : 'not-allowed', fontSize: isMobile ? '12px' : '13px', fontWeight: '600' }}>← Previous</button>
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (<button key={pageNum} onClick={() => handlePageChange(pageNum)} style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', background: pageNum === currentPage ? '#B49A64' : '#fff', color: pageNum === currentPage ? '#fff' : '#555', border: pageNum === currentPage ? 'none' : '1px solid #F0EBE1', borderRadius: '10px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', fontWeight: pageNum === currentPage ? '700' : '500' }}>{pageNum}</button>);
                    })}
                  </div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: isMobile ? '6px 16px' : '8px 20px', background: currentPage < totalPages ? '#1A1A1A' : '#E0DBD0', color: currentPage < totalPages ? '#B49A64' : '#999', border: 'none', borderRadius: '10px', cursor: currentPage < totalPages ? 'pointer' : 'not-allowed', fontSize: isMobile ? '12px' : '13px', fontWeight: '600' }}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedForAction && (
        <>
          <ScheduleTourModal isOpen={showScheduleModal} onClose={() => { setShowScheduleModal(false); setSelectedForAction(null); }} propertyId={selectedForAction.id} propertyTitle={selectedForAction.title} onSuccess={() => {}} />
          <ContactModal isOpen={showContactModal} onClose={() => { setShowContactModal(false); setSelectedForAction(null); }} propertyTitle={selectedForAction.title} propertyPrice={selectedForAction.price} propertyLocation={selectedForAction.location} builderEmail="admin@elitecrm.com" builderName="Property Owner" />
        </>
      )}
    </div>
  );
}