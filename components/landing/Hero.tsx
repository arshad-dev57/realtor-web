'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

// ── Animated letter variants ──────────────────────────────────────────────────
const letterVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.8 + i * 0.025,
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
} as any;

function AnimatedText({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ display: 'inline-block', perspective: 800, ...style }}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ── Building window helper ────────────────────────────────────────────────────
function Building({
  width,
  height,
  delay,
}: {
  width: number;
  height: number;
  delay: number;
}) {
  const rows = Math.floor(height / 22);
  const cols = Math.floor(width / 13);
  const windows: React.ReactNode[] = [];

  for (let r = 1; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.42) {
        const lit = Math.random() > 0.48;
        windows.push(
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              width: 6,
              height: 8,
              left: 4 + c * 13,
              top: r * 22,
              background: lit
                ? 'rgba(212,174,114,0.18)'
                : 'rgba(184,150,90,0.04)',
              border: `1px solid rgba(184,150,90,${lit ? '0.2' : '0.06'})`,
            }}
          />
        );
      }
    }
  }

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        width,
        height,
        flexShrink: 0,
        background: 'linear-gradient(to top, #171720, #0f0f14)',
        borderTop: '1px solid rgba(184,150,90,0.1)',
      }}
    >
      {windows}
    </motion.div>
  );
}

