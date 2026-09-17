'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <>{children}</>;
}

/* ─── Cookie Consent Banner Component ─── */
function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        const parsed = JSON.parse(consent);
        if (parsed.preferences) {
          setPreferences(parsed.preferences);
        }
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }
  }, []);

  const acceptAll = () => {
    const newPrefs = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(newPrefs);
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      preferences: newPrefs,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const rejectAll = () => {
    const newPrefs = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(newPrefs);
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: false,
      preferences: newPrefs,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      accepted: true,
      preferences: preferences,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
    setShowPreferences(false);
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        zIndex: 9999,
        animation: 'slideUp 0.4s ease-out',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'rgba(30, 27, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(180, 154, 100, 0.3)',
          padding: '20px 28px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#B49A64" strokeWidth="1.5" fill="rgba(180,154,100,0.1)"/>
                  <path d="M12 6v6l4 2" stroke="#B49A64" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1" fill="#B49A64"/>
                </svg>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', fontFamily: "'Playfair Display', serif" }}>Cookie Preferences</span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '600px' }}>
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setShowPreferences(true)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1.5px solid rgba(180,154,100,0.5)',
                  borderRadius: '40px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#B49A64',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(180,154,100,0.1)';
                  e.currentTarget.style.borderColor = '#B49A64';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(180,154,100,0.5)';
                }}
              >
                Customize
              </button>
              <button
                onClick={rejectAll}
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: '40px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                style={{
                  padding: '10px 28px',
                  background: '#B49A64',
                  border: 'none',
                  borderRadius: '40px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#9e834f';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#B49A64';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreferences(false);
          }}
        >
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: '#1E1B14',
            borderRadius: '24px',
            border: '1px solid rgba(180,154,100,0.3)',
            overflow: 'hidden',
            animation: 'scaleIn 0.3s ease-out',
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(180,154,100,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', fontFamily: "'Playfair Display', serif" }}>Cookie Preferences</h3>
              <button
                onClick={() => setShowPreferences(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: 1.6 }}>
                When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. 
                Control your personal Cookie Services here.
              </p>

              {/* Necessary Cookies - Always required */}
              <div style={{
                padding: '16px',
                background: 'rgba(180,154,100,0.05)',
                borderRadius: '12px',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>Necessary Cookies</span>
                  <span style={{ fontSize: '11px', color: '#B49A64', background: 'rgba(180,154,100,0.15)', padding: '4px 10px', borderRadius: '20px' }}>Always Active</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  These cookies are essential for the website to function properly. They enable basic features like page navigation and access to secure areas.
                </p>
              </div>

              {/* Functional Cookies */}
              <div style={{
                padding: '16px',
                background: 'rgba(180,154,100,0.03)',
                borderRadius: '12px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>Functional Cookies</span>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    These cookies enable enhanced functionality and personalization, like remembering your preferences.
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('functional', !preferences.functional)}
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    background: preferences.functional ? '#B49A64' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: preferences.functional ? '26px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'all 0.2s',
                  }} />
                </button>
              </div>

              {/* Analytics Cookies */}
              <div style={{
                padding: '16px',
                background: 'rgba(180,154,100,0.03)',
                borderRadius: '12px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>Analytics Cookies</span>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('analytics', !preferences.analytics)}
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    background: preferences.analytics ? '#B49A64' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: preferences.analytics ? '26px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'all 0.2s',
                  }} />
                </button>
              </div>

              {/* Marketing Cookies */}
              <div style={{
                padding: '16px',
                background: 'rgba(180,154,100,0.03)',
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>Marketing Cookies</span>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                    These cookies are used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
                <button
                  onClick={() => updatePreference('marketing', !preferences.marketing)}
                  style={{
                    width: '48px',
                    height: '24px',
                    borderRadius: '12px',
                    background: preferences.marketing ? '#B49A64' : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: preferences.marketing ? '26px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'all 0.2s',
                  }} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPreferences(false)}
                  style={{
                    padding: '10px 24px',
                    background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    borderRadius: '40px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={savePreferences}
                  style={{
                    padding: '10px 28px',
                    background: '#B49A64',
                    border: 'none',
                    borderRadius: '40px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

/* ─── Intersection reveal ─────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, vis };
}

/* ─── Animated counter ───────────────────── */
function Counter({ end, suffix = '', started }: { end: number; suffix?: string; started: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!started) return;
    let cur = 0; const step = end / 60;
    const t = setInterval(() => { cur = Math.min(cur + step, end); setN(Math.floor(cur)); if (cur >= end) clearInterval(t); }, 25);
    return () => clearInterval(t);
  }, [started, end]);
  return <>{n}{suffix}</>;
}

/* ─── Hero Image Slideshow with Animation ─── */
function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const images = [
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=90&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=90&auto=format&fit=crop',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      {images.map((img, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            inset: '-5%',
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: currentIndex === idx ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            transform: currentIndex === idx ? 'scale(1.05)' : 'scale(1)',
            animation: currentIndex === idx ? 'hero-zoom 16s ease-in-out infinite alternate' : 'none',
          }}
        />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,250,0.88) 0%, rgba(255,252,240,0.6) 40%, rgba(180,154,100,0.15) 100%)' }} />
    </div>
  );
}

