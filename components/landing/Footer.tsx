'use client';
import Link from 'next/link';

export default function Footer() {
  const columns = [
    { title: 'Platform', links: ['For Buyers', 'For Realtors', 'How It Works', 'Pricing'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
    { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy'] },
  ];

  return (
    <footer style={{ background: '#0A0A0A', padding: '90px 0 44px', borderTop: '1px solid rgba(201,169,110,0.06)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
        {/* Large brand name */}
        <div style={{ marginBottom: 80, textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(60px, 10vw, 120px)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: 'rgba(245,240,232,0.04)', lineHeight: 1, letterSpacing: 8, userSelect: 'none' }}>
            ESTATEX
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
          {/* Brand col */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #C9A96E, #A88B4A)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" fill="#0A0A0A"/></svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 600, color: '#F5F0E8', fontFamily: "'Cormorant Garamond', serif", letterSpacing: 1 }}>
                Estate<em style={{ fontStyle: 'italic', color: '#C9A96E' }}>X</em>
              </span>
            </Link>
            <p style={{ fontSize: 13, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.25)', lineHeight: 1.9, maxWidth: 260, fontWeight: 300 }}>
              Pakistan&apos;s premier real estate platform for buyers and elite realtors.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, letterSpacing: 3.5, fontFamily: "'Jost', sans-serif", fontWeight: 600, color: 'rgba(201,169,110,0.4)', marginBottom: 22 }}>{col.title.toUpperCase()}</div>
              {col.links.map(l => (
                <a
                  key={l}
                  href="#"
                  style={{ display: 'block', fontSize: 13, fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,0.25)', textDecoration: 'none', marginBottom: 14, transition: 'all 0.2s ease', fontWeight: 300, paddingLeft: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#C9A96E'; e.currentTarget.style.paddingLeft = '8px'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,232,0.25)'; e.currentTarget.style.paddingLeft = '0'; }}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}

          {/* Contact */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3.5, fontFamily: "'Jost', sans-serif", fontWeight: 600, color: 'rgba(201,169,110,0.4)', marginBottom: 22 }}>CONTACT</div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.25)', fontFamily: "'Jost', sans-serif", marginBottom: 10, fontWeight: 300 }}>support@estatex.pk</p>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.25)', fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>+92 300 000 0000</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(245,240,232,0.05)', paddingTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.15)', fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>© 2024 EstateX. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Facebook', 'Instagram', 'LinkedIn'].map(s => (
              <a
                key={s}
                href="#"
                style={{ fontSize: 11, color: 'rgba(245,240,232,0.15)', fontFamily: "'Jost', sans-serif", textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A96E')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.15)')}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
