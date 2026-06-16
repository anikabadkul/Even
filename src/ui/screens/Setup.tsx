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

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, []);

  const size = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh = householdLabel({ adults, kids });

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2 animate-[fade-in_.3s_ease_both]">

      {/* ── Left panel: dark editorial ── */}
      <div className="bg-[#141f16] lg:sticky lg:top-0 lg:h-screen flex flex-col px-10 lg:px-14 py-14 lg:py-16 select-none">
        <span className="font-mono text-[10.5px] tracking-[0.25em] uppercase text-[#3d6648]">
          Free meal planner · 2026
        </span>

        <div className="flex-1 flex flex-col justify-center py-10 lg:py-0">
          <h1
            ref={headRef}
            tabIndex={-1}
            className="font-serif font-medium text-[#eee8d8] outline-none leading-none tracking-tight"
            style={{ fontSize: 'clamp(80px, 11vw, 152px)' }}
          >
            Even
          </h1>
          <p className="font-serif italic text-[#7faa89] mt-5 leading-snug max-w-[300px]"
             style={{ fontSize: 'clamp(17px, 2vw, 23px)' }}>
            Eat well on what you actually have.
          </p>
          <p className="text-[#3d6648] mt-5 text-[14px] leading-relaxed max-w-[270px]">
            A 7-day plan built around your grocery budget — honest about where a tight budget falls short.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-6 border-t border-[#1f3024]">
          {['No account', 'Works offline', 'USDA-based pricing'].map((t) => (
            <span key={t} className="font-mono text-[10px] tracking-widest uppercase text-[#2f4d36]">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="bg-surface flex flex-col min-h-screen">
        <div className="flex-1 px-8 lg:px-14 py-12 lg:py-16 space-y-9">

          <h2 className="font-serif text-[30px] tracking-tight text-ink">Set up your week</h2>

          {/* Budget */}
          <section aria-label="Weekly grocery budget">
            <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-5">
              Weekly grocery budget
            </p>
            <div className="flex items-center gap-4">
              <button
                aria-label="Decrease budget by 50 cents"
                onClick={() => setBudget(Math.max(10, budget - 0.5))}
                className="w-11 h-11 rounded-full border border-line bg-paper font-bold text-xl flex items-center justify-center hover:border-ink transition-colors flex-none"
              >−</button>

              <div className="flex-1 text-center">
                <div className="flex items-start justify-center">
                  <span className="font-serif text-[30px] text-ink-soft mt-3 leading-none">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={10} max={400} step={0.5}
                    value={budget}
                    aria-label="Weekly grocery budget in dollars"
                    onChange={(e) => setBudget(parseFloat(e.target.value))}
                    className="font-serif text-[68px] leading-none font-medium w-[168px] bg-transparent border-none text-center text-ink focus:outline-none"
                  />
                </div>
                <p className="font-mono text-[11.5px] text-ink-soft -mt-1">{f(budget / 7)} / day</p>
              </div>

              <button
                aria-label="Increase budget by 50 cents"
                onClick={() => setBudget(Math.min(400, budget + 0.5))}
                className="w-11 h-11 rounded-full border border-line bg-paper font-bold text-xl flex items-center justify-center hover:border-ink transition-colors flex-none"
              >+</button>
            </div>
            <input
              type="range"
              min={10} max={300} step={0.5}
              value={Math.min(300, budget)}
              aria-label="Adjust weekly budget with slider"
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full mt-4"
            />
            <p className="text-[12.5px] text-ink-soft mt-2">
              Not sure? SNAP averages about $43/week per person.
            </p>
          </section>

          {/* Household */}
          <section aria-label="Household size">
            <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-5">
              Household
            </p>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[13px] font-semibold text-ink mb-2.5">Adults</p>
                <div role="group" aria-label="Number of adults" className="flex gap-2">
                  {[1, 2, 3, 4].map((x) => (
                    <button
                      key={x}
                      aria-pressed={adults === x}
                      onClick={() => setAdults(x)}
                      className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold border-[1.5px] transition-all ${
                        adults === x
                          ? 'bg-accent border-accent text-white shadow-sm'
                          : 'border-line text-ink hover:border-accent-ink bg-transparent'
                      }`}
                    >{x}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-ink mb-2.5">Children</p>
                <div role="group" aria-label="Number of children" className="flex gap-2">
                  {[0, 1, 2, 3].map((x) => (
                    <button
                      key={x}
                      aria-pressed={kids === x}
                      onClick={() => setKids(x)}
                      className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold border-[1.5px] transition-all ${
                        kids === x
                          ? 'bg-accent border-accent text-white shadow-sm'
                          : 'border-line text-ink hover:border-accent-ink bg-transparent'
                      }`}
                    >{x}</button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[12.5px] text-ink-soft mt-3">
              A complete week for {hh} costs about {f(floor)} — the USDA minimum.
            </p>
          </section>

          {/* Diet */}
          <section aria-label="Dietary preference">
            <p className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-ink-soft mb-5">
              How do you eat?
            </p>
            <div role="group" aria-label="Dietary preference" className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d}
                  aria-pressed={diet === d}
                  onClick={() => setDiet(d)}
                  className={`px-5 py-2 rounded-full text-[14px] font-semibold border-[1.5px] transition-all ${
                    diet === d
                      ? 'bg-accent border-accent text-white shadow-sm'
                      : 'border-line text-ink hover:border-accent-ink bg-transparent'
                  }`}
                >{d}</button>
              ))}
            </div>
            <p className="text-[12.5px] text-ink-soft mt-3">Every meal respects this. Swap any meal later.</p>
          </section>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 px-8 lg:px-14 pb-10 pt-4 bg-gradient-to-t from-surface from-50% to-transparent">
          {capabilities.ai && (
            <button
              disabled={aiStatus === 'loading'}
              onClick={async () => {
                await generateWithAI();
                if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                setScreen('plan');
              }}
              className="w-full py-3.5 rounded-2xl border-[1.5px] border-accent-ink text-accent-ink font-bold text-[15px] mb-3 hover:bg-accent-soft transition-colors disabled:opacity-50"
            >
              {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate with AI'}
            </button>
          )}
          <button
            onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
            className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-[16px] hover:bg-[#356b4c] transition-colors shadow-sm"
          >
            Build my week →
          </button>
          {aiStatus === 'error' && (
            <p className="text-[12px] text-ink-soft mt-2.5 text-center">
              AI didn't respond — built the usual way instead.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
