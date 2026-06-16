import type { ButtonHTMLAttributes } from 'react';

export function PrimaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-full min-h-14 rounded-2xl bg-accent text-white text-[17px] font-bold shadow-[0_10px_22px_-12px_var(--color-accent)] active:translate-y-px transition-transform ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-full min-h-13 rounded-2xl border-[1.5px] border-ink bg-surface text-[16px] font-bold text-ink ${className}`}
      {...props}
    />
  );
}

export function BackButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-10 h-10 flex-none rounded-[11px] border-[1.5px] border-line bg-surface text-xl text-ink leading-none ${className}`}
      {...props}
    />
  );
}

export function Chip({
  active,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`min-h-12 px-3.5 rounded-xl text-[15px] font-semibold border-[1.5px] transition-colors ${
        active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink'
      } ${className}`}
      aria-pressed={!!active}
      {...props}
    />
  );
}
