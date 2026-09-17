'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'new_property_alert':
      return '🏠';
    case 'tour_accepted':
      return '✅';
    case 'tour_rejected':
      return '❌';
    case 'tour_confirmation':
      return '📅';
    case 'tour_cancelled':
      return '🚫';
    case 'payment_success':
      return '💰';
    case 'payment_confirmation':
      return '💳';
    default:
      return '🔔';
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'new_property_alert':
      return '#3B82F6';
    case 'tour_accepted':
      return '#10B981';
    case 'tour_rejected':
      return '#EF4444';
    case 'tour_confirmation':
      return '#F59E0B';
    case 'tour_cancelled':
      return '#6B7280';
    case 'payment_success':
      return '#10B981';
    case 'payment_confirmation':
      return '#8B5CF6';
    default:
      return '#B49A64';
  }
};

const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
};

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/notifications?page=1&limit=10');
      if (response.data && response.data.success !== false) {
        const data = response.data.data || response.data;
        const notificationsList = data.notifications || data || [];
        
        // Ensure each notification has an id
        const validNotifications = notificationsList.filter((n: any) => n._id || n.id);
        
        setNotifications(validNotifications.map((n: any) => ({
          id: n._id || n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          data: n.data,
          isRead: n.isRead || false,
          createdAt: n.createdAt,
        })));
        
        const unread = validNotifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      let response;
      try {
        response = await api.get('/notifications/unread/count');
      } catch (e) {
        response = await api.get('/notifications/unread-count');
      }
      
      if (response.data && response.data.success !== false) {
        const data = response.data.data || response.data;
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (notifications.length > 0) {
        const unread = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!notificationId) {
      console.error('Cannot mark as read: notificationId is undefined');
      return;
    }
    
    try {
      await api.put(`/notifications/${notificationId}/read`, {});
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read/all', {});
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!notificationId) {
      console.error('Cannot delete: notificationId is undefined');
      return;
    }
    
    try {
      await api.delete(`/notifications/${notificationId}`);
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deleted && !deleted.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && notification.id) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    
    switch (notification.type) {
      case 'new_property_alert':
        if (notification.data?.propertyId) {
          router.push(`/buyerdashboard?property=${notification.data.propertyId}`);
        }
        break;
      case 'tour_accepted':
      case 'tour_rejected':
      case 'tour_confirmation':
      case 'tour_cancelled':
        router.push('/my-requests');
        break;
      case 'payment_success':
      case 'payment_confirmation':
        router.push('/subscription');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#F5F2EC',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          color: '#555',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#EDE7D9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#F5F2EC';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#EF4444',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '44px',
            right: '0',
            width: '380px',
            maxHeight: '480px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            border: '1px solid #F0EBE1',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #F0EBE1',
              background: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#FEF2F2',
                    color: '#EF4444',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#B49A64',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid rgba(180,154,100,0.25)',
                    borderTopColor: '#B49A64',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto',
                  }}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A', marginBottom: '4px' }}>
                  No notifications yet
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  When you receive notifications, they will appear here
                </div>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id || `notification-${index}-${notification.createdAt}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 20px',
                    borderBottom: '1px solid #F5F2EC',
                    background: notification.isRead ? '#fff' : 'rgba(180,154,100,0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#FAFAF8';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = notification.isRead ? '#fff' : 'rgba(180,154,100,0.04)';
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: `${getNotificationColor(notification.type)}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: notification.isRead ? '500' : '600',
                        color: '#1A1A1A',
                        marginBottom: '4px',
                      }}
                    >
                      {notification.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        lineHeight: '1.4',
                        marginBottom: '6px',
                      }}
                    >
                      {notification.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                      {formatTimeAgo(notification.createdAt)}
                    </div>
                  </div>

                  {/* Delete button */}
                  {notification.id && (
                    <button
                      onClick={(e) => deleteNotification(notification.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#CCC',
                        fontSize: '14px',
                        flexShrink: 0,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#CCC';
                      }}
                    >
                      ✕
                    </button>
                  )}

                  {/* Unread dot */}
                  {!notification.isRead && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#B49A64',
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #F0EBE1',
                textAlign: 'center',
                background: '#FAFAF8',
              }}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/notifications');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#B49A64',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                View all notifications →
              </button>
            </div>
          )}
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