import {
  BatteryCharging, Bookmark, BriefcaseMedical, CalendarRange, Clock3, CloudRain, Cookie, DoorClosed, Droplets, Flashlight, Fuel,
  GlassWater, IdCard, PaintBucket, Phone, Pill, ScanSearch, Scissors, Share2, ShieldCheck, Smartphone, SquareParking, Sprout,
  SunDim, ThermometerSun, Trees, TriangleAlert, Umbrella, UtilityPole, Waves, Wind, Wrench,
} from 'lucide-react';
import {ease, sp} from '../anim';
import {Art, Cloud, Darken, Flash, Rain, Spot, SunGlow, WindLines} from './Art';
import {useNino} from './context';
import {Kicker, Row, Title} from './Shell';
import {artTop, N} from './theme';

/* eslint-disable @typescript-eslint/no-explicit-any */
const ICONS: Record<string, React.FC<any>> = {
  ThermometerSun, SunDim, CloudRain, Waves, ScanSearch, Wrench, ShieldCheck, Scissors, Sprout, Wind, PaintBucket, DoorClosed,
  Droplets, Trees, UtilityPole, SquareParking, Smartphone, Clock3, Umbrella, Flashlight, BatteryCharging, GlassWater, Cookie,
  BriefcaseMedical, Pill, IdCard, Fuel,
};
export const Icon: React.FC<{name: string; size?: number}> = ({name, size = 46}) => {
  const C = ICONS[name];
  return <C size={size} strokeWidth={2.3} />;
};

const tipLabel = (lang: string, n: number) => (lang === 'ar' ? `نصيحة ${n} من 7` : `Tip ${n} of 7`);

