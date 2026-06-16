import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function Setup() {
  const {
    budget, adults, kids, diet, aiStatus, capabilities,
    setScreen, setBudget, setAdults, setKids, setDiet,
    rebuildIfDietChanged, generateWithAI,
  } = useSession();
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, []);

  const size = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh = householdLabel({ adults, kids });

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2 animate-[fade-in_.35s_ease_both]">

      {/* ── Left: dark editorial ── */}
      <div
        className="relative lg:sticky lg:top-0 lg:h-screen flex flex-col px-10 lg:px-14 py-14 lg:py-16 overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 20% 65%, #1d3323 0%, #0d1810 45%, #060c07 100%)' }}
      >
        {/* Grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.055] mix-blend-overlay"
          style={{ backgroundImage: NOISE_SVG, backgroundSize: '192px 192px' }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative flex flex-col h-full">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#2d5238]">
            Free meal planner · 2026
          </span>

          <div className="flex-1 flex flex-col justify-center py-10 lg:py-0">
            <h1
              ref={headRef}
              tabIndex={-1}
              className="font-serif font-bold text-[#e8e0cc] outline-none tracking-[-0.035em]"
              style={{ fontSize: 'clamp(88px, 12.5vw, 168px)', lineHeight: 0.9 }}
            >
              Even
            </h1>
            <p
              className="font-serif italic text-[#6b9e76] mt-6 leading-[1.25] max-w-[270px]"
              style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}
            >
              Eat well on what you actually have.
            </p>
            <p className="text-[13.5px] text-[#2e4d35] mt-4 max-w-[250px] leading-relaxed">
              A 7-day plan built around your grocery budget — priced to the cent.
            </p>
          </div>

          <div
            className="border-t pt-5 flex flex-col gap-2.5"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            {['Honest about the nutrition gap', 'No account · no cost · ever', 'USDA-based · works offline'].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-[12px] text-[#2a4530]">
                <span className="w-[5px] h-[5px] rounded-full bg-[#2a4530] flex-none" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="bg-white flex flex-col min-h-screen">
        <div className="flex-1 px-8 lg:px-14 py-12 lg:py-16 lg:max-w-[520px] lg:mx-auto w-full">
          <h2 className="font-serif text-[30px] tracking-[-0.02em] text-[#111] mb-10">
            Set up your week
          </h2>

          {/* Budget */}
          <div className="mb-10">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#aaa] mb-5">
              Weekly grocery budget
            </p>
            <div className="flex items-center gap-4 mb-1">
              <button
                aria-label="Decrease budget"
                onClick={() => setBudget(Math.max(10, budget - 0.5))}
                className="w-10 h-10 rounded-full border border-[#e8e8e8] text-[#bbb] hover:border-[#333] hover:text-[#333] transition-all text-xl font-light flex items-center justify-center flex-none"
              >−</button>
              <div className="flex-1 flex items-start justify-center gap-0.5">
                <span className="font-serif text-[32px] text-[#ccc] mt-2.5 leading-none">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={10} max={400} step={0.5}
                  value={budget}
                  aria-label="Weekly grocery budget in dollars"
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="font-serif font-semibold text-[80px] leading-none w-[200px] bg-transparent border-none text-center text-[#111] focus:outline-none"
                />
              </div>
              <button
                aria-label="Increase budget"
                onClick={() => setBudget(Math.min(400, budget + 0.5))}
                className="w-10 h-10 rounded-full border border-[#e8e8e8] text-[#bbb] hover:border-[#333] hover:text-[#333] transition-all text-xl font-light flex items-center justify-center flex-none"
              >+</button>
            </div>
            <p className="text-center font-mono text-[11.5px] text-[#bbb] mb-4">{f(budget / 7)} / day</p>
            <input
              type="range"
              min={10} max={300} step={0.5}
              value={Math.min(300, budget)}
              aria-label="Adjust weekly budget with slider"
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-[12.5px] text-[#bbb] mt-2">SNAP averages about $43/week per person.</p>
          </div>

          {/* Adults */}
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#aaa] mb-4">Adults</p>
            <div role="group" aria-label="Number of adults" className="flex gap-2">
              {[1, 2, 3, 4].map((x) => (
                <button
                  key={x}
                  aria-pressed={adults === x}
                  onClick={() => setAdults(x)}
                  className={`flex-1 py-3 rounded-xl text-[15px] font-bold border-[1.5px] transition-all duration-150 ${
                    adults === x
                      ? 'bg-[#0d1810] border-[#0d1810] text-white'
                      : 'bg-transparent border-[#e8e8e8] text-[#333] hover:border-[#555]'
                  }`}
                >{x}</button>
              ))}
            </div>
          </div>

          {/* Children */}
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#aaa] mb-4">Children</p>
            <div role="group" aria-label="Number of children" className="flex gap-2">
              {[0, 1, 2, 3].map((x) => (
                <button
                  key={x}
                  aria-pressed={kids === x}
                  onClick={() => setKids(x)}
                  className={`flex-1 py-3 rounded-xl text-[15px] font-bold border-[1.5px] transition-all duration-150 ${
                    kids === x
                      ? 'bg-[#0d1810] border-[#0d1810] text-white'
                      : 'bg-transparent border-[#e8e8e8] text-[#333] hover:border-[#555]'
                  }`}
                >{x}</button>
              ))}
            </div>
            <p className="text-[12.5px] text-[#bbb] mt-2.5">
              Complete week for {hh}: ~{f(floor)} (USDA minimum).
            </p>
          </div>

          {/* Diet */}
          <div className="mb-10">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#aaa] mb-4">How do you eat?</p>
            <div role="group" aria-label="Dietary preference" className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <button
                  key={d}
                  aria-pressed={diet === d}
                  onClick={() => setDiet(d)}
                  className={`px-5 py-2.5 rounded-full text-[13.5px] font-semibold border-[1.5px] transition-all duration-150 ${
                    diet === d
                      ? 'bg-[#0d1810] border-[#0d1810] text-white'
                      : 'bg-transparent border-[#e8e8e8] text-[#333] hover:border-[#555]'
                  }`}
                >{d}</button>
              ))}
            </div>
            <p className="text-[12.5px] text-[#bbb] mt-2.5">Every meal respects this. Swap any meal later.</p>
          </div>
        </div>

        {/* Sticky CTAs */}
        <div className="sticky bottom-0 px-8 lg:px-14 pb-10 pt-5 bg-gradient-to-t from-white from-60% to-transparent">
          <div className="lg:max-w-[520px] lg:mx-auto w-full">
            {capabilities.ai && (
              <button
                disabled={aiStatus === 'loading'}
                onClick={async () => {
                  await generateWithAI();
                  if (useSession.getState().aiStatus === 'error') rebuildIfDietChanged();
                  setScreen('plan');
                }}
                className="w-full py-3.5 rounded-2xl border border-[#d0d0d0] text-[#555] font-bold text-[15px] mb-3 hover:border-[#aaa] hover:text-[#333] transition-all disabled:opacity-40"
              >
                {aiStatus === 'loading' ? 'Generating your week…' : '✦ Generate with AI'}
              </button>
            )}
            <button
              onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
              className="w-full py-4 rounded-2xl font-bold text-[16px] text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #2c5e3f 0%, #1d3e29 100%)',
                boxShadow: '0 4px 14px rgba(13,24,16,0.25), 0 1px 3px rgba(13,24,16,0.15)',
              }}
            >
              Build my week →
            </button>
            {aiStatus === 'error' && (
              <p className="text-[12px] text-[#bbb] mt-2.5 text-center">
                AI didn't respond — built the usual way instead.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
