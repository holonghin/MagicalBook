import type { BlockRenderer } from '../../../engine/types';
import { Plot, widget, slider, button, math, fixed, demoSequence, sequenceControls, teachingBeats } from './ink';
const raw = String.raw;

/** Shared anchors keep all arrow tips attached under responsive SVG scaling. */
export const mapping: BlockRenderer = () => {
  const w=widget('Domain, codomain, range and the graph of a function');let progress=0;
  const sources=[-1,0,1].map((value,i)=>({value,x:200,y:75+i*85}));
  const targets=[0,1,2].map(value=>({value,x:655,y:245-value*85}));
  const draw=()=>{
    const p=new Plot(-1.5,1.5,-.5,2),mix=(a:number,b:number)=>a+(b-a)*progress;
    let ink=`<defs><marker id="f0-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#624c2c" stroke-width="1.6"/></marker></defs><g opacity="${1-progress}"><ellipse class="calc-set" cx="200" cy="160" rx="90" ry="125"/><ellipse class="calc-set" cx="655" cy="160" rx="108" ry="125"/><ellipse class="calc-band" cx="655" cy="203" rx="45" ry="67"/><text x="145" y="24">A: domain</text><text x="580" y="24">B: codomain</text><text x="705" y="220">range</text>`;
    targets.forEach(t=>{ink+=`<circle class="calc-point ${t.value===2?'hollow':''}" data-output="${t.value}" cx="${t.x}" cy="${t.y}" r="6"/><text x="${t.x+14}" y="${t.y+6}">${t.value}${t.value===2?' (unreached)':''}</text>`;});
    sources.forEach((s,i)=>{const t=targets[s.value**2],end=t.x-9;ink+=`<path class="calc-map-arrow calc-curve" data-input="${s.value}" data-target="${t.value}" data-end-x="${end}" data-end-y="${t.y}" marker-end="url(#f0-arrow)" d="M${s.x+9},${s.y} C${370+i*30},${s.y} ${end-100},${t.y} ${end},${t.y}"/><text x="170" y="${s.y+6}">${s.value}</text>`;});
    ink+=`</g><g opacity="${progress}">${p.axes()}</g>`;
    sources.forEach(s=>{ink+=`<circle class="calc-point" cx="${mix(s.x,p.x(s.value))}" cy="${mix(s.y,p.y(s.value**2))}" r="6"/>`;});
    w.drawing.innerHTML=`<svg viewBox="0 0 900 320" role="img" aria-label="Minus one maps to one; zero to zero; one to one; two is unreached">${ink}</svg>`;
    math(w.output,progress<.5?raw`A=\{-1,0,1\},\ B=\{0,1,2\},\ f(x)=x^2,\ f(A)=\{0,1\}`:raw`\operatorname{Graph}(f)=\{(-1,1),(0,0),(1,1)\}`);
  };
  const seq=demoSequence(w.figure,1,step=>{progress=step;draw();});seq.duration=900;
  seq.transition=(from,to,t)=>{progress=from+(to-from)*(t*t*(3-2*t));draw();};
  sequenceControls(w.controls,seq,'Mapping → graph','Graph → mapping');seq.setStep(0);return w.figure;
};
export const injectivity: BlockRenderer = () => {
  const w=widget('Restrict a non-injective function before reversing its arrows');let stage=0,level=1;
  const note=document.createElement('small');note.className='calc-note';w.figure.append(note);
  const draw=()=>{
    const p=new Plot(-2,2,-.5,4),root=Math.sqrt(level);
    if(stage===3){w.drawing.innerHTML='<div class="calc-formula-panel"></div>';math(w.drawing.firstElementChild as HTMLElement,raw`\begin{gathered}x_1<x_2\Rightarrow f(x_1)<f(x_2)\quad\text{strictly increasing}\\x_1<x_2\Rightarrow f(x_1)>f(x_2)\quad\text{strictly decreasing}\\\text{either on the whole domain}\Rightarrow\text{one-to-one}\end{gathered}`);}
    else w.drawing.innerHTML=p.svg(p.curve(x=>x*x,stage>0?0:-2,2)+p.line(-2,level,2,level)+p.point(root,level,'one input')+(stage===0?p.point(-root,level,'another input'):''));
    math(w.output,stage===0?raw`-\sqrt y\mapsto y\mapsfrom\sqrt y\quad(y>0):\quad\text{not one-to-one}`:stage===1?raw`f:[0,\infty)\to\mathbb R,\quad x\mapsto x^2\quad\text{is one-to-one}`:raw`f^{-1}:[0,\infty)\to[0,\infty),\quad y\mapsto\sqrt y`);
    note.textContent=['Two distinct inputs reach one height. Reversing would not define a function.','Keep nonnegative inputs; each reached height now has one input.','Reverse the unique pairing. An inverse on the codomain also needs onto.','An inverse is not a reciprocal. Strict monotonicity is sufficient, not necessary.'][stage];
  };
  const input=slider(w.controls,'Horizontal level',.1,3.5,level,n=>{level=n;draw();});
  const seq=demoSequence(w.figure,3,step=>{stage=step;level=[1,2.5,.5,.5][step];input.value=String(level);draw();return [w.output];});sequenceControls(w.controls,seq,'Restrict / reverse / characterize');seq.setStep(0);return w.figure;
};