// ---------------------------------------------------------------- hook
export const Hook: React.FC = () => {
  const {frame, cue, scene, content, font, lang} = useNino();
  const s = scene('hook');
  const c = content('hook');
  const chip = sp(frame, cue('hook', 'dates'));
  const tips = [Wrench, Sprout, Droplets, SquareParking, Smartphone, Waves, BriefcaseMedical];
  return (
    <>
      <Art art={1} start={s.start} end={s.end}>
        <SunGlow x={0.08} y={0.03} fadeAt={cue('hook', 'storm')} />
        <Cloud from={cue('hook', 'dates') - 0.5} x0={1.0} x1={0.42} y={0.02} scale={1.3} />
        <Darken from={cue('hook', 'storm')} amount={0.25} />
        <Rain from={cue('hook', 'storm')} density={60} opacity={0.5} />
        <Spot x={0.78} y={0.2} at={cue('hook', 'storm')} until={s.end - 0.6} />
      </Art>
      <Kicker at={s.start + 0.2} text={c.kicker} />
      <Title at={cue('hook', 'title')} text={c.title} size={104} sub={c.sub} subAt={cue('hook', 'title') + 1.4} />
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '20px 34px',
            borderRadius: 26,
            background: N.card,
            border: `3px solid ${N.blue}`,
            boxShadow: `0 14px 34px ${N.blue}33`,
            fontFamily: font.head,
            fontWeight: 800,
            fontSize: 40,
            color: N.ink,
            opacity: chip,
            transform: `scale(${0.7 + 0.3 * chip})`,
          }}
        >
          <CalendarRange size={46} color={N.blue} strokeWidth={2.4} />
          {c.chip}
        </div>
      </div>
      <div style={{position: 'absolute', top: 800, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18}}>
        {tips.map((I, i) => {
          const p = sp(frame, cue('hook', 'steps') + i * 0.12, {damping: 11});
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: p, transform: `translateY(${(1 - p) * 50}px) scale(${p})`}}>
              <div style={{width: 92, height: 92, borderRadius: 46, background: N.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 18px ${N.orange}55`}}>
                <I size={44} strokeWidth={2.3} />
              </div>
              <span style={{fontFamily: font.head, fontWeight: 800, fontSize: 30, color: N.muted}}>{lang === 'ar' ? i + 1 : i + 1}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- why
export const Why: React.FC = () => {
  const {frame, cue, scene, content, font, lang} = useNino();
  const s = scene('why');
  const c = content('why');
  const warn = sp(frame, cue('why', 'warn'));
  return (
    <>
      <Art art={2} start={s.start} end={s.end}>
        <SunGlow x={0.36} y={0.48} />
      </Art>
      <Kicker at={s.start + 0.2} text={c.kicker} color={N.blue} />
      <Title at={cue('why', 'peak')} text={c.title} size={72} />
      <div style={{position: 'absolute', top: 500, left: 70, right: 70, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26}}>
        {c.bullets.map((b: any, i: number) => {
          const p = sp(frame, cue('why', b.at), {damping: 11, stiffness: 160});
          return (
            <div
              key={i}
              style={{
                height: 250,
                borderRadius: 34,
                background: N.card,
                border: `3px solid ${b.color}`,
                boxShadow: `0 16px 34px ${b.color}30`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                opacity: p,
                transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
              }}
            >
              <div style={{width: 112, height: 112, borderRadius: 34, background: b.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={b.icon} size={62} />
              </div>
              <span style={{fontFamily: font.head, fontWeight: 800, fontSize: 44, color: N.ink}}>{b[lang]}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 1050, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 30px',
            borderRadius: 999,
            background: N.red,
            color: '#fff',
            fontFamily: font.head,
            fontWeight: 800,
            fontSize: 36,
            opacity: warn,
            transform: `scale(${0.6 + 0.4 * warn})`,
            boxShadow: `0 10px 26px ${N.red}55`,
          }}
        >
          <TriangleAlert size={40} strokeWidth={2.6} />
          {c.warn}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- generic checklist tip
export const TipScene: React.FC<{id: string; fx?: (c: any) => React.ReactNode; extra?: React.ReactNode; rowsTop?: number}> = ({id, fx, extra, rowsTop}) => {
  const {cue, scene, content, lang} = useNino();
  const s = scene(id);
  const c = content(id);
  const times = c.bullets.map((b: any) => cue(id, b.at));
  const titleH = c.sub ? 120 : 0;
  return (
    <>
      <Art art={c.art} start={s.start} end={s.end}>
        {fx?.(c)}
        {c.bullets.map((b: any, i: number) =>
          b.spot ? <Spot key={i} x={b.spot[0]} y={b.spot[1]} at={times[i]} until={times[i + 1]} tone={b.bad ? 'bad' : b.good ? 'good' : 'info'} /> : null,
        )}
      </Art>
      <Kicker at={s.start + 0.15} text={tipLabel(lang, c.tip)} />
      <Title at={cue(id, 'title')} text={c.title} sub={c.sub} subAt={cue(id, 'title') + 1.2} />
      <div style={{position: 'absolute', top: rowsTop ?? 470 + titleH, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 22, maxHeight: artTop(c.art) - (rowsTop ?? 470 + titleH) - 20}}>
        {c.bullets.map((b: any, i: number) => (
          <Row
            key={i}
            at={times[i]}
            next={times[i + 1] ?? s.end - 0.8}
            icon={<Icon name={b.icon} />}
            label={b[lang]}
            tone={b.bad ? 'bad' : b.good ? 'good' : 'info'}
            bonus={b.bonus}
          />
        ))}
      </div>
      {extra}
    </>
  );
};

// ---------------------------------------------------------------- stay updated (quote banner)
export const Updates: React.FC = () => {
  const {frame, cue, content, font} = useNino();
  const c = content('updates');
  const q = sp(frame, cue('updates', 'life'));
  return (
    <TipScene
      id="updates"
      fx={() => (
        <>
          <Darken from={cue('updates', 'flip')} amount={0.3} />
          <Rain from={cue('updates', 'flip')} area={[0.0, 0.26]} density={30} opacity={0.6} />
        </>
      )}
      extra={
        <div style={{position: 'absolute', top: artTop(7) + 30, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              padding: '22px 40px',
              borderRadius: 30,
              background: N.ink,
              color: '#fff',
              fontFamily: font.head,
              fontWeight: 800,
              fontSize: 46,
              opacity: q,
              transform: `scale(${0.6 + 0.4 * q})`,
              boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
            }}
          >
            {c.quote}
          </div>
        </div>
      }
    />
  );
};

// ---------------------------------------------------------------- wadi
export const Wadi: React.FC = () => {
  const {frame, cue, scene, content, font, lang, rtl} = useNino();
  const s = scene('wadi');
  const c = content('wadi');
  const stat = sp(frame, cue('wadi', 'stat'), {damping: 13});
  const level = ease(frame, cue('wadi', 'stat') + 0.2, 1.8);
  const cm = Math.round(30 * level);
  const wait = sp(frame, cue('wadi', 'wait'));
  return (
    <>
      <Art art={8} start={s.start} end={s.end}>
        <Rain from={s.start} density={80} opacity={0.55} />
        <Flash times={[cue('wadi', 'title') - 0.1, cue('wadi', 'stat') + 2.6]} />
        <Spot x={0.3} y={0.86} at={cue('wadi', 'title')} tone="bad" />
      </Art>
      <Kicker at={s.start + 0.15} text={tipLabel(lang, c.tip)} color={N.red} />
      <div style={{position: 'absolute', top: 320, left: 60, right: 60, textAlign: 'center', fontFamily: font.head, fontWeight: 700, fontSize: 40, color: N.muted, opacity: ease(frame, cue('wadi', 'kick'), 0.6)}}>
        {c.kick}
      </div>
      <Title at={cue('wadi', 'title')} text={c.title} top={390} size={78} color={N.red} />
      <div style={{position: 'absolute', top: 610, left: 70, right: 70, display: 'flex', alignItems: 'center', gap: 34, flexDirection: 'row', opacity: stat, transform: `scale(${0.7 + 0.3 * stat})`}}>
        {/* water gauge */}
        <div style={{position: 'relative', width: 150, height: 300, borderRadius: 30, background: N.card, border: `4px solid ${N.blue}`, overflow: 'hidden', flexShrink: 0}}>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${level * 72}%`, background: `linear-gradient(${N.blue}cc, ${N.blue})`}}>
            <svg style={{position: 'absolute', top: -14, left: 0, width: 300, transform: `translateX(${-((frame * 4) % 150)}px)`}} viewBox="0 0 300 20">
              <path d="M0 10 Q 37 0 75 10 T 150 10 T 225 10 T 300 10 V20 H0Z" fill={`${N.blue}cc`} />
            </svg>
          </div>
          {[0.25, 0.5, 0.75].map((m) => (
            <div key={m} style={{position: 'absolute', [rtl ? 'right' : 'left']: 0, width: 40, bottom: `${m * 96}%`, height: 4, background: N.ink, opacity: 0.4}} />
          ))}
        </div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: font.head, fontWeight: 800, fontSize: 170, lineHeight: 1, color: N.blue, direction: 'ltr', textAlign: rtl ? 'right' : 'left'}}>
            {lang === 'ar' ? `${cm} سم` : `${cm} cm`}
          </div>
          <div style={{marginTop: 14, fontFamily: font.body, fontWeight: font.bodyWeight + 100, fontSize: 42, lineHeight: 1.25, color: N.ink}}>{c.statText}</div>
        </div>
      </div>
      <div style={{position: 'absolute', top: artTop(8) - 105, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            padding: '18px 36px',
            borderRadius: 999,
            background: N.green,
            color: '#fff',
            fontFamily: font.head,
            fontWeight: 800,
            fontSize: 40,
            opacity: wait,
            transform: `scale(${0.6 + 0.4 * wait})`,
            boxShadow: `0 12px 28px ${N.green}55`,
          }}
        >
          {c.waitText}
        </div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- bag
