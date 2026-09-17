import { Suspense } from 'react';
import ProfileSetupClient from './ProfileSetupClient';

function ProfileSetupFallback() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F5F2EC' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(180,154,100,0.25)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<ProfileSetupFallback />}>
      <ProfileSetupClient />
    </Suspense>
  );
}
