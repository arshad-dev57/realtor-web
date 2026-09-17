'use client';

export default function MarqueeStrip() {
  const items = ['LUXURY LIVING', 'SMART INVESTMENTS', 'VERIFIED REALTORS', 'PREMIUM LISTINGS', 'TOUR REQUESTS', 'LEAD MANAGEMENT', 'CITY-WIDE SEARCH', 'ONE-TIME PLAN'];

  return (
    <div style={{ overflow: 'hidden', padding: '22px 0', background: '#0A0A0A', borderTop: '1px solid rgba(201,169,110,0.08)', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
      <div style={{ display: 'flex', animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap' }}>
        {[0, 1].map(k => (
          <span key={k} style={{ display: 'flex', alignItems: 'center' }}>
            {items.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 28, marginRight: 56 }}>
                <span style={{ fontSize: 11, letterSpacing: 5, fontFamily: "'Jost', sans-serif", fontWeight: 500, color: 'rgba(201,169,110,0.45)' }}>{t}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(201,169,110,0.2)', display: 'inline-block' }} />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