export const Bag: React.FC = () => {
  const {frame, cue, scene, content, font, lang} = useNino();
  const s = scene('bag');
  const c = content('bag');
  return (
    <>
      <Art art={9} start={s.start} end={s.end}>
        {c.bullets.map((b: any, i: number) =>
          b.spot ? <Spot key={i} x={b.spot[0]} y={b.spot[1]} at={cue('bag', b.at)} until={cue('bag', c.bullets[i + 1]?.at ?? 'b8') + 0.6} /> : null,
        )}
      </Art>
      <Kicker at={s.start + 0.15} text={tipLabel(lang, c.tip)} />
      <Title at={cue('bag', 'title')} text={c.title} size={74} />
      <div style={{position: 'absolute', top: 480, left: 60, right: 60, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20}}>
        {c.bullets.map((b: any, i: number) => {
          const at = cue('bag', b.at);
          const p = sp(frame, at, {damping: 11, stiffness: 170});
          const active = frame >= at * 30 && frame < (cue('bag', c.bullets[i + 1]?.at ?? 'zz') || s.end) * 30;
          return (
            <div
              key={i}
              style={{
                height: 220,
                borderRadius: 30,
                background: N.card,
                border: `3px solid ${active ? N.orange : N.line}`,
                boxShadow: active ? `0 14px 30px ${N.orange}40` : '0 8px 20px rgba(80,60,30,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                opacity: p,
                transform: `scale(${(0.4 + 0.6 * p) * (active ? 1.05 : 1)})`,
              }}
            >
              <div style={{width: 96, height: 96, borderRadius: 28, background: N.orange, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={b.icon} size={52} />
              </div>
              <span style={{fontFamily: font.body, fontWeight: font.bodyWeight + 100, fontSize: 34, color: N.ink, textAlign: 'center', lineHeight: 1.15, padding: '0 10px'}}>
                {b[lang]}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------------------------------------------- outro
export const Outro: React.FC = () => {
  const {frame, cue, scene, content, font} = useNino();
  const s = scene('outro');
  const c = content('outro');
  const save = sp(frame, cue('outro', 'save'));
  const share = sp(frame, cue('outro', 'share'));
  const sos = sp(frame, cue('outro', 'sos'), {damping: 11});
  const press = (at: number) => {
    const d = frame - (at + 0.5) * 30;
    return d > 0 && d < 10 ? 1 - Math.sin((d / 10) * Math.PI) * 0.12 : 1;
  };
  const ring = ((frame - cue('outro', 'sos') * 30) % 40) / 40;
  const btn = (p: number, at: number, icon: React.ReactNode, label: string, color: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '22px 44px',
        borderRadius: 999,
        background: color,
        color: '#fff',
        fontFamily: font.head,
        fontWeight: 800,
        fontSize: 44,
        opacity: p,
        transform: `scale(${(0.6 + 0.4 * p) * press(at)})`,
        boxShadow: `0 12px 28px ${color}55`,
      }}
    >
      {icon}
      {label}
    </div>
  );
  return (
    <>
      <Art art={10} start={s.start} end={s.end + 2}>
        <Rain from={s.start} density={40} opacity={0.35} area={[0, 0.5]} />
      </Art>
      <Title at={cue('outro', 'title')} text={c.title} top={250} size={96} sub={c.sub} subAt={cue('outro', 'title') + 1.0} />
      <div style={{position: 'absolute', top: 540, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30}}>
        {btn(save, cue('outro', 'save'), <Bookmark size={44} strokeWidth={2.6} />, c.save, N.blue)}
        {btn(share, cue('outro', 'share'), <Share2 size={44} strokeWidth={2.6} />, c.share, N.orange)}
      </div>
      <div style={{position: 'absolute', top: 700, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            padding: '26px 46px',
            borderRadius: 40,
            background: N.red,
            color: '#fff',
            opacity: sos,
            transform: `scale(${0.6 + 0.4 * sos})`,
            boxShadow: `0 20px 44px ${N.red}66`,
          }}
        >
          <div style={{position: 'relative', width: 110, height: 110}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 55, border: '5px solid #fff', transform: `scale(${1 + ring * 0.5})`, opacity: 1 - ring}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: 55, background: '#fff', color: N.red, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Phone size={56} strokeWidth={2.6} />
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span style={{fontFamily: font.head, fontWeight: 700, fontSize: 36, opacity: 0.95}}>{c.sos}</span>
            <span style={{fontFamily: 'Jakarta, sans-serif', fontWeight: 800, fontSize: 120, lineHeight: 1, letterSpacing: 6, direction: 'ltr'}}>9999</span>
          </div>
        </div>
      </div>
    </>
  );
};

export const fxCarport = () => <WindLines from={0} y={0.16} count={4} />;
export const fxGarden = () => <WindLines from={0} y={0.24} count={4} />;
export const fxWater = () => <Rain from={0} area={[0.0, 0.3]} density={26} opacity={0.6} />;
export const fxParking = () => <Rain from={0} area={[0.0, 0.48]} density={40} opacity={0.55} />;
export const tipRowsTop = (hasSub: boolean) => (hasSub ? 590 : 470);
