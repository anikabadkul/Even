import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

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
  const budgetDisplay = Math.round(budget);

  return (
    <main className="min-h-screen lg:flex animate-[fade-in_.4s_ease_both]">

      {/* ── Left: brand panel ── */}
      <div
        className="relative lg:sticky lg:top-0 lg:h-screen lg:w-[46%] flex flex-col overflow-hidden"
        style={{ background: '#080d08' }}
      >
        {/* Radial glow behind wordmark */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: '42%', left: '46%',
            transform: 'translate(-50%, -50%)',
            width: '140%', height: '60%',
            background: 'radial-gradient(ellipse, rgba(52,110,72,0.28) 0%, rgba(30,60,38,0.1) 40%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />

        <div className="relative flex flex-col h-full px-10 lg:px-14 py-14 lg:py-16">
          {/* Top label */}
          <span
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.28em', color: '#1e3824' }}
          >
            Free meal planner · 2026
          </span>

          {/* Wordmark — fills ~85% of column width */}
          <div className="flex-1 flex flex-col justify-center">
            <h1
              ref={headRef}
              tabIndex={-1}
              className="font-serif font-bold outline-none"
              style={{
                fontSize: 'clamp(88px, 17vw, 228px)',
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                color: '#ddd6c4',
              }}
            >
              Even
            </h1>
            <p
              className="font-serif italic"
              style={{
                fontSize: 'clamp(17px, 2.2vw, 24px)',
                lineHeight: 1.3,
                color: '#3d6e4a',
                marginTop: 'clamp(20px, 2.5vw, 32px)',
                maxWidth: 280,
              }}
            >
              Eat well on what you actually have.
            </p>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20 }}>
            <p className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: '0.22em', color: '#1a2e1f', lineHeight: 1.9 }}>
              No account &nbsp;·&nbsp; No cost &nbsp;·&nbsp; Works offline
              <br />
              USDA Thrifty Food Plan · Dietary Guidelines
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="lg:flex-1 flex flex-col min-h-screen" style={{ background: '#ffffff' }}>
        <div
          className="flex-1 px-8 lg:px-14 py-12 lg:py-16"
          style={{ maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
        >

          <h2 className="sr-only">Set up your week</h2>

          {/* Budget ── hero of the form */}
          <div style={{ marginBottom: 44 }}>
            <p
              className="font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.28em', color: '#c0c0c0', marginBottom: 20 }}
            >
              Weekly grocery budget
            </p>

            <div className="flex items-center gap-5">
              <button
                aria-label="Decrease budget"
                onClick={() => setBudget(Math.max(10, budget - 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '1.5px solid #ebebeb', color: '#c0c0c0',
                  fontSize: 22, fontWeight: 300, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: 'transparent',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#333'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#ebebeb'; e.currentTarget.style.color = '#c0c0c0'; }}
              >−</button>

              <div className="flex-1 text-center">
                <div className="flex items-start justify-center" style={{ gap: 4 }}>
                  <span
                    className="font-serif"
                    style={{ fontSize: 36, color: '#d0d0d0', marginTop: 14, lineHeight: 1 }}
                  >$</span>
                  <span
                    className="font-serif font-bold"
                    style={{ fontSize: 'clamp(64px, 7vw, 96px)', lineHeight: 1, letterSpacing: '-0.03em', color: '#111' }}
                  >
                    {budgetDisplay}
                  </span>
                </div>
                <p
                  className="font-mono"
                  style={{ fontSize: 12, color: '#c0c0c0', marginTop: 4 }}
                >
                  {f(budget / 7)} per day
                </p>
              </div>

              <button
                aria-label="Increase budget"
                onClick={() => setBudget(Math.min(400, budget + 1))}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '1.5px solid #ebebeb', color: '#c0c0c0',
                  fontSize: 22, fontWeight: 300, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: 'transparent',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#333'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#ebebeb'; e.currentTarget.style.color = '#c0c0c0'; }}
              >+</button>
            </div>

            {/* Hidden accessible input for slider */}
            <input
              type="range"
              min={10} max={300} step={1}
              value={Math.min(300, budget)}
              aria-label="Weekly grocery budget slider"
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full"
              style={{ marginTop: 20 }}
            />
            <p style={{ fontSize: 12.5, color: '#c8c8c8', marginTop: 6 }}>
              SNAP averages about $43/week per person.
            </p>
          </div>

          {/* Household */}
          <div style={{ marginBottom: 36 }}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p
                  className="font-mono uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.28em', color: '#c0c0c0', marginBottom: 12 }}
                >
                  Adults
                </p>
                <div role="group" aria-label="Number of adults" className="flex gap-2">
                  {[1, 2, 3, 4].map((x) => (
                    <button
                      key={x}
                      aria-pressed={adults === x}
                      onClick={() => setAdults(x)}
                      style={{
                        flex: 1, paddingTop: 10, paddingBottom: 10,
                        borderRadius: 12, fontSize: 14, fontWeight: 700,
                        border: adults === x ? '2px solid #0d1810' : '1.5px solid #e8e8e8',
                        background: adults === x ? '#0d1810' : 'transparent',
                        color: adults === x ? '#fff' : '#333',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >{x}</button>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="font-mono uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.28em', color: '#c0c0c0', marginBottom: 12 }}
                >
                  Children
                </p>
                <div role="group" aria-label="Number of children" className="flex gap-2">
                  {[0, 1, 2, 3].map((x) => (
                    <button
                      key={x}
                      aria-pressed={kids === x}
                      onClick={() => setKids(x)}
                      style={{
                        flex: 1, paddingTop: 10, paddingBottom: 10,
                        borderRadius: 12, fontSize: 14, fontWeight: 700,
                        border: kids === x ? '2px solid #0d1810' : '1.5px solid #e8e8e8',
                        background: kids === x ? '#0d1810' : 'transparent',
                        color: kids === x ? '#fff' : '#333',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >{x}</button>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: '#c0c0c0', marginTop: 12 }}>
              A complete week for {hh} costs about {f(floor)} — the USDA minimum.
            </p>
          </div>

          {/* Diet */}
          <div>
            <p
              className="font-mono uppercase"
              style={{ fontSize: 10, letterSpacing: '0.28em', color: '#c0c0c0', marginBottom: 12 }}
            >
              How do you eat?
            </p>
            <div role="group" aria-label="Dietary preference" className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d}
                  aria-pressed={diet === d}
                  onClick={() => setDiet(d)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 999,
                    fontSize: 13.5, fontWeight: 600,
                    border: diet === d ? '2px solid #0d1810' : '1.5px solid #e8e8e8',
                    background: diet === d ? '#0d1810' : 'transparent',
                    color: diet === d ? '#fff' : '#333',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{d}</button>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: '#c0c0c0', marginTop: 10 }}>
              Every meal respects this. Swap any meal later.
            </p>
          </div>
        </div>

        {/* ── Sticky CTAs ── */}
        <div
          className="sticky bottom-0 px-8 lg:px-14 pb-10 pt-6"
          style={{
            background: 'linear-gradient(to top, #ffffff 70%, rgba(255,255,255,0))',
            maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', width: '100%',
          }}
        >
          {capabilities.ai && (
            <button
              disabled={aiStatus === 'loading'}
              onClick={async () => {
                await generateWithAI();
                if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                setScreen('plan');
              }}
              style={{
                width: '100%', padding: '12px 0', marginBottom: 12,
                borderRadius: 16, border: '1.5px solid #e8e8e8',
                fontSize: 14.5, fontWeight: 600, color: '#555',
                background: 'transparent', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate with AI'}
            </button>
          )}
          <button
            onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
            style={{
              width: '100%', padding: '17px 0',
              borderRadius: 18, border: 'none',
              fontSize: 16, fontWeight: 700, color: '#fff',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #2a5a3c 0%, #162d1e 100%)',
              boxShadow: '0 6px 20px rgba(10,20,12,0.32), 0 1px 3px rgba(10,20,12,0.2)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,20,12,0.38), 0 2px 6px rgba(10,20,12,0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,20,12,0.32), 0 1px 3px rgba(10,20,12,0.2)'; }}
          >
            Build my week →
          </button>
          {aiStatus === 'error' && (
            <p style={{ fontSize: 12, color: '#c0c0c0', marginTop: 10, textAlign: 'center' }}>
              AI didn't respond — built the usual way instead.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
