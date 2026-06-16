import { describe, expect, it, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import App from '../../src/App';
import { useSession } from '../../src/state/session';
import { assembleWeek, DIET_KEY } from '../../src/domain/plan';

function resetSession() {
  useSession.setState({
    screen: 'welcome',
    budget: 41.5,
    adults: 1,
    kids: 0,
    diet: 'Vegetarian',
    seed: 0,
    picks: assembleWeek(DIET_KEY['Vegetarian'], 0),
    picksDiet: DIET_KEY['Vegetarian'],
    edited: false,
    saved: false,
    selected: null,
  });
}

beforeEach(resetSession);

describe('accessibility (axe)', () => {
  it('welcome screen has no detectable violations', async () => {
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('setup screen has no detectable violations', async () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('plan screen has no detectable violations', async () => {
    useSession.getState().setScreen('plan');
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shopping list screen has no detectable violations', async () => {
    useSession.getState().setScreen('list');
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('meal sheet dialog has no detectable violations', async () => {
    useSession.getState().setScreen('plan');
    useSession.getState().openMeal(0, 'B');
    const { container } = render(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
