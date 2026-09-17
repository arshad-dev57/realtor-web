'use client';
import { motion } from 'framer-motion';

const cities = [
  { name: 'Karachi', area: 'Clifton · DHA · Bahria Town', img: '/images/city-karachi.png', listings: '4,200+' },
  { name: 'Lahore', area: 'DHA · Gulberg · Bahria Town', img: '/images/property-1.png', listings: '5,100+' },
  { name: 'Islamabad', area: 'F-Sectors · DHA · Bahria Town', img: '/images/property-3.png', listings: '2,700+' },
];

export default function CityShowcase() {
  return (
    <section id="properties" style={{ padding: '160px 0', background: '#0D0D0D', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: 'rgba(201,169,110,0.5)', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>EXPLORE BY CITY</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', lineHeight: 1.1 }}>
            Discover Pakistan&apos;s<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Finest Addresses</em>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {cities.map((city, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              style={{ position: 'relative', height: 480, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(201,169,110,0.1)' }}
            >
              <img
                src={city.img}
                alt={city.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(10,10,10,0.85) 100%)' }} />
              <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(201,169,110,0.12)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(201,169,110,0.15)' }}>
                <span style={{ fontSize: 10, letterSpacing: 2, color: '#C9A96E', fontFamily: "'Jost', sans-serif", fontWeight: 600 }}>{city.listings} LISTINGS</span>
              </div>
              <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28 }}>
                <h3 style={{ fontSize: 36, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#F5F0E8', marginBottom: 8 }}>{city.name}</h3>
                <p style={{ fontSize: 12, letterSpacing: 2, color: 'rgba(245,240,232,0.45)', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>{city.area}</p>
                <div style={{ width: 40, height: 1, background: '#C9A96E', marginTop: 16 }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
