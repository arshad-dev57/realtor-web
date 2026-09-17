'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { authService } from '@/lib/auth';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  general?: string;
}

interface SignupResponse {
  success: boolean;
  token?: string;
  message: string;
  data?: {
    userId: string;
    role: string;
    email: string;
    name: string;
    phone: string;
    isProfileComplete: boolean;
    isSubscribed: boolean;
  };
}

const ROLES = [
  { value: 'realtor', label: 'Realtor', desc: 'I sell & manage properties' },
  { value: 'buyer', label: 'Buyer', desc: 'I want to find a property' },
];

// Helper to set cookie
const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C7 20 2.73 16.89 1 12.5C1.7 10.61 2.85 8.93 4.34 7.6M9.9 4.24C10.59 4.08 11.29 4 12 4C17 4 21.27 7.11 23 11.5C22.54 12.78 21.86 13.96 21 14.97M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

function InputField({
  label, placeholder, type = 'text', icon, value, onChange, onBlur, error, suffix,
}: {
  label: string; placeholder: string; type?: string;
  icon: React.ReactNode; value: string;
  onChange: (v: string) => void; onBlur?: () => void;
  error?: string; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#EF4444' : focused ? '#B49A64' : '#E0DBD0';

  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' as const, color: '#888', marginBottom: '7px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: error ? '#EF4444' : '#BBBBBB', display: 'flex' }}>{icon}</div>
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder}
          style={{
            width: '100%', height: '50px', paddingLeft: '42px', paddingRight: suffix ? '48px' : '16px',
            fontSize: '14px', color: '#1A1A1A', background: '#FFFFFF', border: `1.5px solid ${borderColor}`,
            borderRadius: '12px', outline: 'none', transition: 'border-color 0.2s',
          }}
        />
        {suffix && <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>{suffix}</div>}
      </div>
      {error && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = {
    name: (v: string) => !v.trim() ? 'Name is required' : '',
    email: (v: string) => {
      if (!v) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
      return '';
    },
    phone: (v: string) => {
      if (!v) return 'Phone is required';
      if (v.replace(/\D/g, '').length < 10) return 'Enter a valid phone number';
      return '';
    },
    password: (v: string) => {
      if (!v) return 'Password is required';
      if (v.length < 6) return 'Password must be at least 6 characters';
      return '';
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {
      name: validate.name(name),
      email: validate.email(email),
      phone: validate.phone(phone),
      password: validate.password(password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      };
      if (selectedRole) payload.role = selectedRole;

      const res = await api.post<SignupResponse>('/auth/signup', payload);

      if (res.data.success && res.data.data && res.data.token) {
        const userData = res.data.data;
        
        authService.saveUser({
          token: res.data.token,
          userId: userData.userId,
          role: userData.role,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          isProfileComplete: userData.isProfileComplete,
          isSubscribed: false,
        });

        // ✅ SET COOKIES FOR MIDDLEWARE
        setCookie('token', res.data.token, 30);
        setCookie('userId', userData.userId, 30);
        if (userData.role) {
          setCookie('role', userData.role, 30);
        }

        console.log('✅ Signup successful, cookies set');

        // ✅ Always go to role selection first
        router.push('/role-selection');
      } else {
        setErrors({ general: res.data.message || 'Signup failed. Please try again.' });
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'An unexpected error occurred.';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Panel */}
      <div id="left-panel" style={{ flex: '0 0 48%', background: 'linear-gradient(160deg, #1A1A1A 0%, #2C2415 60%, #1A1A1A 100%)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 52px' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B49A64' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #B49A64, transparent)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#B49A64', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF' }}>Estatex</span>
          </Link>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '12px', letterSpacing: '3px', color: '#B49A64', marginBottom: '20px' }}>JOIN ESTATEX TODAY</div>
          <h1 style={{ fontSize: '50px', fontWeight: '700', lineHeight: '1.1', color: '#FFFFFF', marginBottom: '24px' }}>Start your<br /><span style={{ color: '#B49A64' }}>journey here.</span></h1>
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', maxWidth: '360px' }}>Whether you&apos;re a realtor closing deals or a buyer finding your dream home — Estatex has everything you need.</p>
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '16px' }}>
          {[{ num: '12K+', label: 'Properties' }, { num: '4.8★', label: 'Rating' }, { num: 'Free', label: 'To Join' }].map((s) => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(180,154,100,0.15)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#B49A64' }}>{s.num}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{ flex: 1, background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#888', textDecoration: 'none', marginBottom: '28px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2"/></svg> Back to Sign In
          </Link>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2.5px', color: '#B49A64', marginBottom: '10px' }}>WELCOME TO ESTATEX</div>
            <h2 style={{ fontSize: '34px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.1', marginBottom: '8px' }}>Create your<br /><em style={{ color: '#B49A64' }}>account</em></h2>
            <p style={{ fontSize: '14px', color: '#888' }}>Already have an account? <Link href="/login" style={{ color: '#B49A64', textDecoration: 'none' }}>Sign in</Link></p>
          </div>

          {errors.general && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="#EF4444" strokeWidth="2"/><circle cx="12" cy="16" r="1" fill="#EF4444"/></svg>
              <span style={{ fontSize: '13px', color: '#DC2626' }}>{errors.general}</span>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '1px', color: '#888', marginBottom: '10px', display: 'block' }}>I am a</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {ROLES.map((role) => {
                const active = selectedRole === role.value;
                return (
                  <button key={role.value} type="button" onClick={() => setSelectedRole(active ? '' : role.value)} style={{ flex: 1, padding: '14px 12px', background: active ? '#1A1A1A' : '#FFFFFF', border: `1.5px solid ${active ? '#B49A64' : '#E0DBD0'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: active ? '#B49A64' : '#888' }}>{role.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '2px', color: active ? 'rgba(180,154,100,0.6)' : '#BBBBBB' }}>{role.desc}</div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '11px', color: '#BBBBBB', marginTop: '6px' }}>Optional — you can choose later</p>
          </div>

          <form onSubmit={handleSubmit}>
            <InputField label="Full Name" placeholder="John Doe" value={name} onChange={setName} error={errors.name} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 17.9 19.6 16.8 18.8 16.1C18.1 15.4 17 15 16 15H8C7 15 5.9 15.4 5.2 16.1C4.4 16.8 4 17.9 4 19V21" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>} />
            <InputField label="Email Address" placeholder="john@example.com" type="email" value={email} onChange={setEmail} error={errors.email} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/></svg>} />
            <InputField label="Phone Number" placeholder="+1 432454234 32" type="tel" value={phone} onChange={setPhone} error={errors.phone} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012.88 2H6a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2"/></svg>} />
            <InputField label="Password" placeholder="Min. 6 characters" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} error={errors.password} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7C7 5.67 7.53 4.41 8.46 3.46C9.41 2.53 10.67 2 12 2C13.33 2 14.59 2.53 15.54 3.46C16.47 4.41 17 5.67 17 7V11" stroke="currentColor" strokeWidth="2"/></svg>} suffix={<button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><EyeIcon open={showPassword} /></button>} />
            
            <button type="submit" disabled={isLoading} style={{ width: '100%', height: '52px', background: isLoading ? 'rgba(26,26,26,0.6)' : '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '14px', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {isLoading ? <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} /> : <>Create Account <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2"/><polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2"/></svg></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}