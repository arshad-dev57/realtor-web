'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';

interface DashboardStats {
     
    totalProperties: number;
    pendingTours: number;
    newLeads: number;
    totalLeads: number;
    assignedLeadsTotal: number;
    assignedLeadsHot: number;
    assignedLeadsWarm: number;
    assignedLeadsCold: number;
    leadRequestsTotal: number;
    leadRequestsPending: number;
    leadRequestsApproved: number;
    leadRequestsRejected: number;
    activeListings: number;
    totalViews: number;
    totalInquiries: number;
    offersReceived: number;
}

interface AssignedLead {

    id: string;
    _id?: string;
    name: string;
    email: string;
    phone: string;
    propertyType: string;
    budget: string;
    location: string;
    status: string;
    stage: string;
    score: number;
    createdAt: string;
}

interface UpcomingTour {
    id: string;
    customerName: string;
    propertyTitle: string;
    date: string;
    time: string;
    status: string;
}

interface Activity {
    id: string;
    title: string;
    time: string;
    type: string;
    propertyName: string;
}

interface TopListing {
    id: string;
    title: string;
    views: number;
    inquiries: number;
    status: string;
}

export default function RealtorDashboard() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    const [savedCount, setSavedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showDevices, setShowDevices] = useState(false);

    // Stats
    const [stats, setStats] = useState<DashboardStats>({
        totalProperties: 0,
        pendingTours: 0,
        newLeads: 0,
        totalLeads: 0,
        assignedLeadsTotal: 0,
        assignedLeadsHot: 0,
        assignedLeadsWarm: 0,
        assignedLeadsCold: 0,
        leadRequestsTotal: 0,
        leadRequestsPending: 0,
        leadRequestsApproved: 0,
        leadRequestsRejected: 0,
        activeListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        offersReceived: 0,
    });

    const [assignedLeads, setAssignedLeads] = useState<AssignedLead[]>([]);
    const [upcomingTours, setUpcomingTours] = useState<UpcomingTour[]>([]);
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [topListings, setTopListings] = useState<TopListing[]>([]);

    // Chart data
    const [weeklyViews, setWeeklyViews] = useState([120, 85, 145, 98, 210, 156, 189]);
    const [weeklyInquiries, setWeeklyInquiries] = useState([12, 8, 15, 10, 22, 18, 24]);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Check screen size for responsive
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
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
        loadDashboardData();
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

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/dashboard/stats');

            if (response.data && response.data.success !== false) {
                const data = response.data.data || response.data;

                setStats({
                    totalProperties: data.totalProperties || 0,
                    pendingTours: data.pendingTours || 0,
                    newLeads: data.newLeads || 0,
                    totalLeads: data.totalLeads || 0,
                    assignedLeadsTotal: data.assignedLeadsTotal || 0,
                    assignedLeadsHot: data.assignedLeadsHot || 0,
                    assignedLeadsWarm: data.assignedLeadsWarm || 0,
                    assignedLeadsCold: data.assignedLeadsCold || 0,
                    leadRequestsTotal: data.leadRequestsTotal || 0,
                    leadRequestsPending: data.leadRequestsPending || 0,
                    leadRequestsApproved: data.leadRequestsApproved || 0,
                    leadRequestsRejected: data.leadRequestsRejected || 0,
                    activeListings: data.totalProperties || 0,
                    totalViews: data.totalViews || 1248,
                    totalInquiries: data.totalInquiries || 86,
                    offersReceived: data.offersReceived || 12,
                });

                setAssignedLeads(data.recentAssignedLeads || []);
                setUpcomingTours(data.upcomingTours || []);
                setRecentActivities(data.recentActivities || []);
                setTopListings(data.topListings || []);
            } else {
                loadMockData();
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            loadMockData();
        } finally {
            setIsLoading(false);
        }
    };

    const loadMockData = () => {
        setStats({
            totalProperties: 12,
            pendingTours: 5,
            newLeads: 8,
            totalLeads: 34,
            assignedLeadsTotal: 15,
            assignedLeadsHot: 6,
            assignedLeadsWarm: 5,
            assignedLeadsCold: 4,
            leadRequestsTotal: 7,
            leadRequestsPending: 3,
            leadRequestsApproved: 3,
            leadRequestsRejected: 1,
            activeListings: 12,
            totalViews: 1248,
            totalInquiries: 86,
            offersReceived: 12,
        });

        setAssignedLeads([
            {
                id: '1',
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '+1 555-987-6543',
                propertyType: 'House',
                budget: '$800K - $1M',
                location: 'Beverly Hills',
                status: 'Hot',
                stage: 'Negotiation',
                score: 92,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '2',
                name: 'Bob Williams',
                email: 'bob@example.com',
                phone: '+1 555-456-7890',
                propertyType: 'Apartment',
                budget: '$500K - $600K',
                location: 'Downtown LA',
                status: 'Warm',
                stage: 'Proposal',
                score: 75,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: '3',
                name: 'Carol Davis',
                email: 'carol@example.com',
                phone: '+1 555-123-7890',
                propertyType: 'Villa',
                budget: '$1.2M - $1.5M',
                location: 'Malibu',
                status: 'Hot',
                stage: 'Qualified',
                score: 88,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ]);

        setUpcomingTours([
            {
                id: '1',
                customerName: 'John Smith',
                propertyTitle: 'Modern Luxury Villa',
                date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '10:00 AM',
                status: 'pending',
            },
            {
                id: '2',
                customerName: 'Sarah Johnson',
                propertyTitle: 'Beachfront Paradise',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '2:00 PM',
                status: 'confirmed',
            },
            {
                id: '3',
                customerName: 'Michael Brown',
                propertyTitle: 'Downtown Penthouse',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '11:30 AM',
                status: 'pending',
            },
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Hot': return '#EF4444';
            case 'Warm': return '#F59E0B';
            case 'Cold': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'Hot': return '#FEE2E2';
            case 'Warm': return '#FEF3C7';
            case 'Cold': return '#DBEAFE';
            default: return '#F3F4F6';
        }
    };

    const getTourStatusColor = (status: string) => {
        return status === 'confirmed' ? '#10B981' : '#F59E0B';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const formatCreatedAt = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    const NAV_ITEMS = [
        {
            id: 'home',
            label: 'Dashboard',
            href: '/realtor-dashboard',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            id: 'properties',
            label: 'Properties',
            href: '/realtorProperties',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
            ),
        },
        {
            id: 'leads',
            label: 'Assigned Leads',
            href: '/assigned-leads',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
            ),
        },
        {
            id: 'requests',
            label: 'Lead Requests',
            href: '/lead-request',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
            ),
        },
        {
            id: 'tours',
            label: 'Tours',
            href: '/tours',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
                </svg>
            ),
        },
        {
            id: 'add-property',
            label: 'Add Property',
            href: '/add-property',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
            ),
        },
    ];

    // Simple Bar Chart Component
    const BarChart = ({ data, color }: { data: number[]; color: string }) => {
        const maxValue = Math.max(...data, 1);
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px' }}>
                {data.map((value, index) => (
                    <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                        <div
                            style={{
                                height: `${(value / maxValue) * 100}px`,
                                background: color,
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease',
                                marginBottom: '8px',
                            }}
                        />
                        <span style={{ fontSize: '10px', color: '#999' }}>{days[index]}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Simple Pie Chart Component (Donut)
    const DonutChart = ({ hot, warm, cold }: { hot: number; warm: number; cold: number }) => {
        const total = hot + warm + cold;
        if (total === 0) return <div style={{ textAlign: 'center', padding: '40px' }}>No data</div>;

        const hotPercent = (hot / total) * 100;
        const warmPercent = (warm / total) * 100;
        const coldPercent = (cold / total) * 100;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="16" />
                        <circle
                            cx="60" cy="60" r="50" fill="none" stroke="#EF4444"
                            strokeWidth="16"
                            strokeDasharray={`${(hotPercent * 314.16) / 100} 314.16`}
                            strokeDashoffset="0"
                            transform="rotate(-90 60 60)"
                        />
                        <circle
                            cx="60" cy="60" r="50" fill="none" stroke="#F59E0B"
                            strokeWidth="16"
                            strokeDasharray={`${(warmPercent * 314.16) / 100} 314.16`}
                            strokeDashoffset={`-${(hotPercent * 314.16) / 100}`}
                            transform="rotate(-90 60 60)"
                        />
                        <circle
                            cx="60" cy="60" r="50" fill="none" stroke="#3B82F6"
                            strokeWidth="16"
                            strokeDasharray={`${(coldPercent * 314.16) / 100} 314.16`}
                            strokeDashoffset={`-${((hotPercent + warmPercent) * 314.16) / 100}`}
                            transform="rotate(-90 60 60)"
                        />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A' }}>{total}</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>Total</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                        <span style={{ fontSize: '11px', color: '#666' }}>Hot ({hot})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                        <span style={{ fontSize: '11px', color: '#666' }}>Warm ({warm})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3B82F6' }} />
                        <span style={{ fontSize: '11px', color: '#666' }}>Cold ({cold})</span>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: '#F5F2EC' }}>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
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
                    .charts-row {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .leads-tours-row {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .dashboard-header {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .search-bar {
                        width: 100% !important;
                    }
                    .header-actions {
                        justify-content: flex-start !important;
                    }
                    .welcome-section {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .welcome-section h1 {
                        font-size: 20px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            {/* Sidebar - Responsive */}
            <aside style={{
                width: sidebarCollapsed ? (isMobile ? '0px' : '72px') : (isMobile ? '240px' : '240px'),
                background: 'linear-gradient(180deg, #1A1A1A 0%, #1F1C14 100%)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
                position: isMobile ? 'fixed' : 'relative',
                zIndex: 20,
                flexShrink: 0,
                borderRight: '1px solid rgba(180,154,100,0.1)',
                left: sidebarCollapsed && isMobile ? '-240px' : '0',
                height: '100vh',
                overflowY: 'auto',
            }}>
                {/* Logo */}
                <div style={{
                    padding: sidebarCollapsed && isMobile ? '0' : (sidebarCollapsed ? '24px 0' : '24px 20px'),
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
                    gap: '12px',
                }}>
                    {(!sidebarCollapsed || isMobile) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '9px',
                                background: '#B49A64',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white" />
                                </svg>
                            </div>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#FFFFFF',
                                fontFamily: "'Cormorant Garamond', serif",
                                letterSpacing: '0.5px',
                            }}>Estatex</span>
                        </div>
                    )}
                    {sidebarCollapsed && !isMobile && (
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            background: '#B49A64',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white" />
                            </svg>
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
                                <path d={sidebarCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Nav Items */}
                <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
                    {(!sidebarCollapsed || isMobile) && (
                        <div style={{
                            fontSize: '9px',
                            fontWeight: '600',
                            letterSpacing: '2px',
                            color: 'rgba(255,255,255,0.25)',
                            textTransform: 'uppercase',
                            padding: '0 20px',
                            marginBottom: '8px',
                        }}>Main Menu</div>
                    )}
                    {NAV_ITEMS.map(item => {
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveNav(item.id);
                                    if (item.id === 'devices') {
                                        setShowDevices(true);
                                    } else {
                                        setShowDevices(false);
                                        if (item.href) {
                                            router.push(item.href);
                                        }
                                    }
                                    if (isMobile) {
                                        setSidebarCollapsed(true);
                                        setMobileMenuOpen(false);
                                    }
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
                                    position: 'relative',
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

                {/* User Card */}
                {(!sidebarCollapsed || isMobile) && (
                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'flex-start',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #B49A64, #9A8254)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#fff',
                            flexShrink: 0,
                        }}>AR</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Jeffry Max
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Realtor</div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobile && !sidebarCollapsed && (
                <div
                    onClick={() => setSidebarCollapsed(true)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 15,
                    }}
                />
            )}

            {/* Mobile Menu Toggle Button */}
            {isMobile && sidebarCollapsed && (
                <button
                    onClick={() => setSidebarCollapsed(false)}
                    style={{
                        position: 'fixed',
                        left: '16px',
                        top: '16px',
                        zIndex: 25,
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
                {/* Header */}
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
                        <div style={{ fontSize: '11px', color: '#B49A64', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Welcome back
                        </div>
                        <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: '#1A1A1A', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>
                            Alex Parker
                        </div>
                    </div>

                    <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 320px', order: isMobile ? 1 : 0 }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <input
                            placeholder="Search properties, leads..."
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
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#B49A64'; e.target.style.background = '#fff'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F2EC'; }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <NotificationDropdown />
                        <ProfileDropdown />
                    </div>
                </header>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
                    {showDevices ? (
                        <DevicesView onBack={() => {
                            setShowDevices(false);
                            setActiveNav('home');
                        }} />
                    ) : (
                        <>
                            {/* Welcome Section with Stats Cards */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)',
                                borderRadius: '20px',
                                padding: isMobile ? '20px' : '24px',
                                marginBottom: '24px',
                    }}>
                        <div className="welcome-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                                    Welcome back, Alex!
                                </h1>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                    Here's what's happening with your real estate business today.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Responsive */}
                    <div className="stats-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px',
                    }}>
                        {[
                            { label: 'Total Properties', value: stats.totalProperties, icon: '🏠', color: '#3B82F6', bg: '#EFF6FF' },
                            { label: 'Active Listings', value: stats.activeListings, icon: '📍', color: '#10B981', bg: '#ECFDF5' },
                            { label: 'Pending Tours', value: stats.pendingTours, icon: '📅', color: '#F59E0B', bg: '#FFFBEB' },
                            { label: 'Total Leads', value: stats.totalLeads, icon: '👥', color: '#8B5CF6', bg: '#F5F3FF' },
                            { label: 'Total Views', value: stats.totalViews, icon: '👁️', color: '#EF4444', bg: '#FEF2F2' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #F0EBE1',
                                padding: '16px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>
                                            {stat.value.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>{stat.label}</div>
                                    </div>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: stat.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '22px',
                                    }}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row - Responsive */}
                    <div className="charts-row" style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '24px',
                        marginBottom: '24px',
                    }}>
                        {/* Views Chart */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #F0EBE1',
                            padding: '20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Property Views</h3>
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Weekly performance</p>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    background: '#F5F2EC',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    color: '#B49A64',
                                    fontWeight: '500',
                                }}>
                                    +12%
                                </div>
                            </div>
                            <BarChart data={weeklyViews} color="#B49A64" />
                        </div>

                        {/* Inquiries Chart */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #F0EBE1',
                            padding: '20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Inquiries Received</h3>
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Weekly inquiries</p>
                                </div>
                                <div style={{
                                    padding: '4px 12px',
                                    background: '#F5F2EC',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    color: '#B49A64',
                                    fontWeight: '500',
                                }}>
                                    +8%
                                </div>
                            </div>
                            <BarChart data={weeklyInquiries} color="#F59E0B" />
                        </div>
                    </div>

                    {/* Leads and Tours Section - Responsive */}
                    <div className="leads-tours-row" style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '24px',
                        marginBottom: '24px',
                    }}>
                        {/* Lead Score Distribution */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #F0EBE1',
                            padding: '20px',
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Lead Distribution</h3>
                                <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Hot, Warm, Cold leads</p>
                            </div>
                            <DonutChart
                                hot={stats.assignedLeadsHot}
                                warm={stats.assignedLeadsWarm}
                                cold={stats.assignedLeadsCold}
                            />
                        </div>

                        {/* Assigned Leads List */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #F0EBE1',
                            padding: '20px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Assigned Leads</h3>
                                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Recently assigned to you</p>
                                </div>
                                <button
                                    onClick={() => router.push('/leads')}
                                    style={{
                                        fontSize: '12px',
                                        color: '#B49A64',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    View All →
                                </button>
                            </div>
                    {assignedLeads.slice(0, 3).map((lead, idx) => (
    <div key={lead.id || lead._id || `lead-${idx}`} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid #F0EBE1',
        flexWrap: 'wrap',
    }}>
        <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: getStatusBgColor(lead.status),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '700',
            color: getStatusColor(lead.status),
        }}>
            {lead.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontWeight: '600', color: '#1A1A1A', marginBottom: '2px' }}>{lead.name || 'N/A'}</div>
            <div style={{ fontSize: '11px', color: '#999' }}>{lead.propertyType || 'Property'} • {lead.budget || 'N/A'}</div>
        </div>
        <div style={{
            padding: '4px 10px',
            borderRadius: '20px',
            background: getStatusBgColor(lead.status),
            color: getStatusColor(lead.status),
            fontSize: '11px',
            fontWeight: '600',
        }}>
            {lead.status || 'Warm'}
        </div>
    </div>
))}
                        </div>
                    </div>

                    {/* Upcoming Tours */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #F0EBE1',
                        padding: '20px',
                        marginBottom: '24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>Upcoming Tours</h3>
                                <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>Scheduled property viewings</p>
                            </div>
                            <button
                                onClick={() => router.push('/tours')}
                                style={{
                                    fontSize: '12px',
                                    color: '#B49A64',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                View All →
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingTours.map((tour) => (
                                <div key={tour.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: '#FAFAF8',
                                    borderRadius: '12px',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: getTourStatusColor(tour.status) + '15',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="4" width="18" height="18" rx="2" stroke={getTourStatusColor(tour.status)} strokeWidth="1.8" />
                                            <line x1="8" y1="2" x2="8" y2="6" stroke={getTourStatusColor(tour.status)} strokeWidth="1.8" />
                                            <line x1="16" y1="2" x2="16" y2="6" stroke={getTourStatusColor(tour.status)} strokeWidth="1.8" />
                                            <line x1="3" y1="10" x2="21" y2="10" stroke={getTourStatusColor(tour.status)} strokeWidth="1.8" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <div style={{ fontWeight: '600', color: '#1A1A1A', marginBottom: '2px' }}>{tour.customerName}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{tour.propertyTitle}</div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{tour.date} at {tour.time}</div>
                                    </div>
                                    <div style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: getTourStatusColor(tour.status) + '15',
                                        color: getTourStatusColor(tour.status),
                                        fontSize: '11px',
                                        fontWeight: '600',
                                    }}>
                                        {tour.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                    </div>
                                </div>
                            ))}
                            {upcomingTours.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    No upcoming tours scheduled
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #F0EBE1',
                        padding: '20px',
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A', marginBottom: '16px' }}>Recent Activity</h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {[
                                { icon: '👁️', text: 'New view on "Modern Luxury Villa"', time: '2 hours ago', color: '#3B82F6' },
                                { icon: '💬', text: 'New inquiry from John Smith', time: '5 hours ago', color: '#10B981' },
                                { icon: '📅', text: 'Tour scheduled for "Beachfront Paradise"', time: '1 day ago', color: '#F59E0B' },
                                { icon: '🏠', text: 'Property "Downtown Penthouse" was listed', time: '2 days ago', color: '#8B5CF6' },
                                { icon: '⭐', text: 'New lead assigned from admin', time: '3 days ago', color: '#EF4444' },
                            ].map((activity, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 0',
                                    borderBottom: i < 4 ? '1px solid #F0EBE1' : 'none',
                                    flexWrap: 'wrap',
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: activity.color + '15',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                    }}>
                                        {activity.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', color: '#1A1A1A' }}>{activity.text}</div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: '32px' }} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}