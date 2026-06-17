import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

const btn = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '11px 0', borderRadius: 12,
  background: active ? '#111' : 'transparent',
  color: active ? '#fff' : '#444',
  border: `${active ? 2 : 1.5}px solid ${active ? '#111' : '#e2e2e2'}`,
  fontWeight: 700, fontSize: 14, cursor: 'pointer',
  transition: 'all 0.12s',
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
    <div className="animate-[fade-in_.4s_ease_both]" style={{ background: '#07100a', minHeight: '100vh' }}>
      <h2 className="sr-only">Set up your week</h2>

      {/* ── Hero ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(60px,8vw,100px) 24px clamp(40px,5vw,64px)' }}>
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.32em', color: '#1d3e26', textTransform: 'uppercase', marginBottom: 28 }}>
          Free meal planner · 2026
        </span>

        <h1
          ref={headRef}
          tabIndex={-1}
          className="font-serif font-bold outline-none text-center"
          style={{
            fontSize: 'clamp(72px, 15vw, 200px)',
            lineHeight: 0.9, letterSpacing: '-0.04em',
            color: '#ddd5be',
          }}
        >
          Even
        </h1>

        <p
          className="font-serif italic text-center"
          style={{ fontSize: 'clamp(17px, 2.2vw, 24px)', color: '#2d5438', marginTop: 24, maxWidth: 380 }}
        >
          Eat well on what you actually have.
        </p>
      </div>

      {/* ── Setup card ── */}
      <div style={{ padding: '0 16px clamp(60px,8vw,100px)', display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%', maxWidth: 540,
            background: '#fff', borderRadius: 28,
            boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Budget */}
          <div style={{ padding: '36px 36px 28px', borderBottom: '1px solid #f2f2f2' }}>
            <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.28em', color: '#bbb', textTransform: 'uppercase', marginBottom: 22 }}>
              Weekly grocery budget
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                aria-label="Decrease budget"
                onClick={() => setBudget(Math.max(10, budget - 1))}
                style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #e8e8e8', background: 'transparent', color: '#bbb', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#333'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#bbb'; }}
              >−</button>

              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 2 }}>
                  <span className="font-serif" style={{ fontSize: 28, color: '#ccc', marginTop: 10, lineHeight: 1 }}>$</span>
                  <span
                    className="font-serif font-bold"
                    style={{ fontSize: 'clamp(56px, 8vw, 88px)', lineHeight: 1, letterSpacing: '-0.025em', color: '#111' }}
                  >
                    {Math.round(budget)}
                  </span>
                </div>
                <p className="font-mono" style={{ fontSize: 11.5, color: '#c0c0c0', marginTop: 2 }}>{f(budget / 7)} / day</p>
              </div>

              <button
                aria-label="Increase budget"
                onClick={() => setBudget(Math.min(400, budget + 1))}
                style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #e8e8e8', background: 'transparent', color: '#bbb', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#333'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.color = '#bbb'; }}
              >+</button>
            </div>
            <input
              type="range" min={10} max={300} step={1}
              value={Math.min(300, budget)}
              aria-label="Weekly grocery budget slider"
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: 18 }}
            />
            <p style={{ fontSize: 12, color: '#ccc', marginTop: 6 }}>SNAP averages about $43/week per person.</p>
          </div>

          {/* Household */}
          <div style={{ padding: '28px 36px', borderBottom: '1px solid #f2f2f2' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.28em', color: '#bbb', textTransform: 'uppercase', marginBottom: 12 }}>Adults</p>
                <div role="group" aria-label="Number of adults" style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4].map((x) => (
                    <button key={x} aria-pressed={adults === x} onClick={() => setAdults(x)} style={btn(adults === x)}>{x}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.28em', color: '#bbb', textTransform: 'uppercase', marginBottom: 12 }}>Children</p>
                <div role="group" aria-label="Number of children" style={{ display: 'flex', gap: 8 }}>
                  {[0, 1, 2, 3].map((x) => (
                    <button key={x} aria-pressed={kids === x} onClick={() => setKids(x)} style={btn(kids === x)}>{x}</button>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: '#c8c8c8', marginTop: 14 }}>
              Complete week for {hh}: ~{f(floor)} (USDA minimum).
            </p>
          </div>

          {/* Diet */}
          <div style={{ padding: '28px 36px' }}>
            <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.28em', color: '#bbb', textTransform: 'uppercase', marginBottom: 12 }}>How do you eat?</p>
            <div role="group" aria-label="Dietary preference" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DIETS.map((d) => (
                <button
                  key={d}
                  aria-pressed={diet === d}
                  onClick={() => setDiet(d)}
                  style={{
                    padding: '8px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
                    background: diet === d ? '#111' : 'transparent',
                    color: diet === d ? '#fff' : '#444',
                    border: `${diet === d ? 2 : 1.5}px solid ${diet === d ? '#111' : '#e2e2e2'}`,
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >{d}</button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div style={{ padding: '4px 36px 36px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {capabilities.ai && (
              <button
                disabled={aiStatus === 'loading'}
                onClick={async () => {
                  await generateWithAI();
                  if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                  setScreen('plan');
                }}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 14,
                  border: '1.5px solid #e2e2e2', background: 'transparent',
                  fontSize: 14.5, fontWeight: 600, color: '#666', cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate with AI'}
              </button>
            )}
            <button
              onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
              style={{
                width: '100%', padding: '17px 0', borderRadius: 16,
                border: 'none', fontSize: 16, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(160deg, #2e6644 0%, #152b1c 100%)',
                boxShadow: '0 8px 28px rgba(8,18,10,0.38), 0 2px 6px rgba(8,18,10,0.2)',
                cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(8,18,10,0.44), 0 3px 8px rgba(8,18,10,0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 28px rgba(8,18,10,0.38), 0 2px 6px rgba(8,18,10,0.2)'; }}
            >
              Build my week →
            </button>
            {aiStatus === 'error' && (
              <p style={{ fontSize: 12, color: '#bbb', textAlign: 'center', margin: 0 }}>
                AI didn't respond — built the usual way.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="font-mono text-center" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#162218', textTransform: 'uppercase', paddingBottom: 32 }}>
        No account &nbsp;·&nbsp; No cost &nbsp;·&nbsp; USDA-based &nbsp;·&nbsp; Works offline
      </p>
    </div>
  );
}
