'use client';
import { motion } from 'framer-motion';

const features = [
  { icon: '🔍', label: 'Smart Search', desc: 'Filter by city, price range, bedrooms, and property type with precision.' },
  { icon: '📍', label: 'City-Level Browse', desc: 'Dedicated listings for Karachi, Lahore, and Islamabad neighbourhoods.' },
  { icon: '📅', label: 'Tour Booking', desc: 'Buyers request tours; realtors confirm with a single click.' },
  { icon: '🤝', label: 'Lead System', desc: 'Realtors request verified leads from our admin — quality over quantity.' },
  { icon: '📊', label: 'Analytics', desc: 'Track listing views, enquiries, and performance in real time.' },
  { icon: '🔔', label: 'Instant Alerts', desc: 'Never miss a new listing or buyer request with smart notifications.' },
];

export default function FeaturesGrid() {
  return (
    <section style={{ padding: '160px 0', background: '#F5F0E8', position: 'relative' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: '#C9A96E', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>PLATFORM FEATURES</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#0D0D0D', lineHeight: 1.1, marginBottom: 16 }}>
            Everything You Need<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Under One Roof</em>
          </h2>
          <p style={{ fontSize: 15, fontFamily: "'Jost', sans-serif", color: '#888', fontWeight: 300, maxWidth: 500, margin: '0 auto' }}>
            A premium toolset for every stage of your real estate journey.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              style={{
                background: '#fff',
                border: '1px solid rgba(201,169,110,0.12)',
                borderRadius: 20,
                padding: 40,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)';
                e.currentTarget.style.boxShadow = '0 30px 70px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(201,169,110,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, marginBottom: 24, transition: 'background 0.3s',
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 19, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#0D0D0D', marginBottom: 12 }}>{f.label}</h3>
              <p style={{ fontSize: 13, fontFamily: "'Jost', sans-serif", color: '#999', lineHeight: 1.8, fontWeight: 300 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
