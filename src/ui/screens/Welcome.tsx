import { useEffect, useRef } from 'react';
import { PrimaryButton } from '../components/Button';
import { Card } from '../components/Card';
import { useSession } from '../../state/session';

export function Welcome() {
  const setScreen = useSession((s) => s.setScreen);
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col min-h-full pt-[30px] animate-[fade-in_.26s_ease_both]">
      <div className="flex-1 flex flex-col justify-center px-5">
        <span className="font-mono text-xs tracking-[0.16em] uppercase text-accent-ink mb-[18px]">
          A free week of meals
        </span>
        <h2
          ref={headRef}
          tabIndex={-1}
          className="font-serif font-medium text-[32px] leading-[1.05] tracking-tight outline-none"
        >
          Eat as well as your budget allows, and see exactly where it falls short.
        </h2>
        <p className="text-[15.5px] leading-relaxed text-ink-soft mt-[18px] max-w-[330px]">
          Tell us your budget, your household, and how you eat. We build the best 7-day plan that fits, price it to
          the cent, and give you a shopping list for the store.
        </p>
      </div>
      <Card className="mx-5 mb-3.5 !p-[14px] !px-4 bg-paper">
        <p className="text-[13.5px] m-0">
          Built on the USDA Thrifty Food Plan and Dietary Guidelines. Free and independent, no account, nothing
          saved, works offline.
        </p>
      </Card>
      <div className="sticky bottom-0 px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-3.5 bg-gradient-to-t from-surface from-[24%] to-transparent">
        <PrimaryButton onClick={() => setScreen('setup')}>Start →</PrimaryButton>
      </div>
    </div>
  );
}
