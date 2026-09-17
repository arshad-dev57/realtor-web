// app/realtor/tours/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';
import SettingsView from '@/components/SettingsView';

// Type definitions
interface TourRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: string;
  propertyLocation: string;
  propertyImage: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'cancelled';
  message: string;
  createdAt: string;
}

// Mock data for demonstration
const MOCK_TOURS: TourRequest[] = [
  {
    id: '1',
    propertyId: 'p1',
    propertyTitle: 'Modern Luxury Villa',
    propertyPrice: '$1,250,000',
    propertyLocation: 'Beverly Hills, CA',
    propertyImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80',
    customerId: 'c1',
    customerName: 'Emma Wilson',
    customerEmail: 'emma.wilson@example.com',
    customerPhone: '+1 (555) 123-4567',
    customerAvatar: 'EW',
    requestedDate: '2024-12-15',
    requestedTime: '10:00 AM',
    status: 'pending',
    message: 'Very interested in this property. Would like to see the backyard and kitchen area.',
    createdAt: '2024-12-10T10:30:00Z',
  },
  {
    id: '2',
    propertyId: 'p2',
    propertyTitle: 'Oceanfront Paradise',
    propertyPrice: '$3,200,000',
    propertyLocation: 'Miami Beach, FL',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
    customerId: 'c2',
    customerName: 'James Carter',
    customerEmail: 'james.carter@example.com',
    customerPhone: '+1 (555) 234-5678',
    customerAvatar: 'JC',
    requestedDate: '2024-12-18',
    requestedTime: '2:00 PM',
    status: 'confirmed',
    message: 'Planning to fly in from New York. Need help with airport directions.',
    createdAt: '2024-12-09T14:20:00Z',
  },
  {
    id: '3',
    propertyId: 'p3',
    propertyTitle: 'Manhattan Penthouse',
    propertyPrice: '$4,500,000',
    propertyLocation: 'New York, NY',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
    customerId: 'c3',
    customerName: 'Sophia Martinez',
    customerEmail: 'sophia.martinez@example.com',
    customerPhone: '+1 (555) 345-6789',
    customerAvatar: 'SM',
    requestedDate: '2024-12-05',
    requestedTime: '11:00 AM',
    status: 'completed',
    message: 'Beautiful property! Would love to schedule a second visit.',
    createdAt: '2024-12-01T09:15:00Z',
  },
  {
    id: '4',
    propertyId: 'p4',
    propertyTitle: 'Suburban Family Home',
    propertyPrice: '$850,000',
    propertyLocation: 'Austin, TX',
    propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
    customerId: 'c4',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@example.com',
    customerPhone: '+1 (555) 456-7890',
    customerAvatar: 'MC',
    requestedDate: '2024-12-20',
    requestedTime: '3:30 PM',
    status: 'pending',
    message: 'Interested in school district information as well.',
    createdAt: '2024-12-11T16:45:00Z',
  },
  {
    id: '5',
    propertyId: 'p5',
    propertyTitle: 'Downtown Luxury Condo',
    propertyPrice: '$2,100,000',
    propertyLocation: 'Chicago, IL',
    propertyImage: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400&q=80',
    customerId: 'c5',
    customerName: 'Olivia Rodriguez',
    customerEmail: 'olivia.rodriguez@example.com',
    customerPhone: '+1 (555) 567-8901',
    customerAvatar: 'OR',
    requestedDate: '2024-12-22',
    requestedTime: '1:00 PM',
    status: 'confirmed',
    message: 'Looking for a place with city views and parking included.',
    createdAt: '2024-12-12T11:30:00Z',
  },
];

