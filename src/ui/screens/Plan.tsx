import { useMemo, useRef, useEffect, useState } from 'react';
import { useSession } from '../../state/session';
import { DIET_KEY, mealAt, SLOTS } from '../../domain/plan';
import { boosterItems, computeBudget, summarizeWeek } from '../../domain/budget';
import { effFor } from '../../domain/money';
import { f } from '../format';
import { weekLabels } from '../../domain/calendar';
import { getMealPhoto } from '../../data/mealPhotos';
import { Toast } from '../components/Toast';

const C = {
  bg: '#FBF7F0', ink: '#211D17', mid: '#6B6358', soft: '#9C9384',
  border: '#EDE5D8', clay: '#C5613B', clayDark: '#A84E2E',
  green: '#3E6B4F', greenBg: '#EAF1EC', cardBg: '#fff',
};

const SLOT_LABEL: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' };
const SLOT_COLOR: Record<string, string> = { B: '#E6B86E', L: '#6B9E78', D: '#7B8EC8' };

interface PlanProps {
  announce: (msg: string) => void;
}

function LogoIcon() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.clay, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 13, height: 2.5, background: '#fff', borderRadius: 2, boxShadow: '0 -5px 0 #fff, 0 5px 0 #fff' }} />
    </div>
  );
}

export function Plan({ announce }: PlanProps) {
  const session = useSession();
  const { budget, adults, kids, diet, picks, setScreen, shuffle, openMeal } = session;
  const headRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);

  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, []);

  const dietKey = DIET_KEY[diet];
  const n = Math.max(1, adults + kids);
  const eff = effFor(n);
  const days = useMemo(() => weekLabels(), []);
  const week = useMemo(() => summarizeWeek(picks, dietKey), [picks, dietKey]);
  const v = useMemo(() => computeBudget(budget, { adults, kids }, week), [budget, adults, kids, week]);
  const adds = v.boosterCost > 0.5 ? boosterItems(v.boosterCost) : [];

  const weeklyTotal = SLOTS.reduce((sum, slot) =>
    sum + days.reduce((s, _, i) => s + mealAt(picks, i, slot, dietKey).cost * n * eff, 0), 0
  );
  const spentPct = Math.min(100, (weeklyTotal / budget) * 100);
  const meterColor = spentPct > 100 ? C.clayDark : spentPct > 85 ? '#D97706' : C.green;

  function doShuffle() {
    const { undo } = shuffle();
    setToast({ message: 'New week generated', undo });
    announce('New week generated');
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>

      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(251,247,240,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', flex: 1 }} onClick={() => setScreen('welcome')}>
            <LogoIcon />
            <span style={{ fontFamily: "'Newsreader', serif", fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: C.ink }}>Even</span>
          </div>
          <button
            onClick={doShuffle}
            aria-label="Shuffle the week for different meals"
            style={{ fontSize: 13.5, fontWeight: 600, color: C.mid, background: 'none', border: `1px solid ${C.border}`, borderRadius: 999, padding: '7px 16px', cursor: 'pointer', transition: 'all .13s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}
          >↻ Shuffle</button>
          <button
            onClick={() => setScreen('setup')}
            style={{ fontSize: 13.5, fontWeight: 600, color: C.mid, background: 'none', border: 'none', padding: '7px 4px', cursor: 'pointer', transition: 'color .13s' }}
            onMouseOver={e => { e.currentTarget.style.color = C.ink; }}
            onMouseOut={e => { e.currentTarget.style.color = C.mid; }}
          >Edit</button>
          <button
            onClick={() => setScreen('list')}
            style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', background: C.clay, border: 'none', borderRadius: 999, padding: '8px 20px', cursor: 'pointer', boxShadow: '0 4px 14px -6px rgba(197,97,59,0.6)', transition: 'all .13s' }}
            onMouseOver={e => { e.currentTarget.style.background = C.clayDark; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = C.clay; e.currentTarget.style.transform = ''; }}
          >Shopping list →</button>
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Budget summary */}
        <div
          ref={headRef}
          tabIndex={-1}
          style={{
            background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 20,
            padding: '28px 32px', marginBottom: 40, outline: 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.soft, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>This week</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: "'Newsreader', serif", fontSize: 38, fontWeight: 600, color: C.ink, lineHeight: 1 }}>
                  {f(weeklyTotal)}
                </span>
                <span style={{ fontSize: 17, color: C.soft }}>/ {f(budget)}</span>
              </div>
              <p style={{ fontSize: 14, color: C.mid, margin: '6px 0 0' }}>{diet} · {n === 1 ? '1 person' : `${n} people`}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700,
                color: meterColor, background: spentPct > 100 ? '#FEF2F2' : spentPct > 85 ? '#FFFBEB' : C.greenBg,
                border: `1px solid ${meterColor}40`, borderRadius: 999, padding: '6px 14px',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: meterColor, display: 'inline-block' }} />
                {spentPct > 100 ? 'Over budget' : spentPct > 85 ? 'Near limit' : 'Within budget'}
              </div>
              {v.leftover > 0.5 && (
                <p style={{ fontSize: 13, color: C.soft, margin: '8px 0 0' }}>{f(v.leftover)} to spare</p>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 8, background: C.border, borderRadius: 4, marginTop: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, spentPct)}%`, background: meterColor, borderRadius: 4, transition: 'width .4s ease' }} />
          </div>

          {/* Booster items */}
          {adds.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.green, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                Your budget also covers
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {adds.map(b => (
                  <span key={b.name} style={{ fontSize: 13, color: C.mid, background: C.greenBg, border: `1px solid #C6DEC9`, borderRadius: 999, padding: '4px 12px' }}>
                    {b.name} · <strong style={{ color: C.green }}>{f(b.cost)}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Day-by-day sections */}
        {days.map((day, dayIdx) => {
          const dayCost = SLOTS.reduce((s, slot) => s + mealAt(picks, dayIdx, slot, dietKey).cost * n * eff, 0);
          const dayKcal = SLOTS.reduce((s, slot) => s + mealAt(picks, dayIdx, slot, dietKey).kcal, 0);
          const dayProt = SLOTS.reduce((s, slot) => s + mealAt(picks, dayIdx, slot, dietKey).protein, 0);
          return (
            <section key={dayIdx} style={{ marginBottom: 48 }}>
              {/* Day header */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: 26, fontWeight: 500, color: C.ink, margin: 0, letterSpacing: '-0.01em' }}>
                  {day.dow}
                </h2>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: C.soft }}>
                  <span>≈{dayKcal.toLocaleString()} kcal</span>
                  <span>{dayProt}g protein</span>
                  <span style={{ color: C.mid, fontWeight: 600 }}>{f(dayCost)}</span>
                </div>
              </div>
              <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

              {/* Meal cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {SLOTS.map(slot => {
                  const meal = mealAt(picks, dayIdx, slot, dietKey);
                  const photo = getMealPhoto(meal.id);
                  const cost = meal.cost * n * eff;
                  return (
                    <button
                      key={slot}
                      onClick={() => openMeal(dayIdx, slot)}
                      aria-label={`${SLOT_LABEL[slot]}: ${meal.name}, ${f(cost)}. Click to view or swap`}
                      style={{
                        textAlign: 'left', background: C.cardBg, border: `1px solid ${C.border}`,
                        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                        transition: 'transform .15s, box-shadow .15s',
                        display: 'flex', flexDirection: 'column',
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(33,29,23,0.18)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    >
                      {/* Photo */}
                      <div style={{ position: 'relative', height: 128, overflow: 'hidden' }}>
                        <img
                          src={photo}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <span style={{
                          position: 'absolute', top: 10, left: 10,
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                          background: SLOT_COLOR[slot], color: '#fff',
                          borderRadius: 999, padding: '3px 9px',
                        }}>
                          {SLOT_LABEL[slot]}
                        </span>
                      </div>
                      {/* Info */}
                      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>{meal.name}</div>
                        {meal.blurb && (
                          <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.4 }}>{meal.blurb}</div>
                        )}
                        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 600, color: C.clayDark }}>{f(cost)}</span>
                          <span style={{ fontSize: 12.5, color: C.clay, fontWeight: 600 }}>View & swap →</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setScreen('list')}
            style={{
              flex: 1, minWidth: 200, fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
              color: '#fff', background: C.clay, border: 'none', padding: '17px 0',
              borderRadius: 14, cursor: 'pointer',
              boxShadow: '0 8px 24px -12px rgba(197,97,59,0.7)', transition: 'all .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = C.clayDark; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = C.clay; e.currentTarget.style.transform = ''; }}
          >
            Get my shopping list →
          </button>
          <button
            onClick={doShuffle}
            style={{
              fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
              color: C.mid, background: 'none', border: `1.5px solid ${C.border}`,
              padding: '17px 28px', borderRadius: 14, cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}
          >↻ Regenerate week</button>
        </div>
      </main>

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
