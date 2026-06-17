import { useEffect, useRef } from 'react';
import { useSession } from '../../state/session';
import { floorFor } from '../../domain/budget';
import { householdLabel } from '../../domain/nutrition';
import { f } from '../format';
import type { DietLabel } from '../../domain/types';

const DIETS: DietLabel[] = ['Vegan', 'Vegetarian', 'Omnivore', 'Halal', 'Gluten-free'];

/* ─── Design tokens ─── */
const C = {
  bg:           '#0b1209',
  bgGlow:       'rgba(52,112,68,0.42)',
  text:         '#e8dfc8',
  textMuted:    '#5a8a6a',
  textFaint:    '#2e5038',
  border:       'rgba(255,255,255,0.1)',
  chipBg:       'rgba(255,255,255,0.07)',
  chipBorder:   'rgba(255,255,255,0.18)',
  chipText:     'rgba(232,223,200,0.82)',
  activeGreen:  '#2d6b47',
  activeBorder: '#3d8a5c',
  ctaGrad:      'linear-gradient(150deg, #357050 0%, #1a3d26 100%)',
};

export function Setup() {
  const {
    budget, adults, kids, diet, aiStatus, capabilities,
    setScreen, setBudget, setAdults, setKids, setDiet,
    rebuildIfDietChanged, generateWithAI,
  } = useSession();
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headRef.current?.focus({ preventScroll: true }); }, []);

  const size  = Math.max(1, adults + kids);
  const floor = floorFor(size);
  const hh    = householdLabel({ adults, kids });

  const numBtn = (val: number, active: boolean, fn: () => void, label?: string) => (
    <button
      key={val}
      aria-pressed={active}
      onClick={fn}
      style={{
        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
        background: active ? C.activeGreen : C.chipBg,
        color:      active ? '#fff'        : C.chipText,
        border:     `1.5px solid ${active ? C.activeBorder : C.chipBorder}`,
        fontSize: 15, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.13s',
        boxShadow: active ? '0 0 18px rgba(45,107,71,0.45)' : 'none',
      }}
    >{label ?? val}</button>
  );

  return (
    <div
      className="animate-[fade-in_.4s_ease_both]"
      style={{
        minHeight: '100vh',
        background: C.bg,
        backgroundImage: `radial-gradient(ellipse 110% 60% at 50% -8%, ${C.bgGlow} 0%, transparent 65%)`,
      }}
    >
      <h2 className="sr-only">Set up your week</h2>

      {/* Grain */}
      <div aria-hidden="true" style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.045,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* ── Page shell ── */}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'0 24px' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign:'center', width:'100%', paddingTop:'clamp(40px,7vw,72px)' }}>
          <p className="font-mono" style={{ fontSize:10, letterSpacing:'0.4em', color:C.textFaint, textTransform:'uppercase', marginBottom:12 }}>
            Free meal planner · 2026
          </p>
          <h1
            ref={headRef}
            tabIndex={-1}
            className="font-serif font-bold"
            style={{
              fontSize:'clamp(96px,22vw,220px)',
              lineHeight:0.86, letterSpacing:'-0.045em',
              color:C.text, outline:'none', margin:0,
            }}
          >
            Even
          </h1>
          <p className="font-serif italic" style={{ fontSize:'clamp(17px,2.4vw,22px)', color:C.textMuted, marginTop:20, marginBottom:'clamp(44px,7vw,68px)' }}>
            Eat well on what you actually have.
          </p>
        </div>

        {/* ── Form ── */}
        <div style={{ width:'100%', maxWidth:480 }}>

          {/* Budget */}
          <section style={{ marginBottom:40 }}>
            <p className="font-mono" style={{ fontSize:11, letterSpacing:'0.28em', color:C.textMuted, textTransform:'uppercase', marginBottom:20 }}>
              Budget / week
            </p>

            {/* Big number row */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button
                aria-label="Decrease budget"
                onClick={() => setBudget(Math.max(10, budget - 1))}
                style={{
                  width:44, height:44, borderRadius:12, flexShrink:0,
                  background:C.chipBg, border:`1.5px solid ${C.chipBorder}`,
                  color:C.chipText, fontSize:22, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.13s',
                }}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.13)';e.currentTarget.style.color=C.text;}}
                onMouseOut={e=>{e.currentTarget.style.background=C.chipBg;e.currentTarget.style.color=C.chipText;}}
              >−</button>

              <div style={{ flex:1, textAlign:'center', lineHeight:1 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', gap:6 }}>
                  <span className="font-serif" style={{ fontSize:28, color:C.textMuted, marginTop:16, lineHeight:1 }}>$</span>
                  <span className="font-serif font-bold" style={{ fontSize:'clamp(72px,13vw,112px)', letterSpacing:'-0.03em', color:C.text, lineHeight:1 }}>
                    {Math.round(budget)}
                  </span>
                </div>
                <p className="font-mono" style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{f(budget/7)} per day</p>
              </div>

              <button
                aria-label="Increase budget"
                onClick={() => setBudget(Math.min(400, budget + 1))}
                style={{
                  width:44, height:44, borderRadius:12, flexShrink:0,
                  background:C.chipBg, border:`1.5px solid ${C.chipBorder}`,
                  color:C.chipText, fontSize:22, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.13s',
                }}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.13)';e.currentTarget.style.color=C.text;}}
                onMouseOut={e=>{e.currentTarget.style.background=C.chipBg;e.currentTarget.style.color=C.chipText;}}
              >+</button>
            </div>

            <input
              type="range" min={10} max={300} step={1}
              value={Math.min(300,budget)}
              aria-label="Weekly grocery budget slider"
              onChange={e => setBudget(parseFloat(e.target.value))}
              style={{ width:'100%', marginTop:22, accentColor:'#3d8a5c' } as React.CSSProperties}
            />
            <p style={{ fontSize:12, color:C.textFaint, marginTop:9 }}>SNAP averages about $43/week per person.</p>
          </section>

          {/* Divider */}
          <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:36 }} />

          {/* Household */}
          <section style={{ marginBottom:36 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div>
                <p className="font-mono" style={{ fontSize:11, letterSpacing:'0.28em', color:C.textMuted, textTransform:'uppercase', marginBottom:14 }}>Adults</p>
                <div role="group" aria-label="Number of adults" style={{ display:'flex', gap:8 }}>
                  {[1,2,3,4].map(x => numBtn(x, adults===x, () => setAdults(x)))}
                </div>
              </div>
              <div>
                <p className="font-mono" style={{ fontSize:11, letterSpacing:'0.28em', color:C.textMuted, textTransform:'uppercase', marginBottom:14 }}>Children</p>
                <div role="group" aria-label="Number of children" style={{ display:'flex', gap:8 }}>
                  {[0,1,2,3].map(x => numBtn(x, kids===x, () => setKids(x)))}
                </div>
              </div>
            </div>
            <p style={{ fontSize:12, color:C.textFaint, marginTop:14 }}>
              Complete week for {hh}: ~{f(floor)} (USDA minimum).
            </p>
          </section>

          {/* Divider */}
          <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:36 }} />

          {/* Diet */}
          <section style={{ marginBottom:44 }}>
            <p className="font-mono" style={{ fontSize:11, letterSpacing:'0.28em', color:C.textMuted, textTransform:'uppercase', marginBottom:14 }}>How do you eat?</p>
            <div role="group" aria-label="Dietary preference" style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {DIETS.map(d => {
                const active = diet === d;
                return (
                  <button
                    key={d}
                    aria-pressed={active}
                    onClick={() => setDiet(d)}
                    style={{
                      padding:'9px 20px', borderRadius:999, fontSize:13.5, fontWeight:600,
                      background: active ? C.activeGreen  : C.chipBg,
                      color:      active ? '#fff'          : C.chipText,
                      border:     `1.5px solid ${active ? C.activeBorder : C.chipBorder}`,
                      cursor:'pointer', transition:'all 0.13s',
                      boxShadow: active ? '0 0 16px rgba(45,107,71,0.4)' : 'none',
                    }}
                  >{d}</button>
                );
              })}
            </div>
          </section>

          {/* CTAs */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:'clamp(48px,8vw,80px)' }}>
            {capabilities.ai && (
              <button
                disabled={aiStatus==='loading'}
                onClick={async () => {
                  await generateWithAI();
                  if (useSession.getState().aiStatus==='error') rebuildIfDietChanged();
                  setScreen('plan');
                }}
                style={{
                  width:'100%', padding:'14px 0', borderRadius:14,
                  background:'rgba(255,255,255,0.05)', border:`1.5px solid ${C.chipBorder}`,
                  fontSize:14, fontWeight:600, color:C.chipText, cursor:'pointer', transition:'all 0.13s',
                }}
                onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color=C.text;}}
                onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color=C.chipText;}}
              >
                {aiStatus==='loading' ? 'Generating your week…' : '✦ Generate with AI'}
              </button>
            )}
            <button
              onClick={() => { rebuildIfDietChanged(); setScreen('plan'); }}
              style={{
                width:'100%', padding:'18px 0', borderRadius:16,
                border:'none', fontSize:17, fontWeight:700, color:'#fff',
                background: C.ctaGrad,
                boxShadow:'0 0 56px rgba(45,112,70,0.35), 0 10px 32px rgba(0,0,0,0.55)',
                cursor:'pointer', transition:'transform 0.14s, box-shadow 0.14s',
                letterSpacing:'-0.01em',
              }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 0 80px rgba(45,112,70,0.48), 0 14px 40px rgba(0,0,0,0.55)';}}
              onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 0 56px rgba(45,112,70,0.35), 0 10px 32px rgba(0,0,0,0.55)';}}
            >
              Build my week →
            </button>
            {aiStatus==='error' && (
              <p style={{ fontSize:12, color:C.textFaint, textAlign:'center', margin:0 }}>AI didn't respond — built the usual way.</p>
            )}
          </div>

          <p className="font-mono text-center" style={{ fontSize:10, letterSpacing:'0.22em', color:C.textFaint, textTransform:'uppercase', paddingBottom:40 }}>
            No account &nbsp;·&nbsp; No cost &nbsp;·&nbsp; USDA-based &nbsp;·&nbsp; Works offline
          </p>
        </div>
      </div>
    </div>
  );
}
