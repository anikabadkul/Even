import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../state/session';
import { DIET_KEY, mealAt, SLOTS } from '../../domain/plan';
import { boosterItems, computeBudget, summarizeWeek } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { effFor } from '../../domain/money';
import { f } from '../format';
import { Meter } from '../components/Meter';
import { SecondaryButton } from '../components/Button';
import { Toast } from '../components/Toast';
import { weekLabels } from '../../domain/calendar';
import { CAL_ADULT, CAL_KID } from '../../data/references';

const SLOT_LABEL: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' };

/* ── Palette (warm cream / food-forward) ── */
const bg       = '#f2e8d5';
const surface  = '#fff';
const ink      = '#1a2416';
const inkSoft  = '#6b7c60';
const inkFaint = '#a89f8c';
const lime     = '#b8d62a';
const limeText = '#3d4a10';
const accent   = '#2c5e3f';
const warmCard = '#fdf5e8';

interface PlanProps {
  announce: (msg: string) => void;
}

export function Plan({ announce }: PlanProps) {
  const session = useSession();
  const { budget, adults, kids, diet, picks, setScreen, setBudget, shuffle, openMeal } = session;
  const headRef = useRef<HTMLHeadingElement>(null);
  const [meterReady, setMeterReady] = useState(false);
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
    const t = setTimeout(() => setMeterReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const dietKey = DIET_KEY[diet];
  const hh = { adults, kids };
  const n = Math.max(1, adults + kids);
  const eff = effFor(n);
  const week = useMemo(() => summarizeWeek(picks, dietKey), [picks, dietKey]);
  const v = useMemo(() => computeBudget(budget, hh, week), [budget, adults, kids, week]);
  const days = useMemo(() => weekLabels(), []);
  const hhLabel = householdLabel(hh);

  const adds = v.boosterCost > 0.5 ? boosterItems(v.boosterCost) : [];
  const need = Math.max(0, v.floorHH - budget);
  const treat = v.microMet
    ? 'Calcium and iron are covered at this budget.'
    : v.leftover > 0.5
      ? `Biggest wins for the least money: milk for calcium, eggs for protein, frozen greens for iron. Your ${f(v.leftover)} spare already goes there.`
      : `Biggest wins for the least money: milk for calcium, eggs for protein, frozen greens for iron. About ${f(Math.max(need, 8))} more a week covers them.`;

  function doShuffle() {
    const { undo } = shuffle();
    setToast({ message: 'New week', undo });
    announce('New week generated');
  }

  return (
    <div className="min-h-screen animate-[fade-in_.26s_ease_both]" style={{ background: bg }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-10 px-6 lg:px-10"
        style={{
          background: `rgba(242,232,213,0.88)`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        } as React.CSSProperties}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 58 }}>
          <span className="font-serif italic font-bold" style={{ fontSize: 20, color: ink, letterSpacing: '-0.02em', flex: 1 }}>Even</span>
          <span className="hidden md:block" style={{ fontSize: 12, color: inkFaint }}>{hhLabel} · {diet}</span>
          <button
            style={{
              fontSize: 12, fontWeight: 700, color: inkSoft, background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.1)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', transition: 'all 0.13s',
            }}
            onClick={doShuffle}
            aria-label="Shuffle the week for different meals"
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = ink; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = inkSoft; }}
          >↻ Shuffle</button>
          <button
            className="hidden sm:block"
            style={{ fontSize: 13, fontWeight: 600, color: inkFaint, cursor: 'pointer', transition: 'all 0.13s', background: 'none', border: 'none', padding: '6px 4px' }}
            onMouseOver={e => (e.currentTarget.style.color = ink)}
            onMouseOut={e => (e.currentTarget.style.color = inkFaint)}
            onClick={() => setScreen('setup')}
          >Edit</button>
          <button
            style={{
              fontSize: 13, fontWeight: 700, color: limeText,
              background: lime, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(184,214,42,0.3)', transition: 'all 0.13s',
            }}
            onClick={() => setScreen('list')}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,214,42,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(184,214,42,0.3)'; }}
          >Shopping list →</button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 pt-10 pb-20">

        {/* ── Headline ── */}
        <h2
          ref={headRef}
          tabIndex={-1}
          className="font-serif font-bold outline-none"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.025em', color: ink, marginBottom: 8 }}
        >
          The best week for {f(budget)}.
        </h2>
        <p style={{ fontSize: 15, color: inkSoft, marginBottom: 36 }}>
          {diet} · click any meal to view its recipe or swap it
        </p>

        {/* ── Budget card ── */}
        <div
          style={{
            background: surface, borderRadius: 20, padding: '28px 32px', marginBottom: 36,
            border: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 12px 40px rgba(0,0,0,0.04)',
          }}
        >
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            <div>
              <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: inkFaint, marginBottom: 12 }}>
                Weekly budget
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span className="font-serif" style={{ fontSize: 22, color: '#ccc' }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={10} max={400} step={0.5}
                  value={budget}
                  aria-label="Weekly budget in dollars"
                  onChange={e => setBudget(parseFloat(e.target.value))}
                  style={{
                    fontFamily: 'inherit', fontSize: 38, fontWeight: 700, width: 110,
                    border: 'none', background: 'transparent', padding: 0,
                    borderBottom: '2px solid #e5ddd0', color: ink, outline: 'none',
                  }}
                  className="font-serif"
                />
                <span className="font-mono" style={{ fontSize: 12, color: inkFaint, marginLeft: 'auto' }}>{f(budget / 7)} / day</span>
              </div>
              <input
                type="range" min={10} max={300} step={0.5}
                value={Math.min(300, budget)}
                aria-label="Adjust weekly budget"
                onChange={e => setBudget(parseFloat(e.target.value))}
                onMouseUp={() => announce(v.showGap ? `${f(budget)}, ${f(v.gap)} short of a complete week` : `${f(budget)}, covers a complete week`)}
                style={{ width: '100%', marginTop: 16, accentColor: accent } as React.CSSProperties}
              />
            </div>
            <div className="mt-6 lg:mt-0">
              <GapBlock v={v} budget={budget} hhLabel={hhLabel} />
            </div>
          </div>
        </div>

        {/* ── 7-day grid header ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: ink }}>Your 7 days</h3>
          <span className="font-mono" style={{ fontSize: 11.5, color: inkFaint }}>21 meals · click any to swap</span>
        </div>

        {/* ── Bento grid ── */}
        <div className="overflow-x-auto -mx-5 lg:-mx-10 px-5 lg:px-10 mb-10">
          <div
            className="overflow-hidden min-w-[680px]"
            style={{
              display: 'grid', gap: '1px',
              gridTemplateColumns: '52px repeat(7, minmax(0, 1fr))',
              background: 'rgba(0,0,0,0.07)',
              borderRadius: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.05)',
            }}
          >
            {/* Day headers */}
            <div style={{ background: '#e8d9c0' }} aria-hidden="true" />
            {days.map((d, i) => {
              const dayCost = SLOTS.reduce((s, slot) => s + mealAt(picks, i, slot, dietKey).cost * n * eff, 0);
              return (
                <div key={i} style={{ background: '#e8d9c0', padding: '10px 8px', textAlign: 'center' }}>
                  <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: inkSoft }}>
                    {d.dow}
                  </div>
                  <div className="font-mono" style={{ fontSize: 11.5, fontWeight: 700, marginTop: 3, color: limeText }}>
                    {f(dayCost)}
                  </div>
                </div>
              );
            })}

            {/* Slot rows */}
            {SLOTS.map(slot => (
              <Fragment key={slot}>
                <div style={{ background: '#e8d9c0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 4px' }}>
                  <span
                    aria-hidden="true"
                    className="font-mono"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a090' }}
                  >
                    {SLOT_LABEL[slot]}
                  </span>
                </div>
                {days.map((d, i) => {
                  const m = mealAt(picks, i, slot, dietKey);
                  return (
                    <button
                      key={i}
                      onClick={() => openMeal(i, slot)}
                      aria-label={`${SLOT_LABEL[slot]}: ${d.dow} ${m.name}, ${f(m.cost * n * eff)}. Click to view or swap`}
                      style={{
                        textAlign: 'left', padding: '12px 10px', minHeight: 96,
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        background: surface, cursor: 'pointer', transition: 'background 0.12s', border: 'none',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = warmCard)}
                      onMouseOut={e => (e.currentTarget.style.background = surface)}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.35, color: '#2a2018', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                        {m.name}
                      </span>
                      <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: limeText }}>
                        {f(m.cost * n * eff)}
                      </span>
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Booster items */}
        {adds.length > 0 && (
          <div style={{ background: '#edf5ef', border: '1.5px solid #bcd2c5', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
            <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>Added with your budget</p>
            <p style={{ fontSize: 13, marginBottom: 12, color: inkSoft }}>Your extra money buys fresh food that fills the gaps:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 4 }}>
              {adds.map(b => (
                <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '7px 0', borderBottom: '1px solid #d4e0d8' }}>
                  <span>{b.name}</span>
                  <span className="font-mono font-bold" style={{ color: accent }}>{f(b.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Week total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `2px solid ${ink}`, paddingTop: 12, marginBottom: 32 }}>
          <span className="font-serif" style={{ fontSize: 20, color: ink }}>Week total</span>
          <span className="font-mono" style={{ fontSize: 17, fontWeight: 700, color: ink }}>{f(v.total)}</span>
        </div>

        <NutritionCard v={v} hhLabel={hhLabel} treat={treat} meterReady={meterReady} budget={budget} />

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <button
            onClick={() => setScreen('list')}
            style={{
              flex: 1, minWidth: 200, padding: '17px 0', borderRadius: 16,
              border: 'none', fontSize: 16, fontWeight: 700,
              background: lime, color: limeText,
              boxShadow: '0 4px 20px rgba(184,214,42,0.3)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(184,214,42,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,214,42,0.3)'; }}
          >
            Get my shopping list
          </button>
          <SecondaryButton onClick={() => window.print()}>Save as PDF</SecondaryButton>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.undo ? 'Undo' : undefined}
          onAction={toast.undo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}

function GapBlock({ v, budget, hhLabel }: { v: ReturnType<typeof computeBudget>; budget: number; hhLabel: string }) {
  const warm = budget < v.floorHH || v.showGap;
  let line: string;
  if (budget < v.floorHH) {
    line = `A complete week for ${hhLabel} costs about ${f(v.floorHH)}, which is ${f(v.gap)} more than your ${f(budget)}. That gap is the budget's, not yours. Drag your budget up to watch the week fill out.`;
  } else if (v.showGap) {
    line = `Your ${f(budget)} covers a complete week for ${hhLabel}, with a little to spare. Anything still thin is flagged below.`;
  } else {
    line = `Your ${f(budget)} covers a complete, nutritious week for ${hhLabel}. Nicely done.`;
  }

  return (
    <div>
      {v.fits ? (
        <div style={{ display: 'flex', gap: 10, background: '#edf5ef', borderRadius: 14, padding: '11px 14px' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>✓</span>
          <span style={{ fontSize: 14, lineHeight: 1.45, color: '#1a4a2e' }}>
            <strong>Fits your budget.</strong> Spends {f(v.total)} of your {f(v.total + Math.max(0, v.leftover))}
            {v.leftover > 0.5 ? `, ${f(v.leftover)} to spare` : ''}.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, background: '#fef3e2', borderRadius: 14, padding: '11px 14px' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>!</span>
          <span style={{ fontSize: 14, lineHeight: 1.45, color: '#78350f' }}>
            <strong>Over your budget.</strong> The cheapest week for {hhLabel} costs {f(v.baseHH)}, {f(v.baseHH - budget)} more than your {f(budget)}.
          </span>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Meter pct={v.meterPct} withGapStripe />
        <div style={{ position: 'relative', height: 18, marginTop: 7 }}>
          <span className="font-mono" style={{ position: 'absolute', left: 0, fontSize: 11.5, color: accent }}>{f(budget)} you</span>
          <span className="font-mono" style={{ position: 'absolute', right: 0, fontSize: 11.5, color: '#b45309' }}>{f(v.floorHH)} full week</span>
        </div>
      </div>

      <div style={{
        borderRadius: 14, padding: 15, marginTop: 14,
        background: warm ? '#fef3e2' : '#edf5ef',
        border: `1.5px solid ${warm ? '#f0d5a0' : '#bcd2c5'}`,
      }}>
        <p className="font-serif" style={{ fontSize: 16, lineHeight: 1.5, margin: 0, color: warm ? '#78350f' : '#1a4a2e' }}>{line}</p>
      </div>
    </div>
  );
}

function NutritionCard({ v, hhLabel, treat, meterReady, budget }: {
  v: ReturnType<typeof computeBudget>; hhLabel: string; treat: string; meterReady: boolean; budget: number;
}) {
  const calColor  = v.calMet  ? accent : '#b45309';
  const protColor = v.protMet ? accent : '#b45309';
  const microColor= v.microMet? accent : '#b45309';

  return (
    <div style={{ background: surface, borderRadius: 20, padding: '24px 28px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <p className="font-mono" style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: inkFaint, marginBottom: 6 }}>Per day, your household · vs the guideline</p>
      <p style={{ fontSize: 12.5, color: inkSoft, marginBottom: 20 }}>
        For {hhLabel}: about {v.targetKcal.toLocaleString()} cal and {v.targetProtein}g protein a day (adults {CAL_ADULT.toLocaleString()}, kids {CAL_KID.toLocaleString()}).
      </p>
      <MetricRow label="Calories"      value={`≈${v.avgKcal.toLocaleString()} / ${v.targetKcal.toLocaleString()}`} pct={meterReady ? v.calPct  : 0} color={calColor}  ok={v.calMet}  okText="Meets the guideline" shortText={`${Math.round(v.targetKcal - v.avgKcal).toLocaleString()} calories under`} />
      <MetricRow label="Protein"       value={`${v.avgProtein}g / ${v.targetProtein}g`}                           pct={meterReady ? v.protPct : 0} color={protColor} ok={v.protMet} okText="Meets the guideline" shortText={`${v.targetProtein - v.avgProtein}g short`} />
      <MetricRow label="Calcium & iron" value={`${Math.round(v.microPct)}%`}                                       pct={meterReady ? v.microPct: 0} color={microColor} ok={v.microMet} okText="Covered"             shortText="Still thin" last />
      <div style={{ borderTop: '1px dashed #e5ddd0', paddingTop: 14, marginTop: 10 }}>
        <p style={{ fontSize: 13.5, color: ink }}>{treat}</p>
        {budget < v.floorHH && (
          <div style={{ marginTop: 12, background: '#f5ede0', borderRadius: 14, padding: '12px 16px' }}>
            <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>Short on cash this week?</p>
            <p style={{ fontSize: 13, margin: 0, color: inkSoft }}>Dial 2-1-1 (free, 24/7) or visit findhelp.org for local food pantries and SNAP help.</p>
          </div>
        )}
      </div>
      <p style={{ fontSize: 11.5, marginTop: 12, color: inkFaint }}>
        Targets from the USDA Dietary Guidelines (2025–2030). Budget floor from the USDA Thrifty Food Plan (2026).
      </p>
    </div>
  );
}

function MetricRow({ label, value, pct, color, ok, okText, shortText, last }: {
  label: string; value: string; pct: number; color: string; ok: boolean; okText: string; shortText: string; last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 6 : 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 14.5, fontWeight: 700, color: ink }}>{label}</span>
        <span className="font-mono" style={{ fontSize: 13, color: inkSoft }}>{value}</span>
      </div>
      <Meter pct={pct} color={color} height={11} />
      <div style={{ fontSize: 12.5, marginTop: 5, fontWeight: 600, color }}>{ok ? okText : shortText}</div>
    </div>
  );
}
