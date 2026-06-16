import { useEffect, useRef } from 'react';
import { Chip, PrimaryButton, SecondaryButton } from '../components/Button';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

const BULLETS = [
  'Honest about the nutrition gap',
  'No account. No cost. Ever.',
  'USDA-based pricing',
  'Works offline',
];

export function Setup() {
  const {
    budget,
    adults,
    kids,
    diet,
    aiStatus,
    capabilities,
    setScreen,
    setBudget,
    setAdults,
    setKids,
    setDiet,
    rebuildIfDietChanged,
    generateWithAI,
  } = useSession();
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, []);

  const size = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh = householdLabel({ adults, kids });

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2 animate-[fade-in_.26s_ease_both]">
      {/* Left panel — sticky brand/editorial */}
      <div className="bg-paper px-10 lg:px-14 py-16 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between">
        <div>
          <div className="font-mono text-xs tracking-[0.16em] uppercase text-ink-soft mb-6">
            Free meal planner · 2026
          </div>
          <div className="font-serif font-medium text-[72px] leading-none tracking-tight mb-4">Even</div>
          <div className="font-serif italic text-[25px] leading-[1.28] mb-6 max-w-[340px]">
            Eat well on what you actually have.
          </div>
          <div className="flex flex-col gap-2.5 mt-2">
            {BULLETS.map((t) => (
              <div key={t} className="flex items-center gap-3 text-[15px]">
                <i className="w-[7px] h-[7px] rounded-full bg-accent flex-none inline-block" aria-hidden="true" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-ink-soft mt-8 max-w-[320px]">
          Built on the USDA Thrifty Food Plan and Dietary Guidelines. Free and independent — no account, nothing
          saved.
        </p>
      </div>

      {/* Right panel — scrollable form */}
      <div className="px-8 lg:px-14 py-14 lg:py-20 flex flex-col gap-10 lg:max-w-[560px] lg:mx-auto w-full">
        <h2
          ref={headRef}
          tabIndex={-1}
          className="font-serif text-3xl outline-none"
        >
          Set up your week
        </h2>

        {/* Budget section */}
        <div>
          <label
            className="block text-xs font-mono uppercase tracking-widest text-ink-soft mb-3"
            htmlFor="bud"
          >
            Weekly grocery budget
          </label>
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              aria-label="Lower budget"
              className="w-10 h-10 flex-none rounded-[11px] border-[1.5px] border-line bg-surface text-xl text-ink leading-none"
              onClick={() => setBudget(budget - 0.5)}
            >
              −
            </button>
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
                  className="font-serif text-[52px] w-[160px] border-none bg-transparent text-center text-ink p-0 focus:outline-none"
                />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-ink-soft">{f(budget / 7)} / day</div>
            </div>
            <button
              type="button"
              aria-label="Raise budget"
              className="w-10 h-10 flex-none rounded-[11px] border-[1.5px] border-line bg-surface text-xl text-ink leading-none"
              onClick={() => setBudget(budget + 0.5)}
            >
              +
            </button>
          </div>
          <input
            type="range"
            min={10}
            max={300}
            step={0.5}
            value={Math.min(300, budget)}
            aria-label="Adjust weekly budget with slider"
            onChange={(e) => setBudget(parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-[12.5px] text-ink-soft mt-2">
            Not sure? The average SNAP benefit is about $43 a week per person.
          </p>
        </div>

        {/* Adults section */}
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">Adults</div>
          <div role="group" aria-label="Number of adults" className="flex gap-2">
            {[1, 2, 3, 4].map((x) => (
              <Chip key={x} active={adults === x} className="flex-1" onClick={() => setAdults(x)}>
                {x}
              </Chip>
            ))}
          </div>
        </div>

        {/* Children section */}
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">Children</div>
          <div role="group" aria-label="Number of children" className="flex gap-2 mb-3">
            {[0, 1, 2, 3].map((x) => (
              <Chip key={x} active={kids === x} className="flex-1" onClick={() => setKids(x)}>
                {x}
              </Chip>
            ))}
          </div>
          <p className="text-[13px] text-ink-soft">
            Kids need fewer calories, so this keeps the check honest. A complete week for {hh} costs about {f(floor)},
            the USDA minimum.
          </p>
        </div>

        {/* Diet section */}
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-ink-soft mb-3">How do you eat?</div>
          <div role="group" aria-label="Dietary preference" className="flex flex-wrap gap-2 mb-2">
            {DIETS.map((d) => (
              <Chip key={d} active={diet === d} onClick={() => setDiet(d)}>
                {d}
              </Chip>
            ))}
          </div>
          <p className="text-[13px] text-ink-soft mt-2">Every meal respects this. You can swap any meal later.</p>
        </div>

        {/* CTA section */}
        <div className="pt-4 flex flex-col gap-2.5">
          {capabilities.ai && (
            <SecondaryButton
              disabled={aiStatus === 'loading'}
              onClick={async () => {
                await generateWithAI();
                if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                setScreen('plan');
              }}
            >
              {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate my week with AI'}
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
      </div>
    </main>
  );
}
