'use client';
import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function AnimatedCounter({ value, suffix, label, icon }: { value: number; suffix: string; label: string; icon: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = value / (1800 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        padding: '48px 24px',
        border: '1px solid rgba(201,169,110,0.08)',
        borderRadius: 20,
        background: 'rgba(201,169,110,0.02)',
        textAlign: 'center',
        transition: 'all 0.4s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.2)';
        e.currentTarget.style.background = 'rgba(201,169,110,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(201,169,110,0.08)';
        e.currentTarget.style.background = 'rgba(201,169,110,0.02)';
      }}
    >
      <div style={{ fontSize: 22, color: 'rgba(201,169,110,0.25)', marginBottom: 22 }}>{icon}</div>
      <div style={{ fontSize: 56, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#C9A96E', lineHeight: 1 }}>{count}{suffix}</div>
      <div style={{ fontSize: 10, letterSpacing: 3.5, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.25)', marginTop: 14, fontWeight: 500 }}>{label.toUpperCase()}</div>
    </motion.div>
  );
}

export default function StatsCounter() {
  return (
    <section style={{ padding: '160px 0', background: '#0A0A0A', position: 'relative', overflow: 'hidden' }}>
      {/* Gold glow orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 80 }}
        >
          <div style={{ fontSize: 10, letterSpacing: 5, fontWeight: 600, color: 'rgba(201,169,110,0.45)', fontFamily: "'Jost', sans-serif", marginBottom: 18 }}>BY THE NUMBERS</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', lineHeight: 1.1 }}>
            A Platform Built on<br /><em style={{ fontStyle: 'italic', color: '#C9A96E' }}>Results</em>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <AnimatedCounter value={50} suffix="K+" label="Happy Clients" icon="✦" />
          <AnimatedCounter value={100} suffix="K+" label="Properties Listed" icon="◈" />
          <AnimatedCounter value={3} suffix="" label="Major Cities" icon="◉" />
          <AnimatedCounter value={98} suffix="%" label="Satisfaction Rate" icon="◆" />
        </div>
      </div>
    </section>
  );
}
