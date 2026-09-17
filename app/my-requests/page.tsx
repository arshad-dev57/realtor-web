'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import DevicesView from '@/components/DevicesView';
import SettingsView from '@/components/SettingsView';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';

// ── Types ──────────────────────────────────────────────────────────────────
interface TourRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  createdAt: string;
}

// ── Status Colors and Labels ───────────────────────────────────────────────
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return '#F59E0B';
    case 'confirmed': return '#10B981';
    case 'cancelled': return '#EF4444';
    case 'completed': return '#3B82F6';
    default: return '#6B7280';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    default: return status;
  }
};

const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const days = Math.floor(diffHours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}m ago`;
  } catch {
    return '';
  }
};

// ── Tour Card Component ────────────────────────────────────────────────────
function TourCard({ tour, onCancel, isMobile }: { tour: TourRequest; onCancel: (id: string) => void; isMobile: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const statusColor = getStatusColor(tour.status);
  const statusLabel = getStatusLabel(tour.status);
  
  return (
    <>
      <div
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: `1px solid ${isHovered ? 'rgba(180,154,100,0.3)' : '#F0EBE1'}`,
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with status */}
        <div
          style={{
            padding: '12px 16px',
            background: `${statusColor}10`,
            borderBottom: `1px solid ${statusColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: statusColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {statusLabel}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#999' }}>{formatTimeAgo(tour.createdAt)}</span>
        </div>
        
        {/* Body */}
        <div style={{ padding: '16px', flex: 1 }}>
          <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px', fontFamily: "'Cormorant Garamond', serif" }}>
            {tour.propertyTitle}
          </h3>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#B49A64" strokeWidth="1.8"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#B49A64" strokeWidth="1.8"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#B49A64" strokeWidth="1.8"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="#B49A64" strokeWidth="1.8"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#555' }}>{tour.date}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#B49A64" strokeWidth="1.8"/>
                <polyline points="12 6 12 12 16 14" stroke="#B49A64" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#555' }}>{tour.time}</span>
            </div>
          </div>
          
          <div style={{ background: '#F5F2EC', borderRadius: '10px', padding: '10px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: '#999', marginBottom: '6px' }}>Contact Information</div>
            <div style={{ fontSize: '12px', color: '#1A1A1A', marginBottom: '4px', wordBreak: 'break-all' }}><strong>{tour.name}</strong></div>
            <div style={{ fontSize: '11px', color: '#666', wordBreak: 'break-all' }}>{tour.email}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>{tour.phone}</div>
          </div>
          
          {tour.status === 'pending' && (
            <button
              onClick={() => setShowCancelDialog(true)}
              style={{
                width: '100%',
                height: '40px',
                background: 'transparent',
                border: '1.5px solid #FECACA',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#EF4444',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = '#FEF2F2';
                (e.target as HTMLButtonElement).style.borderColor = '#EF4444';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'transparent';
                (e.target as HTMLButtonElement).style.borderColor = '#FECACA';
              }}
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowCancelDialog(false); }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px', animation: 'slideUp 0.25s ease' }}>
            <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px', fontFamily: "'Cormorant Garamond', serif" }}>Cancel Tour Request</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Are you sure you want to cancel the tour request for "{tour.propertyTitle}"?</p>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => setShowCancelDialog(false)} style={{ flex: 1, height: '44px', background: '#F5F2EC', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>No, Keep It</button>
              <button onClick={() => { setShowCancelDialog(false); onCancel(tour.id); }} style={{ flex: 1, height: '44px', background: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Table Row Component ────────────────────────────────────────────────────
function TourTableRow({ tour, onCancel, index, isMobile }: { tour: TourRequest; onCancel: (id: string) => void; index: number; isMobile: boolean }) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const statusColor = getStatusColor(tour.status);
  const statusLabel = getStatusLabel(tour.status);
  
  return (
    <>
      <tr
        style={{
          borderBottom: '1px solid #F0EBE1',
          background: index % 2 === 0 ? '#fff' : '#FAFAF8',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#F5F2EC'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = index % 2 === 0 ? '#fff' : '#FAFAF8'; }}
      >
        <td style={{ padding: '14px 12px' }}>
          <div style={{ fontWeight: '600', color: '#1A1A1A', marginBottom: '4px' }}>{tour.propertyTitle}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{tour.date} at {tour.time}</div>
        </td>
        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
          <span style={{ background: `${statusColor}15`, color: statusColor, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{statusLabel}</span>
        </td>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{tour.name}</div>
          <div style={{ fontSize: '11px', color: '#999', wordBreak: 'break-all' }}>{tour.email}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>{tour.phone}</div>
        </td>
        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
          {tour.status === 'pending' && (
            <button onClick={() => setShowCancelDialog(true)} style={{ padding: '6px 14px', background: 'transparent', border: '1.5px solid #FECACA', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#EF4444', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#FEF2F2'; (e.target as HTMLButtonElement).style.borderColor = '#EF4444'; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.borderColor = '#FECACA'; }}>
              Cancel
            </button>
          )}
        </td>
      </tr>
      
      {showCancelDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={(e) => { if (e.target === e.currentTarget) setShowCancelDialog(false); }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px' }}>Cancel Tour Request</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Are you sure you want to cancel the tour request for "{tour.propertyTitle}"?</p>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button onClick={() => setShowCancelDialog(false)} style={{ flex: 1, height: '44px', background: '#F5F2EC', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>No</button>
              <button onClick={() => { setShowCancelDialog(false); onCancel(tour.id); }} style={{ flex: 1, height: '44px', background: '#EF4444', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#fff', cursor: 'pointer' }}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '16px' }}>
      <div style={{ height: '40px', background: '#F0EBE1', borderRadius: '8px', marginBottom: '12px' }} />
      <div style={{ height: '20px', width: '70%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '14px', width: '50%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} />
      <div style={{ height: '60px', background: '#F0EBE1', borderRadius: '8px', marginBottom: '12px' }} />
      <div style={{ height: '40px', background: '#F0EBE1', borderRadius: '8px' }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #F0EBE1' }}>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '120px', background: '#F0EBE1', borderRadius: '4px' }} /><div style={{ height: '12px', width: '80px', background: '#F0EBE1', borderRadius: '4px', marginTop: '6px' }} /></td>
      <td style={{ padding: '14px 12px', textAlign: 'center' }}><div style={{ height: '24px', width: '60px', background: '#F0EBE1', borderRadius: '20px', margin: '0 auto' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '100px', background: '#F0EBE1', borderRadius: '4px' }} /><div style={{ height: '12px', width: '120px', background: '#F0EBE1', borderRadius: '4px', marginTop: '6px' }} /></td>
      <td style={{ padding: '14px 12px', textAlign: 'center' }}><div style={{ height: '28px', width: '60px', background: '#F0EBE1', borderRadius: '6px', margin: '0 auto' }} /></td>
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
  { id: 'requests', label: 'My Requests', href: null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>) },
  { id: 'saved', label: 'Saved Properties', href: '/saved-properties', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { id: 'devices', label: 'Devices', href: null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg>) },
  { id: 'settings', label: 'Settings', href: null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg>) },
];

// ── Main Page Component ────────────────────────────────────────────────────
export default function MyRequestsPage() {
  const router = useRouter();
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('requests');
  const [savedCount, setSavedCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showDevices, setShowDevices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const itemsPerPage = 6;

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

  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tours/my-tours');
      if (response.data && response.data.success !== false) {
        let toursData: any[] = [];
        if (Array.isArray(response.data)) toursData = response.data;
        else if (response.data.data && Array.isArray(response.data.data)) toursData = response.data.data;
        else if (response.data.tours && Array.isArray(response.data.tours)) toursData = response.data.tours;
        
        const formattedTours: TourRequest[] = toursData.map((tour: any) => ({
          id: tour._id || tour.id,
          propertyId: tour.propertyId,
          propertyTitle: tour.propertyTitle || 'Property',
          propertyImage: tour.propertyImage || '',
          userId: tour.userId,
          name: tour.name || '',
          email: tour.email || '',
          phone: tour.phone || '',
          date: tour.date ? new Date(tour.date).toLocaleDateString('en-PK') : tour.date,
          time: tour.time || '',
          status: tour.status || 'pending',
          notes: tour.notes || '',
          createdAt: tour.createdAt || new Date().toISOString(),
        }));
        setTours(formattedTours);
      } else setTours([]);
    } catch (error) { console.error('Error fetching tours:', error); setTours([]); } 
    finally { setIsLoading(false); }
  };

  const cancelTour = async (tourId: string) => {
    try {
      const response = await api.put(`/tours/${tourId}/cancel`, {});
      if (response.data && response.data.success !== false) {
        setTours(prev => prev.map(tour => tour.id === tourId ? { ...tour, status: 'cancelled' as const } : tour));
        alert('Tour cancelled successfully');
      } else alert(response.data?.message || 'Failed to cancel tour');
    } catch (error) { console.error('Error cancelling tour:', error); alert('Failed to cancel tour'); }
  };

  const totalPages = Math.ceil(tours.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTours = tours.slice(startIndex, startIndex + itemsPerPage);
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  useEffect(() => {
    try { const favorites = JSON.parse(localStorage.getItem('favorites') || '[]'); setSavedCount(favorites.length); } 
    catch (e) { setSavedCount(0); }
  }, []);

  useEffect(() => { fetchTours(); }, []);

  const pendingCount = tours.filter(t => t.status === 'pending').length;
  const confirmedCount = tours.filter(t => t.status === 'confirmed').length;
  const completedCount = tours.filter(t => t.status === 'completed').length;

  // Handle navigation click
  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    setActiveNav(item.id);
    setShowDevices(false);
    setShowSettings(false);
    
    if (item.id === 'home') {
      router.push('/buyerdashboard');
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
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E0DBD0; borderRadius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #B49A64; }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .table-container {
            overflow-x: auto !important;
          }
          .grid-container {
            grid-template-columns: 1fr !important;
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
                {(!sidebarCollapsed || isMobile) && item.id === 'requests' && pendingCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#F59E0B', color: '#fff', borderRadius: '20px', padding: '1px 7px', fontSize: '10px', fontWeight: '700' }}>
                    {pendingCount}
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
            <div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>My Account</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>Tour Requests</div>
          </div>
          
          {/* View Toggle - Hide on mobile */}
          {!isMobile && (
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #F0EBE1', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#1A1A1A' : 'transparent', color: viewMode === 'grid' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/></svg>
              </button>
              <button onClick={() => setViewMode('table')} style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? '#1A1A1A' : 'transparent', color: viewMode === 'table' ? '#B49A64' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
          )}
          
          <NotificationDropdown />
          <ProfileDropdown />
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {showDevices ? (
            <DevicesView onBack={() => {
              setShowDevices(false);
              setActiveNav('requests');
            }} />
          ) : showSettings ? (
            <SettingsView onBack={() => {
              setShowSettings(false);
              setActiveNav('requests');
            }} />
          ) : (
            <>
              {/* Stats Row - Responsive */}
              <div className="stats-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                {[
                  { label: 'Total Requests', value: tours.length.toString(), icon: '📋', color: '#B49A64' },
                  { label: 'Pending', value: pendingCount.toString(), icon: '⏳', color: '#F59E0B' },
                  { label: 'Confirmed', value: confirmedCount.toString(), icon: '✅', color: '#10B981' },
                  { label: 'Completed', value: completedCount.toString(), icon: '🏁', color: '#3B82F6' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Tours List */}
              {isLoading ? (
                viewMode === 'table' && !isMobile ? (
                  <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#1A1A1A' }}>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Property</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Status</th>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Contact</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                    {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                )
              ) : tours.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>No Tour Requests</div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '24px' }}>Schedule a tour for any property and it will appear here</div>
                  <button onClick={() => router.push('/buyerdashboard')} style={{ padding: '10px 24px', background: '#1A1A1A', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', color: '#B49A64', cursor: 'pointer' }}>Browse Properties</button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                  {paginatedTours.map((tour) => (<TourCard key={tour.id} tour={tour} onCancel={cancelTour} isMobile={isMobile} />))}
                </div>
              ) : (
                <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: '#1A1A1A' }}>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Property</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Contact</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTours.map((tour, index) => (<TourTableRow key={tour.id} tour={tour} onCancel={cancelTour} index={index} isMobile={isMobile} />))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
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
          <div style={{ height: '32px' }} />
        </div>
      </div>
    </div>
  );
}