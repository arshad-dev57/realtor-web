'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { authService } from '@/lib/auth';

interface Role {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

const ROLES: Role[] = [
  {
    id: 'buyer',
    title: 'Buyer / Renter',
    subtitle: "I'm looking for a property",
    description: 'Browse listings, connect with agents, and find your perfect home.',
    icon: '🔍',
    color: '#4CAF50',
    features: ['Browse Listings', 'Save Favourites', 'Contact Agent'],
  },
  {
    id: 'realtor',
    title: 'Realtor / Agent',
    subtitle: "I'm a professional agent",
    description: 'Manage leads, close deals, and grow your real estate business.',
    icon: '📋',
    color: '#CFAE5A',
    features: ['Manage Leads', 'Track Pipeline', 'Close Deals'],
  },
];

const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth > 900);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const userId = authService.getUserId();
    const existingRole = authService.getRole();
    const isProfileComplete = authService.isProfileComplete();

    // ✅ No userId at all → back to signup
    if (!userId) {
      router.replace('/signup');
      return;
    }

    // ✅ Only redirect away if BOTH profile is complete AND subscribed
    // This prevents the loop where role-selection → dashboard → middleware → loop
    const isSubscribed = authService.isSubscribed?.();
    if (
      isProfileComplete === true &&
      isSubscribed === true &&
      existingRole &&
      existingRole !== 'null' &&
      existingRole !== ''
    ) {
      router.replace(existingRole === 'buyer' ? '/buyerdashboard' : '/realtor-dashboard');
      return;
    }

    // ✅ Profile not complete but role exists → go to profile setup
    if (
      isProfileComplete !== true &&
      existingRole &&
      existingRole !== 'null' &&
      existingRole !== ''
    ) {
      router.replace(`/profile-setup?role=${existingRole}`);
      return;
    }

    // Otherwise: stay on role-selection so user can pick their role
  }, [router]);

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userId = authService.getUserId();

      if (!userId) {
        setError('User session expired. Please signup again.');
        router.push('/signup');
        return;
      }

      const response = await api.post('/auth/select-role', {
        userId,
        role: selectedRole,
      });

      if (response.data.success) {
        authService.updateUserRole(selectedRole);
        setCookie('role', selectedRole, 30);
        router.push(`/profile-setup?role=${selectedRole}`);
      } else {
        setError(response.data.message || 'Failed to select role');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {isDesktop && (
        <div style={{ flex: '0 0 48%', background: 'linear-gradient(160deg, #1A1A1A 0%, #2C2415 60%, #1A1A1A 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px', minHeight: '100vh' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B49A64' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #B49A64, transparent)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF' }}>Estatex</span>
            </Link>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '12px', letterSpacing: '3px', color: '#B49A64', marginBottom: '20px' }}>CHOOSE YOUR PATH</div>
            <h1 style={{ fontSize: '50px', fontWeight: '700', lineHeight: '1.1', color: '#FFFFFF', marginBottom: '24px' }}>Tell us<br /><span style={{ color: '#B49A64' }}>who you are.</span></h1>
            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', maxWidth: '360px' }}>Select your role to get a personalised experience tailored to your needs — whether you're buying your dream home or helping others find theirs.</p>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '16px' }}>
            {[{ num: '12K+', label: 'Active Buyers' }, { num: '2K+', label: 'Realtors' }, { num: '98%', label: 'Satisfaction' }].map((s) => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(180,154,100,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#B49A64' }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, background: '#F5F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isDesktop ? '40px 24px' : '32px 20px', minHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>
          {!isDesktop && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
                </div>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A' }}>Estatex</span>
              </Link>
              <div style={{ fontSize: '11px', letterSpacing: '2.5px', color: '#B49A64', marginBottom: '8px' }}>CHOOSE YOUR PATH</div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Who are you?</h1>
              <p style={{ fontSize: '13px', color: '#888' }}>Select your role to get a personalised experience.</p>
            </div>
          )}

          {isDesktop && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '2.5px', color: '#B49A64', marginBottom: '8px' }}>ESTATEX</div>
              <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>Who are you?</h1>
              <p style={{ fontSize: '14px', color: '#888' }}>Select your role to get a personalised experience.</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '13px', color: '#DC2626' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{ background: isSelected ? `${role.color}0F` : '#FFFFFF', borderRadius: '20px', border: `1.5px solid ${isSelected ? role.color : '#F0EBE1'}`, padding: isDesktop ? '20px' : '16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: isSelected ? `0 8px 24px ${role.color}20` : 'none' }}
                >
                  <div style={{ display: 'flex', gap: isDesktop ? '16px' : '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: isDesktop ? '56px' : '48px', height: isDesktop ? '56px' : '48px', borderRadius: '14px', background: `${role.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isDesktop ? '28px' : '24px' }}>
                      {role.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: isDesktop ? '18px' : '16px', fontWeight: '700', color: isSelected ? role.color : '#1A1A1A', marginBottom: '4px' }}>{role.title}</h3>
                          <p style={{ fontSize: isDesktop ? '13px' : '12px', color: '#666' }}>{role.subtitle}</p>
                        </div>
                        <div style={{ width: isDesktop ? '22px' : '20px', height: isDesktop ? '22px' : '20px', borderRadius: '50%', border: `2px solid ${isSelected ? role.color : '#DDD'}`, background: isSelected ? role.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                        </div>
                      </div>
                      <p style={{ fontSize: isDesktop ? '13px' : '12px', color: '#888', marginTop: '8px', marginBottom: '12px' }}>{role.description}</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {role.features.map((feature) => (
                          <span key={feature} style={{ fontSize: isDesktop ? '11px' : '10px', background: `${role.color}10`, color: role.color, padding: isDesktop ? '4px 12px' : '3px 10px', borderRadius: '20px' }}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={isLoading || !selectedRole}
            style={{ width: '100%', padding: isDesktop ? '16px' : '14px', background: isLoading || !selectedRole ? '#CCC' : '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '14px', fontSize: isDesktop ? '16px' : '14px', fontWeight: '600', cursor: isLoading || !selectedRole ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { if (!isLoading && selectedRole) e.currentTarget.style.background = '#B49A64'; }}
            onMouseLeave={(e) => { if (!isLoading && selectedRole) e.currentTarget.style.background = '#1A1A1A'; }}
          >
            {isLoading ? (
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>Continue <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#FFFFFF" strokeWidth="2"/><polyline points="12 5 19 12 12 19" stroke="#FFFFFF" strokeWidth="2"/></svg></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 