/* ─── Particle canvas with Gold/White theme ── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    
    const onResize = () => { 
      W = canvas.width = window.innerWidth; 
      H = canvas.height = window.innerHeight; 
    };
    window.addEventListener('resize', onResize);

    const dots: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 80; i++) {
      dots.push({ 
        x: Math.random() * W, 
        y: Math.random() * H, 
        vx: (Math.random() - 0.5) * 0.3, 
        vy: (Math.random() - 0.5) * 0.3, 
        r: Math.random() * 1.8 + 0.5, 
        a: Math.random() * 0.6 + 0.2 
      });
    }

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; 
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; 
        if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 154, 100, ${d.a * 0.4})`;
        ctx.fill();
      });
      
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(180, 154, 100, ${(1 - dist / 110) * 0.15})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { 
      cancelAnimationFrame(raf); 
      window.removeEventListener('resize', onResize); 
    };
  }, []);
  
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />;
}

/* ─── PROPERTY DATA for 2-COLUMN GRID (6 exceptional homes) ─── */
const PROPERTIES_GRID = [
  { img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80&auto=format&fit=crop', city: 'Beverly Hills, CA', name: 'Summit Estate', price: '$4.2M', beds: 5, baths: 6, area: '6,200 sq ft', tag: 'FEATURED', desc: 'Panoramic canyon views, infinity pool, and private home theater.' },
  { img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop', city: 'Miami Beach, FL', name: 'Meridian Villa', price: '$2.8M', beds: 4, baths: 4, area: '4,800 sq ft', tag: 'NEW', desc: 'Oceanfront masterpiece with Italian marble and rooftop terrace.' },
  { img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop', city: 'Manhattan, NY', name: 'Apex Penthouse', price: '$6.5M', beds: 4, baths: 4.5, area: '4,100 sq ft', tag: 'FOR SALE', desc: '360° skyline views, private elevator, and concierge service.' },
  { img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80&auto=format&fit=crop', city: 'Aspen, CO', name: 'Alpine Lodge', price: '$3.9M', beds: 5, baths: 5, area: '5,500 sq ft', tag: 'EXCLUSIVE', desc: 'Mountain modern retreat with spa and ski-in/ski-out access.' },
  { img: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80&auto=format&fit=crop', city: 'Austin, TX', name: 'Hilltop Ranch', price: '$2.45M', beds: 4, baths: 3.5, area: '4,200 sq ft', tag: 'HOT LISTING', desc: 'Hill country views, resort-style pool, and equestrian facilities.' },
  { img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80&auto=format&fit=crop', city: 'Seattle, WA', name: 'Elliott Bay Tower', price: '$3.2M', beds: 3, baths: 3, area: '2,950 sq ft', tag: 'PREMIER', desc: 'Waterfront luxury with floor-to-ceiling glass and smart home tech.' },
];

/* ─── BLOG POSTS DATA ─── */
const BLOG_POSTS = [
  {
    id: 1,
    title: '10 Tips for First-Time Home Buyers',
    excerpt: 'Buying your first home can be overwhelming. Here are 10 essential tips to make the process smooth and successful.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
    category: 'Buying Tips',
    date: 'Mar 15, 2025',
    readTime: '5 min read',
    author: 'Sarah Johnson'
  },
  {
    id: 2,
    title: 'How to Price Your Home for a Quick Sale',
    excerpt: 'Pricing your property correctly is crucial. Learn the strategies that top realtors use to sell homes faster.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    category: 'Selling Tips',
    date: 'Mar 10, 2025',
    readTime: '4 min read',
    author: 'Michael Chen'
  },
  {
    id: 3,
    title: 'Top Real Estate Markets to Watch in 2025',
    excerpt: 'Discover which cities are emerging as hot real estate markets this year and where to invest.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
    category: 'Market Trends',
    date: 'Mar 5, 2025',
    readTime: '6 min read',
    author: 'Emily Rodriguez'
  },
  {
    id: 4,
    title: 'The Future of Real Estate Technology',
    excerpt: 'How AI and virtual reality are transforming the way we buy and sell properties.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    category: 'Technology',
    date: 'Feb 28, 2025',
    readTime: '4 min read',
    author: 'David Kim'
  },
  {
    id: 5,
    title: 'Why a One-Time Fee Model Works for Realtors',
    excerpt: 'Discover why more real estate professionals are choosing flat-fee platforms over traditional subscriptions.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    category: 'Realtor Advice',
    date: 'Feb 20, 2025',
    readTime: '3 min read',
    author: 'Ahmad Raza'
  },
  {
    id: 6,
    title: 'Luxury Home Features That Add Real Value',
    excerpt: 'From smart home technology to sustainable design, these luxury features are worth the investment.',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
    category: 'Luxury Living',
    date: 'Feb 15, 2025',
    readTime: '5 min read',
    author: 'Jessica Wong'
  },
];

/* ════════════════════════════════════════════
   MAIN PAGE - WITH ABOUT & BLOG SECTIONS
   ════════════════════════════════════════════ */
export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const stats = useReveal(0.15);
  const buyers = useReveal(0.1);
  const realtors = useReveal(0.1);
  const pricing = useReveal(0.1);
  const aboutRef = useReveal(0.1);
  const blogRef = useReveal(0.1);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const scrollPct = mounted ? (scrollY / (document.body?.scrollHeight - window.innerHeight || 1)) * 100 : 0;

  useEffect(() => {
    if (!mounted) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-up, .scroll-reveal-scale, .prop-grid-card, .blog-card')
      .forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', sans-serif", background: '#FFFFFF', color: '#1A1A1A', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
        ::selection{background:rgba(180,154,100,0.25);color:#1A1A1A}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#F5F0EB}
        ::-webkit-scrollbar-thumb{background:#b49a64;border-radius:20px}

        @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes hero-zoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}
        @keyframes reveal-line{from{width:0}to{width:64px}}
        @keyframes marquee-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scan{0%{top:6px; opacity:1} 80%{top:28px; opacity:0.3} 100%{top:6px; opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}

        .nav-link:hover{color:#b49a64!important}
        .prop-grid-card:hover .prop-img{transform:scale(1.05)!important}
        .prop-grid-card:hover{transform:translateY(-8px)!important;box-shadow:0 25px 40px rgba(0,0,0,0.12)!important}
        .blog-card:hover{transform:translateY(-5px)!important;box-shadow:0 20px 35px rgba(0,0,0,0.08)!important}
        .btn-gold:hover{background:#9e834f!important;transform:translateY(-2px)!important;box-shadow:0 12px 28px rgba(180,154,100,0.35)!important}
        .feature-row:hover{background:rgba(180,154,100,0.05)!important;border-radius:14px!important;padding-left:20px!important}
        .price-card:hover{transform:translateY(-8px)!important;box-shadow:0 25px 45px rgba(180,154,100,0.15)!important}
        .floating{animation:float 6s ease-in-out infinite}
        
        /* Scroll reveal animations */
        .scroll-reveal-left{opacity:0;transform:translateX(-50px);transition:all 0.8s cubic-bezier(0.2,0.9,0.4,1.1)}
        .scroll-reveal-left.revealed{opacity:1;transform:translateX(0)}
        .scroll-reveal-right{opacity:0;transform:translateX(50px);transition:all 0.8s cubic-bezier(0.2,0.9,0.4,1.1)}
        .scroll-reveal-right.revealed{opacity:1;transform:translateX(0)}
        .scroll-reveal-up{opacity:0;transform:translateY(40px);transition:all 0.7s ease-out}
        .scroll-reveal-up.revealed{opacity:1;transform:translateY(0)}
        .scroll-reveal-scale{opacity:0;transform:scale(0.95);transition:all 0.6s ease}
        .scroll-reveal-scale.revealed{opacity:1;transform:scale(1)}

        .prop-grid-card{opacity:0;transform:translateY(30px);transition:all 0.6s cubic-bezier(0.2,0.8,0.4,1);}
        .prop-grid-card.revealed{opacity:1;transform:translateY(0)}
        .blog-card{opacity:0;transform:translateY(30px);transition:all 0.6s cubic-bezier(0.2,0.8,0.4,1);}
        .blog-card.revealed{opacity:1;transform:translateY(0)}

        @media(max-width:900px){
          .desktop-nav{display:none !important}
          .mobile-menu-btn{display:flex !important}
          .props-grid-2col{grid-template-columns:1fr !important}
          .blog-grid{grid-template-columns:1fr !important}
          .split-r{grid-template-columns:1fr !important; gap:40px !important; text-align:center;}
          .split-l{grid-template-columns:1fr !important; gap:40px !important; text-align:center;}
          .stats-row{grid-template-columns:1fr 1fr !important}
          .price-grid{grid-template-columns:1fr !important}
          .footer-cols{grid-template-columns:1fr 1fr !important; gap:30px !important}
          .hero-stats{flex-wrap:wrap; gap:20px !important; justify-content:center !important}
          .hero-stats > div{padding-right:0 !important; border-right:none !important}
          nav{padding:0 16px !important; width:calc(100% - 20px) !important}
          nav > div > div:first-child{padding:0 16px !important}
          .hero-stats{margin-top:40px !important}
          section{padding:60px 0 !important}
          .container{padding:0 20px !important}
          .about-stats{grid-template-columns:repeat(2,1fr) !important}
          .testimonials-grid{grid-template-columns:1fr !important}
        }
        @media(min-width:901px){
          .mobile-menu-btn{display:none !important}
          .mobile-nav{display:none !important}
        }
        @media(max-width:480px){
          .hero-stats{gap:16px !important}
          .hero-stats div div:first-child{font-size:28px !important}
          .hero-stats div div:last-child{font-size:9px !important}
          nav > div > div:first-child span{font-size:18px !important}
          nav .btn-gold{padding:8px 18px !important; font-size:12px !important}
          nav a[href="/login"]{padding:8px 12px !important; font-size:12px !important}
          .about-stats{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* Progress Bar */}
      {mounted && (
        <div style={{ position: 'fixed', top: 0, left: 0, height: '3px', width: `${scrollPct}%`, background: '#b49a64', zIndex: 9999, transition: 'width 0.1s linear' }} />
      )}

      {/* ========== GLASS MORPHISM NAVIGATION ========== */}
      <nav style={{
        position: 'fixed', 
        top: '16px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: 'calc(100% - 24px)', 
        maxWidth: '1280px', 
        zIndex: 1000,
        background: scrollY > 50 ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: '50px',
        border: '1px solid rgba(180,154,100,0.25)',
        boxShadow: scrollY > 50 ? '0 8px 32px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#b49a64', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#fff', fontFamily: 'Playfair Display, serif' }}>E</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '20px', color: '#1E1B14', letterSpacing: '-0.5px' }}>ESTATEX</span>
          </Link>

          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {['Properties', 'For Buyers', 'For Realtors', 'About', 'Blog', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '')}`} className="nav-link" style={{ fontSize: '14px', fontWeight: 500, color: '#4A4A4A', textDecoration: 'none', transition: 'color 0.2s' }}>{item}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link href="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#6B6B6B', textDecoration: 'none', padding: '8px 14px', whiteSpace: 'nowrap' }}>Sign In</Link>
            <Link href="/signup" className="btn-gold" style={{ fontSize: '14px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '8px 22px', borderRadius: '40px', textDecoration: 'none', transition: 'all 0.3s', display: 'inline-block', whiteSpace: 'nowrap' }}>Register →</Link>
          </div>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            style={{ 
              background: 'rgba(180,154,100,0.1)', 
              border: '1px solid rgba(180,154,100,0.3)', 
              width: '42px', 
              height: '42px', 
              borderRadius: '30px', 
              fontSize: '22px', 
              cursor: 'pointer', 
              color: '#b49a64',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav" style={{ 
            background: 'rgba(255,255,255,0.98)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: '28px', 
            margin: '12px 16px 20px 16px', 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            border: '1px solid rgba(180,154,100,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            {['Properties', 'For Buyers', 'For Realtors', 'About', 'Blog', 'Pricing'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/\s+/g, '')}`} 
                style={{ 
                  fontSize: '16px', 
                  fontWeight: 500, 
                  color: '#4A4A4A', 
                  textDecoration: 'none', 
                  padding: '14px 16px',
                  borderRadius: '14px',
                  transition: 'all 0.2s',
                  background: 'transparent'
                }} 
                onClick={handleMobileLinkClick}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(180,154,100,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item}
              </a>
            ))}
            <div style={{ height: '1px', background: 'rgba(180,154,100,0.2)', margin: '8px 0' }} />
            <Link 
              href="/login" 
              style={{ 
                fontSize: '16px', 
                fontWeight: 500, 
                color: '#6B6B6B', 
                textDecoration: 'none', 
                padding: '14px 16px',
                borderRadius: '14px',
                textAlign: 'center'
              }} 
              onClick={handleMobileLinkClick}
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="btn-gold" 
              style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: '#fff', 
                background: '#b49a64', 
                padding: '14px 20px', 
                borderRadius: '40px', 
                textDecoration: 'none', 
                textAlign: 'center',
                marginTop: '4px'
              }} 
              onClick={handleMobileLinkClick}
            >
              Register →
            </Link>
          </div>
        )}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '700px', overflow: 'hidden', display: 'flex', alignItems: 'center', marginTop: '0', paddingTop: '80px' }}>
        <ClientOnly>
          <HeroSlideshow />
          <ParticleField />
        </ClientOnly>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '28px', animation: mounted ? 'fadeUp 0.8s ease 0.2s both' : 'none' }}>
            <div style={{ width: '64px', height: '2px', background: '#b49a64', animation: mounted ? 'reveal-line 0.8s ease 0.4s both' : 'none' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: '#b49a64', textTransform: 'uppercase' }}>Premium Real Estate · USA</span>
          </div>

          <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", paddingTop: '20px', fontSize: 'clamp(38px, 8vw, 90px)', color: '#1E1B14', lineHeight: 0.95, letterSpacing: '-2px', fontWeight: 700, animation: mounted ? 'fadeUp 0.8s ease 0.4s both' : 'none' }}>
              PUT AGENTS TO WORK
            </div>
          </div>
          <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(42px, 8vw, 100px)', lineHeight: 0.95, letterSpacing: '-2px', fontWeight: 700, animation: mounted ? 'fadeUp 0.8s ease 0.55s both' : 'none', color: '#b49a64' }}>
              IN COMPLEX ENVIRONMENTS
            </div>
          </div>

          <p style={{ fontSize: 'clamp(14px, 4vw, 18px)', color: '#4A453B', maxWidth: '520px', lineHeight: 1.6, marginBottom: '36px', fontWeight: 400, animation: mounted ? 'fadeUp 0.8s ease 0.7s both' : 'none' }}>
            The next-generation platform connecting discerning buyers with elite realtors across New York, Los Angeles, Miami, and beyond.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', animation: mounted ? 'fadeUp 0.8s ease 0.85s both' : 'none' }}>
            <Link href="/signup" className="btn-gold" style={{ fontSize: '13px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '12px 28px', borderRadius: '40px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Talk to an Expert →</Link>
            <Link href="/signup" style={{ fontSize: '13px', fontWeight: 500, color: '#b49a64', background: 'transparent', border: '1.5px solid #b49a64', padding: '12px 24px', borderRadius: '40px', textDecoration: 'none', transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Browse Properties</Link>
          </div>

          <div className="hero-stats" style={{ display: 'flex', gap: '40px', marginTop: '56px', animation: mounted ? 'fadeUp 0.8s ease 1s both' : 'none' }}>
            {[['380+', 'Active Listings'], ['94%', 'Satisfaction Rate'], ['18', 'Major Cities'], ['120K+', 'Happy Clients']].map(([n, l], i) => (
              <div key={i} style={{ paddingRight: i < 3 ? '32px' : '0', borderRight: i < 3 ? '1px solid rgba(180,154,100,0.25)' : 'none' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 34px)', fontWeight: 700, letterSpacing: '-1px', color: '#b49a64', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: '10px', color: '#6F6A5F', fontWeight: 500, marginTop: '4px', letterSpacing: '0.5px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
          <div style={{ width: '24px', height: '38px', border: '1.5px solid #b49a64', borderRadius: '30px', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '8px', background: '#b49a64', borderRadius: '2px', animation: 'scan 1.6s infinite' }} />
          </div>
        </div>
      </section>

      {/* Partner Logos Strip */}
      <div style={{ background: '#FEFAF3', borderTop: '1px solid rgba(180,154,100,0.2)', borderBottom: '1px solid rgba(180,154,100,0.2)', padding: '14px 0', overflow: 'hidden' }}>
        <ClientOnly>
          <div style={{ display: 'flex', animation: 'marquee-x 25s linear infinite', whiteSpace: 'nowrap', alignItems: 'center' }}>
            {[...Array(2)].map((_, rep) => (
              <span key={rep} style={{ display: 'inline-flex', alignItems: 'center', gap: '40px', padding: '0 40px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#b49a64', opacity: 0.7 }}>SCHNEIDER</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#b49a64', opacity: 0.4 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#b49a64', opacity: 0.7 }}>JOB&TALENT</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#b49a64', opacity: 0.4 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#b49a64', opacity: 0.7 }}>WERNER</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#b49a64', opacity: 0.4 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#b49a64', opacity: 0.7 }}>NATURGY</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#b49a64', opacity: 0.4 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#b49a64', opacity: 0.7 }}>CMA CGM</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#b49a64', opacity: 0.4 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1px', color: '#b49a64', opacity: 0.7 }}>UBER FREIGHT</span>
              </span>
            ))}
          </div>
        </ClientOnly>
      </div>

      {/* ========== HANDPICKED EXCEPTIONAL HOMES ========== */}
      <section id="properties" style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="scroll-reveal-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '10px' }}>CURATED COLLECTION</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(32px, 6vw, 52px)', color: '#1E1B14', lineHeight: 1.1 }}>Handpicked Exceptional Homes</h2>
            </div>
            <Link href="/signup" style={{ fontSize: '13px', fontWeight: 600, color: '#b49a64', textDecoration: 'none' }}>View all listings →</Link>
          </div>

          <div className="props-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px' }}>
            {PROPERTIES_GRID.map((property, idx) => (
              <div key={idx} className="prop-grid-card" style={{ 
                background: '#FFFFFF',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(180,154,100,0.2)',
                transition: 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                transitionDelay: `${idx * 0.05}s`,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                  <img src={property.img} alt={property.name} className="prop-img" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' }} />
                  <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#b49a64', padding: '4px 12px', borderRadius: '30px', fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{property.tag}</div>
                </div>
                
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#b49a64', marginBottom: '10px' }}>{property.city.toUpperCase()}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, color: '#1E1B14', marginBottom: '6px' }}>{property.name}</h3>
                  <div style={{ fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 800, color: '#b49a64', marginBottom: '14px' }}>{property.price}</div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: '13px', color: '#5A5245', borderBottom: '1px solid rgba(180,154,100,0.15)', paddingBottom: '14px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🛏️ {property.beds} beds</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🛁 {property.baths} baths</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📐 {property.area}</span>
                  </div>
                  
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#4A453B', marginBottom: '20px', flex: 1 }}>{property.desc}</p>
                  
                  <Link href="/signup" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '10px 20px', borderRadius: '40px', textDecoration: 'none', transition: 'all 0.3s', width: 'fit-content' }}>
                    Schedule Tour →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Buyers Section */}
      <section id="forbuyers" ref={buyers.ref} style={{ padding: '80px 0', background: '#FEFAF3' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="split-r" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            <div className="scroll-reveal-left" style={{ position: 'relative' }}>
              <div style={{ borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/5' }}><img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85&auto=format&fit=crop" alt="Luxury home" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: '#FFFFFF', border: '1px solid rgba(180,154,100,0.3)', borderRadius: '16px', padding: '16px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '10px', color: '#8A8578', marginBottom: '4px', fontWeight: 600 }}>MATCHES FOUND</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 800, color: '#b49a64', lineHeight: 1 }}>1,247</div>
                <div style={{ fontSize: '10px', color: '#6F6A5F', marginTop: '4px' }}>+124 this week</div>
              </div>
            </div>
            <div className="scroll-reveal-right">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '14px' }}>FOR BUYERS</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(32px, 6vw, 52px)', color: '#1E1B14', lineHeight: 1.2, marginBottom: '16px' }}>Your Perfect Home Is One Search Away</h2>
              <p style={{ fontSize: '15px', color: '#4A453B', lineHeight: 1.6, marginBottom: '32px' }}>Search verified listings across Manhattan, Beverly Hills, South Beach. Connect with realtors directly, schedule tours, and track your favourites.</p>
              <Link href="/signup" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '12px 28px', borderRadius: '40px', textDecoration: 'none' }}>Start Searching →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Realtors Section */}
      <section id="forrealtors" ref={realtors.ref} style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="split-l" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'center' }}>
            <div className="scroll-reveal-left">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '14px' }}>FOR REALTORS</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(32px, 6vw, 52px)', color: '#1E1B14', lineHeight: 1.2, marginBottom: '16px' }}>Build Your Portfolio. Close More Deals.</h2>
              <p style={{ fontSize: '15px', color: '#4A453B', lineHeight: 1.6, marginBottom: '32px' }}>Get curated buyer leads, list unlimited properties, and manage your entire practice from one powerful dashboard — across all 50 states.</p>
              <Link href="/signup" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '12px 28px', borderRadius: '40px', textDecoration: 'none' }}>Join as Realtor →</Link>
            </div>
            <div className="scroll-reveal-right" style={{ position: 'relative' }}>
              <div style={{ borderRadius: '24px', overflow: 'hidden', aspectRatio: '4/5' }}><img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=85&auto=format&fit=crop" alt="Realtor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section id="about" ref={aboutRef.ref} style={{ padding: '80px 0', background: '#FEFAF3' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="scroll-reveal-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '12px' }}>ABOUT ESTATEX</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(34px, 6vw, 52px)', color: '#1E1B14', marginBottom: '16px' }}>Redefining Real Estate Experience</h2>
            <p style={{ fontSize: '16px', color: '#6F6A5F', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
              We're on a mission to make real estate transactions seamless, transparent, and accessible for everyone.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '50px', alignItems: 'center' }}>
            <div className="scroll-reveal-left">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" 
                alt="Modern home" 
                style={{ width: '100%', borderRadius: '24px', objectFit: 'cover', height: '400px' }}
              />
            </div>
            <div className="scroll-reveal-right">
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#1E1B14', marginBottom: '20px', fontFamily: "'Playfair Display', serif" }}>Our Story</h3>
              <p style={{ fontSize: '15px', color: '#4A453B', lineHeight: 1.7, marginBottom: '20px' }}>
                Founded in 2024, Estatex was born from a simple idea: that buying and selling real estate should be simpler, faster, and more transparent. We've built a platform that puts agents to work in complex environments, connecting buyers with the right properties and helping realtors grow their business.
              </p>
              <p style={{ fontSize: '15px', color: '#4A453B', lineHeight: 1.7, marginBottom: '30px' }}>
                Today, we're proud to serve thousands of users across America, from first-time homebuyers to experienced real estate professionals.
              </p>
              
              <div className="about-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div><div style={{ fontSize: '32px', fontWeight: 700, color: '#b49a64', fontFamily: "'Playfair Display', serif" }}>50K+</div><div style={{ fontSize: '12px', color: '#8A8578' }}>Active Users</div></div>
                <div><div style={{ fontSize: '32px', fontWeight: 700, color: '#b49a64', fontFamily: "'Playfair Display', serif" }}>100K+</div><div style={{ fontSize: '12px', color: '#8A8578' }}>Properties Listed</div></div>
                <div><div style={{ fontSize: '32px', fontWeight: 700, color: '#b49a64', fontFamily: "'Playfair Display', serif" }}>98%</div><div style={{ fontSize: '12px', color: '#8A8578' }}>Satisfaction Rate</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BLOG SECTION ========== */}
      <section id="blog" ref={blogRef.ref} style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="scroll-reveal-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '12px' }}>FROM OUR BLOG</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(34px, 6vw, 52px)', color: '#1E1B14', marginBottom: '16px' }}>Insights & Inspiration</h2>
            <p style={{ fontSize: '16px', color: '#6F6A5F', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Expert advice, market trends, and tips for buyers and sellers.
            </p>
          </div>

          <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {BLOG_POSTS.map((post, idx) => (
              <div key={post.id} className="blog-card" style={{ 
                background: '#FFFFFF',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(180,154,100,0.15)',
                transition: 'all 0.4s ease',
                transitionDelay: `${idx * 0.05}s`,
                cursor: 'pointer',
              }}>
                <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="blog-img" />
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#b49a64', letterSpacing: '1px', textTransform: 'uppercase' }}>{post.category}</span>
                    <span style={{ fontSize: '11px', color: '#999' }}>{post.date}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E1B14', marginBottom: '10px', lineHeight: 1.4, fontFamily: "'Playfair Display', serif" }}>{post.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6F6A5F', lineHeight: 1.6, marginBottom: '16px' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#b49a64' }}>
                        {post.author.charAt(0)}
                      </div>
                      <span style={{ fontSize: '11px', color: '#999' }}>{post.author}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#b49a64' }}>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="scroll-reveal-scale" style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/blog" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '12px 32px', borderRadius: '40px', textDecoration: 'none' }}>
              View All Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={stats.ref} style={{ padding: '60px 0', background: '#FEFAF3', borderTop: '1px solid rgba(180,154,100,0.15)', borderBottom: '1px solid rgba(180,154,100,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', textAlign: 'center' }}>
            {[{ end: 12, suffix: 'K+', label: 'Active Listings' }, { end: 50, suffix: 'K+', label: 'Happy Clients' }, { end: 18, suffix: '', label: 'Major Cities' }, { end: 98, suffix: '%', label: 'Satisfaction Rate' }].map((s, i) => (
              <div key={i} className="scroll-reveal-scale" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(40px, 6vw, 60px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1, marginBottom: '6px', color: '#b49a64' }}><Counter end={s.end} suffix={s.suffix} started={stats.vis} /></div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8A8578', letterSpacing: '1px' }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '80px 0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '10px' }}>TESTIMONIALS</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(30px, 5vw, 48px)', color: '#1E1B14' }}>What Our Community Says</h2>
        </div>
        <div className="testimonials-grid" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
          {[
            { q: 'Found my dream apartment in Manhattan in just two weeks. The platform made everything effortless.', name: 'Emma Wilson', role: 'Home Buyer · New York', init: 'EW' },
            { q: 'Admin-curated leads transformed my practice. Closed three Beverly Hills listings last month alone.', name: 'James Carter', role: 'Elite Realtor · Los Angeles', init: 'JC' },
            { q: "America's best real estate platform. The one-time fee is unbeatable value for serious investors.", name: 'Sophia Martinez', role: 'Property Investor · Miami', init: 'SM' },
          ].map((t, i) => (
            <div key={i} className="scroll-reveal-scale" style={{ background: '#FEFAF3', border: '1px solid rgba(180,154,100,0.2)', borderRadius: '20px', padding: '28px', transitionDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '16px', color: '#b49a64' }}>★★★★★</div>
              <p style={{ fontSize: '13px', color: '#4A453B', lineHeight: 1.6, marginBottom: '24px', fontStyle: 'italic' }}>"{t.q}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(180,154,100,0.15)', border: '1px solid rgba(180,154,100,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#b49a64' }}>{t.init}</div>
                <div><div style={{ fontSize: '14px', fontWeight: 700, color: '#1E1B14' }}>{t.name}</div><div style={{ fontSize: '10px', color: '#8A8578' }}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricing.ref} style={{ padding: '80px 0', background: '#FEFAF3' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#b49a64', marginBottom: '14px' }}>PRICING</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 'clamp(34px, 6vw, 54px)', color: '#1E1B14', marginBottom: '12px' }}>One Payment. Forever.</h2>
          <p style={{ fontSize: '15px', color: '#6F6A5F', marginBottom: '48px' }}>No subscriptions. Pay once and the platform is yours. Just $100 for lifetime access.</p>
          <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              { role: 'Buyer', perks: ['City-level property search', 'Direct realtor contact', 'Schedule unlimited tours', '24/7 customer support'], featured: false },
              { role: 'Realtor', perks: ['Request buyer leads', 'List unlimited properties', 'Tour management', 'Analytics & insights', 'Verified badge'], featured: true },
            ].map((p, i) => (
              <div key={i} className="price-card scroll-reveal-scale" style={{
                background: '#FFFFFF',
                border: p.featured ? '2px solid #b49a64' : '1px solid rgba(180,154,100,0.25)',
                borderRadius: '24px', padding: '36px 28px', position: 'relative',
                transition: 'all 0.4s ease',
                transitionDelay: `${i * 0.15}s`,
              }}>
                {p.featured && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#b49a64', padding: '4px 16px', borderRadius: '30px', fontSize: '10px', fontWeight: 700, color: '#fff' }}>POPULAR</div>}
                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#b49a64', marginBottom: '16px' }}>{p.role.toUpperCase()}</div>
                <div style={{ fontSize: '44px', fontWeight: 800, color: '#1E1B14' }}>$100</div>
                <div style={{ fontSize: '10px', color: '#b49a64', marginBottom: '24px', fontWeight: 600 }}>ONE-TIME PAYMENT</div>
                <div style={{ borderTop: '1px solid rgba(180,154,100,0.2)', paddingTop: '20px', marginBottom: '24px' }}>
                  {p.perks.map((k, j) => (<div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '12px', color: '#4A453B' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(180,154,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>{k}</div>))}
                </div>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: p.featured ? '#fff' : '#b49a64', background: p.featured ? '#b49a64' : 'transparent', border: p.featured ? 'none' : '1px solid #b49a64', padding: '12px 20px', borderRadius: '40px', textDecoration: 'none' }}>Get Started</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '70px 20px', background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFAF3 100%)', textAlign: 'center', borderTop: '1px solid rgba(180,154,100,0.15)', borderBottom: '1px solid rgba(180,154,100,0.15)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 'clamp(30px, 6vw, 48px)', color: '#1E1B14', marginBottom: '16px' }}>Ready to Find<br />Your <span style={{ color: '#b49a64' }}>Dream Home?</span></h2>
          <p style={{ fontSize: '15px', color: '#6F6A5F', marginBottom: '28px' }}>Join thousands of Americans discovering exceptional properties every day.</p>
          <Link href="/signup" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff', background: '#b49a64', padding: '14px 36px', borderRadius: '50px', textDecoration: 'none' }}>Get Started Today →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1E1B14', padding: '50px 0 30px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
          <div className="footer-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#b49a64', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#fff' }}>E</div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: '18px', color: '#FFFFFF' }}>ESTATEX</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: '240px' }}>America's most refined real estate platform.</p>
            </div>
            {[
              { title: 'Platform', links: ['For Buyers', 'For Realtors', 'How It Works', 'Pricing'] },
              { title: 'Resources', links: ['Blog', 'About', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'FAQs'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: '#b49a64', marginBottom: '16px' }}>{col.title.toUpperCase()}</div>
                {col.links.map(l => (
                  <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '')}`} style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '8px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#b49a64'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>© 2025 Estatex. All rights reserved.</span>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>support@estatex.com · +1 (800) 555-0199</div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}