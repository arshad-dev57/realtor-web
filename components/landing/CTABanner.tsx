'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTABanner() {
  return (
    <section style={{ padding: '160px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Background image */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src="/images/property-2.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.82)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,169,110,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ fontSize: 80, marginBottom: 28, opacity: 0.1, fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}>⌂</div>
          <h2 style={{ fontSize: 'clamp(38px, 5vw, 58px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 20 }}>
            Your Perfect Property<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Awaits You</em>
          </h2>
          <p style={{ fontSize: 16, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.4)', fontWeight: 300, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.8 }}>
            Join thousands already using EstateX to buy, sell, and invest in Pakistan&apos;s finest properties.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link
              href="/signup"
              style={{ padding: '18px 44px', fontSize: 12, letterSpacing: 2.5, fontWeight: 600, color: '#0A0A0A', background: '#C9A96E', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Jost', sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(201,169,110,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              GET STARTED FREE
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5"/><polyline points="13 6 19 12 13 18" stroke="currentColor" strokeWidth="1.5"/></svg>
            </Link>
            <Link
              href="/login"
              style={{ padding: '18px 44px', fontSize: 12, letterSpacing: 2.5, fontWeight: 500, color: 'rgba(245,240,232,0.7)', background: 'transparent', border: '1px solid rgba(245,240,232,0.2)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Jost', sans-serif", textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.color = '#C9A96E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,240,232,0.2)'; e.currentTarget.style.color = 'rgba(245,240,232,0.7)'; }}
            >
              SIGN IN
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
