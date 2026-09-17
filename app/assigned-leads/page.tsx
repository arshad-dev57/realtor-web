// app/realtor/assigned-leads/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileDropdown from '@/components/ProfileDropdown';
import DevicesView from '@/components/DevicesView';
import SettingsView from '@/components/SettingsView';

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
  { id: 'assigned-leads', label: 'Assigned Leads', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'lead-requests', label: 'Lead Requests', href: '/lead-request', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'tours', label: 'Tours', href: '/tours', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'add-property', label: 'Add Property', href: '/add-property', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'devices', label: 'Devices', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'settings', label: 'Settings', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

interface AssignedLead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  propertyType: string;
  budget: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  priority: string;
  stage: string;
  score: number;
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  notes: string;
  lastContact: string;
  nextFollowUp: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  source?: string;
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #F0EBE1' }}>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '120px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '150px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '100px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '80px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '80px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '60px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '16px', width: '60px', background: '#F0EBE1', borderRadius: '4px' }} /></td>
      <td style={{ padding: '14px 12px' }}><div style={{ height: '28px', width: '70px', background: '#F0EBE1', borderRadius: '6px' }} /></td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div><div style={{ height: '18px', width: '120px', background: '#F0EBE1', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '12px', width: '80px', background: '#F0EBE1', borderRadius: '4px' }} /></div>
        <div style={{ height: '20px', width: '60px', background: '#F0EBE1', borderRadius: '20px' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1', marginBottom: '12px' }}>
        <div><div style={{ height: '10px', width: '40px', background: '#F0EBE1', marginBottom: '6px' }} /><div style={{ height: '14px', width: '50px', background: '#F0EBE1' }} /></div>
        <div><div style={{ height: '10px', width: '40px', background: '#F0EBE1', marginBottom: '6px' }} /><div style={{ height: '14px', width: '50px', background: '#F0EBE1' }} /></div>
        <div><div style={{ height: '10px', width: '40px', background: '#F0EBE1', marginBottom: '6px' }} /><div style={{ height: '14px', width: '50px', background: '#F0EBE1' }} /></div>
      </div>
      <div><div style={{ height: '12px', width: '90%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '12px', width: '70%', background: '#F0EBE1', borderRadius: '4px', marginBottom: '12px' }} /></div>
      <div style={{ display: 'flex', gap: '8px' }}><div style={{ flex: 1, height: '34px', background: '#F0EBE1', borderRadius: '8px' }} /><div style={{ flex: 1, height: '34px', background: '#F0EBE1', borderRadius: '8px' }} /></div>
    </div>
  );
}

export default function AssignedLeadsPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('assigned-leads');
  const [leads, setLeads] = useState<AssignedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads/my-leads');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        let leadsData = response.data.data.leads || response.data.data || [];
        setLeads(leadsData);
      } else {
        console.error('API Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead =>
    !search || 
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.location?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone?.includes(search)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': return '#F44336';
      case 'Warm': return '#FF9800';
      case 'Cold': return '#2196F3';
      default: return '#999';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Hot': return '#FEF3F2';
      case 'Warm': return '#FFF8E7';
      case 'Cold': return '#E3F2FD';
      default: return '#F5F2EC';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospecting': return '#9E9E9E';
      case 'Qualified': return '#2196F3';
      case 'Proposal': return '#9C27B0';
      case 'Negotiation': return '#FF9800';
      case 'Closed Won': return '#4CAF50';
      case 'Closed Lost': return '#F44336';
      default: return '#B49A64';
    }
  };

  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024) return 'repeat(2, 1fr)';
    return 'repeat(auto-fill, minmax(320px, 1fr))';
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
    } else if (item.id === 'assigned-leads') {
      // Stay on current page
    } else if (item.href) {
      router.push(item.href);
    }
    
    if (isMobile) setMobileSidebarOpen(false);
  };

  // Export Functions
  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Name',
        'Email',
        'Phone',
        'Location',
        'Property Type',
        'Budget',
        'Status',
        'Stage',
        'Priority',
        'Score',
        'Source',
        'Notes',
        'Created Date'
      ];

      const rows = filteredLeads.map(lead => [
        lead.name || 'N/A',
        lead.email || 'N/A',
        lead.phone || 'N/A',
        lead.location || 'N/A',
        lead.propertyType || 'House',
        lead.budget || 'N/A',
        lead.status || 'Warm',
        lead.stage || 'Prospecting',
        lead.priority || 'Medium',
        lead.score?.toString() || '0',
        lead.source || 'Website',
        (lead.notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
        lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `assigned-leads-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('CSV exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      const headers = [
        'Name', 'Email', 'Phone', 'Location', 'Property Type', 'Budget',
        'Budget Min', 'Budget Max', 'Status', 'Stage', 'Priority', 'Score',
        'Source', 'Notes', 'Created Date', 'Last Contact', 'Next Follow Up'
      ];

      const rows = filteredLeads.map(lead => [
        lead.name || 'N/A',
        lead.email || 'N/A',
        lead.phone || 'N/A',
        lead.location || 'N/A',
        lead.propertyType || 'House',
        lead.budget || 'N/A',
        lead.budgetMin || 'N/A',
        lead.budgetMax || 'N/A',
        lead.status || 'Warm',
        lead.stage || 'Prospecting',
        lead.priority || 'Medium',
        lead.score?.toString() || '0',
        lead.source || 'Website',
        (lead.notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
        lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A',
        lead.lastContact ? new Date(lead.lastContact).toLocaleDateString() : 'N/A',
        lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'N/A'
      ]);

      // Create HTML table for Excel
      const tableHtml = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Assigned Leads Export</title>
          </head>
          <body>
            <table border="1">
              <thead>
                <tr>
                  ${headers.map(h => `<th style="background-color: #B49A64; color: white; padding: 8px;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    ${row.map(cell => `<td style="padding: 6px;">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `assigned-leads-${new Date().toISOString().split('T')[0]}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Excel file exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export Excel file');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const exportData = filteredLeads.map(lead => ({
        id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        location: lead.location,
        propertyType: lead.propertyType,
        budget: lead.budget,
        budgetMin: lead.budgetMin,
        budgetMax: lead.budgetMax,
        status: lead.status,
        stage: lead.stage,
        priority: lead.priority,
        score: lead.score,
        source: lead.source,
        notes: lead.notes,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
      }));

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `assigned-leads-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('JSON exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export JSON');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
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
            <div style={{ fontSize: '11px', color: COLORS.gold, fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Lead Management</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: COLORS.textDark, fontFamily: "'Cormorant Garamond', serif" }}>Assigned Leads</div>
          </div>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: isMobile ? '1 1 100%' : '0 1 280px', order: isMobile ? 1 : 0 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#BBBBBB' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder={isMobile ? "Search..." : "Search leads..."} 
              style={{ width: '100%', height: '38px', paddingLeft: '36px', paddingRight: '12px', fontSize: '13px', color: '#1A1A1A', background: '#F5F2EC', border: '1.5px solid transparent', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }} 
            />
          </div>
          
          {/* View Toggle and Export Button */}
          <div className="header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Export Button with Dropdown */}
            <div style={{ position: 'relative' }} ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting || filteredLeads.length === 0}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  background: filteredLeads.length === 0 ? '#E0DBD0' : '#1A1A1A',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: filteredLeads.length === 0 ? '#999' : COLORS.gold,
                  cursor: filteredLeads.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v12m0 0l-3-3m3 3l3-3M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                {isExporting ? 'Exporting...' : 'Export'}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              
              {showExportMenu && filteredLeads.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #F0EBE1',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  minWidth: '180px',
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={exportToCSV}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: '#555',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F2EC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>📄</span> Export as CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid #F0EBE1',
                      borderBottom: '1px solid #F0EBE1',
                      fontSize: '13px',
                      color: '#555',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F2EC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>📊</span> Export as Excel
                  </button>
                  <button
                    onClick={exportToJSON}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: '#555',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F5F2EC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>📋</span> Export as JSON
                  </button>
                </div>
              )}
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
            
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px' }}>
          {showDevices ? (
            <DevicesView onBack={() => {
              setShowDevices(false);
              setActiveNav('assigned-leads');
            }} />
          ) : showSettings ? (
            <SettingsView onBack={() => {
              setShowSettings(false);
              setActiveNav('assigned-leads');
            }} />
          ) : (
            <>
              {/* Stats Row - Responsive */}
              <div className="stats-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                {[
                  { label: 'Total Leads', value: leads.length.toString(), icon: '👥', color: COLORS.gold },
                  { label: 'Hot Leads', value: leads.filter(l => l.status === 'Hot').length.toString(), icon: '🔥', color: '#F44336' },
                  { label: 'Warm Leads', value: leads.filter(l => l.status === 'Warm').length.toString(), icon: '🌤️', color: '#FF9800' },
                  { label: 'Cold Leads', value: leads.filter(l => l.status === 'Cold').length.toString(), icon: '❄️', color: '#2196F3' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: isMobile ? '12px' : '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? '20px' : '24px', marginBottom: '8px' }}>{stat.icon}</div>
                    <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Loading State */}
              {isLoading ? (
                viewMode === 'list' && !isMobile ? (
                  <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ background: '#1A1A1A' }}>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Name</th>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Contact</th>
                          <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Location</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Property Type</th>
                          <th style={{ padding: '14px 12px', textAlign: 'right', color: COLORS.gold, fontSize: '12px' }}>Budget</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Status</th>
                          <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Stage</th>
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
              ) : filteredLeads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1px solid #F0EBE1' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>No leads assigned yet</div>
                  <div style={{ fontSize: '13px', color: '#999' }}>Leads will appear here once admin assigns them</div>
                </div>
              ) : viewMode === 'list' && !isMobile ? (
                // Table View - Desktop only
                <div className="table-container" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ background: '#1A1A1A' }}>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Name</th>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Contact</th>
                        <th style={{ padding: '14px 12px', textAlign: 'left', color: COLORS.gold, fontSize: '12px' }}>Location</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Property Type</th>
                        <th style={{ padding: '14px 12px', textAlign: 'right', color: COLORS.gold, fontSize: '12px' }}>Budget</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Status</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Stage</th>
                        <th style={{ padding: '14px 12px', textAlign: 'center', color: COLORS.gold, fontSize: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead, index) => (
                        <tr key={lead._id} style={{ borderBottom: '1px solid #F0EBE1', background: index % 2 === 0 ? '#fff' : '#FAFAF8' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '600', color: '#1A1A1A' }}>{lead.name || 'N/A'}</div>
                            <div style={{ fontSize: '11px', color: '#999' }}>ID: {lead._id?.slice(-8) || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {lead.email && <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#666" strokeWidth="1.5"/><path d="M22 6l-10 7L2 6" stroke="#666" strokeWidth="1.5"/></svg>{lead.email}</div>}
                            {lead.phone && <div style={{ fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#666" strokeWidth="1.5"/></svg>{lead.phone}</div>}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', color: '#555' }}>{lead.location || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: 'rgba(180,154,100,0.1)', color: COLORS.gold, padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {lead.propertyType || 'House'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: COLORS.gold }}>{lead.budget || 'N/A'}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: getStatusBgColor(lead.status), color: getStatusColor(lead.status), padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {lead.status || 'Warm'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ background: `${getStageColor(lead.stage)}20`, color: getStageColor(lead.stage), padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {lead.stage || 'Prospecting'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => window.location.href = `tel:${lead.phone}`}
                                style={{ padding: '6px 12px', background: '#1A1A1A', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer' }}
                              >
                                Call
                              </button>
                              <button 
                                onClick={() => window.location.href = `mailto:${lead.email}`}
                                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #E0DBD0', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#555', cursor: 'pointer' }}
                              >
                                Email
                              </button>
                            </div>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Grid View - Mobile & Tablet
                <div style={{ display: 'grid', gridTemplateColumns: getGridColumns(), gap: '16px' }}>
                  {filteredLeads.map(lead => (
                    <div key={lead._id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1', overflow: 'hidden' }}>
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '4px' }}>{lead.name || 'N/A'}</h3>
                            <div style={{ fontSize: '12px', color: '#999' }}>📍 {lead.location || 'N/A'}</div>
                          </div>
                          <span style={{ background: `${getStageColor(lead.stage)}20`, color: getStageColor(lead.stage), padding: '4px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                            {lead.stage || 'Prospecting'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', padding: '10px 0', borderTop: '1px solid #F0EBE1', borderBottom: '1px solid #F0EBE1', flexWrap: 'wrap' }}>
                          <div><div style={{ fontSize: '10px', color: '#999' }}>Budget</div><div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.gold }}>{lead.budget || 'N/A'}</div></div>
                          <div><div style={{ fontSize: '10px', color: '#999' }}>Type</div><div style={{ fontSize: '13px', fontWeight: '500' }}>{lead.propertyType || 'House'}</div></div>
                          <div><div style={{ fontSize: '10px', color: '#999' }}>Status</div><div style={{ fontSize: '13px', fontWeight: '500', color: getStatusColor(lead.status) }}>{lead.status || 'Warm'}</div></div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          {lead.email && <div style={{ fontSize: '12px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-all' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#666" strokeWidth="1.5"/><path d="M22 6l-10 7L2 6" stroke="#666" strokeWidth="1.5"/></svg>{lead.email}</div>}
                          {lead.phone && <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#666" strokeWidth="1.5"/></svg>{lead.phone}</div>}
                        </div>

                        <div className="action-buttons" style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
                          <button onClick={() => window.location.href = `tel:${lead.phone}`} style={{ flex: 1, padding: '8px', background: '#1A1A1A', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: COLORS.gold, cursor: 'pointer' }}>Call</button>
                          <button onClick={() => window.location.href = `mailto:${lead.email}`} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #E0DBD0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#555', cursor: 'pointer' }}>Email</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}