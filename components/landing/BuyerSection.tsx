'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { icon: '◈', text: 'City & neighbourhood-level search' },
  { icon: '◉', text: 'Direct contact with verified realtors' },
  { icon: '✦', text: 'Schedule property tour requests' },
  { icon: '◆', text: 'Save favourites & get price alerts' },
];

export default function BuyerSection() {
  return (
    <section id="for-buyers" style={{ padding: '160px 0', background: '#F5F0E8', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.015, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A96E'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center', position: 'relative', zIndex: 2 }}>
        {/* Left - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: '#C9A96E', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>FOR BUYERS</div>
          <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 52px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#0D0D0D', lineHeight: 1.1, marginBottom: 20 }}>
            Find Your<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Perfect Home</em><br />By City
          </h2>
          <p style={{ fontSize: 15, fontFamily: "'Jost', sans-serif", color: '#777', lineHeight: 1.9, fontWeight: 300, marginBottom: 32, maxWidth: 420 }}>
            Search across Karachi, Lahore, and Islamabad&apos;s most prestigious neighbourhoods. Filter by price, size, type — and step inside with a scheduled tour request.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <span style={{ color: '#C9A96E', fontSize: 14 }}>{f.icon}</span>
                <span style={{ fontSize: 14, fontFamily: "'Jost', sans-serif", color: '#555', fontWeight: 400 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
          <Link
            href="/signup"
            style={{ padding: '16px 36px', fontSize: 12, letterSpacing: 2.5, fontWeight: 600, color: '#F5F0E8', background: '#0D0D0D', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Jost', sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#C9A96E'; e.currentTarget.style.color = '#0D0D0D'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0D0D0D'; e.currentTarget.style.color = '#F5F0E8'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            EXPLORE PROPERTIES
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5"/><polyline points="13 6 19 12 13 18" stroke="currentColor" strokeWidth="1.5"/></svg>
          </Link>
        </motion.div>

        {/* Right - Property Card Visual */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ position: 'relative' }}
        >
          {/* Main property card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 0, boxShadow: '0 40px 100px rgba(0,0,0,0.12)', border: '1px solid rgba(201,169,110,0.15)', overflow: 'hidden' }}>
            <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
              <img src="/images/property-1.png" alt="Luxury Villa" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(201,169,110,0.95)', padding: '6px 14px', borderRadius: 6 }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: '#0A0A0A', fontFamily: "'Jost', sans-serif", fontWeight: 600 }}>FOR SALE</span>
              </div>
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: '#C9A96E', fontFamily: "'Jost', sans-serif", marginBottom: 6 }}>DHA PHASE 6 · LAHORE</div>
              <div style={{ fontSize: 22, fontFamily: "'Cormorant Garamond', serif", color: '#0D0D0D', fontWeight: 600, marginBottom: 12 }}>Modern Villa</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 24, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: '#0D0D0D' }}>PKR 3.2 Cr</span>
                <div style={{ display: 'flex', gap: 16 }}>
                  {['4 Bed', '3 Bath', '450 yd²'].map(s => <span key={s} style={{ fontSize: 11, color: '#999', fontFamily: "'Jost', sans-serif" }}>{s}</span>)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(201,169,110,0.15)' }}>
                <button style={{ flex: 1, padding: 12, background: '#0D0D0D', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, letterSpacing: 1.5, fontFamily: "'Jost', sans-serif", cursor: 'pointer', fontWeight: 500 }}>CONTACT REALTOR</button>
                <button style={{ flex: 1, padding: 12, background: 'transparent', color: '#C9A96E', border: '1px solid #C9A96E', borderRadius: 8, fontSize: 11, letterSpacing: 1.5, fontFamily: "'Jost', sans-serif", cursor: 'pointer', fontWeight: 500 }}>BOOK TOUR</button>
              </div>
            </div>
          </div>

          {/* Floating city badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: -24, right: -24, background: '#0D0D0D', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 16, padding: '18px 22px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}
          >
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'rgba(245,240,232,0.35)', fontFamily: "'Jost', sans-serif", marginBottom: 10 }}>SEARCHING IN</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['KHI', 'LHR', 'ISB'].map((c, i) => (
                <div key={i} style={{ padding: '7px 14px', background: i === 1 ? '#C9A96E' : 'rgba(255,255,255,0.06)', borderRadius: 6, fontSize: 11, letterSpacing: 1.5, color: i === 1 ? '#0A0A0A' : 'rgba(255,255,255,0.45)', fontFamily: "'Jost', sans-serif", fontWeight: 600 }}>{c}</div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
