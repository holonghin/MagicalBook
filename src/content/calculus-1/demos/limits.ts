import type { BlockRenderer } from '../../../engine/types';
import { Plot, widget, slider, choices, button, math, fixed, demoSequence, sequenceControls, teachingBeats, reflectChoice } from './ink';
const raw = String.raw;

export const hole: BlockRenderer = () => {
  const w = widget('A removable hole and a separately assigned value'); let h = .8;
  const draw = () => {
    const p = new Plot(-2, 2, -1, 5);
    w.drawing.innerHTML = p.svg(p.curve(x => x + 1) + p.point(0, 1, 'limit = 1', 'calc-point', true) + p.point(0, 3, 'f(0) = 3') + p.point(-h, 1 - h) + p.point(h, 1 + h));
    math(w.output, raw`x\to0:\quad f(x)\to1\ne f(0)=3`);
  };
  const input = slider(w.controls, 'Distance from the hole', .03, 1.5, h, n => { h = n; draw(); });
  const seq=teachingBeats(w,[{label:'Inspect the assigned value',state:{h:.8}},{label:'Approach the hole: limit 1, value 3',state:{h:.03}}],state=>{h=state.h;input.value=String(h);draw();},['h']);
  button(w.controls,'Approach',()=>seq.request(1)); return w.figure;
};

export function sideDemo(continuity = false): BlockRenderer {
  if (continuity) return continuityChecklist;
  return () => {
    const w = widget(continuity ? 'Continuous point, hole, jump and unbounded behavior' : 'Left and right approaches');
    let mode = 0, h = .7, verdict=true;
    const draw = () => {
      const p = new Plot(-2, 2, -3, 4); let ink = '', result = '';
      const kind = continuity ? mode : [0, 2, 3][mode];
      if (kind === 3) {
        ink = p.curve(x => 1 / x, -2, -.025) + p.curve(x => 1 / x, .025, 2) + p.point(-h, -1 / h) + p.point(h, 1 / h);
        result = raw`\lim_{x\to0^-}\frac1x=-\infty,\qquad\lim_{x\to0^+}\frac1x=+\infty`;
      } else {
        ink = p.curve(x => x + 1, -2, 0) + p.curve(x => x + (kind === 2 ? 2 : 1), 0, 2);
        ink += p.point(-h, 1 - h) + p.point(h, h + (kind === 2 ? 2 : 1));
        ink += p.point(0, 1, '', 'calc-point', kind === 1);
        if (kind === 1) ink += p.point(0, 3, 'assigned value');
        if (kind === 2) ink += p.point(0, 2, '', 'calc-point', true);
        result = kind === 0 ? raw`f(0)=1=\lim_{x\to0}f(x)` : kind === 1 ? raw`\lim_{x\to0}f(x)=1\ne f(0)=3` : raw`\lim_{x\to0^-}f(x)=1\ne2=\lim_{x\to0^+}f(x)`;
      }
      w.drawing.innerHTML = p.svg(ink); math(w.output, verdict ? result : raw`\text{Compare the two approaches. Do they agree?}`); w.figure.dataset.case=String(mode); w.figure.dataset.verdict=String(verdict);
    };
    const cases=choices(w.controls, continuity ? ['Continuous', 'Removable', 'Jump', 'Unbounded'] : ['Agree', 'Disagree', 'Signed infinity'], i => { mode = i; verdict=true; draw(); });
    const input=slider(w.controls,'Approach distance',.06,1.4,h,n=>{h=n;draw();});
    teachingBeats(w,[
      {label:'Question: compare both sides',state:{mode:0,h:.7,verdict:false}},
      {label:'Agree: the finite limits match',state:{mode:0,h:.08,verdict:true}},
      {label:'Question: a jump changes the comparison',state:{mode:1,h:.7,verdict:false}},
      {label:'Disagree: no two-sided limit',state:{mode:1,h:.08,verdict:true}},
      {label:'Question: inspect signs near the asymptote',state:{mode:2,h:.8,verdict:false}},
      {label:'Opposite infinite signs are not a finite limit',state:{mode:2,h:.35,verdict:true}}
    ],state=>{mode=state.mode;reflectChoice(cases,mode);h=state.h;verdict=state.verdict;input.value=String(h);draw();},['h']); return w.figure;
  };
}

