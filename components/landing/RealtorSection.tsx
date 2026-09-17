'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const features = [
  { icon: '◈', text: 'Request curated buyer leads from admin' },
  { icon: '◉', text: 'List unlimited properties instantly' },
  { icon: '✦', text: 'Manage and confirm tour bookings' },
  { icon: '◆', text: 'Track enquiries and property analytics' },
];

const dashStats = [
  ['Lead Requests', '12', '+3 today'],
  ['Active Listings', '24', '+2 this week'],
  ['Tour Requests', '8', '3 pending'],
  ['Properties Sold', '47', 'All time'],
];

const recentLeads = [
  ['Buyer: Ali Hassan', 'F-7 Sector, ISB', 'Approved'],
  ['Buyer: Sara Khan', 'DHA Phase 5', 'Pending'],
];

export default function RealtorSection() {
  return (
    <section id="for-realtors" style={{ padding: '160px 0', background: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
      {/* Gold orbs */}
      <div style={{ position: 'absolute', top: '20%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center', position: 'relative', zIndex: 2 }}>
        {/* Left - Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,110,0.1)', borderRadius: 20, padding: 32, backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(201,169,110,0.5)', fontFamily: "'Jost', sans-serif", marginBottom: 24, fontWeight: 600 }}>REALTOR DASHBOARD</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {dashStats.map(([l, v, s], i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  style={{ padding: 16, background: 'rgba(201,169,110,0.04)', borderRadius: 12, border: '1px solid rgba(201,169,110,0.08)' }}
                >
                  <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'rgba(245,240,232,0.3)', fontFamily: "'Jost', sans-serif", marginBottom: 10 }}>{l.toUpperCase()}</div>
                  <div style={{ fontSize: 28, fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E', fontWeight: 600 }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)', fontFamily: "'Jost', sans-serif", marginTop: 4 }}>{s}</div>
                </motion.div>
              ))}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: 'rgba(245,240,232,0.2)', fontFamily: "'Jost', sans-serif", marginBottom: 12 }}>RECENT LEAD REQUESTS</div>
            {recentLeads.map(([n, l, s], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#F5F0E8', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>{n}</div>
                  <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)', fontFamily: "'Jost', sans-serif", marginTop: 2 }}>{l}</div>
                </div>
                <div style={{ padding: '5px 12px', background: s === 'Approved' ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.04)', borderRadius: 5, fontSize: 9, letterSpacing: 1.5, color: s === 'Approved' ? '#C9A96E' : 'rgba(255,255,255,0.35)', fontFamily: "'Jost', sans-serif", fontWeight: 600 }}>{s.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right - Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: '#C9A96E', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>FOR REALTORS</div>
          <h2 style={{ fontSize: 'clamp(36px, 4.5vw, 52px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 20 }}>
            Build Your<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Empire</em>,<br />Close More Deals
          </h2>
          <p style={{ fontSize: 15, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.45)', lineHeight: 1.9, fontWeight: 300, marginBottom: 32, maxWidth: 420 }}>
            Request high-quality leads from our admin team, list unlimited properties, and manage buyer tour requests — all in one powerful dashboard built for serious realtors.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14 }}
              >
                <span style={{ color: '#C9A96E', fontSize: 14 }}>{f.icon}</span>
                <span style={{ fontSize: 14, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.55)', fontWeight: 400 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>
          <Link
            href="/signup"
            style={{ padding: '16px 36px', fontSize: 12, letterSpacing: 2.5, fontWeight: 600, color: '#0A0A0A', background: '#C9A96E', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: "'Jost', sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(201,169,110,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            JOIN AS REALTOR
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5"/><polyline points="13 6 19 12 13 18" stroke="currentColor" strokeWidth="1.5"/></svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