// ── Star field ────────────────────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() < 0.15 ? 2.5 : 1.5,
    opacity: Math.random() * 0.4 + 0.1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {stars.map((s) => (
        <motion.div
          key={s.id}
          animate={{ opacity: [s.opacity, 0.05, s.opacity] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#F5F1EA',
          }}
        />
      ))}
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Building specs: [width, height, animDelay]
  const buildings: [number, number, number][] = [
    [38, 160, 0.35], [28, 110, 0.5],  [55, 220, 0.15], [35, 150, 0.4],
    [72, 290, 0.06], [25, 180, 0.45], [50, 260, 0.12], [30, 140, 0.55],
    [65, 250, 0.08], [42, 175, 0.3],  [22, 105, 0.6],  [48, 210, 0.18],
    [32, 158, 0.42], [60, 240, 0.09], [28, 132, 0.52], [38, 188, 0.28],
    [54, 268, 0.14], [30, 148, 0.48], [70, 285, 0.04], [36, 168, 0.38],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@200;300;400;500&display=swap');

        @keyframes gridScroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes scrollPulse {
          0%   { height: 0;    top: 0;    opacity: 1; }
          50%  { height: 100%; top: 0;    opacity: 1; }
          51%  { height: 100%; top: 0;    opacity: 0; }
          100% { height: 0;    top: 100%; opacity: 0; }
        }
        @keyframes orbDrift1 {
          0%   { transform: translate(0,0); }
          100% { transform: translate(40px, 30px); }
        }
        @keyframes orbDrift2 {
          0%   { transform: translate(0,0); }
          100% { transform: translate(-30px, 20px); }
        }
        .hero-btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 14px 34px;
          background: linear-gradient(135deg, #D4AE72, #B8965A, #8B6830);
          color: #0C0C0E;
          text-decoration: none;
          border-radius: 1px;
          display: inline-block;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hero-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 44px rgba(184,150,90,0.32);
        }
        .hero-btn-primary:hover::after { opacity: 1; }

        .hero-btn-ghost {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 13px 34px;
          background: transparent;
          border: 1px solid rgba(245,241,234,0.2);
          color: rgba(245,241,234,0.6);
          text-decoration: none;
          border-radius: 1px;
          display: inline-block;
          transition: border-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
        }
        .hero-btn-ghost:hover {
          border-color: #B8965A;
          color: #D4AE72;
          transform: translateY(-2px);
        }
      `}</style>

      <section
        ref={ref}
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0C0C0E',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Parallax Background Layer ── */}
        <motion.div
          style={{
            position: 'absolute',
            inset: '-10%',
            width: '120%',
            height: '120%',
            y: bgY,
          }}
        >
          {/* Sky gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 80% 60% at 50% 110%, #1e1a14 0%, #0e0d10 55%, #080810 100%)',
            }}
          />

          {/* Perspective grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right, rgba(184,150,90,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(184,150,90,0.05) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              animation: 'gridScroll 20s linear infinite',
            }}
          />

          {/* Ambient orbs */}
          <div
            style={{
              position: 'absolute',
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'rgba(184,150,90,0.07)',
              filter: 'blur(70px)',
              top: -100,
              left: -60,
              animation: 'orbDrift1 14s ease-in-out infinite alternate',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'rgba(120,100,200,0.05)',
              filter: 'blur(60px)',
              top: 80,
              right: -40,
              animation: 'orbDrift2 10s ease-in-out infinite alternate',
            }}
          />

          {/* Stars */}
          <StarField />

          {/* Horizon glow */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 300,
              background:
                'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(184,150,90,0.16) 0%, rgba(184,150,90,0.05) 40%, transparent 70%)',
            }}
          />

          {/* Skyline */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 320,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {buildings.map(([w, h, d], i) => (
              <Building key={i} width={w} height={h} delay={d} />
            ))}
          </div>

          {/* Bottom city fade */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 220,
              background:
                'linear-gradient(to top, rgba(8,8,12,0.97) 0%, transparent 100%)',
            }}
          />
        </motion.div>

        {/* ── Vignette ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(8,8,12,0.55) 100%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />

        {/* ── Corner Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            zIndex: 20,
            border: '1px solid rgba(184,150,90,0.25)',
            padding: '10px 16px',
          }}
        >
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 9,
              letterSpacing: '0.35em',
              color: '#B8965A',
              textTransform: 'uppercase',
            }}
          >
            Est. 2012
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              color: '#F5F1EA',
              marginTop: 2,
            }}
          >
            Prestige Group
          </div>
        </motion.div>

        {/* ── Side Tag ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          style={{
            position: 'absolute',
            left: 32,
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            transformOrigin: 'center center',
            zIndex: 20,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 9,
            fontWeight: 300,
            letterSpacing: '0.38em',
            color: 'rgba(245,241,234,0.2)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Karachi · Dubai · London
        </motion.div>

        {/* ── Nav Dots ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 20,
          }}
        >
          {[true, false, false].map((active, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: active ? '#B8965A' : 'rgba(245,241,234,0.2)',
                transform: active ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </motion.div>

        {/* ── Main Content ── */}
        <motion.div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            y: textY,
            opacity,
            padding: '0 24px',
            maxWidth: 820,
          }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div style={{ width: 32, height: 1, background: '#B8965A' }} />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 400,
                letterSpacing: '0.38em',
                color: '#B8965A',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Luxury Real Estate
            </p>
            <div style={{ width: 32, height: 1, background: '#B8965A' }} />
          </motion.div>

          {/* Main heading */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              lineHeight: 1.08,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            {/* Line 1 — solid white */}
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(46px, 7vw, 86px)',
                color: '#F5F1EA',
              }}
            >
              <AnimatedText text="Extraordinary" />
            </span>

            {/* Line 2 — outline ghost */}
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(46px, 7vw, 86px)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(245,241,234,0.28)',
                fontStyle: 'italic',
                marginTop: -6,
              }}
            >
              <AnimatedText text="Living" />
            </span>

            {/* Line 3 — gold gradient */}
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(46px, 7vw, 86px)',
                background:
                  'linear-gradient(135deg, #EDD899 0%, #D4AE72 40%, #8B6830 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
                marginTop: -6,
              }}
            >
              <AnimatedText text="Redefined" />
            </span>
          </h1>

          {/* Diamond divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              margin: '24px 0',
            }}
          >
            <div
              style={{
                flex: 1,
                maxWidth: 64,
                height: 1,
                background:
                  'linear-gradient(to right, transparent, #D4AE72)',
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                background: '#B8965A',
                transform: 'rotate(45deg)',
              }}
            />
            <div
              style={{
                flex: 1,
                maxWidth: 64,
                height: 1,
                background:
                  'linear-gradient(to left, transparent, #D4AE72)',
              }}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: '0.2em',
              color: 'rgba(245,241,234,0.42)',
              textTransform: 'uppercase',
              marginBottom: 44,
              lineHeight: 2,
            }}
          >
            Discover curated residences crafted for distinguished living
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link href="/listings" className="hero-btn-primary">
              Explore Listings
            </Link>
            <Link href="/contact" className="hero-btn-ghost">
              Schedule a Tour
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Bottom Stats Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 48px 28px',
            zIndex: 10,
          }}
        >
          {/* Stat left */}
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 400,
                color: '#D4AE72',
                lineHeight: 1,
              }}
            >
              500+
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9,
                fontWeight: 300,
                letterSpacing: '0.3em',
                color: 'rgba(245,241,234,0.35)',
                textTransform: 'uppercase',
                marginTop: 5,
              }}
            >
              Premium Properties
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9,
                letterSpacing: '0.32em',
                color: 'rgba(245,241,234,0.22)',
                textTransform: 'uppercase',
              }}
            >
              Scroll
            </span>
            <div
              style={{
                width: 1,
                height: 48,
                background: 'rgba(245,241,234,0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  background: '#B8965A',
                  animation: 'scrollPulse 2.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* Stat right */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 400,
                color: '#D4AE72',
                lineHeight: 1,
              }}
            >
              12yr
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 9,
                fontWeight: 300,
                letterSpacing: '0.3em',
                color: 'rgba(245,241,234,0.35)',
                textTransform: 'uppercase',
                marginTop: 5,
              }}
            >
              Market Expertise
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}