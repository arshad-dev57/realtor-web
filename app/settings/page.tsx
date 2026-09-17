// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  { id: 'leads', label: 'Assigned Leads', href: '/assigned-leads', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'requests', label: 'Lead Requests', href: '/lead-request', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'tours', label: 'Tours', href: '/tours', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'add-property', label: 'Add Property', href: '/add-property', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'devices', label: 'Devices', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'settings', label: 'Settings', href: null, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

// Simple Settings Option Component
function SettingOption({ icon, title, description, onClick, isLast = false }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(180, 154, 100, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(180, 154, 100, 0.03)';
        e.currentTarget.style.paddingLeft = '8px';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.paddingLeft = '0';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(180, 154, 100, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A1A' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{description}</div>
        </div>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="#B49A64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('settings');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

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

  const sections = {
    about: {
      title: 'About Estatex',
      content: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: COLORS.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/>
              </svg>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px', fontFamily: "'Cormorant Garamond', serif" }}>Estatex</h1>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              Estatex is America's most refined real estate platform, connecting discerning buyers with elite realtors across New York, Los Angeles, Miami, and beyond.
            </p>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
              Founded in 2024, our mission is to revolutionize the real estate experience by combining cutting-edge technology with personalized service.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div><strong style={{ color: '#1A1A1A' }}>Founded</strong><br /><span style={{ fontSize: '13px', color: '#999' }}>2024</span></div>
              <div><strong style={{ color: '#1A1A1A' }}>Headquarters</strong><br /><span style={{ fontSize: '13px', color: '#999' }}>New York, USA</span></div>
              <div><strong style={{ color: '#1A1A1A' }}>Active Users</strong><br /><span style={{ fontSize: '13px', color: '#999' }}>50,000+</span></div>
            </div>
          </div>
        </div>
      ),
    },
    terms: {
      title: 'Terms of Service',
      content: (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Terms of Service</h2>
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>Last updated: January 1, 2025</p>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>1. Acceptance of Terms</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>By accessing and using Estatex, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>2. User Accounts</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>3. Property Listings</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>All property listings are provided by real estate agents and brokers. While we strive for accuracy, we do not guarantee the accuracy of any listing information.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>4. Payments</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>Estatex charges a one-time fee of $100 for lifetime access. This fee is non-refundable. All payments are processed securely through our payment partners.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>5. Prohibited Activities</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>Users may not: (a) use the platform for any illegal purpose; (b) harass or abuse other users; (c) post false or misleading information; (d) attempt to hack or disrupt the service.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>6. Limitation of Liability</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>Estatex is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </div>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Privacy Policy</h2>
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>Last updated: January 1, 2025</p>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>1. Information We Collect</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>We collect information you provide directly to us, such as your name, email address, phone number, and property preferences. We also automatically collect usage data when you use our platform.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>2. How We Use Your Information</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>We use your information to provide and improve our services, connect you with real estate professionals, personalize your experience, and communicate with you about your account.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>3. Information Sharing</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>We do not sell your personal information. We may share your information with real estate agents to facilitate property tours and inquiries, or as required by law.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>4. Data Security</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '10px' }}>5. Your Rights</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>You may access, update, or delete your personal information at any time through your account settings.</p>
          </div>
        </div>
      ),
    },
    contact: {
      title: 'Contact Us',
      content: (
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A1A', marginBottom: '20px', fontFamily: "'Cormorant Garamond', serif" }}>Contact Us</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FAFAF8', borderRadius: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📧</div>
              <div><div style={{ fontSize: '13px', color: '#999' }}>Email</div><div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>support@estatex.com</div></div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FAFAF8', borderRadius: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📞</div>
              <div><div style={{ fontSize: '13px', color: '#999' }}>Phone</div><div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>+1 (800) 555-0199</div></div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#FAFAF8', borderRadius: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(180,154,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📍</div>
              <div><div style={{ fontSize: '13px', color: '#999' }}>Address</div><div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>123 Real Estate Ave, New York, NY 10001</div></div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A', marginBottom: '16px' }}>Business Hours</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span style={{ color: '#666' }}>Monday - Friday</span><span style={{ color: '#1A1A1A', fontWeight: '500' }}>9:00 AM - 6:00 PM EST</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span style={{ color: '#666' }}>Saturday</span><span style={{ color: '#1A1A1A', fontWeight: '500' }}>10:00 AM - 4:00 PM EST</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span style={{ color: '#666' }}>Sunday</span><span style={{ color: '#1A1A1A', fontWeight: '500' }}>Closed</span></div>
            </div>
          </div>
        </div>
      ),
    },
  };

  const settingsOptions = [
    { icon: '🏢', title: 'About Estatex', description: 'Learn about our company and mission', key: 'about' },
    { icon: '📜', title: 'Terms of Service', description: 'Our terms and conditions', key: 'terms' },
    { icon: '🔒', title: 'Privacy Policy', description: 'How we handle your data', key: 'privacy' },
    { icon: '📞', title: 'Contact Us', description: 'Get in touch with our team', key: 'contact' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif", background: COLORS.darkBg }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .settings-content {
            padding: 20px !important;
          }
          .settings-title {
            font-size: 24px !important;
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
                  } else if (item.id === 'settings') {
                    // Stay on Settings page
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
            <div style={{ fontSize: '11px', color: COLORS.gold, fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Account</div>
            <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: '700', color: COLORS.textDark, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1 }}>Settings</div>
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
              setActiveNav('settings');
            }} />
          ) : (
            <div style={{ display: 'flex', gap: '32px', flexDirection: isMobile ? 'column' : 'row', maxWidth: '1200px', margin: '0 auto' }}>
              {/* Settings Menu - Left Side */}
              <div style={{ 
                flex: isMobile ? 'auto' : '0 0 280px',
                background: '#fff',
                borderRadius: '20px',
                border: '1px solid #F0EBE1',
                padding: '20px',
                height: 'fit-content',
              }}>
                <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #F0EBE1' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#999' }}>Settings</div>
                </div>
                {settingsOptions.map((opt, idx) => (
                  <button
                    key={opt.key}
                    onClick={() => setActiveSection(opt.key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      background: activeSection === opt.key ? 'rgba(180,154,100,0.08)' : 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginBottom: idx === settingsOptions.length - 1 ? 0 : '4px',
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== opt.key) {
                        e.currentTarget.style.background = '#F5F2EC';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== opt.key) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ fontSize: '20px' }}>{opt.icon}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: activeSection === opt.key ? '600' : '500', color: activeSection === opt.key ? COLORS.gold : '#333' }}>
                        {opt.title}
                      </div>
                      {!isMobile && <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{opt.description}</div>}
                    </div>
                    {activeSection === opt.key && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 'auto' }}>
                        <path d="M9 18l6-6-6-6" stroke={COLORS.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Content Area - Right Side */}
              <div style={{
                flex: 1,
                background: '#fff',
                borderRadius: '20px',
                border: '1px solid #F0EBE1',
                padding: isMobile ? '24px' : '32px',
                minHeight: '500px',
              }}>
                <div className="settings-content">
                  {sections[activeSection as keyof typeof sections]?.content}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}