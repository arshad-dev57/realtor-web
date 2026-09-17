'use client';
import { motion } from 'framer-motion';

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up and choose your role — whether you\'re a property seeker or an elite realtor ready to grow.', icon: '✦' },
  { num: '02', title: 'Unlock Access', desc: 'A single one-time payment unlocks the full platform — unlimited browsing, listings, and lead requests forever.', icon: '◈' },
  { num: '03', title: 'Achieve Your Goal', desc: 'Buyers discover dream properties across Pakistan\'s finest cities. Realtors request leads, list homes, and close deals.', icon: '◉' },
];

export default function HowItWorks() {
  return (
    <section style={{ padding: '140px 0', background: '#0D0D0D', position: 'relative', overflow: 'hidden' }}>
      {/* Background orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: 'rgba(201,169,110,0.5)', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>THE PROCESS</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', lineHeight: 1.1 }}>
            Three Steps to<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Your New Reality</em>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              style={{
                padding: 44,
                background: 'rgba(201,169,110,0.03)',
                border: '1px solid rgba(201,169,110,0.08)',
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(201,169,110,0.08)';
                e.currentTarget.style.borderColor = 'rgba(201,169,110,0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(201,169,110,0.03)';
                e.currentTarget.style.borderColor = 'rgba(201,169,110,0.08)';
              }}
            >
              {/* Glow corner */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
                <span style={{ fontSize: 14, letterSpacing: 4, color: 'rgba(201,169,110,0.3)', fontFamily: "'Jost', sans-serif", fontWeight: 600 }}>{step.num}</span>
                <span style={{ fontSize: 28, color: 'rgba(201,169,110,0.25)' }}>{step.icon}</span>
              </div>
              <div style={{ width: 36, height: 1, background: 'linear-gradient(to right, #C9A96E, transparent)', marginBottom: 28 }} />
              <h3 style={{ fontSize: 22, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#F5F0E8', marginBottom: 14 }}>{step.title}</h3>
              <p style={{ fontSize: 13, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.4)', lineHeight: 1.9, fontWeight: 300 }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
