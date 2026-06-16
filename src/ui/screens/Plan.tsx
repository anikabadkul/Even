import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '../../state/session';
import { DIET_KEY, mealAt, SLOTS, SLOT_LABEL } from '../../domain/plan';
import { boosterItems, computeBudget, summarizeWeek } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { effFor } from '../../domain/money';
import { f } from '../format';
import { Card, Label } from '../components/Card';
import { Meter } from '../components/Meter';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Toast } from '../components/Toast';
import { weekLabels } from '../../domain/calendar';
import { CAL_ADULT, CAL_KID } from '../../data/references';

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
    <div className="flex flex-col min-h-full animate-[fade-in_.26s_ease_both]">
      <div className="sticky top-0 z-[5] bg-surface border-b border-line px-5 py-3.5 flex items-center gap-2.5">
        <span className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft flex-1">Your week</span>
        <button
          className="font-mono text-[13px] font-bold text-accent-ink bg-accent-soft border border-[#bcd2c5] rounded-full px-3 py-[7px]"
          onClick={doShuffle}
          aria-label="Shuffle the week for different meals"
        >
          ↻ Shuffle
        </button>
        <button
          className="text-sm font-bold text-accent-ink underline underline-offset-2 px-1"
          onClick={() => setScreen('setup')}
        >
          Edit
        </button>
      </div>

      <div className="px-5 pt-5 flex-1">
        <h2 ref={headRef} tabIndex={-1} className="font-serif text-[32px] leading-[1.05] outline-none mb-1.5">
          The best week for {f(budget)}.
        </h2>
        <p className="text-[15.5px] text-ink-soft mb-[18px]">
          {hhLabel} · {diet} · tap any meal to swap it.
        </p>

        <Card>
          <label className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft" htmlFor="budR">
            Your weekly budget · drag to fill out the week
          </label>
          <div className="flex items-baseline gap-1.5 mt-2 mb-0.5">
            <span className="font-serif text-[22px]">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={10}
              max={400}
              step={0.5}
              value={budget}
              aria-label="Weekly budget in dollars"
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="font-serif text-[30px] w-24 border-none bg-transparent text-ink p-0 border-b-[1.5px] border-line focus:outline-none"
            />
            <span className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft ml-auto">
              {f(budget / 7)}/day
            </span>
          </div>
          <input
            id="budR"
            type="range"
            min={10}
            max={300}
            step={0.5}
            value={Math.min(300, budget)}
            aria-label="Adjust weekly budget"
            onChange={(e) => setBudget(parseFloat(e.target.value))}
            onMouseUp={() =>
              announce(v.showGap ? `${f(budget)}, ${f(v.gap)} short of a complete week` : `${f(budget)}, covers a complete week`)
            }
          />
          <div className="mt-1.5">
            <GapBlock v={v} budget={budget} hhLabel={hhLabel} />
          </div>
        </Card>

        <div className="flex justify-between items-baseline mt-[26px] mb-0 mx-0.5">
          <span className="font-serif text-[22px]">Your 7 days</span>
          <span className="font-mono text-[13px] text-ink-soft">21 meals</span>
        </div>

        {days.map((d, i) => {
          return (
            <Card key={i} className="!p-0 overflow-hidden mt-3">
              <div className="flex justify-between px-4 py-3 bg-paper border-b border-line">
                <span className="font-bold text-[15px]">
                  {d.dow} <span className="text-ink-soft font-medium">· {d.date}</span>
                </span>
                <span className="font-mono text-[13px] font-bold text-accent-ink">
                  {f(
                    SLOTS.reduce((s, slot) => {
                      const m = mealAt(picks, i, slot, dietKey);
                      return s + m.cost * n * eff;
                    }, 0),
                  )}
                </span>
              </div>
              <div className="px-4">
                {SLOTS.map((slot) => {
                  const m = mealAt(picks, i, slot, dietKey);
                  return (
                    <button
                      key={slot}
                      className="w-full flex items-center gap-3 py-[13px] border-b border-line last:border-b-0 text-left min-h-[54px]"
                      onClick={() => openMeal(i, slot)}
                      aria-label={`${SLOT_LABEL[slot]}: ${m.name}, ${f(m.cost * n * eff)}. Tap to view or swap`}
                    >
                      <span className="font-mono text-xs uppercase text-ink-soft w-[34px] flex-none" aria-hidden="true">
                        {slot}
                      </span>
                      <span className="flex-1 text-[14.5px] font-semibold leading-tight">{m.name}</span>
                      <span className="font-mono text-[13px] font-bold" aria-hidden="true">
                        {f(m.cost * n * eff)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {adds.length > 0 && (
          <Card className="mt-3 bg-accent-soft border-[#bcd2c5]">
            <Label className="text-accent-ink">Added with your budget</Label>
            <p className="text-[13px] my-1.5 mb-2.5">Your extra money buys fresh food that fills the gaps:</p>
            {adds.map((b) => (
              <div key={b.name} className="flex justify-between text-sm py-[5px] border-b border-[#d4e0d8]">
                <span>{b.name}</span>
                <span className="font-mono font-bold text-accent-ink">{f(b.cost)}</span>
              </div>
            ))}
          </Card>
        )}

        <div className="flex justify-between items-baseline border-t-2 border-ink mt-3.5 mx-0.5 pt-2.5">
          <span className="font-serif text-xl">Week total</span>
          <span className="font-mono text-[17px] font-bold">{f(v.total)}</span>
        </div>

        <NutritionCard v={v} hhLabel={hhLabel} treat={treat} meterReady={meterReady} budget={budget} />
      </div>

      <div className="sticky bottom-0 px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3.5 bg-gradient-to-t from-surface from-[24%] to-transparent flex flex-col gap-2.5">
        <PrimaryButton onClick={() => setScreen('list')}>Get my shopping list</PrimaryButton>
        <SecondaryButton onClick={() => window.print()}>Save as PDF</SecondaryButton>
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
        <div className="flex items-start gap-2.5 bg-accent-soft rounded-xl px-[13px] py-[11px]">
          <span
            className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-extrabold flex-none mt-0.5"
            aria-hidden="true"
          >
            ✓
          </span>
          <span className="text-sm leading-snug text-accent-ink">
            <strong>Fits your budget.</strong> Spends {f(v.total)} of your {f(v.total + Math.max(0, v.leftover))}
            {v.leftover > 0.5 ? `, ${f(v.leftover)} to spare` : ''}.
          </span>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 bg-amber-soft rounded-xl px-[13px] py-[11px]">
          <span
            className="w-5 h-5 rounded-full bg-amber text-white flex items-center justify-center text-[13px] font-extrabold flex-none mt-0.5"
            aria-hidden="true"
          >
            !
          </span>
          <span className="text-sm leading-snug text-amber-ink">
            <strong>Over your budget.</strong> The cheapest week for {hhLabel} costs {f(v.baseHH)}, {f(v.baseHH - budget)}{' '}
            more than your {f(budget)}.
          </span>
        </div>
      )}

      <div className="mt-4">
        <Meter pct={v.meterPct} withGapStripe />
        <div className="relative h-[18px] mt-[7px]">
          <span className="absolute left-0 font-mono text-xs text-accent-ink">{f(budget)} you</span>
          <span className="absolute right-0 font-mono text-xs text-amber-ink">{f(v.floorHH)} full week</span>
        </div>
      </div>

      <div
        className={`rounded-[14px] p-[15px] mt-3.5 border-[1.5px] ${
          warm ? 'bg-amber-soft border-[#e9d6b6]' : 'bg-accent-soft border-[#bcd2c5]'
        }`}
      >
        <p className={`font-serif text-[16.5px] leading-snug m-0 ${warm ? 'text-[#5e431c]' : 'text-accent-ink'}`}>
          {line}
        </p>
      </div>
    </div>
  );
}

function NutritionCard({
  v,
  hhLabel,
  treat,
  meterReady,
  budget,
}: {
  v: ReturnType<typeof computeBudget>;
  hhLabel: string;
  treat: string;
  meterReady: boolean;
  budget: number;
}) {
  const calColor = v.calMet ? 'var(--color-accent-ink)' : 'var(--color-amber-ink)';
  const protColor = v.protMet ? 'var(--color-accent-ink)' : 'var(--color-amber-ink)';
  const microColor = v.microMet ? 'var(--color-accent-ink)' : 'var(--color-amber-ink)';

  return (
    <Card className="mt-4">
      <Label>Per day, your household · vs the guideline</Label>
      <p className="text-[12.5px] my-1.5 mb-3.5">
        For {hhLabel}: about {v.targetKcal.toLocaleString()} cal and {v.targetProtein}g protein a day (adults{' '}
        {CAL_ADULT.toLocaleString()}, kids {CAL_KID.toLocaleString()}).
      </p>

      <MetricRow
        label="Calories"
        value={`≈${v.avgKcal.toLocaleString()} / ${v.targetKcal.toLocaleString()}`}
        pct={meterReady ? v.calPct : 0}
        color={calColor}
        ok={v.calMet}
        okText="Meets the guideline"
        shortText={`${Math.round(v.targetKcal - v.avgKcal).toLocaleString()} calories under`}
      />
      <MetricRow
        label="Protein"
        value={`${v.avgProtein}g / ${v.targetProtein}g`}
        pct={meterReady ? v.protPct : 0}
        color={protColor}
        ok={v.protMet}
        okText="Meets the guideline"
        shortText={`${v.targetProtein - v.avgProtein}g short`}
      />
      <MetricRow
        label="Calcium & iron"
        value={`${Math.round(v.microPct)}%`}
        pct={meterReady ? v.microPct : 0}
        color={microColor}
        ok={v.microMet}
        okText="Covered"
        shortText="Still thin"
        last
      />

      <div className="border-t border-dashed border-line pt-[13px] mt-2">
        <p className="text-[13.5px]">{treat}</p>
        {budget < v.floorHH && (
          <div className="mt-3 bg-paper rounded-xl px-[14px] py-3">
            <div className="text-[13px] font-extrabold mb-0.5">Short on cash this week?</div>
            <p className="text-[13px] m-0">
              Dial 2-1-1 (free, 24/7) or visit findhelp.org for local food pantries and SNAP help.
            </p>
          </div>
        )}
      </div>
      <p className="text-[11.5px] mt-3 text-ink-soft">
        Targets from the USDA Dietary Guidelines (2025-2030). Budget floor from the USDA Thrifty Food Plan (2026).
      </p>
    </Card>
  );
}

function MetricRow({
  label,
  value,
  pct,
  color,
  ok,
  okText,
  shortText,
  last,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  ok: boolean;
  okText: string;
  shortText: string;
  last?: boolean;
}) {
  return (
    <div className={last ? 'mb-1.5' : 'mb-3.5'}>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[14.5px] font-bold">{label}</span>
        <span className="font-mono text-[13px] text-ink-soft">{value}</span>
      </div>
      <Meter pct={pct} color={color} height={11} />
      <div className="text-[12.5px] mt-1.5 font-semibold" style={{ color }}>
        {ok ? okText : shortText}
      </div>
    </div>
  );
}