const COLORS = {
  gold: '#B49A64',
  darkBg: '#F5F2EC',
  white: '#FFFFFF',
  border: '#F0EBE1',
  textDark: '#1A1A1A',
  textLight: '#999',
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
  { id: 'properties', label: 'Properties', href: '/realtorProperties', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'assigned-leads', label: 'Assigned Leads', href: '/assigned-leads', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'lead-requests', label: 'Lead Requests', href: '/lead-request', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'tours', label: 'Tours', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'add-property', label: 'Add Property', href: '/add-property', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'devices', label: 'Devices', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'settings', label: 'Settings', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

export default function TourRequestsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tourRequests, setTourRequests] = useState<TourRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [selectedRequest, setSelectedRequest] = useState<TourRequest | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('tours');
  const [savedCount, setSavedCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = ['Pending', 'Confirmed', 'Completed', 'All'];

  // Check screen size for responsive
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

  useEffect(() => {
    loadTourRequests();
    loadFavoritesCount();
  }, []);

  const loadFavoritesCount = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setSavedCount(favorites.length);
    } catch (e) {
      setSavedCount(0);
    }
  };

  const loadTourRequests = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setTourRequests(MOCK_TOURS);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = () => {
    if (selectedTab === 0) {
      return tourRequests.filter(r => r.status === 'pending');
    } else if (selectedTab === 1) {
      return tourRequests.filter(r => r.status === 'confirmed');
    } else if (selectedTab === 2) {
      return tourRequests.filter(r => r.status === 'completed');
    } else {
      return tourRequests;
    }
  };

  const paginatedRequests = () => {
    const filtered = filteredRequests();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredRequests().length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const acceptRequest = async (request: TourRequest) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTourRequests(prev =>
        prev.map(r => r.id === request.id ? { ...r, status: 'confirmed' } : r)
      );
      alert(`Tour request from ${request.customerName} has been accepted!`);
    } catch (error) {
      alert('Failed to accept request');
    }
  };

  const rejectRequest = async (request: TourRequest) => {
    if (confirm(`Reject tour request from ${request.customerName}?`)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTourRequests(prev =>
          prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r)
        );
        alert(`Tour request from ${request.customerName} has been rejected.`);
      } catch (error) {
        alert('Failed to reject request');
      }
    }
  };

  const cancelTour = async (request: TourRequest) => {
    if (confirm(`Cancel scheduled tour with ${request.customerName}?`)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTourRequests(prev =>
          prev.map(r => r.id === request.id ? { ...r, status: 'cancelled' } : r)
        );
        alert(`Tour with ${request.customerName} has been cancelled.`);
      } catch (error) {
        alert('Failed to cancel tour');
      }
    }
  };

  const openRescheduleModal = (request: TourRequest) => {
    setSelectedRequest(request);
    setRescheduleData({
      date: request.requestedDate,
      time: request.requestedTime,
    });
    setShowRescheduleModal(true);
  };

  const submitReschedule = async () => {
    if (!selectedRequest) return;
    if (!rescheduleData.date || !rescheduleData.time) {
      alert('Please enter both date and time');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTourRequests(prev =>
        prev.map(r =>
          r.id === selectedRequest.id
            ? {
                ...r,
                requestedDate: rescheduleData.date,
                requestedTime: rescheduleData.time,
                status: 'pending' as const,
              }
            : r
        )
      );
      setShowRescheduleModal(false);
      alert(`Tour rescheduled to ${rescheduleData.date} at ${rescheduleData.time}`);
    } catch (error) {
      alert('Failed to reschedule');
    }
  };

  // Contact methods
  const callCustomer = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const emailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'rgba(245, 158, 11, 0.1)';
      case 'confirmed': return 'rgba(16, 185, 129, 0.1)';
      case 'completed': return 'rgba(59, 130, 246, 0.1)';
      case 'rejected': return 'rgba(239, 68, 68, 0.1)';
      case 'cancelled': return 'rgba(107, 114, 128, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  // Navigation handler
  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    setActiveNav(item.id);
    setShowDevices(false);
    setShowSettings(false);
    
    if (item.id === 'devices') {
      setShowDevices(true);
    } else if (item.id === 'settings') {
      setShowSettings(true);
    } else if (item.id === 'tours') {
      // Stay on current page
    } else if (item.href) {
      router.push(item.href);
    }
    
    if (isMobile) setMobileSidebarOpen(false);
  };

  // Stats
  const stats = {
    total: tourRequests.length,
    pending: tourRequests.filter(r => r.status === 'pending').length,
    confirmed: tourRequests.filter(r => r.status === 'confirmed').length,
    completed: tourRequests.filter(r => r.status === 'completed').length,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: COLORS.darkBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
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
          .action-buttons {
            flex-direction: column !important;
            gap: 6px !important;
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
                onClick={() => handleNavClick(item)} 
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
            <div style={{ fontSize: '11px', color: COLORS.gold, fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Tour Management</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: COLORS.textDark, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>Tour Requests</div>
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
              setActiveNav('tours');
            }} />
          ) : showSettings ? (
            <SettingsView onBack={() => {
              setShowSettings(false);
              setActiveNav('tours');
            }} />
          ) : (
            <>
              {/* Stats Grid */}
              <div className="stats-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                {[
                  { label: 'Total Requests', value: stats.total.toString(), icon: '📋', color: COLORS.gold },
                  { label: 'Pending', value: stats.pending.toString(), icon: '⏳', color: '#F59E0B' },
                  { label: 'Confirmed', value: stats.confirmed.toString(), icon: '✅', color: '#10B981' },
                  { label: 'Completed', value: stats.completed.toString(), icon: '🏁', color: '#3B82F6' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '4px',
                  border: '1px solid #F0EBE1',
                  marginBottom: '24px',
                  width: 'fit-content',
                  overflowX: 'auto',
                }}
              >
                {tabs.map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setSelectedTab(index);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: isMobile ? '8px 16px' : '10px 24px',
                      background: selectedTab === index ? '#1A1A1A' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: selectedTab === index ? 600 : 500,
                      color: selectedTab === index ? COLORS.gold : '#8A8578',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Table View - Desktop */}
              {!isMobile && (
                <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#1A1A1A' }}>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Customer</th>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Property</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Date & Time</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: '#B49A64', fontSize: '12px', fontWeight: '600' }}>Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F0EBE1' }}>
                            <td style={{ padding: '12px' }}><div style={{ height: '16px', width: '100px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
                            <td style={{ padding: '12px' }}><div style={{ height: '16px', width: '120px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
                            <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '16px', width: '80px', background: '#F0EBE1', borderRadius: '4px', margin: '0 auto' }} /></td>
                            <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '24px', width: '70px', background: '#F0EBE1', borderRadius: '20px', margin: '0 auto' }} /></td>
                            <td style={{ padding: '12px', textAlign: 'center' }}><div style={{ height: '32px', width: '100px', background: '#F0EBE1', borderRadius: '6px', margin: '0 auto' }} /></td>
                          </tr>
                        ))
                      ) : paginatedRequests().length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗓️</div>
                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No tour requests found</div>
                            <div style={{ fontSize: '13px' }}>No {tabs[selectedTab].toLowerCase()} tour requests at the moment</div>
                          </td>
                        </tr>
                      ) : (
                        paginatedRequests().map((request, index) => (
                          <tr key={request.id} style={{ borderBottom: '1px solid #F0EBE1', background: index % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(180,154,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#B49A64' }}>
                                  {request.customerAvatar}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1A1A1A' }}>{request.customerName}</div>
                                  <div style={{ fontSize: '11px', color: '#999' }}>{request.customerPhone}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 500, fontSize: '13px', color: '#1A1A1A' }}>{request.propertyTitle}</div>
                              <div style={{ fontSize: '11px', color: '#999' }}>{request.propertyLocation}</div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', marginTop: '4px' }}>{request.propertyPrice}</div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ fontSize: '13px', color: '#1A1A1A' }}>{request.requestedDate}</div>
                              <div style={{ fontSize: '11px', color: '#999' }}>{request.requestedTime}</div>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <span style={{
                                background: getStatusBgColor(request.status),
                                color: getStatusColor(request.status),
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: '600',
                              }}>
                                {getStatusText(request.status)}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                {request.status === 'pending' ? (
                                  <>
                                    <button
                                      onClick={() => acceptRequest(request)}
                                      style={{ padding: '6px 12px', background: '#10B981', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => rejectRequest(request)}
                                      style={{ padding: '6px 12px', background: '#EF4444', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : request.status === 'confirmed' ? (
                                  <>
                                    <button
                                      onClick={() => openRescheduleModal(request)}
                                      style={{ padding: '6px 12px', background: '#B49A64', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                                    >
                                      Reschedule
                                    </button>
                                    <button
                                      onClick={() => cancelTour(request)}
                                      style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #EF4444', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowContactModal(true);
                                    }}
                                    style={{ padding: '6px 12px', background: '#1A1A1A', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#B49A64', cursor: 'pointer' }}
                                  >
                                    Contact
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid View - Mobile */}
              {isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '16px' }}>
                        <div style={{ height: '50px', background: '#F0EBE1', borderRadius: '8px', marginBottom: '12px' }} />
                        <div style={{ height: '20px', width: '70%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} />
                        <div style={{ height: '40px', background: '#F0EBE1', borderRadius: '8px' }} />
                      </div>
                    ))
                  ) : paginatedRequests().length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗓️</div>
                      <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#1A1A1A' }}>No tour requests found</div>
                      <div style={{ fontSize: '13px', color: '#999' }}>No {tabs[selectedTab].toLowerCase()} tour requests at the moment</div>
                    </div>
                  ) : (
                    paginatedRequests().map((request) => (
                      <div key={request.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #F0EBE1', background: getStatusBgColor(request.status) }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(request.status) }} />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: getStatusColor(request.status) }}>{getStatusText(request.status)}</span>
                            </span>
                            <span style={{ fontSize: '11px', color: '#999' }}>{formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                        <div style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600, color: '#B49A64' }}>
                              {request.customerAvatar}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>{request.customerName}</div>
                              <div style={{ fontSize: '11px', color: '#999' }}>{request.customerPhone}</div>
                              <div style={{ fontSize: '11px', color: '#999' }}>{request.customerEmail}</div>
                            </div>
                          </div>
                          <div style={{ background: '#F5F2EC', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 500, fontSize: '13px', color: '#1A1A1A', marginBottom: '4px' }}>{request.propertyTitle}</div>
                            <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{request.propertyLocation}</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{request.propertyPrice}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div><span style={{ fontSize: '11px', color: '#999' }}>📅 </span><span style={{ fontSize: '13px' }}>{request.requestedDate}</span></div>
                            <div><span style={{ fontSize: '11px', color: '#999' }}>⏰ </span><span style={{ fontSize: '13px' }}>{request.requestedTime}</span></div>
                          </div>
                          <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                            {request.status === 'pending' ? (
                              <>
                                <button onClick={() => acceptRequest(request)} style={{ flex: 1, padding: '10px', background: '#10B981', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Accept</button>
                                <button onClick={() => rejectRequest(request)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #EF4444', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>Reject</button>
                              </>
                            ) : request.status === 'confirmed' ? (
                              <>
                                <button onClick={() => openRescheduleModal(request)} style={{ flex: 1, padding: '10px', background: '#B49A64', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Reschedule</button>
                                <button onClick={() => cancelTour(request)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #EF4444', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#EF4444', cursor: 'pointer' }}>Cancel</button>
                              </>
                            ) : (
                              <button onClick={() => { setSelectedRequest(request); setShowContactModal(true); }} style={{ width: '100%', padding: '10px', background: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#B49A64', cursor: 'pointer' }}>Contact Customer</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginTop: '32px', padding: '16px 0', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: isMobile ? '6px 16px' : '8px 20px',
                      background: currentPage > 1 ? '#1A1A1A' : '#E0DBD0',
                      color: currentPage > 1 ? '#B49A64' : '#999',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: currentPage > 1 ? 'pointer' : 'not-allowed',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '600',
                    }}
                  >
                    ← Previous
                  </button>
                  <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            width: isMobile ? '32px' : '40px',
                            height: isMobile ? '32px' : '40px',
                            background: pageNum === currentPage ? '#B49A64' : '#fff',
                            color: pageNum === currentPage ? '#fff' : '#555',
                            border: pageNum === currentPage ? 'none' : '1px solid #F0EBE1',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '12px' : '14px',
                            fontWeight: pageNum === currentPage ? '700' : '500',
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: isMobile ? '6px 16px' : '8px 20px',
                      background: currentPage < totalPages ? '#1A1A1A' : '#E0DBD0',
                      color: currentPage < totalPages ? '#B49A64' : '#999',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: currentPage < totalPages ? 'pointer' : 'not-allowed',
                      fontSize: isMobile ? '12px' : '13px',
                      fontWeight: '600',
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowRescheduleModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif", color: '#1A1A1A' }}>Reschedule Tour</h3>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
              Property: {selectedRequest.propertyTitle}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px', display: 'block' }}>New Date</label>
              <input
                type="date"
                value={rescheduleData.date}
                onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1.5px solid #E0DBD0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px', display: 'block' }}>New Time</label>
              <input
                type="time"
                value={rescheduleData.time}
                onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1.5px solid #E0DBD0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#F5F2EC',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#555',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#1A1A1A',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#B49A64',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px', fontFamily: "'Cormorant Garamond', serif" }}>
              Contact {selectedRequest.customerName}
            </h3>

            <button
              onClick={() => { callCustomer(selectedRequest.customerPhone); setShowContactModal(false); }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: 'none',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '28px' }}>📞</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>Call {selectedRequest.customerName}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{selectedRequest.customerPhone}</div>
              </div>
            </button>

            <button
              onClick={() => { emailCustomer(selectedRequest.customerEmail); setShowContactModal(false); }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '28px' }}>✉️</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>Email {selectedRequest.customerName}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{selectedRequest.customerEmail}</div>
              </div>
            </button>

            <button
              onClick={() => setShowContactModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#F5F2EC',
                border: 'none',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#555',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}