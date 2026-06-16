import { useEffect } from 'react';

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

export function Toast({ message, actionLabel, onAction, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, actionLabel ? 6000 : 1800);
    return () => clearTimeout(t);
  }, [onDismiss, actionLabel]);

  return (
    <div
      role="status"
      className="fixed left-1/2 bottom-[30px] -translate-x-1/2 bg-ink text-white text-sm font-semibold pl-[18px] pr-[14px] py-[11px] rounded-full z-[80] flex items-center gap-3.5 max-w-[92vw] shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]"
      style={{ animation: 'toast-in .2s ease both' }}
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          className="text-amber-200 font-extrabold text-sm p-1"
          onClick={() => {
            onAction();
            onDismiss();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