/** Solve on monotone pieces, including tangencies, rather than guessing one IVT root. */
export function cubicLevelRoots(level: number, bound = 1.4) {
  const f = (x: number) => x * x * x - x - level, c = 1 / Math.sqrt(3);
  const intervals = [-bound, -c, c, bound], roots: number[] = [];
  const add = (x: number) => { if (!roots.some(r => Math.abs(r - x) < 1e-6)) roots.push(x); };
  for (let i = 0; i < intervals.length - 1; i++) {
    let a = intervals[i], b = intervals[i + 1];
    if (Math.abs(f(a)) < 1e-9) add(a);
    if (Math.abs(f(b)) < 1e-9) add(b);
    if (f(a) * f(b) >= 0) continue;
    for (let j = 0; j < 55; j++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; }
    add((a + b) / 2);
  }
  return roots.sort((a, b) => a - b);
}
export const ivt: BlockRenderer = () => {
  const w = widget('Intermediate values with all intersections marked'); let level = 0;
  const bound = 1.4, end = bound ** 3 - bound;
  const draw = () => {
    const p = new Plot(-1.6, 1.6, -1.8, 1.8), roots = cubicLevelRoots(level);
    let ink = p.curve(x => x ** 3 - x, -bound, bound) + p.line(-1.6, level, 1.6, level, 'calc-bound');
    ink += p.point(-bound, -end, 'a') + p.point(bound, end, 'b');
    roots.forEach(x => { ink += p.point(x, level); });
    w.drawing.innerHTML = p.svg(ink); w.figure.dataset.intersections = String(roots.length); w.figure.dataset.level = String(level);
    math(w.output, raw`f(x)=x^3-x,\quad N=` + fixed(level) + raw`:\quad ` + roots.length + raw`\text{ intersection` + (roots.length === 1 ? '' : 's') + raw`}`);
  };
  const input=slider(w.controls,'Target height N',-end,end,0,n=>{level=n;draw();},.001);
  button(w.controls, 'Show three intersections', () => { level = 0; (w.controls.querySelector('input') as HTMLInputElement).value = '0'; draw(); });
  button(w.controls, 'At a turning height', () => { level = 2 / (3 * Math.sqrt(3)); (w.controls.querySelector('input') as HTMLInputElement).value = String(level); draw(); });
  teachingBeats(w,[{label:'IVT: a target height must be reached',state:{level:0}},{label:'A different height has one intersection',state:{level:1}},{label:'A turning-level intersection is counted once',state:{level:2/(3*Math.sqrt(3))}},{label:'Three crossings: IVT alone does not give uniqueness',state:{level:0}}],state=>{level=state.level;input.value=String(level);draw();},['level']);return w.figure;
};

export function secant(corner = false): BlockRenderer {
  return () => {
    const w=widget(corner?'Continuity does not supply matching one-sided slopes':'Average slopes approach the derivative of x squared');let h=.9;
    const draw=()=>{
      const a=corner?0:1,f=corner?Math.abs:(x:number)=>x*x,p=new Plot(-1.5,2.5,-.5,5.5),slope=h===0?(corner?NaN:2):corner?Math.sign(h):2+h;
      let ink=p.curve(f)+p.point(a,f(a),'P');if(h!==0)ink+=p.point(a+h,f(a+h),'Q');if(Number.isFinite(slope))ink+=p.curve(x=>f(a)+slope*(x-a),-1.5,2.5,'calc-tangent');
      w.drawing.innerHTML=p.svg(ink);w.figure.dataset.slope=String(slope);
      math(w.output,corner?raw`f=|x|:\quad f'_-(0)=-1\ne1=f'_+(0)\Rightarrow f'(0)\text{ DNE}`:raw`f=x^2,\ a=1:\quad h=`+fixed(h)+raw`,\quad `+(h===0?raw`f'(1)=2\ \text{(limit)}`:raw`\Delta y/h=`+fixed(slope)));
    };
    const input=slider(w.controls,'Signed secant step h',-1,1,h,n=>{h=n;draw();});
    const seq=demoSequence(w.figure,corner?2:3,step=>{h=corner?[.9,-.05,.05][step]:[.9,.08,-.08,0][step];input.value=String(h);draw();return [];});
    seq.duration=700; seq.transition=(from,to,p)=>{const positions=corner?[.9,-.05,.05]:[.9,.08,-.08,0];h=positions[from]+(positions[to]-positions[from])*(p*p*(3-2*p));input.value=String(h);draw();};
    sequenceControls(w.controls,seq,corner?'Compare the other side':'Take the slope limit');seq.setStep(0);return w.figure;
  };
}
export function meanValue(rolle = false): BlockRenderer {
  return () => {
    const w=widget(rolle?'Equal endpoint heights force an interior horizontal tangent':'Move a tangent until its slope matches the interval rate');let tilt=rolle?0:.8,c=rolle?-.6:.6,stage=0;
    const draw=()=>{
      const p=new Plot(-1.5,1.5,-1,3.5),f=(x:number)=>x*x+tilt*x,slope=2*c+tilt;
      let ink=p.curve(f)+p.point(-1,f(-1),'a')+p.point(1,f(1),'b');if(stage>=1)ink+=p.line(-1,f(-1),1,f(1),'calc-bound');if(stage>=2)ink+=p.curve(x=>f(c)+slope*(x-c),c-.5,c+.5,'calc-tangent')+p.point(c,f(c),'c');
      w.drawing.innerHTML=p.svg(ink);w.figure.dataset.secantSlope=String(tilt);w.figure.dataset.tangentSlope=String(slope);
      math(w.output,rolle?raw`f=x^2,\ f(-1)=f(1)=1:\quad f'(c)=2c=`+fixed(slope):raw`\text{secant}=`+fixed(tilt)+raw`,\quad f'(`+fixed(c)+raw`)=`+fixed(slope));
    };
    const input=slider(w.controls,'Tangent position c',-.9,.9,c,n=>{c=n;stage=Math.max(2,stage);draw();});const tiltInput=!rolle?slider(w.controls,'Secant tilt',-1.2,1.2,tilt,n=>{tilt=n;draw();}):undefined;
    const seq=demoSequence(w.figure,rolle?3:4,step=>{stage=step;c=step>=3?0:rolle?-.6:.6;tilt=rolle?0:step===4?-.8:.8;input.value=String(c);if(tiltInput)tiltInput.value=String(tilt);draw();return [];});
    seq.duration=700;seq.transition=(from,to,p)=>{const t=p*p*(3-2*p),at=(i:number)=>i>=3?0:rolle?-.6:.6;c=at(from)+(at(to)-at(from))*t;tilt=rolle?0:(from===4?-.8:.8)+((to===4?-.8:.8)-(from===4?-.8:.8))*t;stage=to;input.value=String(c);if(tiltInput)tiltInput.value=String(tilt);draw();};
    sequenceControls(w.controls,seq,rolle?'Endpoints → chord → horizontal tangent':'Chord → trial tangent → matching tangent');seq.setStep(0);return w.figure;
  };
}

