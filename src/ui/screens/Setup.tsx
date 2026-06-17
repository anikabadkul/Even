import { useRef, useEffect } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const C = {
  bg: '#FBF7F0', ink: '#211D17', mid: '#6B6358', soft: '#9C9384',
  border: '#EDE5D8', innerBorder: '#E0D7C8', clay: '#C5613B', clayDark: '#A84E2E',
  cardBg: '#fff', activeBg: '#FBF3EE',
};

const DIETS: { label: DietLabel; desc: string }[] = [
  { label: 'Vegan',       desc: 'Plants only'       },
  { label: 'Vegetarian',  desc: 'No meat'            },
  { label: 'Omnivore',    desc: 'Everything'         },
  { label: 'Halal',       desc: 'Halal-certified'    },
  { label: 'Gluten-free', desc: 'No gluten'          },
];

function LogoIcon() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.clay, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 13, height: 2.5, background: '#fff', borderRadius: 2, boxShadow: '0 -5px 0 #fff, 0 5px 0 #fff' }} />
    </div>
  );
}

export function Setup() {
  const {
    budget, adults, kids, diet,
    setScreen, setBudget, setAdults, setKids, setDiet,
    rebuildIfDietChanged,
  } = useSession();
  const headRef = useRef<HTMLDivElement>(null);
  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, []);

  const size = Math.max(1, adults + kids);
  const floor = floorFor(size);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <h2 className="sr-only">Set up your week</h2>

      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(251,247,240,0.88)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }} onClick={() => setScreen('welcome')}>
            <LogoIcon />
            <span style={{ fontFamily: "'Newsreader', serif", fontSize: 23, fontWeight: 600, letterSpacing: '-0.01em', color: C.ink }}>Even</span>
          </div>
        </div>
      </header>

      {/* Form */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div ref={headRef} tabIndex={-1} style={{ outline: 'none', textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 'clamp(28px, 5vw, 40px)', letterSpacing: '-0.02em', margin: '0 0 10px', color: C.ink }}>
            Let's build your week
          </h1>
          <p style={{ fontSize: 17, color: C.mid, margin: 0 }}>Three quick things. You can change any of them later.</p>
        </div>

        {/* Budget */}
        <section style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 30, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <label style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Weekly grocery budget</label>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 34, fontWeight: 600, lineHeight: 1, color: C.clayDark }}>
              ${Math.round(budget)}
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.mid, margin: '0 0 18px' }}>
            What you'd comfortably spend on groceries each week.
          </p>
          <input
            type="range" min={10} max={300} step={5}
            value={Math.min(300, budget)}
            aria-label="Weekly grocery budget slider"
            onChange={e => setBudget(parseFloat(e.target.value))}
            style={{ width: '100%', height: 6, cursor: 'pointer', accentColor: C.clay } as React.CSSProperties}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: C.soft, marginTop: 8 }}>
            <span>$10</span><span>$300</span>
          </div>
          {floor > 0 && (
            <p style={{ fontSize: 12.5, color: C.soft, marginTop: 10, marginBottom: 0 }}>
              SNAP thrifty plan averages ~$43/week per person. A complete week for your household costs ~{f(floor)}.
            </p>
          )}
        </section>

        {/* Household */}
        <section style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 30, marginBottom: 20 }}>
          <label style={{ fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 4, color: C.ink }}>Who's eating?</label>
          <p style={{ fontSize: 14, color: C.mid, margin: '0 0 20px' }}>We size every recipe and the shopping list to match.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {([
              { label: 'Adults', sub: '1 to 4', val: adults, min: 1, max: 4, set: setAdults },
              { label: 'Children', sub: '0 to 3', val: kids, min: 0, max: 3, set: setKids },
            ] as const).map(row => (
              <div key={row.label} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: C.soft }}>{row.sub}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    onClick={() => row.set(Math.max(row.min, row.val - 1))}
                    style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.innerBorder}`, background: C.bg, fontSize: 20, color: C.ink, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1, transition: 'all .13s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#EDE5D8'; }}
                    onMouseOut={e => { e.currentTarget.style.background = C.bg; }}
                  >–</button>
                  <span style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 600, minWidth: 20, textAlign: 'center', color: C.ink }}>{row.val}</span>
                  <button
                    onClick={() => row.set(Math.min(row.max, row.val + 1))}
                    style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.innerBorder}`, background: C.bg, fontSize: 20, color: C.ink, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1, transition: 'all .13s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#EDE5D8'; }}
                    onMouseOut={e => { e.currentTarget.style.background = C.bg; }}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Diet */}
        <section style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 18, padding: 30, marginBottom: 28 }}>
          <label style={{ fontSize: 16, fontWeight: 600, display: 'block', marginBottom: 4, color: C.ink }}>How do you eat?</label>
          <p style={{ fontSize: 14, color: C.mid, margin: '0 0 20px' }}>Pick one — every meal will respect it.</p>
          <div role="group" aria-label="Dietary preference" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))', gap: 12 }}>
            {DIETS.map(d => {
              const active = diet === d.label;
              return (
                <button
                  key={d.label}
                  aria-pressed={active}
                  onClick={() => setDiet(d.label)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 4,
                    alignItems: 'flex-start', textAlign: 'left', fontFamily: 'inherit',
                    padding: '15px 16px', borderRadius: 13, cursor: 'pointer', transition: 'all .15s',
                    border: `1.5px solid ${active ? C.clay : C.border}`,
                    background: active ? C.activeBg : C.cardBg,
                    boxShadow: active ? '0 6px 18px -12px rgba(197,97,59,0.7)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 15.5, fontWeight: 600, color: active ? C.clayDark : C.ink }}>{d.label}</span>
                  <span style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.35 }}>{d.desc}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <button
          onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
          style={{
            width: '100%', fontFamily: 'inherit', fontSize: 18, fontWeight: 600,
            color: '#fff', background: C.clay, border: 'none',
            padding: 18, borderRadius: 14, cursor: 'pointer',
            boxShadow: '0 10px 26px -12px rgba(197,97,59,0.8)',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#B0532F'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { e.currentTarget.style.background = C.clay; e.currentTarget.style.transform = ''; }}
        >
          Generate my week →
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: C.soft, margin: '16px 0 0' }}>
          We'll fit seven days of meals inside ${Math.round(budget)}.
        </p>
      </main>
    </div>
  );
}
