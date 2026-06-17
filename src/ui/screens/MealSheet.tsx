import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { eligibleMeals, mealAt, SLOT_LABEL, perishableIngredients } from '../../domain/plan';
import { DIET_KEY } from '../../domain/plan';
import { effFor } from '../../domain/money';
import { f } from '../format';
import { weekLabels } from '../../domain/calendar';
import { getMealPhoto } from '../../data/mealPhotos';

const C = {
  bg: '#FBF7F0', ink: '#211D17', mid: '#6B6358', soft: '#9C9384',
  border: '#EDE5D8', clay: '#C5613B', clayDark: '#A84E2E',
  green: '#3E6B4F', greenBg: '#EAF1EC', cardBg: '#fff',
};

interface MealSheetProps {
  onClose: () => void;
  announce: (msg: string) => void;
}

export function MealSheet({ onClose, announce }: MealSheetProps) {
  const { selected, picks, diet, adults, kids, swap } = useSession();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    lastFocusRef.current = document.activeElement as HTMLElement;
    closeRef.current?.focus({ preventScroll: true });
    return () => { lastFocusRef.current?.focus?.({ preventScroll: true }); };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = Array.from(
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
          ),
        ).filter(el => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!drawerRef.current.contains(document.activeElement)) {
          e.preventDefault(); first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!selected) return null;

  const dietKey = DIET_KEY[diet];
  const meal = mealAt(picks, selected.day, selected.slot, dietKey);
  const n = Math.max(1, adults + kids);
  const eff = effFor(n);
  const pool = eligibleMeals(selected.slot, dietKey);
  const curIdx = picks[selected.day][selected.slot] % pool.length;
  const day = weekLabels()[selected.day];
  const photo = getMealPhoto(meal.id);

  const currentPerishables = new Set(perishableIngredients(meal));
  const otherMealPerishables = new Set(
    Object.entries(picks).flatMap(([d, slots]) =>
      Object.entries(slots).flatMap(([s]) => {
        if (Number(d) === selected.day && s === selected.slot) return [];
        const m = mealAt(picks, Number(d), s as 'B' | 'L' | 'D', dietKey);
        return perishableIngredients(m);
      }),
    ),
  );
  const orphaned = [...currentPerishables].filter(item => !otherMealPerishables.has(item));

  return (
    <div role="dialog" aria-modal="true" aria-label={meal.name} style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(33,29,23,0.45)', animation: 'evenFade .25s ease both' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 460,
          background: C.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'evenSlideIn .3s cubic-bezier(.22,.61,.36,1) both',
          fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        }}
      >
        {/* Photo hero */}
        <div style={{ position: 'relative', height: 230, flexShrink: 0 }}>
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(33,29,23,0.75) 0%, rgba(33,29,23,0.1) 55%, transparent 100%)' }} />
          {/* Close button */}
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(33,29,23,0.5)', border: 'none',
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)', transition: 'background .13s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(33,29,23,0.75)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(33,29,23,0.5)'; }}
          >×</button>
          {/* Meal info over photo */}
          <div style={{ position: 'absolute', bottom: 18, left: 22, right: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginBottom: 4 }}>
              {SLOT_LABEL[selected.slot]} · {day.dow}
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 24, fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>{meal.name}</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 32px' }}>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {[
              { label: 'Cost', value: f(meal.cost * n * eff) },
              { label: 'Kcal', value: meal.kcal.toLocaleString() },
              { label: 'Protein', value: `${meal.protein}g` },
              { label: 'Carbs', value: `${meal.carbs}g` },
            ].map(stat => (
              <div key={stat.label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 10px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Newsreader', serif", fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.soft, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {n > 1 && (
            <p style={{ fontSize: 13, color: C.soft, marginBottom: 20 }}>
              Amounts for {n} people. Per person: {f(meal.cost * eff)}.
            </p>
          )}

          {/* Ingredients */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>What's in it</p>
            {meal.ingredients.map(ing => (
              <div key={ing.item} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px dashed ${C.border}`, fontSize: 14, color: C.ink }}>
                <span>{ing.item}{n > 1 ? ` ×${n}` : ''}</span>
                <span style={{ color: C.soft }}>{f(ing.perServingCost * n * eff)}</span>
              </div>
            ))}
          </div>

          {/* Recipe steps */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>How to make it</p>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {meal.recipe.map((step, i) => (
                <li key={i} style={{ fontSize: 14.5, color: C.ink, lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Swap alternatives */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.soft, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
              Swap this {SLOT_LABEL[selected.slot].toLowerCase()} · {pool.length} options
            </p>
            {orphaned.length > 0 && (
              <p style={{ fontSize: 12.5, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                Only this meal uses {orphaned.join(' and ')} — swapping may leave them unused.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pool.map((m, idx) => {
                const isCur = idx === curIdx;
                const swapPhoto = getMealPhoto(m.id);
                return (
                  <button
                    key={m.id}
                    aria-pressed={isCur}
                    onClick={() => {
                      if (idx === curIdx) return;
                      swap(selected.day, selected.slot, idx);
                      announce(`Swapped to ${m.name}`);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                      padding: '10px 14px', borderRadius: 13, cursor: isCur ? 'default' : 'pointer',
                      border: `1.5px solid ${isCur ? C.clay : C.border}`,
                      background: isCur ? '#FBF3EE' : C.cardBg,
                      transition: 'all .13s', fontFamily: 'inherit',
                    }}
                    onMouseOver={e => { if (!isCur) { e.currentTarget.style.borderColor = C.mid; } }}
                    onMouseOut={e => { if (!isCur) { e.currentTarget.style.borderColor = C.border; } }}
                  >
                    <img src={swapPhoto} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isCur ? C.clayDark : C.ink, lineHeight: 1.3 }}>
                        {m.name}
                        {isCur && <span style={{ fontSize: 11, color: C.clay, marginLeft: 6 }}>✓ current</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{m.kcal} kcal</div>
                    </div>
                    <div style={{ fontFamily: "'Newsreader', serif", fontSize: 17, fontWeight: 600, color: C.clayDark, flexShrink: 0 }}>{f(m.cost * n * eff)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '100%', fontFamily: 'inherit', fontSize: 16, fontWeight: 600,
              color: C.ink, background: 'none', border: `1.5px solid ${C.border}`,
              padding: 16, borderRadius: 14, cursor: 'pointer', transition: 'all .13s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = C.ink; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = C.border; }}
          >Done</button>
        </div>
      </div>

      <style>{`
        @keyframes evenFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes evenSlideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}
