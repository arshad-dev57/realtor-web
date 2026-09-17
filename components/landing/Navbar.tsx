'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Properties', 'For Buyers', 'For Realtors', 'Pricing'];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '18px 0',
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,169,110,0.12)' : '1px solid transparent',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #C9A96E, #A88B4A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="#0A0A0A"/></svg>
          </div>
          <span style={{ fontSize: 22, fontWeight: 600, color: '#F5F0E8', fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1 }}>
            Estate<em style={{ fontStyle: 'italic', color: '#C9A96E' }}>X</em>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', gap: 44, alignItems: 'center' }}>
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, '-')}`}
              style={{ fontSize: 11, letterSpacing: 2.5, fontWeight: 500, color: 'rgba(245,240,232,0.5)', textDecoration: 'none', transition: 'color 0.3s', fontFamily: "'Jost', sans-serif", textTransform: 'uppercase' as const }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A96E')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.5)')}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link
            href="/login"
            style={{ padding: '10px 26px', fontSize: 11, letterSpacing: 2, fontWeight: 500, color: 'rgba(245,240,232,0.7)', background: 'transparent', border: '1px solid rgba(245,240,232,0.18)', borderRadius: 8, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.3s ease', fontFamily: "'Jost', sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.18)'; e.currentTarget.style.color = 'rgba(245,240,232,0.7)'; }}
          >
            SIGN IN
          </Link>
          <Link
            href="/signup"
            style={{ padding: '10px 26px', fontSize: 11, letterSpacing: 2, fontWeight: 600, color: '#0A0A0A', background: '#C9A96E', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Jost', sans-serif", textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(201,169,110,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            GET STARTED
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
