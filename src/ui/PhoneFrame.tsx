import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex-none w-[392px] h-[812px] bg-[#1f1c17] rounded-[46px] p-[11px] shadow-[0_2px_1px_rgba(255,255,255,.5)_inset,0_40px_80px_-28px_rgba(43,38,32,.55),0_8px_24px_-12px_rgba(43,38,32,.4)] max-[760px]:w-screen max-[760px]:h-[100dvh] max-[760px]:rounded-none max-[760px]:p-0 max-[760px]:shadow-none">
      <div className="relative w-full h-full bg-surface rounded-[36px] overflow-hidden max-[760px]:rounded-none">
        <StatusBar />
        <div className="absolute inset-0 overflow-y-auto bg-surface" id="app-scroll">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-[26px] z-30 text-[13px] font-semibold text-ink pointer-events-none bg-surface max-[760px]:hidden"
      aria-hidden="true"
    >
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-px h-[11px]">
          <i className="w-[3px] h-[5px] bg-current rounded-sm inline-block" />
          <i className="w-[3px] h-[7px] bg-current rounded-sm inline-block" />
          <i className="w-[3px] h-[9px] bg-current rounded-sm inline-block" />
          <i className="w-[3px] h-[11px] bg-current rounded-sm opacity-35 inline-block" />
        </span>
        <span className="font-bold">3G</span>
        <span className="w-[22px] h-[11px] border-[1.5px] border-current rounded-[3px] relative inline-block">
          <i className="absolute top-0.5 left-0.5 bottom-0.5 w-[9px] bg-current rounded-sm block" />
        </span>
      </span>
    </div>
  );
}
