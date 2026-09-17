'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { authService } from '@/lib/auth';

export default function SubscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [role, setRole] = useState<string>('');
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const userRole = authService.getRole();
      setRole(userRole || '');
      
      // First check localStorage for cached payment status using existing method
      const cachedPaymentStatus = authService.isSubscribed();
      if (cachedPaymentStatus) {
        setHasPaid(true);
        setIsLoading(false);
        redirectToDashboard(userRole || '');
        return;
      }

      try {
        const response = await api.get('/auth/subscription/check');
        if (response.data.success && response.data.data?.isSubscribed) {
          setHasPaid(true);
          authService.updateOneTimePaymentStatus(true);
          redirectToDashboard(userRole || '');
        } else {
          // User is not subscribed - this is normal, just show the subscription page
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Error checking payment:', error);
        
        // Check if the error is due to not being subscribed (403)
        // This is actually expected behavior - user needs to subscribe
        if (error?.response?.status === 403) {
          // User is not subscribed - this is normal, just show the subscription page
          console.log('User not subscribed, showing subscription page');
          setIsLoading(false);
        } else {
          // Other errors - still show subscription page but log the error
          console.error('Unexpected error checking subscription:', error);
          setIsLoading(false);
        }
      }
    };

    checkPaymentStatus();
  }, []);

  const redirectToDashboard = (userRole: string) => {
    if (userRole === 'buyer') {
      router.replace('/buyerdashboard');
    } else if (userRole === 'realtor') {
      router.replace('/realtor-dashboard');
    } else {
      router.replace('/role-selection');
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await api.post('/auth/subscription/create', {
        paymentMethod: 'manual',
        transactionId: `TXN_${Date.now()}`,
        paymentType: 'one_time',
        amount: 100,
        role: role,
      });

      if (response.data.success) {
        // Update payment status in localStorage using existing method
        authService.updateOneTimePaymentStatus(true);
        setHasPaid(true);
        // Redirect to dashboard after successful payment
        redirectToDashboard(role);
      } else {
        alert(response.data.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error?.response?.data?.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  // If already paid, don't render anything (will redirect)
  if (hasPaid) return null;

  const isRealtor = role === 'realtor';
  
  // If no role is set, show error
  if (!role) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#FFF', borderRadius: '24px', padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Unable to determine your account type. Please try again.</p>
          <button onClick={() => router.push('/role-selection')} style={{ padding: '12px 24px', background: '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Go to Role Selection</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>{isRealtor ? '📋' : '🔍'}</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: '700', color: '#FFF', marginBottom: '8px' }}>{isRealtor ? 'Realtor Subscription' : 'Buyer Subscription'}</h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>One-time payment for lifetime access</p>
      </div>

      {/* Price Card */}
      <div style={{ maxWidth: '500px', margin: '32px auto', padding: '0 20px' }}>
        <div style={{ background: '#FFF', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#B49A64' }}>$</span>
              <span style={{ fontSize: '56px', fontWeight: '700', color: '#B49A64' }}>100</span>
              <span style={{ fontSize: '16px', color: '#999' }}>one-time</span>
            </div>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: '20px', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#10B981' }}>LIFETIME ACCESS</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F0EBE1', marginBottom: '24px' }} />

          {/* Features */}
          <div style={{ textAlign: 'left', marginBottom: '32px' }}>
            {isRealtor ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>List unlimited properties</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Get leads from buyers</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>View property analytics</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Verified realtor badge</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Priority support</span></div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Browse all properties</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Save favorite properties</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Schedule property tours</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Contact realtors directly</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5"/></svg></div><span style={{ fontSize: '14px', color: '#555' }}>Get price alerts</span></div>
              </>
            )}
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            style={{
              width: '100%', padding: '16px', background: isProcessing ? '#CCC' : '#1A1A1A',
              color: '#FFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '600',
              cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isProcessing ? <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} /> : <>Pay $100 & Subscribe <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="#B49A64" strokeWidth="2"/><polyline points="12 5 19 12 12 19" stroke="#B49A64" strokeWidth="2"/></svg></>}
          </button>

          <p style={{ fontSize: '12px', color: '#BBBBBB', marginTop: '16px' }}>✓ One-time payment • ✓ Lifetime access • ✓ No recurring fees</p>
        </div>
      </div>
    </div>
  );
}