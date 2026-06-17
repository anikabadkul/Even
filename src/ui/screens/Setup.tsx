import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

/* ── Palette ── */
const lime   = '#b8d62a';
const limeHover = '#caea36';
const bg     = '#0f1a11';
const text   = '#f0ead8';
const muted  = '#6ea876';
const faint  = '#304d35';
const inkDark= '#0f1a11';

const inactiveBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1.5px solid rgba(255,255,255,0.16)',
  color: 'rgba(240,234,216,0.75)',
};
const activeBtn: React.CSSProperties = {
  background: lime,
  border: `1.5px solid ${lime}`,
  color: inkDark,
  boxShadow: `0 0 20px rgba(184,214,42,0.35)`,
};

export function Setup() {
  const {
    budget, adults, kids, diet, aiStatus, capabilities,
    setScreen, setBudget, setAdults, setKids, setDiet,
    rebuildIfDietChanged, generateWithAI,
  } = useSession();
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, []);

  const size  = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh    = householdLabel({ adults, kids });

  return (
    <div
      className="animate-[fade-in_.4s_ease_both]"
      style={{
        minHeight: '100vh',
        background: bg,
        backgroundImage: [
          'radial-gradient(ellipse 55% 40% at 15% 10%, rgba(140,200,60,0.13) 0%, transparent 65%)',
          'radial-gradient(ellipse 45% 35% at 90% 85%, rgba(30,80,40,0.22) 0%, transparent 55%)',
        ].join(', '),
      }}
    >
      <h2 className="sr-only">Set up your week</h2>

      {/* Grain */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Wordmark (restrained) ── */}
        <div style={{ paddingTop: 'clamp(32px, 5vw, 52px)', paddingBottom: 40, borderBottom: `1px solid rgba(255,255,255,0.07)`, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="font-serif italic font-bold" style={{ fontSize: 22, color: text, letterSpacing: '-0.02em' }}>
              Even
            </span>
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.3em', color: faint, textTransform: 'uppercase' }}>
              Free · 2026
            </span>
          </div>
        </div>

        {/* ── Headline ── */}
        <div ref={headRef} tabIndex={-1} style={{ outline: 'none', marginBottom: 44 }}>
          <h1
            className="font-serif font-bold"
            style={{
              fontSize: 'clamp(34px, 7vw, 52px)',
              lineHeight: 1.08, letterSpacing: '-0.025em',
              color: text, margin: 0,
            }}
          >
            Eat well on what you actually have.
          </h1>
          <p style={{ fontSize: 15, color: muted, marginTop: 14, lineHeight: 1.55 }}>
            Answer three questions. Get a full week of meals planned around your real grocery budget.
          </p>
        </div>

        {/* ── Budget ── */}
        <div style={{ marginBottom: 36 }}>
          <p className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.28em', color: muted, textTransform: 'uppercase', marginBottom: 18 }}>
            Weekly budget
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              aria-label="Decrease budget"
              onClick={() => setBudget(Math.max(10, budget - 1))}
              style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0, fontSize: 22,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.13s', ...inactiveBtn,
              }}
              onMouseOver={e => { Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.13)', color: text }); }}
              onMouseOut={e => { Object.assign(e.currentTarget.style, { background: inactiveBtn.background as string, color: inactiveBtn.color as string }); }}
            >−</button>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
                <span className="font-serif" style={{ fontSize: 24, color: lime, marginTop: 13, lineHeight: 1 }}>$</span>
                <span className="font-serif font-bold" style={{ fontSize: 'clamp(68px, 13vw, 100px)', lineHeight: 1, letterSpacing: '-0.03em', color: text }}>
                  {Math.round(budget)}
                </span>
              </div>
              <p className="font-mono" style={{ fontSize: 12, color: muted, marginTop: 4 }}>{f(budget / 7)} per day</p>
            </div>

            <button
              aria-label="Increase budget"
              onClick={() => setBudget(Math.min(400, budget + 1))}
              style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0, fontSize: 22,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.13s', ...inactiveBtn,
              }}
              onMouseOver={e => { Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.13)', color: text }); }}
              onMouseOut={e => { Object.assign(e.currentTarget.style, { background: inactiveBtn.background as string, color: inactiveBtn.color as string }); }}
            >+</button>
          </div>

          <input
            type="range" min={10} max={300} step={1}
            value={Math.min(300, budget)}
            aria-label="Weekly grocery budget slider"
            onChange={e => setBudget(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: 20, accentColor: lime } as React.CSSProperties}
          />
          <p style={{ fontSize: 12, color: faint, marginTop: 8 }}>SNAP averages about $43/week per person.</p>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 36 }} />

        {/* ── Household ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <p className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.28em', color: muted, textTransform: 'uppercase', marginBottom: 14 }}>Adults</p>
              <div role="group" aria-label="Number of adults" style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4].map(x => (
                  <button
                    key={x}
                    aria-pressed={adults === x}
                    onClick={() => setAdults(x)}
                    style={{
                      width: 52, height: 52, borderRadius: 14, fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.13s',
                      ...(adults === x ? activeBtn : inactiveBtn),
                    }}
                  >{x}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.28em', color: muted, textTransform: 'uppercase', marginBottom: 14 }}>Children</p>
              <div role="group" aria-label="Number of children" style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2, 3].map(x => (
                  <button
                    key={x}
                    aria-pressed={kids === x}
                    onClick={() => setKids(x)}
                    style={{
                      width: 52, height: 52, borderRadius: 14, fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.13s',
                      ...(kids === x ? activeBtn : inactiveBtn),
                    }}
                  >{x}</button>
                ))}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: faint, marginTop: 14 }}>
            Complete week for {hh}: ~{f(floor)} (USDA minimum).
          </p>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 36 }} />

        {/* ── Diet ── */}
        <div style={{ marginBottom: 44 }}>
          <p className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.28em', color: muted, textTransform: 'uppercase', marginBottom: 14 }}>How do you eat?</p>
          <div role="group" aria-label="Dietary preference" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DIETS.map(d => {
              const active = diet === d;
              return (
                <button
                  key={d}
                  aria-pressed={active}
                  onClick={() => setDiet(d)}
                  style={{
                    padding: '10px 20px', borderRadius: 999, fontSize: 13.5, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.13s',
                    ...(active ? activeBtn : inactiveBtn),
                  }}
                >{d}</button>
              );
            })}
          </div>
        </div>

        {/* ── CTAs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 'clamp(48px, 7vw, 72px)' }}>
          {capabilities.ai && (
            <button
              disabled={aiStatus === 'loading'}
              onClick={async () => {
                await generateWithAI();
                if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                setScreen('plan');
              }}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14,
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.13s',
                ...inactiveBtn,
              }}
              onMouseOver={e => { Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.12)', color: text }); }}
              onMouseOut={e => { Object.assign(e.currentTarget.style, { background: inactiveBtn.background as string, color: inactiveBtn.color as string }); }}
            >
              {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate with AI'}
            </button>
          )}

          <button
            onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
            style={{
              width: '100%', padding: '18px 0', borderRadius: 16,
              border: 'none', fontSize: 16, fontWeight: 700,
              background: lime, color: inkDark,
              boxShadow: `0 0 48px rgba(184,214,42,0.28), 0 8px 28px rgba(0,0,0,0.5)`,
              cursor: 'pointer', transition: 'all 0.15s',
              letterSpacing: '-0.01em',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = limeHover;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 0 64px rgba(184,214,42,0.38), 0 12px 36px rgba(0,0,0,0.5)`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = lime;
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = `0 0 48px rgba(184,214,42,0.28), 0 8px 28px rgba(0,0,0,0.5)`;
            }}
          >
            Build my week →
          </button>

          {aiStatus === 'error' && (
            <p style={{ fontSize: 12, color: faint, textAlign: 'center', margin: 0 }}>
              AI didn't respond — built the usual way.
            </p>
          )}
        </div>

        <p className="font-mono text-center" style={{ fontSize: 10, letterSpacing: '0.22em', color: faint, textTransform: 'uppercase', paddingBottom: 40 }}>
          No account &nbsp;·&nbsp; No cost &nbsp;·&nbsp; USDA-based &nbsp;·&nbsp; Works offline
        </p>
      </div>
    </div>
  );
}
