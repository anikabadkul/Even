import { useEffect, useRef, useState } from 'react';
import { useSession } from '../../state/session';
import { f } from '../format';

export function BarcodeScanner() {
  const { scannerOpen, zip, barcodeStatus, barcodeResult, scanBarcode, closeScanner } = useSession();
  const [upc, setUpc] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scannerOpen) inputRef.current?.focus({ preventScroll: true });
  }, [scannerOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeScanner();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeScanner]);

  if (!scannerOpen) return null;
  const onClose = closeScanner;

  return (
    <div role="dialog" aria-modal="true" aria-label="Scan a barcode" className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(38,34,25,.45)] animate-[fade-in_.25s_ease_both]" onClick={onClose} />
      <div
        ref={dialogRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[430px] bg-surface rounded-t-[18px] flex flex-col overflow-hidden p-[22px]"
        style={{ animation: 'sheet-up .34s cubic-bezier(.22,.61,.36,1) both' }}
      >
        <div className="font-serif text-[22px] mb-1">Check a price</div>
        <p className="text-[13.5px] text-ink-soft mb-3">
          Type the UPC from a barcode (the digits under it) to see the live price at your nearest store.
        </p>
        {!zip && <p className="text-[13.5px] text-ink-soft mb-3">Add your ZIP code above first.</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (upc.trim()) scanBarcode(upc.trim());
          }}
          className="flex gap-2 mb-3"
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder="UPC, e.g. 0001111041700"
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
            aria-label="UPC barcode number"
            className="flex-1 min-h-12 px-3 rounded-xl border-[1.5px] border-line bg-surface text-[15px]"
          />
          <button
            type="submit"
            disabled={!zip || !upc.trim() || barcodeStatus === 'loading'}
            className="min-h-12 px-4 rounded-xl bg-accent text-white text-[15px] font-bold disabled:opacity-50"
          >
            {barcodeStatus === 'loading' ? 'Looking up…' : 'Check'}
          </button>
        </form>

        {barcodeStatus === 'error' && (
          <p className="text-[13.5px] text-ink-soft mb-3">Couldn't find that item at your nearest store.</p>
        )}
        {barcodeResult && (
          <div className="flex justify-between items-baseline border border-line rounded-xl px-3.5 py-3 mb-3">
            <span className="text-[15px] font-semibold">
              {barcodeResult.name}
              {barcodeResult.size && <span className="text-ink-soft font-mono text-xs"> · {barcodeResult.size}</span>}
            </span>
            <span className="font-mono text-base font-bold">{f(barcodeResult.price)}</span>
          </div>
        )}

        <button
          className="w-full min-h-13 rounded-2xl border-[1.5px] border-ink bg-surface text-[16px] font-bold text-ink"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
