import { useEffect, useRef } from 'react';
import { BackButton, Chip, PrimaryButton, SecondaryButton } from '../components/Button';
import { Label } from '../components/Card';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { hasGemini } from '../../integrations/env';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

export function Setup() {
  const {
    budget,
    adults,
    kids,
    diet,
    aiStatus,
    setScreen,
    setBudget,
    setAdults,
    setKids,
    setDiet,
    rebuildIfDietChanged,
    generateWithAI,
  } = useSession();
  const headRef = useRef<HTMLHeadingElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, []);

  const size = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh = householdLabel({ adults, kids });

  return (
    <div className="flex flex-col min-h-full animate-[fade-in_.26s_ease_both]">
      <div className="sticky top-0 z-[5] bg-surface border-b border-line px-5 py-3.5 flex items-center gap-2.5">
        <BackButton aria-label="Back" onClick={() => setScreen('welcome')}>
          ←
        </BackButton>
        <span className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft">Set up your week</span>
      </div>

      <div className="px-5 pt-[22px] flex-1">
        <label className="block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft" htmlFor="bud">
          Weekly grocery budget
        </label>
        <div className="flex items-center gap-3 my-3">
          <BackButton
            aria-label="Lower budget"
            className="text-2xl w-12 h-12"
            onClick={() => setBudget(budget - 0.5)}
          >
            −
          </BackButton>
          <div className="flex-1 text-center border-b-2 border-ink pb-1.5">
            <div className="flex items-baseline justify-center">
              <span className="font-serif text-[28px]">$</span>
              <input
                id="bud"
                type="number"
                inputMode="decimal"
                min={10}
                max={400}
                step={0.5}
                value={budget}
                aria-label="Weekly grocery budget in dollars"
                onChange={(e) => setBudget(parseFloat(e.target.value))}
                className="font-serif text-[44px] w-[132px] border-none bg-transparent text-center text-ink p-0 focus:outline-none"
              />
            </div>
            <div className="text-[12.5px] font-bold tracking-wide uppercase text-ink-soft">{f(budget / 7)} / day</div>
          </div>
          <BackButton
            aria-label="Raise budget"
            className="text-2xl w-12 h-12"
            onClick={() => setBudget(budget + 0.5)}
          >
            +
          </BackButton>
        </div>
        <p className="text-[12.5px] text-ink-soft mt-1.5">
          Not sure? The average SNAP benefit is about $43 a week per person.
        </p>

        <Label className="mt-6">Adults</Label>
        <div role="group" aria-label="Number of adults" className="flex gap-2 mt-2.5">
          {[1, 2, 3, 4].map((x) => (
            <Chip key={x} active={adults === x} className="flex-1" onClick={() => setAdults(x)}>
              {x}
            </Chip>
          ))}
        </div>

        <Label className="mt-[18px]">Children</Label>
        <div role="group" aria-label="Number of children" className="flex gap-2 mt-2.5">
          {[0, 1, 2, 3].map((x) => (
            <Chip key={x} active={kids === x} className="flex-1" onClick={() => setKids(x)}>
              {x}
            </Chip>
          ))}
        </div>
        <p className="text-[13px] text-ink-soft mt-2">
          Kids need fewer calories, so this keeps the check honest. A complete week for {hh} costs about {f(floor)},
          the USDA minimum.
        </p>

        <Label className="mt-[22px]">How do you eat?</Label>
        <div role="group" aria-label="Dietary preference" className="flex flex-wrap gap-2 mt-2.5">
          {DIETS.map((d) => (
            <Chip key={d} active={diet === d} onClick={() => setDiet(d)}>
              {d}
            </Chip>
          ))}
        </div>
        <p className="text-[13px] text-ink-soft mt-2">Every meal respects this. You can swap any meal later.</p>
      </div>

      <div className="sticky bottom-0 px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3.5 bg-gradient-to-t from-surface from-[24%] to-transparent">
        {hasGemini && (
          <SecondaryButton
            className="mb-2.5"
            disabled={aiStatus === 'loading'}
            onClick={async () => {
              await generateWithAI();
              if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
              setScreen('plan');
            }}
          >
            {aiStatus === 'loading' ? 'Asking Gemini…' : '✦ Generate my week with AI'}
          </SecondaryButton>
        )}
        <PrimaryButton
          onClick={() => {
            rebuildIfDietChanged();
            setScreen('plan');
          }}
        >
          Build my week →
        </PrimaryButton>
        {aiStatus === 'error' && (
          <p className="text-[12.5px] text-ink-soft mt-2 text-center">
            AI plan didn't come through, so we built your week the usual way.
          </p>
        )}
      </div>
      <div ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
