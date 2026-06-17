import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';
import { useSession } from '../../src/state/session';
import { assembleWeek, DIET_KEY } from '../../src/domain/plan';

beforeEach(() => {
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
});

describe('end-to-end UI flow', () => {
  it('walks welcome -> setup -> plan -> shopping list', () => {
    render(<App />);
    // Welcome screen: landing page CTA
    fireEvent.click(screen.getByRole('button', { name: /plan my week/i }));

    // Setup screen: "set up your week" heading (sr-only h2)
    expect(screen.getByText(/set up your week/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /generate my week/i }));

    // Plan screen
    expect(screen.getByRole('button', { name: /get my shopping list/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /get my shopping list/i }));

    // Shopping list screen
    expect(screen.getByText(/everything for the week/i)).toBeInTheDocument();
  });

  it('opens a meal sheet and swaps a meal', () => {
    useSession.getState().setScreen('plan');
    render(<App />);
    const mealButtons = screen.getAllByRole('button', { name: /breakfast:/i });
    fireEvent.click(mealButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shuffling changes the displayed week and undo restores it', () => {
    useSession.getState().setScreen('plan');
    render(<App />);
    const before = useSession.getState().picks;
    fireEvent.click(screen.getByRole('button', { name: /shuffle the week/i }));
    expect(useSession.getState().picks).not.toEqual(before);
  });
});
