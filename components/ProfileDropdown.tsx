'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'realtor' | 'admin';
  profilePhoto?: string;
  bio?: string;
  country?: string;
  city?: string;
  agencyName?: string;
  isProfileComplete: boolean;
  createdAt: string;
}

// Helper to delete cookies
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Helper to clear all auth cookies
const clearAllCookies = () => {
  // Clear all possible auth-related cookies
  const cookiesToClear = ['token', 'userId', 'role', 'session', 'auth_token', 'refresh_token'];
  cookiesToClear.forEach(deleteCookie);
};

export default function ProfileDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editCity, setEditCity] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.success !== false) {
        const data = response.data.data || response.data;
        setProfile(data);
        // Initialize edit fields
        setEditName(data.name || '');
        setEditPhone(data.phone || '');
        setEditBio(data.bio || '');
        setEditCountry(data.country || '');
        setEditCity(data.city || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        name: editName,
        phone: editPhone,
        country: editCountry,
        city: editCity,
      };
      if (editBio) updateData.bio = editBio;
      
      const response = await api.put('/auth/profile', updateData);
      if (response.data && response.data.success !== false) {
        const data = response.data.data || response.data;
        setProfile(data);
        setIsEditing(false);
        // Show success message
        alert('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // ────────── COMPLETE LOGOUT FUNCTION - CLEARS ALL CACHE ──────────
  const handleLogout = async () => {
    try {
      // Try to call logout API if available
      await api.post('/auth/logout', {}).catch(() => {});
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // ─── CLEAR ALL COOKIES ───
      clearAllCookies();
      
      // ─── CLEAR ALL LOCALSTORAGE ───
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('favorites');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userData');
      
      // ─── CLEAR SESSIONSTORAGE (if any) ───
      sessionStorage.clear();
      
      // ─── CLEAR ANY CACHED API DATA ───
      // Optional: Clear any global state if you have it
      
      console.log('✅ All cache cleared, cookies removed, redirecting to login...');
      
      // Redirect to login page
      router.push('/login');
    }
  };

  const cancelEdit = () => {
    // Reset to original values
    if (profile) {
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
      setEditBio(profile.bio || '');
      setEditCountry(profile.country || '');
      setEditCity(profile.city || '');
    }
    setIsEditing(false);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string): { bg: string; text: string } => {
    switch (role) {
      case 'buyer':
        return { bg: '#3B82F6', text: '#fff' };
      case 'realtor':
        return { bg: '#10B981', text: '#fff' };
      case 'admin':
        return { bg: '#8B5CF6', text: '#fff' };
      default:
        return { bg: '#6B7280', text: '#fff' };
    }
  };

  const getRoleText = (role: string): string => {
    switch (role) {
      case 'buyer':
        return 'Buyer';
      case 'realtor':
        return 'Realtor';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1A1A1A, #2C2415)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(180,154,100,0.3)',
            borderTopColor: '#B49A64',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  const roleColors = profile ? getRoleBadgeColor(profile.role) : { bg: '#6B7280', text: '#fff' };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (isEditing) setIsEditing(false);
        }}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1A1A1A, #2C2415)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: isOpen ? '0 0 0 3px rgba(180,154,100,0.3)' : 'none',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#B49A64',
            textTransform: 'uppercase',
          }}
        >
          {profile ? getInitials(profile.name) : 'U'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && profile && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '360px',
            maxHeight: '500px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            border: '1px solid #F0EBE1',
            zIndex: 1000,
            overflow: 'auto',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2415 100%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#B49A64',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {getInitials(profile.name)}
              </span>
            </div>
            {!isEditing ? (
              <>
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px',
                  }}
                >
                  {profile.name}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '8px',
                  }}
                >
                  {profile.email}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: roleColors.bg,
                    color: roleColors.text,
                  }}
                >
                  {getRoleText(profile.role)}
                </span>
              </>
            ) : (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full Name"
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    fontSize: '14px',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    outline: 'none',
                    marginBottom: '8px',
                  }}
                />
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  {profile.email}
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div style={{ padding: '16px' }}>
            {!isEditing ? (
              <>
                {/* Profile Info Summary */}
                <div
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #F0EBE1',
                  }}
                >
                  <div style={{ display: 'flex', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#999" strokeWidth="1.8"/>
                          <circle cx="12" cy="7" r="4" stroke="#999" strokeWidth="1.8"/>
                        </svg>
                        <span style={{ fontSize: '10px', color: '#999' }}>Role</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{getRoleText(profile.role)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="#999" strokeWidth="1.8"/>
                        </svg>
                        <span style={{ fontSize: '10px', color: '#999' }}>Phone</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>{profile.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  {(profile.country || profile.city) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid #F5F2EC' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#999" strokeWidth="1.8"/>
                        <circle cx="12" cy="10" r="3" stroke="#999" strokeWidth="1.8"/>
                      </svg>
                      <div>
                        <div style={{ fontSize: '10px', color: '#999', marginBottom: '2px' }}>Location</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A' }}>
                          {[profile.city, profile.country].filter(Boolean).join(', ') || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.bio && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F5F2EC' }}>
                      <div style={{ fontSize: '10px', color: '#999', marginBottom: '4px' }}>Bio</div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{profile.bio}</div>
                    </div>
                  )}
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    background: '#F5F2EC',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    marginTop: '12px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#EDE7D9';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#F5F2EC';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17 3l4 4L7 21H3v-4L17 3z" stroke="#B49A64" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#B49A64' }}>Edit Profile</span>
                </button>

                <div style={{ height: '1px', background: '#F0EBE1', margin: '12px 0' }} />

                {/* My Profile Link */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/profile');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#F5F2EC';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                
                </button>

                {/* Settings Link */}
              
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    textAlign: 'left',
                    marginTop: '8px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
                    <polyline points="16 17 21 12 16 7" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#EF4444' }}>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Edit Mode Fields */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#999', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      fontSize: '13px',
                      background: '#F5F2EC',
                      border: '1.5px solid transparent',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#B49A64'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F2EC'; }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#999', display: 'block', marginBottom: '4px' }}>Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    placeholder="e.g., Pakistan"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      fontSize: '13px',
                      background: '#F5F2EC',
                      border: '1.5px solid transparent',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#B49A64'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F2EC'; }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#999', display: 'block', marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="e.g., Karachi"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      fontSize: '13px',
                      background: '#F5F2EC',
                      border: '1.5px solid transparent',
                      borderRadius: '8px',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#B49A64'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F2EC'; }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#999', display: 'block', marginBottom: '4px' }}>Bio (Optional)</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '13px',
                      background: '#F5F2EC',
                      border: '1.5px solid transparent',
                      borderRadius: '8px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#B49A64'; e.target.style.background = '#fff'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#F5F2EC'; }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    onClick={cancelEdit}
                    style={{
                      flex: 1,
                      height: '40px',
                      background: '#F5F2EC',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#555',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={isUpdating}
                    style={{
                      flex: 2,
                      height: '40px',
                      background: isUpdating ? '#999' : '#1A1A1A',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#B49A64',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(180,154,100,0.3)', borderTopColor: '#B49A64', animation: 'spin 0.8s linear infinite' }} />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}