const continuityChecklist: BlockRenderer = () => {
  const w=widget('Three continuity requirements at a finite point');let mode=0,h=.5;
  const draw=()=>{
    const p=new Plot(-.2,2.2,-.2,4.5),value=mode===1?3:1;
    let ink=mode===3?p.curve(x=>1/(x-1)**2,-.2,.97)+p.curve(x=>1/(x-1)**2,1.03,2.2):p.curve(x=>x*x,-.2,1)+p.curve(x=>x*x+(mode===2?1:0),1,2.2);
    if(mode!==3)ink+=p.point(1-h,(1-h)**2)+p.point(1+h,(1+h)**2+(mode===2?1:0));
    ink+=p.point(1,value,'f(1)')+(mode===1?p.point(1,1,'limit','calc-point',true):'');
    if(mode===2)ink+=p.point(1,2,'right limit','calc-point',true);
    w.drawing.innerHTML=p.svg(ink);
    w.output.textContent=['Defined: yes · finite limit: 1 · matches f(1): yes ⇒ continuous.','Defined: yes · finite limit: 1 · f(1)=3: mismatch ⇒ discontinuous.','Defined: yes · left limit 1 ≠ right limit 2 ⇒ no two-sided limit.','Defined: yes · nearby values unbounded ⇒ no finite limit.'][mode];
  };
  const cases=choices(w.controls,['Match at 1','Reassign value','Mismatch sides','Unbounded nearby'],i=>{mode=i;draw();});
  const input=slider(w.controls,'Distance from a = 1',.03,.8,h,n=>{h=n;draw();});
  teachingBeats(w,[{label:'Defined, finite, matching',state:{mode:0,h:.5}},{label:'Approach the matching value',state:{mode:0,h:.03}},{label:'A reassigned value breaks equality',state:{mode:1,h:.03}},{label:'A jump breaks the two-sided limit',state:{mode:2,h:.03}},{label:'Unbounded values break finiteness',state:{mode:3,h:.03}}],state=>{mode=state.mode;reflectChoice(cases,mode);h=state.h;input.value=String(h);draw();},['h']);return w.figure;
};

export const dominant: BlockRenderer = () => {
  const w = widget('Dominant powers and the absolute-value sign factor'); let sign = 1, r = 5, divided = false;
  const draw = () => {
    const x = sign * r, value = Math.sqrt(x * x + 2 * x) / x;
    w.drawing.innerHTML = '<div class="calc-formula-panel"></div>';
    math(w.drawing.firstElementChild as HTMLElement, divided
      ? raw`\begin{gathered}\frac{3-2/x+1/x^2}{2+1/x-4/x^2}\longrightarrow\frac32\\ \frac{\sqrt{x^2+2x}}x=\underbrace{\frac{|x|}x}_{` + sign + raw`}\sqrt{1+\frac2x}\end{gathered}`
      : raw`\frac{3x^2-2x+1}{2x^2+x-4}\quad\xrightarrow{\div x^2}\quad\frac{3-2/x+1/x^2}{2+1/x-4/x^2}`);
    if (divided) {
      const terms = document.createElement('div'); terms.className = 'calc-small-terms';
      terms.style.transform = `scale(${.6 + .4 * Math.sqrt(3 / r)})`; terms.style.opacity = String(.35 + .65 * Math.sqrt(3 / r));
      math(terms, raw`-2/x+1/x^2=` + fixed(-2 / x + 1 / (x * x), 4) + raw`,\quad1/x-4/x^2=` + fixed(1 / x - 4 / (x * x), 4));
      (w.drawing.firstElementChild as HTMLElement).append(terms);
    }
    math(w.output, raw`x=` + fixed(x) + raw`:\quad\frac{\sqrt{x^2+2x}}x\approx` + fixed(value, 4) + raw`\longrightarrow` + sign);
  };
  button(w.controls,'Divide each term by x²',()=>seq.request(1));
  const directions=choices(w.controls, ['Toward +∞', 'Toward −∞'], i => { sign = i === 0 ? 1 : -1; draw(); });
  const input=slider(w.controls,'|x|',3,150,r,n=>{r=n;draw();},1);
  const seq=teachingBeats(w,[{label:'Divide numerator and denominator by x²',state:{sign:1,r:5,divided:false}},{label:'Keep the absolute-value sign',state:{sign:1,r:5,divided:true}},{label:'At positive infinity the small terms shrink',state:{sign:1,r:100,divided:true}},{label:'At negative infinity the sign reverses',state:{sign:-1,r:100,divided:true}}],state=>{sign=state.sign;reflectChoice(directions,sign>0?0:1);r=state.r;divided=state.divided;input.value=String(r);draw();},['r']);return w.figure;
};

