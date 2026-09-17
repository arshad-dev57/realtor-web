'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

// ── Icons ──────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94C16.23 19.24 14.18 20 12 20C7 20 2.73 16.89 1 12.5C1.7 10.61 2.85 8.93 4.34 7.6M9.9 4.24C10.59 4.08 11.29 4 12 4C17 4 21.27 7.11 23 11.5C22.54 12.78 21.86 13.96 21 14.97M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// ── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'OTP' },
    { num: 3, label: 'Reset' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
      {steps.map((step, i) => (
        <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: current >= step.num ? '#B49A64' : '#E0DBD0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s',
            }}>
              {current > step.num ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span style={{
                  fontSize: '14px', fontWeight: '600',
                  color: current >= step.num ? '#FFFFFF' : '#999',
                  fontFamily: "'DM Sans', sans-serif",
                }}>{step.num}</span>
              )}
            </div>
            <span style={{
              fontSize: '10px', marginTop: '4px', fontWeight: '500',
              color: current >= step.num ? '#B49A64' : '#BBBBBB',
              fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.5px',
            }}>{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: '2px', margin: '0 8px', marginBottom: '16px',
              background: current > step.num ? '#B49A64' : '#E0DBD0',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── OTP Input ──────────────────────────────────────────────────────────────
function OtpInput({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: string;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    const newValue = newDigits.join('');
    onChange(newValue);
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            style={{
              width: '48px', height: '52px',
              textAlign: 'center', fontSize: '22px', fontWeight: '700',
              color: '#1A1A1A', background: '#FFFFFF',
              border: `1.5px solid ${error ? '#EF4444' : digits[i] ? '#B49A64' : '#E0DBD0'}`,
              borderRadius: '12px', outline: 'none',
              fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = error ? '#EF4444' : '#B49A64'; }}
            onBlur={(e) => { e.target.style.borderColor = error ? '#EF4444' : digits[i] ? '#B49A64' : '#E0DBD0'; }}
          />
        ))}
      </div>
      {error && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#EF4444', fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Password Field ─────────────────────────────────────────────────────────
function PasswordField({ label, placeholder, value, onChange, error }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#EF4444' : focused ? '#B49A64' : '#E0DBD0';

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '500',
        letterSpacing: '1px', textTransform: 'uppercase' as const,
        color: '#888', marginBottom: '7px', fontFamily: "'DM Sans', sans-serif",
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: '#BBBBBB', pointerEvents: 'none' as const, display: 'flex',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 11V7C7 4.79 9.24 3 12 3C14.76 3 17 4.79 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <input
          type={show ? 'text' : 'password'} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            width: '100%', height: '50px',
            paddingLeft: '42px', paddingRight: '44px',
            fontSize: '14px', color: '#1A1A1A', background: '#FFFFFF',
            border: `1.5px solid ${borderColor}`,
            borderRadius: '12px', outline: 'none',
            fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
          }}
        />
        <button
          type="button" onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#B49A64', padding: '4px', display: 'flex',
          }}
        ><EyeIcon open={show} /></button>
      </div>
      {error && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 2
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Step 1: Send OTP
  const sendOTP = async () => {
    if (!email) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email'); return; }
    setEmailError(''); setGeneralError(''); setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      const body = res.data as { success: boolean; message: string };
      if (body.success) {
        setUserEmail(email.trim());
        setStep(2);
        startCountdown();
      } else {
        setGeneralError(body.message || 'Failed to send OTP.');
      }
    } catch (err: unknown) {
      setGeneralError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Network error. Please try again.');
    } finally { setIsLoading(false); }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: userEmail });
      const body = res.data as { success: boolean; message: string };
      if (body.success) { setOtp(''); setOtpError(''); startCountdown(); }
      else setGeneralError(body.message);
    } catch { setGeneralError('Failed to resend OTP.'); }
    finally { setIsResending(false); }
  };

  // Step 2: Verify OTP
  const verifyOTP = async () => {
    if (otp.length !== 6) { setOtpError('Enter a valid 6-digit OTP'); return; }
    setOtpError(''); setGeneralError(''); setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: userEmail, otp: otp.trim() });
      const body = res.data as { success: boolean; message: string; data?: { resetToken: string } };
      if (body.success) {
        setResetToken(body.data?.resetToken || '');
        setStep(3);
      } else {
        setOtpError(body.message || 'Invalid OTP.');
      }
    } catch (err: unknown) {
      setOtpError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed.');
    } finally { setIsLoading(false); }
  };

  // Step 3: Reset Password
  const resetPassword = async () => {
    let hasError = false;
    if (!newPassword) { setPasswordError('Password is required'); hasError = true; }
    else if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); hasError = true; }
    else setPasswordError('');
    if (!confirmPassword) { setConfirmError('Please confirm your password'); hasError = true; }
    else if (newPassword !== confirmPassword) { setConfirmError('Passwords do not match'); hasError = true; }
    else setConfirmError('');
    if (hasError) return;

    setGeneralError(''); setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: userEmail,
        resetToken,
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      const body = res.data as { success: boolean; message: string };
      if (body.success) {
        setStep(4); // success state
        setTimeout(() => router.push('/login'), 2500);
      } else {
        setGeneralError(body.message || 'Password reset failed.');
      }
    } catch (err: unknown) {
      setGeneralError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Something went wrong.');
    } finally { setIsLoading(false); }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) setStep(step - 1);
    else router.push('/login');
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: '100%', height: '52px',
    background: disabled ? 'rgba(26,26,26,0.5)' : '#1A1A1A',
    color: '#FFFFFF', border: 'none', borderRadius: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px', fontWeight: '500', letterSpacing: '0.3px',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'background 0.2s',
  });

  const Spinner = () => (
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%',
      border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64',
      animation: 'spin 0.8s linear infinite',
    }} />
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Left Panel ── */}
      <div id="left-panel" style={{
        flex: '0 0 48%',
        background: 'linear-gradient(160deg, #1A1A1A 0%, #2C2415 60%, #1A1A1A 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        padding: '48px 52px',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B49A64'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, transparent, #B49A64, transparent)',
        }} />
        {/* City */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', opacity: 0.06 }}>
          <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height: '100%' }}>
            <rect x="50" y="140" width="55" height="260" fill="#B49A64"/>
            <rect x="160" y="100" width="70" height="300" fill="#B49A64"/>
            <rect x="295" y="120" width="60" height="280" fill="#B49A64"/>
            <rect x="315" y="70" width="20" height="50" fill="#B49A64"/>
            <rect x="425" y="80" width="80" height="320" fill="#B49A64"/>
            <rect x="455" y="40" width="20" height="40" fill="#B49A64"/>
            <rect x="515" y="130" width="55" height="270" fill="#B49A64"/>
            <rect x="630" y="110" width="65" height="290" fill="#B49A64"/>
            <rect x="760" y="180" width="40" height="220" fill="#B49A64"/>
          </svg>
        </div>

        {/* Logo */}
        <Link href="/login" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '64px', position: 'relative', zIndex: 2 }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', background: '#B49A64',
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
        </Link>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '380px' }}>
          {/* Step-aware content */}
          <div style={{
            display: 'inline-block', fontSize: '11px', fontWeight: '500',
            letterSpacing: '3px', color: '#B49A64', textTransform: 'uppercase', marginBottom: '20px',
          }}>
            {step === 1 ? 'Account Recovery' : step === 2 ? 'Verification' : step === 3 ? 'New Password' : 'All Done'}
          </div>

          <h1 style={{
            fontSize: '46px', fontWeight: '700', lineHeight: '1.1',
            color: '#FFFFFF', marginBottom: '24px',
            fontFamily: "'Cormorant Garamond', serif",
          }}>
            {step === 1 && (<>Forgot your<br /><span style={{ color: '#B49A64' }}>password?</span></>)}
            {step === 2 && (<>Check your<br /><span style={{ color: '#B49A64' }}>email.</span></>)}
            {step === 3 && (<>Set a new<br /><span style={{ color: '#B49A64' }}>password.</span></>)}
            {step === 4 && (<>You&apos;re all<br /><span style={{ color: '#B49A64' }}>set!</span></>)}
          </h1>

          <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.5)', fontWeight: '300' }}>
            {step === 1 && "Don't worry — it happens to everyone. Enter your email and we'll send you a reset code."}
            {step === 2 && `We sent a 6-digit code to ${userEmail || 'your email'}. Enter it to verify your identity.`}
            {step === 3 && 'Create a strong new password to secure your Estatex account.'}
            {step === 4 && 'Your password has been reset. Redirecting you to sign in...'}
          </p>

          {/* Security tip */}
          {step === 3 && (
            <div style={{
              marginTop: '36px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(180,154,100,0.2)',
              borderRadius: '14px', padding: '20px 22px',
            }}>
              <div style={{ fontSize: '12px', color: '#B49A64', fontWeight: '500', marginBottom: '10px', letterSpacing: '0.5px' }}>
                STRONG PASSWORD TIPS
              </div>
              {['At least 8 characters long', 'Mix uppercase & lowercase letters', 'Include numbers or symbols'].map((tip) => (
                <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: '#B49A64', fontSize: '8px' }}>◆</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '300' }}>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{
        flex: 1, background: '#FAFAF8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Back */}
          {step < 4 && (
            <button onClick={handleBack} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#888', background: 'none', border: 'none',
              cursor: 'pointer', marginBottom: '28px', padding: 0,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {step === 1 ? 'Back to Sign In' : 'Back'}
            </button>
          )}

          {/* Step indicator */}
          {step < 4 && <StepIndicator current={step} />}

          {/* General error */}
          {generalError && (
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
              <span style={{ fontSize: '13px', color: '#DC2626' }}>{generalError}</span>
            </div>
          )}

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#B49A64', fontWeight: '500', marginBottom: '10px' }}>
                  Reset Password
                </div>
                <h2 style={{
                  fontSize: '32px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.1',
                  fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px',
                }}>
                  Forgot your<br /><em style={{ color: '#B49A64', fontStyle: 'italic' }}>password?</em>
                </h2>
                <p style={{ fontSize: '14px', color: '#888', fontWeight: '300' }}>
                  Enter your email to receive a reset OTP.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block', fontSize: '11px', fontWeight: '500',
                  letterSpacing: '1px', textTransform: 'uppercase',
                  color: '#888', marginBottom: '7px',
                }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: emailError ? '#EF4444' : '#BBBBBB', pointerEvents: 'none', display: 'flex',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
                    placeholder="you@example.com"
                    style={{
                      width: '100%', height: '50px', paddingLeft: '42px', paddingRight: '16px',
                      fontSize: '14px', color: '#1A1A1A', background: '#FFFFFF',
                      border: `1.5px solid ${emailError ? '#EF4444' : '#E0DBD0'}`,
                      borderRadius: '12px', outline: 'none',
                      fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { if (!emailError) e.target.style.borderColor = '#B49A64'; }}
                    onBlur={(e) => { if (!emailError) e.target.style.borderColor = '#E0DBD0'; }}
                  />
                </div>
                {emailError && <p style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{emailError}</p>}
              </div>

              <button onClick={sendOTP} disabled={isLoading} style={btnStyle(isLoading)}>
                {isLoading ? <Spinner /> : <>Send OTP <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2" strokeLinecap="round"/><polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
              </button>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#B49A64', fontWeight: '500', marginBottom: '10px' }}>
                  Verify OTP
                </div>
                <h2 style={{
                  fontSize: '32px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.1',
                  fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px',
                }}>
                  Enter the<br /><em style={{ color: '#B49A64', fontStyle: 'italic' }}>6-digit code</em>
                </h2>
                <p style={{ fontSize: '14px', color: '#888', fontWeight: '300' }}>
                  Code sent to <strong style={{ color: '#1A1A1A', fontWeight: '500' }}>{userEmail}</strong>
                </p>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(''); }} error={otpError} />
              </div>

              {/* Resend row */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                {countdown > 0 ? (
                  <span style={{ fontSize: '13px', color: '#888' }}>
                    Resend code in <strong style={{ color: '#B49A64' }}>{countdown}s</strong>
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', color: '#888' }}>
                    Didn&apos;t receive code?{' '}
                    <button
                      onClick={resendOTP} disabled={isResending}
                      style={{
                        background: 'none', border: 'none', cursor: isResending ? 'not-allowed' : 'pointer',
                        color: '#B49A64', fontWeight: '600', fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif", padding: 0,
                      }}
                    >
                      {isResending ? 'Sending...' : 'Resend'}
                    </button>
                  </span>
                )}
              </div>

              <button onClick={verifyOTP} disabled={isLoading || otp.length !== 6} style={btnStyle(isLoading || otp.length !== 6)}>
                {isLoading ? <Spinner /> : <>Verify OTP <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2" strokeLinecap="round"/><polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
              </button>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 3 && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#B49A64', fontWeight: '500', marginBottom: '10px' }}>
                  Set New Password
                </div>
                <h2 style={{
                  fontSize: '32px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.1',
                  fontFamily: "'Cormorant Garamond', serif", marginBottom: '8px',
                }}>
                  Create a<br /><em style={{ color: '#B49A64', fontStyle: 'italic' }}>new password</em>
                </h2>
                <p style={{ fontSize: '14px', color: '#888', fontWeight: '300' }}>
                  Make it strong and memorable.
                </p>
              </div>

              <PasswordField
                label="New Password" placeholder="Enter new password"
                value={newPassword} onChange={setNewPassword} error={passwordError}
              />

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div style={{ marginBottom: '16px', marginTop: '-8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3].map((level) => {
                      const strength = newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
                      const colors = ['#EF4444', '#F59E0B', '#22C55E'];
                      return <div key={level} style={{ flex: 1, height: '3px', borderRadius: '2px', background: level <= strength ? colors[strength - 1] : '#E0DBD0', transition: 'background 0.3s' }} />;
                    })}
                  </div>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    {newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Fair' : 'Strong'} password
                  </span>
                </div>
              )}

              <PasswordField
                label="Confirm Password" placeholder="Confirm your new password"
                value={confirmPassword} onChange={setConfirmPassword} error={confirmError}
              />

              <div style={{ marginTop: '8px' }}>
                <button onClick={resetPassword} disabled={isLoading} style={btnStyle(isLoading)}>
                  {isLoading ? <Spinner /> : <>Reset Password <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2" strokeLinecap="round"/><polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #B49A64, #9A8254)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{
                fontSize: '30px', fontWeight: '700', color: '#1A1A1A',
                fontFamily: "'Cormorant Garamond', serif", marginBottom: '12px',
              }}>Password Reset!</h2>
              <p style={{ fontSize: '14px', color: '#888', fontWeight: '300', lineHeight: '1.6', marginBottom: '32px' }}>
                Your password has been successfully updated.<br />
                Redirecting you to sign in...
              </p>
              <div style={{
                width: '100%', height: '4px', background: '#E0DBD0', borderRadius: '2px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', background: '#B49A64', borderRadius: '2px',
                  animation: 'progress 2.5s linear forwards',
                }} />
              </div>
            </div>
          )}

          {/* Back to login */}
          {step < 4 && (
            <div style={{ textAlign: 'center', marginTop: '28px' }}>
              <Link href="/login" style={{ fontSize: '13px', color: '#BBBBBB', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        @media (max-width: 768px) { #left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}