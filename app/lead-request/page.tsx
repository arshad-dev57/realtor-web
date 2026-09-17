// app/realtor/lead-requests/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';

const COLORS = {
  gold: '#B49A64',
  darkBg: '#F5F2EC',
  white: '#FFFFFF',
  border: '#F0EBE1',
  textDark: '#1A1A1A',
  textLight: '#999',
  success: '#4CAF50',
  pending: '#CFAE5A',
  error: '#F44336',
  warning: '#FF9800',
};

function HomeIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: '/realtor-dashboard', icon: <HomeIcon color="currentColor" size={18} /> },
  { id: 'properties', label: 'Properties', href: '/properties', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'assigned-leads', label: 'Assigned Leads', href: '/assigned-leads', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'lead-requests', label: 'Lead Requests', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'tours', label: 'Tours', href: '/tours', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'add-property', label: 'Add Property', href: '/add-property', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'devices', label: 'Devices', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'settings', label: 'Settings', href: '/settings', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

interface LeadRequest {
  id: string;
  country: string;
  city: string;
  location: string;
  area: string;
  propertyType: 'sale' | 'rent';
  propertyCategory: string;
  priceRange?: string;
  additionalNote?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRejectionReason?: string;
}

function TimeAgo({ date }: { date: string }) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const getTimeAgo = () => {
      try {
        const d = new Date(date);
        const now = new Date();
        const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
      } catch { return date; }
    };
    setTimeAgo(getTimeAgo());
  }, [date]);

  return <span>{timeAgo}</span>;
}

