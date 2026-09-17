'use client';
import { motion } from 'framer-motion';

const testimonials = [
  { name: 'Sarah Ahmed', role: 'Home Buyer · Karachi', text: 'Found my dream apartment in Clifton in under two weeks. The city filter made it effortless, and booking the tour directly sealed the deal.', avatar: 'SA' },
  { name: 'Omar Farooq', role: 'Elite Realtor · Lahore', text: 'The lead request system changed everything. I get quality buyers from the admin, not cold calls. Closed 3 DHA listings in one month.', avatar: 'OF' },
  { name: 'Fatima Riaz', role: 'Property Investor · Islamabad', text: 'Best real estate platform in Pakistan. The analytics on my listings help me price competitively and close faster.', avatar: 'FR' },
];

export default function Testimonials() {
  return (
    <section style={{ padding: '160px 0', background: '#F5F0E8', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: '#C9A96E', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>TESTIMONIALS</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#0D0D0D', lineHeight: 1.1 }}>
            Stories From Our<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Community</em>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              style={{
                background: '#fff',
                border: '1px solid rgba(201,169,110,0.12)',
                borderRadius: 20,
                padding: 40,
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,169,110,0.12)')}
            >
              {/* Decorative quote */}
              <div style={{ fontSize: 64, fontFamily: "'Cormorant Garamond', serif", color: 'rgba(201,169,110,0.12)', lineHeight: 1, marginBottom: -20, fontWeight: 700 }}>&ldquo;</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#C9A96E', fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontSize: 16, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: '#444', lineHeight: 1.9, marginBottom: 28 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 20, borderTop: '1px solid rgba(201,169,110,0.1)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A96E, #A88B4A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#0A0A0A',
                  fontFamily: "'Jost', sans-serif", flexShrink: 0,
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 15, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#0D0D0D' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa', fontFamily: "'Jost', sans-serif", marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
