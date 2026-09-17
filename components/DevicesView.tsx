'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot';
  os: string;
  browser: string;
  ipAddress: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActive: string;
  loginTime: string;
  location: string;
}

const getDeviceIcon = (type: string): string => {
  switch (type) {
    case 'mobile': return '📱';
    case 'tablet': return '📟';
    case 'desktop': return '💻';
    case 'bot': return '🤖';
    default: return '💻';
  }
};

const getDeviceTypeLabel = (type: string): string => {
  switch (type) {
    case 'mobile': return 'Mobile Phone';
    case 'tablet': return 'Tablet';
    case 'desktop': return 'Desktop / Laptop';
    case 'bot': return 'Bot / API';
    default: return 'Unknown Device';
  }
};

const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
};

interface DevicesViewProps {
  onBack: () => void;
}

export default function DevicesView({ onBack }: DevicesViewProps) {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
const fetchDevices = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('device_id');
    
    // Use api instance directly - it already has interceptor
    const response = await api.get('/devices', {
      headers: {
        'X-Device-Id': deviceId || ''
      }
    });
    
    if (response.data && response.data.success !== false) {
      setDevices(response.data.data || []);
    }
  } catch (error: any) {
    console.error('Error fetching devices:', error);
    console.error('Status:', error?.response?.status);
    console.error('Data:', error?.response?.data);
    setDevices([]);
  } finally {
    setIsLoading(false);
  }
};
  const removeDevice = async (deviceId: string) => {
    setIsRemoving(deviceId);
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/devices/${deviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDevices(prev => prev.filter(d => d.deviceId !== deviceId));
      setShowConfirmDialog(null);
    } catch (error) {
      console.error('Error removing device:', error);
      alert('Failed to remove device');
    } finally {
      setIsRemoving(null);
    }
  };

  const removeOtherDevices = async () => {
    setIsRemoving('all');
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('device_id');
      await api.delete('/devices/others/remove', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Device-Id': deviceId || ''
        }
      });
      setDevices(prev => prev.filter(d => d.isCurrent));
      alert('All other devices have been logged out');
    } catch (error) {
      console.error('Error removing other devices:', error);
      alert('Failed to remove other devices');
    } finally {
      setIsRemoving(null);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const stats = {
    total: devices.length,
    current: devices.filter(d => d.isCurrent).length,
    others: devices.filter(d => !d.isCurrent).length,
    mobile: devices.filter(d => d.deviceType === 'mobile').length,
    desktop: devices.filter(d => d.deviceType === 'desktop').length
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={onBack} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '13px', 
            color: '#B49A64', 
            padding: '6px 12px', 
            borderRadius: '8px' 
          }}
        >
          ← Back to Dashboard
        </button>
        <span style={{ color: '#CCC' }}>/</span>
        <span style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '500' }}>Device Management</span>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Devices', value: stats.total.toString(), icon: '📱', color: '#B49A64' },
          { label: 'Current Device', value: stats.current.toString(), icon: '✅', color: '#10B981' },
          { label: 'Other Devices', value: stats.others.toString(), icon: '🌐', color: '#F59E0B' },
          { label: 'Mobile/Desktop', value: `${stats.mobile}/${stats.desktop}`, icon: '📊', color: '#3B82F6' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #F0EBE1', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color, fontFamily: "'Cormorant Garamond', serif", marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#888' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Remove All Other Devices Button */}
      {stats.others > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setShowConfirmDialog('all')} 
            style={{ 
              padding: '10px 20px', 
              background: '#EF4444', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#fff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#fff" strokeWidth="1.8"/>
              <polyline points="16 17 21 12 16 7" stroke="#fff" strokeWidth="1.8"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="#fff" strokeWidth="1.8"/>
            </svg>
            Logout from all other devices
          </button>
        </div>
      )}

      {/* Devices List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            border: '3px solid rgba(180,154,100,0.25)', 
            borderTopColor: '#B49A64', 
            animation: 'spin 0.8s linear infinite', 
            margin: '0 auto 16px' 
          }} />
          <div style={{ fontSize: '13px', color: '#999' }}>Loading devices...</div>
        </div>
      ) : devices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #F0EBE1' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A', marginBottom: '8px' }}>No Devices Found</div>
          <div style={{ fontSize: '13px', color: '#999' }}>Login from a device to see it here</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {devices.map((device) => (
            <div 
              key={device.id} 
              style={{ 
                background: device.isCurrent ? 'linear-gradient(135deg, #fff 0%, #F5F2EC 100%)' : '#fff', 
                borderRadius: '16px', 
                border: device.isCurrent ? '2px solid #B49A64' : '1px solid #F0EBE1', 
                padding: '20px', 
                position: 'relative' 
              }}
            >
              {device.isCurrent && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  right: '20px', 
                  background: '#B49A64', 
                  color: '#fff', 
                  fontSize: '10px', 
                  fontWeight: '700', 
                  padding: '2px 10px', 
                  borderRadius: '20px' 
                }}>
                  CURRENT DEVICE
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '14px', 
                  background: 'rgba(180,154,100,0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '32px' 
                }}>
                  {getDeviceIcon(device.deviceType)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A1A1A' }}>{device.deviceName}</h3>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#F5F2EC', color: '#666' }}>{device.browser}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#F5F2EC', color: '#666' }}>{device.os}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#999" strokeWidth="1.8"/>
                        <circle cx="12" cy="7" r="4" stroke="#999" strokeWidth="1.8"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#666' }}>Type: {getDeviceTypeLabel(device.deviceType)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="#999" strokeWidth="1.8"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#666' }}>Last active: {formatRelativeTime(device.lastActive)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#999" strokeWidth="1.8"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="#999" strokeWidth="1.8"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="#999" strokeWidth="1.8"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#666' }}>Logged in: {formatDateTime(device.loginTime)}</span>
                    </div>
                  </div>
                </div>
                
                {!device.isCurrent && (
                  <button 
                    onClick={() => setShowConfirmDialog(device.deviceId)} 
                    disabled={isRemoving === device.deviceId} 
                    style={{ 
                      padding: '8px 16px', 
                      background: '#FEF2F2', 
                      border: '1px solid #FECACA', 
                      borderRadius: '10px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#EF4444', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}
                  >
                    {isRemoving === device.deviceId ? (
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '50%', 
                        border: '2px solid rgba(239,68,68,0.3)', 
                        borderTopColor: '#EF4444', 
                        animation: 'spin 0.8s linear infinite' 
                      }} />
                    ) : (
                      <>Logout</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 1000, 
            padding: '20px' 
          }} 
          onClick={(e) => { 
            if (e.target === e.currentTarget) setShowConfirmDialog(null); 
          }}
        >
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', marginBottom: '12px' }}>
              {showConfirmDialog === 'all' ? 'Logout from all other devices?' : 'Remove this device?'}
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              {showConfirmDialog === 'all' 
                ? 'This will log you out from all other devices. You will stay logged in on this device.'
                : 'This device will be logged out and will require re-authentication.'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirmDialog(null)} 
                style={{ 
                  flex: 1, 
                  height: '44px', 
                  background: '#F5F2EC', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#555', 
                  cursor: 'pointer' 
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (showConfirmDialog === 'all') removeOtherDevices();
                  else removeDevice(showConfirmDialog);
                }} 
                style={{ 
                  flex: 1, 
                  height: '44px', 
                  background: '#EF4444', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#fff', 
                  cursor: 'pointer' 
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}