export const squeeze: BlockRenderer = () => {
  const w = widget('Oscillating x sin(1/x) trapped by ±|x|'); let radius = 1;
  const draw = () => {
    // Phase sampling preserves oscillation near 0; the unresolved tail lies in its envelope.
    const p = new Plot(-radius, radius, -radius * 1.1, radius * 1.1);
    let d = '';
    for (const sign of [-1, 1]) {
      for (let i = 0; i <= 1600; i++) {
        const phase = 1 / radius + i * (Math.max(800, 80 / radius) - 1 / radius) / 1600;
        const x = sign / phase, y = x * Math.sin(1 / x);
        d += `${i ? 'L' : 'M'}${p.x(x)},${p.y(y)}`;
      }
    }
    w.drawing.innerHTML = p.svg(p.curve(Math.abs, -radius, radius, 'calc-bound') + p.curve(x => -Math.abs(x), -radius, radius, 'calc-bound') + `<path class="calc-curve" d="${d}"/>` + p.point(0, 0, '', 'calc-point', true));
    math(w.output, raw`-|x|\le x\sin(1/x)\le|x|,\qquad 0<|x|\le` + fixed(radius));
  };
  const input=slider(w.controls,'Neighborhood radius',.02,1,radius,n=>{radius=n;draw();});
  teachingBeats(w,[{label:'Trap the oscillation',state:{radius:1}},{label:'Shrink both bounds',state:{radius:.2}},{label:'Still oscillating, but forced to zero',state:{radius:.02}}],state=>{radius=state.radius;input.value=String(radius);draw();},['radius']);return w.figure;
};

export const epsilon: BlockRenderer = () => {
  const w = widget('Epsilon target band and sufficient delta band for f(x)=2x+1'); let eps = 1;
  const draw = () => {
    const p = new Plot(-1.2, 1.2, -1.5, 3.5), delta = eps / 2;
    w.drawing.innerHTML = p.svg(p.band(-1.2, 1.2, 1 - eps, 1 + eps) + p.band(-delta, delta, -1.5, 3.5, 'calc-band calc-band-vertical') + p.curve(x => 2 * x + 1) + p.point(0, 1, 'x = 0 excluded', 'calc-point', true));
    w.figure.dataset.epsilon = String(eps); w.figure.dataset.delta = String(delta);
    math(w.output, raw`\varepsilon=` + fixed(eps) + raw`,\quad\delta=\varepsilon/2=` + fixed(delta) + raw`:\quad0<|x|<\delta\Rightarrow |2x|<\varepsilon`);
  };
  const input=slider(w.controls,'ε',.1,2,eps,n=>{eps=n;draw();});
  teachingBeats(w,[{label:'Choose an output tolerance',state:{eps:1}},{label:'A smaller epsilon needs a smaller delta',state:{eps:.4}},{label:'The same guarantee works for every epsilon',state:{eps:.1}}],state=>{eps=state.eps;input.value=String(eps);draw();},['eps']);return w.figure;
};

export const hospitalRule: BlockRenderer = () => {
  const w = widget('Check every assumption before using L’Hôpital’s Rule');
  const list=document.createElement('ol'); list.className='calc-checklist calc-hospital-checks';
  const conditions=[
    ['Form', raw`0/0\quad\text{or}\quad\infty/\infty`],
    ['Near a', raw`f,g\text{ differentiable near }a\text{, except possibly at }a;\quad g'(x)\ne0`],
    ['Defined', raw`f(x)/g(x)\text{ is defined where the limit is taken}`],
    ['Derivative ratio', raw`\lim_{x\to a}f'(x)/g'(x)\text{ exists: finite or }\pm\infty`],
  ];
  const items=conditions.map(([label,tex])=>{const li=document.createElement('li'),title=document.createElement('strong'),body=document.createElement('div');title.textContent=label;math(body,tex);li.append(title,body);list.append(li);return li;});
  w.drawing.append(list);
  const seq=demoSequence(w.figure,4,step=>{
    items.forEach((item,i)=>{item.style.visibility=i<step?'visible':'hidden';});
    w.output.textContent=step===4?'One-sided limits: the same checks on that side. At infinity: on the corresponding tail.':'Only after checking every condition may we write the equality above.';
    return step ? [items[step-1],w.output] : [w.output];
  });
  seq.labels=['Check before calculating','Check the indeterminate form','Differentiate near a; require g′ ≠ 0','Check the quotient’s domain','Check the derivative-ratio limit'];
  sequenceControls(w.controls,seq,'Check next condition'); seq.setStep(0); return w.figure;
};

