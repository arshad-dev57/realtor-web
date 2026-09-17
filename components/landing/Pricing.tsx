'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const plans = [
  {
    role: 'Buyer', price: '999',
    desc: 'For property seekers ready to find their perfect home.',
    perks: ['Unlimited property search', 'City-level browse (KHI, LHR, ISB)', 'Direct realtor contact', 'Schedule unlimited tours', 'Save & track favourites', 'Price drop alerts'],
  },
  {
    role: 'Realtor', price: '2,499',
    desc: 'For real estate professionals ready to scale.',
    perks: ['List unlimited properties', 'Request buyer leads from admin', 'Manage tour requests', 'Full listing analytics', 'Priority listing placement', 'Dedicated realtor profile'],
    featured: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: '160px 0', background: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: 'rgba(201,169,110,0.45)', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>PRICING</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 16 }}>
            One Payment.<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Lifetime Access.</em>
          </h2>
          <p style={{ fontSize: 15, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.35)', fontWeight: 300 }}>No monthly fees. No hidden costs. Pay once and own the platform forever.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 860, margin: '0 auto' }}>
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={p.featured ? { y: -8, transition: { duration: 0.3 } } : undefined}
              style={{
                padding: 44,
                borderRadius: 20,
                background: p.featured ? 'linear-gradient(160deg, #141414, #1a1508)' : '#fff',
                border: p.featured ? '1px solid rgba(201,169,110,0.2)' : '1px solid rgba(201,169,110,0.1)',
                position: 'relative',
                transition: 'all 0.4s ease',
                ...(p.featured ? { boxShadow: '0 30px 80px rgba(201,169,110,0.08)' } : {}),
              }}
            >
              {p.featured && (
                <div style={{
                  position: 'absolute', top: 22, right: 22,
                  padding: '6px 14px', background: '#C9A96E', color: '#0A0A0A',
                  fontSize: 9, letterSpacing: 2.5, fontFamily: "'Jost', sans-serif", fontWeight: 700, borderRadius: 6,
                }}>MOST POPULAR</div>
              )}

              <div style={{ fontSize: 11, letterSpacing: 3.5, fontFamily: "'Jost', sans-serif", fontWeight: 600, color: p.featured ? '#C9A96E' : 'rgba(201,169,110,0.5)', marginBottom: 20 }}>{p.role.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontFamily: "'Jost', sans-serif", color: p.featured ? 'rgba(245,240,232,0.5)' : '#999' }}>PKR</span>
                <span style={{ fontSize: 52, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: p.featured ? '#F5F0E8' : '#0D0D0D', lineHeight: 1 }}>{p.price}</span>
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2.5, fontFamily: "'Jost', sans-serif", color: p.featured ? 'rgba(201,169,110,0.35)' : '#bbb', marginBottom: 10 }}>ONE-TIME PAYMENT</div>
              <p style={{ fontSize: 14, fontFamily: "'Jost', sans-serif", color: p.featured ? 'rgba(245,240,232,0.35)' : '#888', marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>{p.desc}</p>

              <div style={{ borderTop: `1px solid ${p.featured ? 'rgba(201,169,110,0.1)' : 'rgba(201,169,110,0.1)'}`, paddingTop: 28, marginBottom: 32 }}>
                {p.perks.map((k, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{ color: '#C9A96E', fontSize: 10 }}>◆</span>
                    <span style={{ fontSize: 13, fontFamily: "'Jost', sans-serif", color: p.featured ? 'rgba(245,240,232,0.55)' : '#666', fontWeight: 400 }}>{k}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/signup"
                style={{
                  display: 'block', textAlign: 'center', padding: '16px 24px',
                  fontSize: 12, letterSpacing: 2.5, fontWeight: 600,
                  background: p.featured ? '#C9A96E' : '#0D0D0D',
                  color: p.featured ? '#0A0A0A' : '#F5F0E8',
                  borderRadius: 10, textDecoration: 'none',
                  fontFamily: "'Jost', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(201,169,110,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                GET STARTED
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
