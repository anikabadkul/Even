import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`bg-surface border-[1.5px] border-line rounded-[18px] p-[18px] ${className}`} {...props} />;
}

export function Label({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`block text-[12.5px] font-bold tracking-wide uppercase text-ink-soft ${className}`} {...props} />
  );
}
