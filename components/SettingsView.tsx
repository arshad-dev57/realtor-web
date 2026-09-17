// components/SettingsView.tsx
'use client';

import { useState, useEffect } from 'react';

const COLORS = {
  gold: '#B49A64',
  darkBg: '#F5F2EC',
  white: '#FFFFFF',
  border: '#F0EBE1',
  textDark: '#1A1A1A',
  textLight: '#999',
};

interface SettingsViewProps {
  onBack: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
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
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px', color: '#B49A64', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>
          ← Back to Dashboard
        </button>
        <span style={{ color: '#CCC' }}>/</span>
        <span style={{ fontSize: isMobile ? '12px' : '13px', color: '#1A1A1A', fontWeight: '500' }}>Settings</span>
      </div>

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
    </div>
  );
}