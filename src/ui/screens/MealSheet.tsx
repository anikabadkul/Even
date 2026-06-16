import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { eligibleMeals, mealAt, SLOT_LABEL } from '../../domain/plan';
import { DIET_KEY } from '../../domain/plan';
import { effFor } from '../../domain/money';
import { f } from '../format';
import { weekLabels } from '../../domain/calendar';

interface MealSheetProps {
  onClose: () => void;
  announce: (msg: string) => void;
}

export function MealSheet({ onClose, announce }: MealSheetProps) {
  const { selected, picks, diet, adults, kids, swap } = useSession();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    lastFocusRef.current = document.activeElement as HTMLElement;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      lastFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!dialogRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
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

  return (
    <div role="dialog" aria-modal="true" aria-label={meal.name} className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(38,34,25,.45)] animate-[fade-in_.25s_ease_both]" onClick={onClose} />
      <div
        ref={dialogRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[430px] max-h-[92%] bg-surface rounded-t-[18px] flex flex-col overflow-hidden"
        style={{ animation: 'sheet-up .34s cubic-bezier(.22,.61,.36,1) both' }}
      >
        <div className="flex-none flex justify-center pt-3 pb-0.5">
          <span className="w-[42px] h-[5px] rounded-full bg-line" aria-hidden="true" />
        </div>
        <div className="overflow-y-auto px-[22px] pb-[26px] pt-3">
          <span className="font-mono text-xs uppercase text-accent-ink">
            {SLOT_LABEL[selected.slot]} · {day.dow}
          </span>
          <div className="flex justify-between items-start gap-3 mt-1.5 mb-1">
            <div className="font-serif text-[25px] leading-[1.12] flex-1">{meal.name}</div>
            <div className="font-serif text-[28px]">{f(meal.cost * n * eff)}</div>
          </div>
          {n > 1 ? (
            <p className="text-[12.5px] text-ink-soft mb-2">
              Cost and amounts for {n} {n === 1 ? 'person' : 'people'}. Per person: {f(meal.cost * eff)}.
            </p>
          ) : (
            <div className="h-1.5" />
          )}

          <div className="flex gap-2 my-3 py-3.5 border-t border-b border-line">
            <MacroCell value={meal.kcal} label="kcal" />
            <MacroCell value={`${meal.protein}g`} label="protein" />
            <MacroCell value={`${meal.carbs}g`} label="carbs" />
            <MacroCell value={`${meal.fat}g`} label="fat" />
          </div>

          <span className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft">What's in it</span>
          <div className="my-2 mb-[18px]">
            {meal.ingredients.map((ing) => (
              <div
                key={ing.item}
                className="flex justify-between py-[9px] border-b border-dotted border-line font-mono text-[13px]"
              >
                <span>
                  {ing.item}
                  {n > 1 ? ` ×${n}` : ''}
                </span>
                <span className="text-ink-soft">{f(ing.perServingCost * n * eff)}</span>
              </div>
            ))}
          </div>

          <span className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft" id="swapHead">
            Swap this {SLOT_LABEL[selected.slot].toLowerCase()} ({pool.length} that fit {diet.toLowerCase()})
          </span>
          <div className="my-2.5 mb-[18px]">
            {pool.map((m, idx) => {
              const isCur = idx === curIdx;
              return (
                <button
                  key={m.id}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-[1.5px] mb-2 text-left ${
                    isCur ? 'border-accent bg-accent-soft' : 'border-line bg-surface'
                  }`}
                  aria-pressed={isCur}
                  onClick={() => {
                    if (idx === curIdx) return;
                    swap(selected.day, selected.slot, idx);
                    announce(`Swapped to ${m.name}`);
                  }}
                >
                  <span className="flex-1 text-sm font-semibold leading-tight">
                    {m.name}
                    {isCur && <span className="text-accent-ink text-[11px]"> ✓ current</span>}
                  </span>
                  <span className="font-mono text-xs text-ink-soft whitespace-nowrap">
                    {f(m.cost * n * eff)} · {m.kcal}kcal
                  </span>
                </button>
              );
            })}
          </div>

          <button
            ref={closeRef}
            className="w-full min-h-13 rounded-2xl border-[1.5px] border-ink bg-surface text-[16px] font-bold text-ink"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="font-mono text-[17px] font-bold">{value}</div>
      <div className="text-[11px] font-bold tracking-wide uppercase text-ink-soft mt-0.5">{label}</div>
    </div>
  );
}
