import { useCallback, useRef } from 'react';
import { useSession } from './state/session';
import { PhoneFrame } from './ui/PhoneFrame';
import { Welcome } from './ui/screens/Welcome';
import { Setup } from './ui/screens/Setup';
import { Plan } from './ui/screens/Plan';
import { ShoppingList } from './ui/screens/ShoppingList';
import { MealSheet } from './ui/screens/MealSheet';
import { BarcodeScanner } from './ui/components/BarcodeScanner';

function Editorial() {
  return (
    <div className="flex-[0_1_360px] max-w-[380px] max-[760px]:hidden">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-ink-soft mb-5">Meal planner · 2026</div>
      <div className="font-serif font-medium text-[72px] leading-[0.92] tracking-tight mb-4">Even</div>
      <div className="font-serif italic text-[25px] leading-[1.28] mb-[18px] max-w-[320px]">
        Eat well on what you actually have.
      </div>
      <p className="text-base leading-relaxed text-ink-soft mb-[26px] max-w-[340px]">
        A free 7-day plan built around your budget and your diet, and honest about where a tight budget leaves you
        short instead of pretending it doesn't.
      </p>
      {['Honest about the nutrition gap', 'No account. No cost. Ever.', 'Built for any phone, even on 3G'].map(
        (t) => (
          <div key={t} className="flex items-center gap-3 text-[15px] mb-2.5">
            <i className="w-[7px] h-[7px] rounded-full bg-accent flex-none inline-block" />
            {t}
          </div>
        ),
      )}
    </div>
  );
}

export default function App() {
  const screen = useSession((s) => s.screen);
  const selected = useSession((s) => s.selected);
  const closeMeal = useSession((s) => s.closeMeal);
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  }, []);

  return (
    <>
      <h1 className="sr-only">
        Even, a free weekly meal planner that builds the best week within your grocery budget and shows where it
        falls short
      </h1>
      <div className="min-h-screen flex flex-wrap gap-14 items-center justify-center px-9 py-12 max-[760px]:block max-[760px]:p-0">
        <Editorial />
        <PhoneFrame
          overlay={
            <>
              {selected && <MealSheet onClose={closeMeal} announce={announce} />}
              <BarcodeScanner />
            </>
          }
        >

          {screen === 'welcome' && <Welcome />}
          {screen === 'setup' && <Setup />}
          {screen === 'plan' && <Plan announce={announce} />}
          {screen === 'list' && <ShoppingList announce={announce} />}
        </PhoneFrame>
      </div>
      <div ref={liveRef} className="sr-only" aria-live="polite" />
    </>
  );
}
