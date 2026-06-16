import { useCallback, useEffect, useRef } from 'react';
import { useSession } from './state/session';
import { Setup } from './ui/screens/Setup';
import { Plan } from './ui/screens/Plan';
import { ShoppingList } from './ui/screens/ShoppingList';
import { MealSheet } from './ui/screens/MealSheet';

export default function App() {
  const screen = useSession((s) => s.screen);
  const selected = useSession((s) => s.selected);
  const closeMeal = useSession((s) => s.closeMeal);
  const loadCapabilities = useSession((s) => s.loadCapabilities);
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  }, []);

  useEffect(() => { loadCapabilities(); }, [loadCapabilities]);

  return (
    <>
      <h1 className="sr-only">Even — a free weekly meal planner built around your grocery budget</h1>
      {(screen === 'welcome' || screen === 'setup') && <Setup />}
      {screen === 'plan' && <Plan announce={announce} />}
      {screen === 'list' && <ShoppingList announce={announce} />}
      {selected && <MealSheet onClose={closeMeal} announce={announce} />}
      <div ref={liveRef} className="sr-only" aria-live="polite" />
    </>
  );
}
