import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

const chip = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '11px 0', borderRadius: 10,
  background: active ? '#ddd5be' : 'rgba(255,255,255,0.06)',
  color: active ? '#0a0f0b' : 'rgba(221,213,190,0.7)',
  border: `${active ? 2 : 1}px solid ${active ? '#ddd5be' : 'rgba(255,255,255,0.14)'}`,
  fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
});

export function Setup() {
  const {
    budget, adults, kids, diet, aiStatus, capabilities,
    setScreen, setBudget, setAdults, setKids, setDiet,
    rebuildIfDietChanged, generateWithAI,
  } = useSession();
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, []);

  const size = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh = householdLabel({ adults, kids });

  return (
    <div
      className="animate-[fade-in_.4s_ease_both]"
      style={{
        minHeight: '100vh',
        background: '#0a0f0b',
        backgroundImage: [
          'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(46,102,68,0.38) 0%, transparent 68%)',
          'radial-gradient(ellipse 60% 35% at 50% 105%, rgba(20,46,26,0.25) 0%, transparent 60%)',
        ].join(', '),
      }}
    >
      <h2 className="sr-only">Set up your week</h2>

      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.04,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', paddingTop: 'clamp(44px, 7vw, 80px)' }}>
          <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.38em', color: '#3d6647', textTransform: 'uppercase' }}>
            Free meal planner · 2026
          </span>

          <h1
            ref={headRef}
            tabIndex={-1}
            className="font-serif font-bold"
            style={{
              fontSize: 'clamp(80px, 19vw, 196px)',
              lineHeight: 0.88, letterSpacing: '-0.04em',
              color: '#ddd5be', marginTop: 10, marginBottom: 16,
              outline: 'none',
            }}
          >
            Even
          </h1>

          <p className="font-serif italic" style={{ fontSize: 'clamp(16px, 2.2vw, 21px)', color: '#4a7a58', marginBottom: 'clamp(36px, 6vw, 60px)' }}>
            Eat well on what you actually have.
          </p>
        </div>

        {/* ── Form panel ── */}
        <div
          style={{
            background: 'rgba(221,213,190,0.03)',
            border: '1px solid rgba(221,213,190,0.09)',
            borderRadius: 22,
            padding: '32px 32px 28px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          } as React.CSSProperties}
        >

          {/* Budget */}
          <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid rgba(221,213,190,0.09)' }}>
            <span className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.3em', color: '#5d9470', textTransform: 'uppercase', marginBottom: 16 }}>
              Weekly grocery budget
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                aria-label="Decrease budget"
                onClick={() => setBudget(Math.max(10, budget - 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)',
                  color: 'rgba(221,213,190,0.55)', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#ddd5be'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(221,213,190,0.55)'; }}
              >−</button>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 3 }}>
                  <span className="font-serif" style={{ fontSize: 24, color: '#4a7a58', marginTop: 12, lineHeight: 1 }}>$</span>
                  <span className="font-serif font-bold" style={{ fontSize: 'clamp(60px, 11vw, 92px)', lineHeight: 1, letterSpacing: '-0.03em', color: '#e8dfc8' }}>
                    {Math.round(budget)}
                  </span>
                </div>
                <p className="font-mono" style={{ fontSize: 11.5, color: '#4a7a58', marginTop: 3 }}>{f(budget / 7)} / day</p>
              </div>

              <button
                aria-label="Increase budget"
                onClick={() => setBudget(Math.min(400, budget + 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)',
                  color: 'rgba(221,213,190,0.55)', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#ddd5be'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(221,213,190,0.55)'; }}
              >+</button>
            </div>
            <input
              type="range" min={10} max={300} step={1}
              value={Math.min(300, budget)}
              aria-label="Weekly grocery budget slider"
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: 18, accentColor: '#3a7a50' } as React.CSSProperties}
            />
            <p style={{ fontSize: 12, color: '#3d6647', marginTop: 8 }}>SNAP averages about $43/week per person.</p>
          </div>

          {/* Household */}
          <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: '1px solid rgba(221,213,190,0.09)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <span className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.3em', color: '#5d9470', textTransform: 'uppercase', marginBottom: 12 }}>Adults</span>
                <div role="group" aria-label="Number of adults" style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4].map((x) => (
                    <button key={x} aria-pressed={adults === x} onClick={() => setAdults(x)} style={chip(adults === x)}>{x}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.3em', color: '#5d9470', textTransform: 'uppercase', marginBottom: 12 }}>Children</span>
                <div role="group" aria-label="Number of children" style={{ display: 'flex', gap: 8 }}>
                  {[0, 1, 2, 3].map((x) => (
                    <button key={x} aria-pressed={kids === x} onClick={() => setKids(x)} style={chip(kids === x)}>{x}</button>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#3d6647', marginTop: 12 }}>
              Complete week for {hh}: ~{f(floor)} (USDA minimum).
            </p>
          </div>

          {/* Diet */}
          <div>
            <span className="font-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.3em', color: '#5d9470', textTransform: 'uppercase', marginBottom: 12 }}>How do you eat?</span>
            <div role="group" aria-label="Dietary preference" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIETS.map((d) => (
                <button
                  key={d}
                  aria-pressed={diet === d}
                  onClick={() => setDiet(d)}
                  style={{
                    padding: '8px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
                    background: diet === d ? '#ddd5be' : 'rgba(255,255,255,0.06)',
                    color: diet === d ? '#0a0f0b' : 'rgba(221,213,190,0.7)',
                    border: `${diet === d ? 2 : 1}px solid ${diet === d ? '#ddd5be' : 'rgba(255,255,255,0.14)'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{d}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTAs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, paddingBottom: 'clamp(48px, 7vw, 72px)' }}>
          {capabilities.ai && (
            <button
              disabled={aiStatus === 'loading'}
              onClick={async () => {
                await generateWithAI();
                if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                setScreen('plan');
              }}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.05)',
                fontSize: 14, fontWeight: 600, color: 'rgba(221,213,190,0.6)', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ddd5be'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(221,213,190,0.6)'; }}
            >
              {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate with AI'}
            </button>
          )}
          <button
            onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
            style={{
              width: '100%', padding: '17px 0', borderRadius: 14,
              border: 'none', fontSize: 16, fontWeight: 700, color: '#fff',
              background: 'linear-gradient(160deg, #2e6644 0%, #152b1c 100%)',
              boxShadow: '0 0 52px rgba(46,102,68,0.32), 0 8px 28px rgba(0,0,0,0.5)',
              cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 72px rgba(46,102,68,0.42), 0 12px 36px rgba(0,0,0,0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 52px rgba(46,102,68,0.32), 0 8px 28px rgba(0,0,0,0.5)'; }}
          >
            Build my week →
          </button>
          {aiStatus === 'error' && (
            <p style={{ fontSize: 12, color: '#3d6647', textAlign: 'center', margin: 0 }}>
              AI didn't respond — built the usual way.
            </p>
          )}
        </div>

        <p className="font-mono text-center" style={{ fontSize: 10, letterSpacing: '0.22em', color: '#1e3524', textTransform: 'uppercase', paddingBottom: 40 }}>
          No account &nbsp;·&nbsp; No cost &nbsp;·&nbsp; USDA-based &nbsp;·&nbsp; Works offline
        </p>
      </div>
    </div>
  );
}
