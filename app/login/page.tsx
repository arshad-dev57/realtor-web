'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import { LoginResponse } from '@/types/auth';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Helper to set cookie
const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const registerDevice = async () => {
    try {
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
        localStorage.setItem('device_id', deviceId);
      }
      
      const userAgent = navigator.userAgent;
      let deviceType = 'desktop';
      let os = 'Unknown';
      let browser = 'Unknown';
      
      if (/mobile/i.test(userAgent)) deviceType = 'mobile';
      if (/tablet/i.test(userAgent)) deviceType = 'tablet';
      
      if (/Windows/i.test(userAgent)) os = 'Windows';
      else if (/Mac/i.test(userAgent)) os = 'macOS';
      else if (/Linux/i.test(userAgent)) os = 'Linux';
      else if (/Android/i.test(userAgent)) os = 'Android';
      else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS';
      
      if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) browser = 'Chrome';
      else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
      else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
      else if (/Edg/i.test(userAgent)) browser = 'Edge';
      
      await api.post('/devices/register', {
        deviceId,
        deviceName: `${deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'Computer'} - ${browser}`,
        deviceType,
        os,
        browser,
        ipAddress: 'auto-detected',
        userAgent
      });
      
      console.log('✅ Device registered successfully');
    } catch (deviceError) {
      console.error('Failed to register device:', deviceError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      const { data: body } = res;

      if (body.success && body.data && body.token) {
        const userData = body.data;

        authService.saveUser({
          token: body.token,
          userId: userData.userId.toString(),
          role: userData.role,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          isProfileComplete: userData.isProfileComplete,
          isSubscribed: userData.isSubscribed,
        });

        // ✅ SET COOKIES FOR MIDDLEWARE
        setCookie('token', body.token, 30);
        setCookie('userId', userData.userId.toString(), 30);
        setCookie('role', userData.role, 30);
        
        console.log('✅ Cookies set successfully');

        await registerDevice();

        const { requiresPayment, isSubscribed, isProfileComplete, role } = userData;

        // Redirect based on user status
        if (requiresPayment && !isSubscribed) {
          if (!isProfileComplete) {
            router.push('/profile-setup');
          } else {
            router.push('/subscription');
          }
        } else if (!isProfileComplete) {
          router.push('/profile-setup');
        } else if (role === 'realtor') {
          router.push('/realtor-dashboard');
        } else if (role === 'buyer') {
          router.push('/buyerdashboard');
        } else {
          router.push('/role-selection');
        }
      } else {
        setErrors({ general: body.message || 'Login failed. Please try again.' });
      }
    } catch (err: unknown) {
      const message =
        (err as { message?: string; response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'An unexpected error occurred.';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Left Panel ── */}
      <div
        id="left-panel"
        style={{
          flex: '0 0 52%',
          background: 'linear-gradient(160deg, #1A1A1A 0%, #2C2415 60%, #1A1A1A 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B49A64' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, transparent, #B49A64, transparent)',
        }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', opacity: 0.07 }}>
          <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height: '100%' }}>
            <rect x="0" y="200" width="40" height="200" fill="#B49A64"/>
            <rect x="50" y="140" width="55" height="260" fill="#B49A64"/>
            <rect x="55" y="120" width="20" height="20" fill="#B49A64"/>
            <rect x="115" y="180" width="35" height="220" fill="#B49A64"/>
            <rect x="160" y="100" width="70" height="300" fill="#B49A64"/>
            <rect x="185" y="80" width="25" height="20" fill="#B49A64"/>
            <rect x="240" y="160" width="45" height="240" fill="#B49A64"/>
            <rect x="295" y="120" width="60" height="280" fill="#B49A64"/>
            <rect x="305" y="90" width="40" height="30" fill="#B49A64"/>
            <rect x="315" y="70" width="20" height="20" fill="#B49A64"/>
            <rect x="365" y="150" width="50" height="250" fill="#B49A64"/>
            <rect x="425" y="80" width="80" height="320" fill="#B49A64"/>
            <rect x="445" y="60" width="40" height="20" fill="#B49A64"/>
            <rect x="455" y="40" width="20" height="20" fill="#B49A64"/>
            <rect x="515" y="130" width="55" height="270" fill="#B49A64"/>
            <rect x="580" y="170" width="40" height="230" fill="#B49A64"/>
            <rect x="630" y="110" width="65" height="290" fill="#B49A64"/>
            <rect x="650" y="90" width="25" height="20" fill="#B49A64"/>
            <rect x="705" y="155" width="45" height="245" fill="#B49A64"/>
            <rect x="760" y="200" width="40" height="200" fill="#B49A64"/>
          </svg>
        </div>

        <div className="animate-fade-up" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: '#B49A64',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/>
              </svg>
            </div>
            <span style={{
              fontSize: '22px', fontWeight: '700', color: '#FFFFFF',
              fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px',
            }}>Estatex</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: '500', letterSpacing: '3px',
            color: '#B49A64', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            Real Estate CRM Platform
          </div>

          <h1 style={{
            fontSize: '54px', fontWeight: '700', lineHeight: '1.1',
            color: '#FFFFFF', marginBottom: '24px',
            fontFamily: "'Cormorant Garamond', serif",
          }}>
            Close Deals.<br />
            <span style={{ color: '#B49A64' }}>Build Wealth.</span>
          </h1>

          <p style={{
            fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)',
            maxWidth: '380px', fontWeight: '300',
          }}>
            The all-in-one platform for realtors and buyers to manage listings,
            track deals, and grow their real estate portfolio.
          </p>

          <div style={{ display: 'flex', gap: '40px', marginTop: '48px' }}>
            {[
              { num: '12K+', label: 'Properties Listed' },
              { num: '4.8★', label: 'Agent Rating' },
              { num: '98%', label: 'Deal Success Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontSize: '26px', fontWeight: '600', color: '#B49A64',
                  fontFamily: "'Cormorant Garamond', serif",
                }}>{stat.num}</div>
                <div style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)',
                  fontWeight: '300', marginTop: '2px',
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'relative', zIndex: 2,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(180,154,100,0.2)',
          borderRadius: '16px', padding: '24px 28px',
        }}>
          <div style={{
            fontSize: '17px', lineHeight: '1.7',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic', marginBottom: '16px',
          }}>
            &ldquo;Estatex transformed how I manage my listings. Closed 3x more deals since switching.&rdquo;
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #B49A64, #9A8254)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '600', color: '#FFFFFF',
            }}>AK</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Ahmed Khan</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Senior Realtor, Karachi</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div style={{
        flex: 1,
        background: '#FAFAF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ marginBottom: '40px' }}>
            <div style={{
              fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase',
              color: '#B49A64', fontWeight: '500', marginBottom: '10px',
            }}>Welcome Back</div>
            <h2 style={{
              fontSize: '36px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.1',
              fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px',
            }}>
              Sign in to your<br />
              <em style={{ color: '#B49A64', fontStyle: 'italic' }}>account</em>
            </h2>
            <p style={{ fontSize: '14px', color: '#888', fontWeight: '300' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: '#B49A64', fontWeight: '500', textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
          </div>

          {errors.general && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="#EF4444"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#DC2626' }}>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '500',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#888', marginBottom: '7px',
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: errors.email ? '#EF4444' : '#BBBBBB', pointerEvents: 'none',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={(e) => setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }))}
                  placeholder="john@example.com"
                  style={{
                    width: '100%', height: '50px',
                    paddingLeft: '42px', paddingRight: '16px',
                    fontSize: '14px', color: '#1A1A1A',
                    background: '#FFFFFF',
                    border: `1.5px solid ${errors.email ? '#EF4444' : '#E0DBD0'}`,
                    borderRadius: '12px', outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { if (!errors.email) e.target.style.borderColor = '#B49A64'; }}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.email}</p>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: '500',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: '#888', marginBottom: '7px',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: errors.password ? '#EF4444' : '#BBBBBB', pointerEvents: 'none',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7C7 5.67 7.53 4.41 8.46 3.46C9.41 2.53 10.67 2 12 2C13.33 2 14.59 2.53 15.54 3.46C16.47 4.41 17 5.67 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                  }}
                  onBlur={(e) => setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }))}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', height: '50px',
                    paddingLeft: '42px', paddingRight: '48px',
                    fontSize: '14px', color: '#1A1A1A',
                    background: '#FFFFFF',
                    border: `1.5px solid ${errors.password ? '#EF4444' : '#E0DBD0'}`,
                    borderRadius: '12px', outline: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = '#B49A64'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#B49A64', padding: '4px', display: 'flex',
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C7 20 2.73 16.89 1 12.5C1.7 10.61 2.85 8.93 4.34 7.6M9.9 4.24C10.59 4.08 11.29 4 12 4C17 4 21.27 7.11 23 11.5C22.54 12.78 21.86 13.96 21 14.97M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.password}</p>
              )}
            </div>

            <div style={{ textAlign: 'right', marginBottom: '28px' }}>
              <Link href="/forgotpassword" style={{
                fontSize: '13px', color: '#B49A64', fontWeight: '500', textDecoration: 'none',
              }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', height: '52px',
                background: isLoading ? 'rgba(26,26,26,0.6)' : '#1A1A1A',
                color: '#FFFFFF', border: 'none',
                borderRadius: '14px', cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '500', letterSpacing: '0.3px',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s',
                marginBottom: '20px',
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: '2px solid rgba(180,154,100,0.3)',
                  borderTopColor: '#B49A64',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E0DBD0' }} />
              <span style={{ fontSize: '12px', color: '#BBBBBB' }}>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: '#E0DBD0' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
              {[
                {
                  label: 'Google',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ),
                },
                {
                  label: 'Facebook',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                  ),
                },
              ].map((social) => (
                <button
                  key={social.label}
                  type="button"
                  style={{
                    flex: 1, height: '46px',
                    background: '#FFFFFF',
                    border: '1.5px solid #E0DBD0',
                    borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '13px', fontWeight: '500', color: '#444444',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color 0.2s',
                  }}
                >
                  {social.icon}
                  {social.label}
                </button>
              ))}
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#BBBBBB' }}>
            © 2025 Estatex. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          #left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}