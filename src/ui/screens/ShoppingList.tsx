import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../state/session';
import { DIET_KEY } from '../../domain/plan';
import { boosterItems, computeBudget, summarizeWeek } from '../../domain/budget';
import { aggregateIngredients, buildShoppingList, AISLE_ORDER } from '../../domain/shopping';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import { BackButton } from '../components/Button';
import { Toast } from '../components/Toast';

export function ShoppingList({ announce }: { announce: (msg: string) => void }) {
  const {
    budget,
    adults,
    kids,
    diet,
    picks,
    setScreen,
  } = useSession();
  const headRef = useRef<HTMLSpanElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, []);

  const hh = { adults, kids };
  const dietKey = DIET_KEY[diet];
  const week = useMemo(() => summarizeWeek(picks, dietKey), [picks, dietKey]);
  const v = useMemo(() => computeBudget(budget, hh, week), [budget, adults, kids, week]);
  const adds = v.boosterCost > 0.5 ? boosterItems(v.boosterCost) : [];
  const items = useMemo(() => aggregateIngredients(picks, dietKey, hh, adds), [picks, dietKey, adults, kids, adds]);
  const lines = useMemo(() => buildShoppingList(items, hh), [items, adults, kids]);
  const total = lines.reduce((s, i) => s + i.purchaseCost, 0);
  const hhLabel = householdLabel(hh);

  function share() {
    const text = `Even — shopping list (${hhLabel}, ${diet})\n${lines
      .map((i) => `- ${i.name}${i.packs ? ` x${i.packs} (${i.packLabel})` : ''} ${f(i.purchaseCost)}`)
      .join('\n')}\nWeek total ${f(total)}`;
    if (navigator.share) {
      navigator.share({ title: 'Even shopping list', text }).catch(() => {});
    } else if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          setToast('List copied');
          announce('List copied');
        },
        () => setToast('Could not copy'),
      );
    } else {
      setToast('Sharing not supported here');
    }
  }

  return (
    <div className="flex flex-col min-h-full animate-[fade-in_.26s_ease_both]">
      <div className="sticky top-0 z-[5] bg-surface border-b border-line px-5 py-3.5 flex items-center gap-2.5">
        <BackButton aria-label="Back to plan" onClick={() => setScreen('plan')}>
          ←
        </BackButton>
        <span
          ref={headRef}
          tabIndex={-1}
          className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft flex-1 outline-none"
        >
          Shopping list · {hhLabel}
        </span>
        <button
          className="font-mono text-[13px] font-bold text-accent-ink bg-accent-soft border border-[#bcd2c5] rounded-full px-3 py-[7px]"
          onClick={share}
          aria-label="Share or copy the list"
        >
          Share
        </button>
      </div>

      <div className="px-5 pt-[18px] flex-1">
        <p className="text-[15.5px] text-ink-soft mb-2">Everything for the week in one list, biggest cost first.</p>

        {AISLE_ORDER.map((cat) => {
          const inCat = lines.filter((i) => i.aisle === cat);
          if (!inCat.length) return null;
          return (
            <div key={cat} className="mt-4">
              <span className="block text-[12.5px] font-bold tracking-wide uppercase text-accent-ink">{cat}</span>
              <div className="mt-1">
                {inCat.map((i) => {
                  const spoilRisk = !i.added && i.perishableDays && i.leftoverServings > 0;
                  return (
                    <div key={i.name} className="py-[11px] border-b border-line">
                      <div className="flex items-baseline gap-2.5">
                        <span className="flex-1 text-[15px] font-medium">
                          {i.name}{' '}
                          {!i.added && i.packLabel && (
                            <span className="text-ink-soft font-mono text-xs">
                              {i.packs} × {i.packLabel}
                            </span>
                          )}
                          {i.added && <span className="text-ink-soft font-mono text-xs">added</span>}
                        </span>
                        <span className="font-mono text-sm font-bold">{f(i.purchaseCost)}</span>
                      </div>
                      {spoilRisk && (
                        <p className="text-[11.5px] text-amber-700 mt-0.5">
                          ~{i.leftoverServings} serving{i.leftoverServings !== 1 ? 's' : ''} left over — use within {i.perishableDays} days or it may spoil. Swap in a meal that uses it to avoid waste.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex justify-between items-baseline mt-4">
          <span className="font-serif text-xl">Week total</span>
          <span className="font-mono text-lg font-bold">{f(total)}</span>
        </div>
        <p className="text-[12.5px] mt-2.5 text-ink-soft">
          Quantities are for the week. Staples like rice, oats and peanut butter are bought once and last several
          weeks, so the price shown is what you pay at the till for the pack; the plan's budget math uses the
          amortized share actually used this week.
        </p>
      </div>

      <div className="sticky bottom-0 px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3.5 bg-gradient-to-t from-surface from-[24%] to-transparent">
        <button
          className="w-full min-h-14 rounded-2xl bg-accent text-white text-[17px] font-bold"
          onClick={() => {
            window.print();
            setSaved(true);
          }}
        >
          {saved ? 'Saved ✓' : 'Download PDF'}
        </button>
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