export const monotone: BlockRenderer = () => {
  const w = widget('Strict monotonicity implies at most one horizontal intersection'); let level = .5;
  const draw = () => {
    const p = new Plot(-1.5, 1.5, -3, 3), x = Math.cbrt(level);
    w.drawing.innerHTML = p.svg(p.curve(x => x ** 3) + p.line(-1.5, level, 1.5, level) + p.point(x, level));
    math(w.output, raw`f=x^3\text{ strictly increasing},\quad f'(0)=0;\quad y=` + fixed(level) + raw`\text{ meets it once}`);
  };
  const input=slider(w.controls,'Horizontal height',-2,2,level,n=>{level=n;draw();});
  teachingBeats(w,[{label:'One height, at most one input',state:{level:.5}},{label:'A negative height still meets once',state:{level:-1}},{label:'Zero derivative at 0 does not break strict increase',state:{level:0}},{label:'Every height still meets at most once',state:{level:1}}],state=>{level=state.level;input.value=String(level);draw();},['level']);return w.figure;
};

export const uniqueRoot: BlockRenderer = () => {
  const w=widget('IVT supplies at least one root; strict monotonicity supplies at most one');
  const f=(x:number)=>x**3+x-1;let lo=0,hi=1;
  for(let i=0;i<55;i++){const m=(lo+hi)/2;if(f(m)<0)lo=m;else hi=m;}
  const c=(lo+hi)/2;
  const seq=demoSequence(w.figure,3,step=>{
    const p=new Plot(-.15,1.15,-1.2,1.3);
    let ink=p.curve(f,0,1)+p.point(0,-1,'f(a) < 0')+p.point(1,1,'f(b) > 0')+p.text(.35,1.15,'f(x) = x³ + x − 1');
    if(step>=1)ink+=p.band(c-.045,c+.045,-.13,.13)+p.point(c,0,'c ∈ (0,1)');
    if(step>=2)ink+=p.curve(x=>f(.4)+(3*.4**2+1)*(x-.4),.25,.55,'calc-tangent');
    w.drawing.innerHTML=p.svg(ink);
    const formulas=[raw`f(0)=-1<0<1=f(1),\quad f\in C[0,1]`,raw`\text{IVT: at least one }c\in(0,1)\text{ has }f(c)=0`,raw`f'=3x^2+1>0\ \xRightarrow{\mathrm{MVT}}\ \text{strictly increasing: at most one zero}`,raw`\text{at least one}\ +\ \text{at most one}\ =\ \boxed{\text{exactly one root}}`];
    math(w.output,formulas[step]);w.figure.dataset.root=String(c);w.figure.dataset.claim=['hypotheses','at-least-one','at-most-one','exactly-one'][step];return [w.output];
  });seq.labels=['Opposite endpoint signs and continuity','IVT gives existence','Strict monotonicity gives uniqueness','Combine: exactly one interior root'];
  seq.setStep(0);return w.figure;
};