export const hospital: BlockRenderer = () => {
  const w = widget('Three short L’Hôpital diagnoses');
  const cases = [
    { formula: raw`\displaystyle\lim_{x\to0}\frac{|x|}{|x|}`, verdict: 'Applicable. Differentiable off 0; g′ = ±1; derivative quotient = 1.', detail: raw`0/0,\quad x\ne0:\quad\frac{f'}{g'}=1\quad\Rightarrow\quad\lim\frac fg=1` },
    { formula: raw`f(0)=0,\quad f'(0)=2,\qquad\displaystyle\lim_{x\to0}\frac{f(x)}x\ ?`, verdict: 'Conditions not established. The limit is 2 by the derivative definition.', detail: raw`\lim_{x\to0}\frac{f(x)-f(0)}{x-0}=f'(0)=2` },
    { formula: raw`\lim f'/g'\text{ fails. Does }\lim f/g\text{ fail?}`, verdict: 'Inconclusive. The original limit may still exist.', detail: raw`\text{Derivative-quotient limit fails}\ \not\Rightarrow\ \text{original limit fails}` },
  ]; let index = 0;
  const question = document.createElement('div'); question.className = 'calc-diagnosis';
  const verdict = document.createElement('p'); verdict.className = 'calc-verdict';
  w.drawing.append(question, verdict);
  const seq = demoSequence(w.figure, 7, step => {
    index = Math.min(2,Math.floor(step / 2)); const answered = step % 2 === 1 || step>=6;
    math(question, cases[index].formula); verdict.textContent = answered ? cases[index].verdict : 'Check the hypotheses, then reveal.';
    if (answered) math(w.output, cases[index].detail); else w.output.replaceChildren();
    witness.hidden = !answered || index !== 2; reveal.disabled = answered;
    selectors.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    if(step===6)math(w.output,raw`\begin{gathered}f=x^2\sin(1/x),\quad g=\sin x\quad(x\ne0)\\ f/g\to0,\qquad f'/g'=\frac{2x\sin(1/x)-\cos(1/x)}{\cos x}\text{ oscillates}\end{gathered}`);
    if(step===7){
      math(question,raw`|x\sin(1/x)|\le|x|\quad\Rightarrow\quad\lim_{x\to0}x\sin(1/x)=0`);
      verdict.textContent='A function can have a limit while its derivative oscillates. Use the bound, not automatic differentiation.';
      math(w.output,raw`(x\sin(1/x))'=\sin(1/x)-\frac{\cos(1/x)}x\quad(x\ne0):\ \text{no limit}`);
    }
    return [question, verdict, w.output];
  });
  const selectors = choices(w.controls, ['Off-target differentiability', 'Only f′(0) is known', 'Derivative limit fails'], i => seq.request(i * 2));
  const reveal = button(w.controls, 'Reveal verdict', () => seq.request(index * 2 + 1));
  const witness=button(w.controls,'Optional lecture witness',()=>seq.request(6));
  sequenceControls(w.controls, seq, 'Next diagnosis / verdict'); seq.setStep(0); return w.figure;
};

export const cubes: BlockRenderer = () => {
  const w=widget('Factor a difference or sum of cubes before cancellation');
  const formulas=[
    raw`\begin{aligned}a^3-b^3&=(a-b)(a^2+ab+b^2)\\a^3+b^3&=(a+b)(a^2-ab+b^2)\end{aligned}`,
    raw`\frac{x^3-8}{x-2}=\frac{(x-2)(x^2+2x+4)}{x-2}\quad(x\ne2)`,
    raw`\frac{\cancel{(x-2)}(x^2+2x+4)}{\cancel{x-2}}=x^2+2x+4\quad(x\ne2)`,
    raw`\lim_{x\to2}\frac{x^3-8}{x-2}=2^2+2\cdot2+4=12`,
  ];
  const seq=demoSequence(w.figure,3,step=>{w.drawing.innerHTML='<div class="calc-formula-panel"></div>';math(w.drawing.firstElementChild as HTMLElement,formulas[step]);w.output.textContent=['A compact factoring reminder.','Expose the common factor away from 2.','Cancel only in the punctured neighborhood.','The polynomial is continuous at 2; substitution is now valid.'][step];return [w.drawing,w.output];});
  seq.labels=['Recall both cube identities','Factor x³ − 8','Cancel for x ≠ 2','Take the polynomial limit'];
  sequenceControls(w.controls,seq,'Factor / cancel / take the limit');seq.setStep(0);return w.figure;
};
