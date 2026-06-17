import { useSession } from '../../state/session';

const C = {
  bg: '#FBF7F0', ink: '#211D17', mid: '#6B6358', soft: '#9C9384',
  border: '#EDE5D8', clay: '#C5613B', clayDark: '#A84E2E', green: '#3E6B4F',
};

const IMG = (uid: string, w = 700) =>
  `https://images.unsplash.com/photo-${uid}?auto=format&fit=crop&w=${w}&q=72`;

export function Welcome() {
  const setScreen = useSession((s) => s.setScreen);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* ── Nav ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(251,247,240,0.88)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <LogoIcon />
            <span style={{ fontFamily: "'Newsreader', serif", fontSize: 23, fontWeight: 600, letterSpacing: '-0.01em', color: C.ink }}>Even</span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(40px,6vw,64px) 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 56, alignItems: 'center' }}
          className="even-hero-grid">
          {/* Left */}
          <div style={{ animation: 'evenRise .6s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.clayDark, marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.clay, display: 'inline-block' }} />
              Free weekly meal planner
            </div>
            <h1 style={{
              fontFamily: "'Newsreader', serif", fontWeight: 500,
              fontSize: 'clamp(36px, 5.5vw, 60px)', lineHeight: 1.04,
              letterSpacing: '-0.02em', margin: '0 0 22px', color: C.ink,
            }}>
              A whole week of meals, on the budget you actually have.
            </h1>
            <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: C.mid, maxWidth: '30em', margin: '0 0 32px' }}>
              Tell Even your weekly grocery budget and who you're feeding. Get seven days of breakfast, lunch and dinner that fit — with recipes and one tidy shopping list.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <button
                onClick={() => setScreen('setup')}
                style={{
                  fontFamily: 'inherit', fontSize: 17, fontWeight: 600, color: '#fff',
                  background: C.clay, border: 'none', padding: '16px 28px',
                  borderRadius: 13, cursor: 'pointer',
                  boxShadow: '0 8px 22px -10px rgba(197,97,59,0.7)',
                  transition: 'transform .15s, box-shadow .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 26px -10px rgba(197,97,59,0.8)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 22px -10px rgba(197,97,59,0.7)'; }}
              >
                Plan my week →
              </button>
              <span style={{ fontSize: 14, color: C.soft, lineHeight: 1.5 }}>
                Free forever · No account<br />Built for SNAP / EBT budgets
              </span>
            </div>
          </div>

          {/* Right — staggered photos */}
          <div style={{ position: 'relative', height: 440, animation: 'evenFade .9s ease both' }} className="even-hero-photos">
            <div style={{ position: 'absolute', top: 0, right: 0, width: '62%', height: '62%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 50px -22px rgba(33,29,23,0.45)' }}>
              <img src={IMG('1512621776951-a57141f2eefd')} alt="A colourful vegetable bowl" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ position: 'absolute', bottom: 34, left: 0, width: '54%', height: '50%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 50px -22px rgba(33,29,23,0.45)', border: `5px solid ${C.bg}` }}>
              <img src={IMG('1467003909585-2f8a72700288')} alt="A plated salmon dish" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ position: 'absolute', bottom: 0, right: 18, width: '40%', height: '33%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 18px 40px -20px rgba(33,29,23,0.45)', border: `5px solid ${C.bg}` }}>
              <img src={IMG('1490474418585-ba9bad8fd0ea')} alt="A fresh fruit breakfast bowl" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            {/* Floating stats card */}
            <div style={{ position: 'absolute', top: 18, left: 8, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 13, padding: '13px 16px', boxShadow: '0 14px 34px -18px rgba(33,29,23,0.4)' }}>
              <div style={{ fontSize: 12, color: C.soft, fontWeight: 500 }}>This week</div>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: 25, fontWeight: 600, lineHeight: 1 }}>
                $83.40<span style={{ fontSize: 14, color: C.green, fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600 }}> / $90</span>
              </div>
              <div style={{ height: 5, background: '#EFE7DA', borderRadius: 4, marginTop: 8, overflow: 'hidden', width: 140 }}>
                <div style={{ height: '100%', width: '93%', background: C.green, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="even-steps-grid">
          {[
            { n: '01', title: 'Set your budget', desc: 'From $10 to $300 a week. Tell us how many adults and kids you\'re feeding.' },
            { n: '02', title: 'Get your week', desc: 'Seven days of meals that fit your budget and the way you eat. Swap anything you like.' },
            { n: '03', title: 'Shop once', desc: 'One consolidated grocery list, sorted by aisle, with prices and quantities.' },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', border: `1px solid #EDE5D8`, borderRadius: 16, padding: 26 }}>
              <div style={{ fontFamily: "'Newsreader', serif", fontSize: 22, color: C.clay, marginBottom: 10 }}>{s.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: C.ink }}>{s.title}</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, color: C.mid }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Photo strip ── */}
      <section style={{ paddingBottom: 70 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 16px', fontSize: 14, color: C.soft, fontWeight: 500 }}>
          Real meals, not gimmicks
        </div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '0 24px 8px', maxWidth: 1180, margin: '0 auto' }}>
          {[
            '1565299624946-b28f40a0ae38', '1547592180-85f173990554',
            '1502741224143-90386d7f8c82', '1473093226795-af9932fe5856',
            '1505253716362-afaea1d3d1af', '1568901346375-23c9450c58cd',
          ].map(uid => (
            <img key={uid} src={IMG(uid, 420)} alt="" style={{ flexShrink: 0, width: 220, height: 160, objectFit: 'cover', borderRadius: 13, display: 'block' }} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '20px 24px', textAlign: 'center', fontSize: 13, color: C.soft }}>
        Free forever · No account required · USDA-based · Works offline
      </footer>

      <style>{`
        @keyframes evenFade { from { opacity:0 } to { opacity:1 } }
        @keyframes evenRise { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
        @media (max-width: 680px) {
          .even-hero-grid { grid-template-columns: 1fr !important; }
          .even-hero-photos { display: none !important; }
          .even-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function LogoIcon() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#C5613B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 13, height: 2.5, background: '#fff', borderRadius: 2, boxShadow: '0 -5px 0 #fff, 0 5px 0 #fff' }} />
    </div>
  );
}