function StatusBadge({ status }: { status: LeadRequest['status'] }) {
  const config = {
    pending: { bg: '#CFAE5A20', color: '#CFAE5A', icon: '⏳', label: 'Pending' },
    approved: { bg: '#4CAF5020', color: '#4CAF50', icon: '✓', label: 'Approved' },
    rejected: { bg: '#F4433620', color: '#F44336', icon: '✗', label: 'Rejected' },
  };
  const { bg, color, icon, label } = config[status];
  return (
    <span style={{ background: bg, color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {icon} {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #F0EBE1' }}>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '100px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '120px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '80px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '60px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '80px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '60px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '28px', width: '80px', background: '#F0EBE1', borderRadius: '20px' }} /></td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ height: '20px', width: '80px', background: '#F0EBE1', borderRadius: '20px' }} />
        <div style={{ height: '20px', width: '60px', background: '#F0EBE1', borderRadius: '20px' }} />
      </div>
      <div style={{ height: '20px', width: '70%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '14px', width: '90%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '14px', width: '50%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '14px', width: '100%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '36px', width: '100%', background: '#F0EBE1', borderRadius: '8px' }} />
    </div>
  );
}

// Styled Dropdown Component
function StyledDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false,
  renderOption 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: any[]; 
  placeholder: string; 
  disabled?: boolean;
  renderOption?: (option: any) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    (renderOption ? opt.name : opt).toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px',
          background: disabled ? '#F5F2EC' : '#fff',
          border: `1.5px solid ${isOpen ? COLORS.gold : '#E0DBD0'}`,
          borderRadius: '10px',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: value ? COLORS.textDark : '#999',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        <span>{value || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      
      {isOpen && !disabled && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#fff',
          border: '1px solid #E0DBD0',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 100,
          maxHeight: '280px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F0EBE1' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E0DBD0',
                borderRadius: '8px',
                fontSize: '12px',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                color: '#1A1A1A'
              }}
            />
          </div>
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(renderOption ? opt.name : opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    border: 'none',
                    background: (renderOption ? opt.name : opt) === value ? 'rgba(180,154,100,0.08)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: (renderOption ? opt.name : opt) === value ? COLORS.gold : '#555',
                    fontFamily: "'DM Sans', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {renderOption ? renderOption(opt) : opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewRequestModal({ isOpen, onClose, onSubmit, editData }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; editData?: LeadRequest | null }) {
  const [formData, setFormData] = useState({
    country: '', city: '', location: '', area: '', propertyType: 'sale' as 'sale' | 'rent',
    propertyCategory: '', priceRange: '', additionalNote: ''
  });
  const [countries, setCountries] = useState<{ name: string; code: string; flag: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileModal, setIsMobileModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileModal(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        country: editData.country,
        city: editData.city,
        location: editData.location,
        area: editData.area,
        propertyType: editData.propertyType,
        propertyCategory: editData.propertyCategory,
        priceRange: editData.priceRange || '',
        additionalNote: editData.additionalNote || '',
      });
    }
  }, [editData]);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
      .then(res => res.json())
      .then(data => {
        const sorted = data.map((c: any) => ({ name: c.name.common, code: c.cca2, flag: c.flags.emoji || '🌍' })).sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(err => console.error('Error fetching countries:', err));
  }, []);

  useEffect(() => {
    if (formData.country) {
      fetch(`https://countriesnow.space/api/v0.1/countries/cities/q?country=${encodeURIComponent(formData.country)}`)
        .then(res => res.json())
        .then(data => { if (data.error === false && data.data) setCities(data.data.sort()); })
        .catch(err => console.error('Error fetching cities:', err));
    } else {
      setCities([]);
    }
  }, [formData.country]);

  const handleSubmit = async () => {
    if (!formData.country || !formData.city || !formData.location || !formData.area || !formData.propertyCategory) {
      alert('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ 
        background: '#fff', 
        borderRadius: isMobileModal ? '24px 24px 0 0' : '24px', 
        width: '100%', 
        maxWidth: 500, 
        maxHeight: '90vh', 
        overflow: 'auto',
        margin: isMobileModal ? '0' : 'auto',
        position: isMobileModal ? 'relative' : 'static',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: isMobileModal ? '20px' : '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: isMobileModal ? '18px' : '20px', fontWeight: '700', color: COLORS.textDark }}>{editData ? 'Resubmit Request' : 'New Lead Request'}</h2>
              <p style={{ fontSize: '12px', color: '#999' }}>Tell admin what kind of leads you need</p>
            </div>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F0EBE1', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>Country *</label>
            <StyledDropdown
              value={formData.country}
              onChange={(val) => setFormData({ ...formData, country: val, city: '' })}
              options={countries}
              placeholder="Select Country"
              renderOption={(c) => (
                <>
                  <span style={{ fontSize: '20px' }}>{c.flag}</span>
                  <span>{c.name}</span>
                  <span style={{ fontSize: '11px', color: '#999', marginLeft: 'auto' }}>{c.code}</span>
                </>
              )}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>City *</label>
            <StyledDropdown
              value={formData.city}
              onChange={(val) => setFormData({ ...formData, city: val })}
              options={cities}
              placeholder={formData.country ? "Select City" : "Select country first"}
              disabled={!formData.country}
            />
          </div>

          <input 
            type="text" 
            placeholder="Location / Area *" 
            value={formData.location} 
            onChange={e => setFormData({ ...formData, location: e.target.value })} 
            style={{ width: '100%', padding: '12px', border: '1.5px solid #E0DBD0', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', outline: 'none', transition: 'all 0.2s', color: '#1A1A1A' }}
            onFocus={e => e.target.style.borderColor = COLORS.gold}
            onBlur={e => e.target.style.borderColor = '#E0DBD0'}
          />
          <input 
            type="text" 
            placeholder="Locality / Street *" 
            value={formData.area} 
            onChange={e => setFormData({ ...formData, area: e.target.value })} 
            style={{ width: '100%', padding: '12px', border: '1.5px solid #E0DBD0', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', outline: 'none', transition: 'all 0.2s', color: '#1A1A1A' }}
            onFocus={e => e.target.style.borderColor = COLORS.gold}
            onBlur={e => e.target.style.borderColor = '#E0DBD0'}
          />
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>Property Type *</label>
            <div style={{ display: 'flex', gap: '10px', flexDirection: isMobileModal ? 'column' : 'row' }}>
              <button 
                onClick={() => setFormData({ ...formData, propertyType: 'sale' })} 
                style={{ 
                  flex: 1, padding: '10px', borderRadius: '10px', 
                  background: formData.propertyType === 'sale' ? COLORS.textDark : '#fff',
                  border: `1.5px solid ${formData.propertyType === 'sale' ? COLORS.textDark : '#E0DBD0'}`,
                  color: formData.propertyType === 'sale' ? '#fff' : '#666',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                For Sale
              </button>
              <button 
                onClick={() => setFormData({ ...formData, propertyType: 'rent' })} 
                style={{ 
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: formData.propertyType === 'rent' ? COLORS.textDark : '#fff',
                  border: `1.5px solid ${formData.propertyType === 'rent' ? COLORS.textDark : '#E0DBD0'}`,
                  color: formData.propertyType === 'rent' ? '#fff' : '#666',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                For Rent
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>Category *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['house', 'apartment', 'villa', 'plot', 'commercial'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFormData({ ...formData, propertyCategory: cat })}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '30px',
                    background: formData.propertyCategory === cat ? COLORS.textDark : '#fff',
                    border: `1.5px solid ${formData.propertyCategory === cat ? COLORS.textDark : '#E0DBD0'}`,
                    color: formData.propertyCategory === cat ? '#fff' : '#666',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <input 
            type="text" 
            placeholder="Budget / Price Range (Optional)" 
            value={formData.priceRange} 
            onChange={e => setFormData({ ...formData, priceRange: e.target.value })} 
            style={{ width: '100%', padding: '12px', border: '1.5px solid #E0DBD0', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', outline: 'none', transition: 'all 0.2s', color: '#1A1A1A' }}
            onFocus={e => e.target.style.borderColor = COLORS.gold}
            onBlur={e => e.target.style.borderColor = '#E0DBD0'}
          />
          <textarea 
            placeholder="Additional Note (Optional)" 
            value={formData.additionalNote} 
            onChange={e => setFormData({ ...formData, additionalNote: e.target.value })} 
            rows={3} 
            style={{ width: '100%', padding: '12px', border: '1.5px solid #E0DBD0', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', resize: 'vertical', outline: 'none', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A' }}
            onFocus={e => e.target.style.borderColor = COLORS.gold}
            onBlur={e => e.target.style.borderColor = '#E0DBD0'}
          />
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            style={{ 
              width: '100%', padding: '14px', background: COLORS.textDark, border: 'none', 
              borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: COLORS.gold, 
              cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Submitting...' : (editData ? 'Resubmit Request' : 'Submit Request')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadRequestsPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('lead-requests');
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeadRequest | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
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
        setViewMode('grid');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/lead-requests/my-requests');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        const requestsData = response.data.data.requests || response.data.data || [];
        setRequests(requestsData.map((req: any) => ({
          id: req._id || req.id,
          country: req.country,
          city: req.city,
          location: req.location,
          area: req.area,
          propertyType: req.propertyType,
          propertyCategory: req.propertyCategory,
          priceRange: req.priceRange,
          additionalNote: req.additionalNote,
          submittedAt: req.createdAt || req.submittedAt,
          status: req.status,
          adminRejectionReason: req.adminRejectionReason,
        })));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const url = editingRequest ? `/lead-requests/${editingRequest.id}/resubmit` : '/lead-requests';
      const response = await api.post(url, {
        country: formData.country,
        city: formData.city,
        location: formData.location,
        area: formData.area,
        propertyType: formData.propertyType,
        propertyCategory: formData.propertyCategory,
        priceRange: formData.priceRange,
        additionalNote: formData.additionalNote,
      });
      
      if (response.data.success) {
        setShowModal(false);
        setEditingRequest(null);
        fetchRequests();
        alert(editingRequest ? 'Request resubmitted successfully!' : 'Request submitted successfully!');
      } else {
        alert(response.data.message || 'Failed to submit request');
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleResubmit = (request: LeadRequest) => {
    setEditingRequest(request);
    setShowModal(true);
  };

  const filteredRequests = requests.filter(req =>
    !search || 
    req.area.toLowerCase().includes(search.toLowerCase()) ||
    req.location.toLowerCase().includes(search.toLowerCase()) ||
    req.city.toLowerCase().includes(search.toLowerCase()) ||
    req.country.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusCount = (status: string) => {
    return requests.filter(r => r.status === status).length;
  };

  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (window.innerWidth >= 768 && window.innerWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(380px, 1fr))';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: COLORS.darkBg }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .table-container {
            overflow-x: auto !important;
          }
          .action-buttons {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .action-buttons button {
            width: 100% !important;
          }
          .header-buttons {
            flex-wrap: wrap !important;
            justify-content: flex-start !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .category-buttons {
            justify-content: center !important;
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
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.gold}, #9A8050)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HomeIcon color="#fff" size={16} />
            </div>
            {(!sidebarCollapsed || isMobile) && <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'Cormorant Garamond', serif" }}>Estatex</span>}
          </div>
          {!isMobile && (
            <>
              {!sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(true)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2"/></svg>
                </button>
              )}
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} style={{ position: 'absolute', right: -12, top: 28, background: '#2A2310', border: '1px solid rgba(180,154,100,0.25)', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: COLORS.gold }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"/></svg>
                </button>
              )}
            </>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {(!sidebarCollapsed || isMobile) && (
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', padding: '8px 18px 6px' }}>
              Navigation
            </div>
          )}
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => { 
                  setActiveNav(item.id);
                  setShowDevices(false);
                  if (item.id === 'devices') {
                    setShowDevices(true);
                  } else if (item.id === 'lead-requests') {
                    // Stay on current page
                  } else if (item.href) {
                    router.push(item.href);
                  }
                  if (isMobile) setMobileSidebarOpen(false);
                }} 
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: (sidebarCollapsed && !isMobile) ? '11px 0' : '10px 18px', 
                  justifyContent: (sidebarCollapsed && !isMobile) ? 'center' : 'flex-start', 
                  background: isActive ? 'rgba(180,154,100,0.1)' : 'transparent', 
                  border: 'none', 
                  borderLeft: isActive ? `3px solid ${COLORS.gold}` : '3px solid transparent', 
                  cursor: 'pointer', 
                  color: isActive ? COLORS.gold : 'rgba(255,255,255,0.38)' 
                }}
              >
                <span>{item.icon}</span>
                {(!sidebarCollapsed || isMobile) && <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        {(!sidebarCollapsed || isMobile) && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.gold}, #9A8050)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>AR</div>
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
            <div style={{ fontSize: '11px', color: COLORS.gold, fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Lead Management</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: COLORS.textDark, fontFamily: "'Cormorant Garamond', serif" }}>Lead Requests</div>
          </div>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 280px', order: isMobile ? 1 : 0 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={isMobile ? "Search..." : "Search requests..."} 
              style={{ width: '100%', height: '38px', paddingLeft: '36px', paddingRight: '12px', fontSize: '13px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }} 
            />
          </div>
          
          {/* View Toggle - Hide on mobile */}
          {!isMobile && (
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #F0EBE1', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#1A1A1A' : 'transparent', color: viewMode === 'grid' ? COLORS.gold : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/></svg>
              </button>
              <button onClick={() => setViewMode('list')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#1A1A1A' : 'transparent', color: viewMode === 'list' ? COLORS.gold : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}
          
          <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => { setEditingRequest(null); setShowModal(true); }} style={{ 
              padding: isMobile ? '6px 12px' : '8px 20px', 
              background: COLORS.textDark, 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: isMobile ? '12px' : '13px', 
              fontWeight: '600', 
              color: COLORS.gold, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8"/></svg>
              {isMobile ? "New" : "New Request"}
            </button>
            {!isMobile && (
              <button onClick={() => router.push('/assigned-leads')} style={{ padding: '8px 20px', background: 'transparent', border: '1.5px solid #E0DBD0', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>
                View Assigned Leads →
              </button>
            )}
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {showDevices ? (
            <DevicesView onBack={() => {
              setShowDevices(false);
              setActiveNav('lead-requests');
            }} />
          ) : (
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {/* Stats Row - Responsive */}
              <div className="stats-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                {[
                  { label: 'Total Requests', value: requests.length.toString(), icon: '📋', color: COLORS.gold },
                  { label: 'Pending', value: getStatusCount('pending').toString(), icon: '⏳', color: COLORS.pending },
                  { label: 'Approved', value: getStatusCount('approved').toString(), icon: '✓', color: COLORS.success },
                  { label: 'Rejected', value: getStatusCount('rejected').toString(), icon: '✗', color: COLORS.error },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {isLoading ? (
                viewMode === 'list' && !isMobile ? (
                  <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ background: '#1A1A1A' }}>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Property</th>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Location</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Type</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Budget</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Status</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Submitted</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                    {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                )
              ) : filteredRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>No requests found</div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>{search ? 'Try a different search term' : 'Create your first lead request to get started'}</div>
                  {!search && (
                    <button onClick={() => { setEditingRequest(null); setShowModal(true); }} style={{ padding: '10px 24px', background: COLORS.textDark, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer' }}>Create New Request</button>
                  )}
                </div>
              ) : viewMode === 'list' && !isMobile ? (
                /* Table View - Desktop Only */
                <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#1A1A1A' }}>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Property</th>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Location</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Type</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Budget</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Status</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Submitted</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request, index) => (
                        <tr key={request.id} style={{ borderBottom: '1px solid #F0EBE1', background: index % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '600', color: '#1A1A1A' }}>{request.area}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{request.propertyCategory}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#555' }}>{request.location}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>{request.city}, {request.country}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: request.propertyType === 'sale' ? 'rgba(76,175,80,0.1)' : 'rgba(33,150,243,0.1)', color: request.propertyType === 'sale' ? '#4CAF50' : '#2196F3', padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {request.propertyType === 'sale' ? 'For Sale' : 'For Rent'}
                            </span>
                           </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: COLORS.gold }}>
                            {request.priceRange || 'N/A'}
                           </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <StatusBadge status={request.status} />
                           </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
                            <TimeAgo date={request.submittedAt} />
                           </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {request.status === 'approved' && (
                                <button onClick={() => router.push('/assigned-leads')} style={{ padding: '6px 12px', background: COLORS.success, border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>
                                  View Leads
                                </button>
                              )}
                              {request.status === 'rejected' && (
                                <button onClick={() => handleResubmit(request)} style={{ padding: '6px 12px', background: COLORS.textDark, border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer' }}>
                                  Resubmit
                                </button>
                              )}
                              {request.status === 'pending' && (
                                <span style={{ fontSize: '11px', color: '#CFAE5A' }}>Waiting...</span>
                              )}
                            </div>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              ) : (
                /* Grid/Widget View - Mobile & Tablet */
                <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                  {filteredRequests.map(request => (
                    <div 
                      key={request.id} 
                      style={{ 
                        background: '#fff', 
                        borderRadius: '16px', 
                        border: '1px solid #F0EBE1', 
                        padding: '16px', 
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: COLORS.textDark, color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: '700', letterSpacing: '0.8px' }}>
                            {request.propertyType === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                          </span>
                          <span style={{ background: '#E0DBD020', color: '#666', padding: '4px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: '600' }}>
                            {request.propertyCategory.charAt(0).toUpperCase() + request.propertyCategory.slice(1)}
                          </span>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textDark, marginBottom: '6px', wordBreak: 'break-word' }}>{request.area}</h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#B49A64" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="#B49A64" strokeWidth="2"/></svg>
                        <span>{request.location}</span>
                        <span>•</span>
                        <span>{request.city}, {request.country}</span>
                      </div>
                      
                      {request.priceRange && (
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>💰 Budget: {request.priceRange}</div>
                      )}
                      
                      {request.additionalNote && (
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', background: '#FAFAF8', padding: '10px', borderRadius: '10px', wordBreak: 'break-word' }}>
                          📝 {request.additionalNote}
                        </div>
                      )}
                      
                      {request.status === 'rejected' && request.adminRejectionReason && (
                        <div style={{ background: '#FEF3F2', padding: '12px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #FEE2E2' }}>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#DC2626', marginBottom: '4px' }}>Admin Reason:</div>
                          <div style={{ fontSize: '12px', color: '#991B1B' }}>{request.adminRejectionReason}</div>
                        </div>
                      )}
                      
                      <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>
                        <TimeAgo date={request.submittedAt} />
                      </div>
                      
                      {request.status === 'pending' && (
                        <div style={{ background: '#FFF8E7', padding: '12px', borderRadius: '10px', textAlign: 'center', fontSize: '12px', color: '#CFAE5A' }}>⏳ Waiting for admin review</div>
                      )}
                      
                      {request.status === 'approved' && (
                        <button onClick={() => router.push('/assigned-leads')} style={{ width: '100%', padding: '10px', background: COLORS.success, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>
                          View Assigned Leads →
                        </button>
                      )}
                      
                      {request.status === 'rejected' && (
                        <button onClick={() => handleResubmit(request)} style={{ width: '100%', padding: '10px', background: COLORS.textDark, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                          Resubmit Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <NewRequestModal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setEditingRequest(null); }} 
        onSubmit={handleSubmit}
        editData={editingRequest}
      />
    </div>
  );
}
