import type { BlockRenderer } from '../../../engine/types';
import { widget, slider, button, math, fixed, demoSequence, sequenceControls, teachingBeats } from './ink';
const raw = String.raw;

export const chainFactors = [
  raw`\cos\!\left(\ln\!\left(1+e^{(x^2+1)^3}\right)\right)`,
  raw`\frac{1}{1+e^{(x^2+1)^3}}`,
  raw`e^{(x^2+1)^3}`,
  raw`3(x^2+1)^2`,
  raw`2x`,
];
export const chainPending = [
  raw`\frac{d}{dx}\sin\!\left(\ln\!\left(1+e^{(x^2+1)^3}\right)\right)`,
  raw`\frac{d}{dx}\left[\ln\!\left(1+e^{(x^2+1)^3}\right)\right]`,
  raw`\frac{d}{dx}\left[e^{(x^2+1)^3}\right]`,
  raw`\frac{d}{dx}\left[(x^2+1)^3\right]`,
  raw`\frac{d}{dx}(x^2+1)`,
];
export const chain: BlockRenderer = () => {
  const w=widget('Peel the nested expression from outside to inside');
  const original=document.createElement('div');original.className='calc-chain-original';
  const work=document.createElement('div');work.className='calc-chain-work';
  const product=document.createElement('div');product.className='calc-factors';
  const pending=document.createElement('div');pending.className='calc-pending';
  w.drawing.classList.add('calc-chain');work.append(product,pending);w.drawing.append(original,work);
  const accent=[
    raw`\textcolor{#98652b}{\sin}\!\left(\ln\!\left(1+e^{(x^2+1)^3}\right)\right)`,
    raw`\textcolor{#98652b}{\ln}\!\left(1+e^{(x^2+1)^3}\right)`,
    raw`1+\textcolor{#98652b}{e^{(x^2+1)^3}}`,raw`\textcolor{#98652b}{(x^2+1)^3}`,raw`\textcolor{#98652b}{x^2+1}`,
  ];
  const labels=['sine','logarithm','exponential','cube','inner quadratic'];
  const final=raw`y'=\cos\!\left(\ln\!\left(1+e^{(x^2+1)^3}\right)\right)\cdot\frac{e^{(x^2+1)^3}}{1+e^{(x^2+1)^3}}\cdot3(x^2+1)^2\cdot2x`;
  const seq=demoSequence(w.figure,6,(step,previous)=>{
    math(original,raw`y=\sin\!\left(\ln\!\left(1+e^{(x^2+1)^3}\right)\right)`);
    product.replaceChildren();pending.replaceChildren();const targets:HTMLElement[]=[];
    work.classList.toggle('is-final',step===6);
    if(step===6){
      const line=document.createElement('div');line.className='calc-chain-final';math(line,final);
      const narrow=document.createElement('div');narrow.className='calc-chain-final-narrow';math(narrow,raw`\begin{gathered}y'=\cos\!\left(\ln\!\left(1+e^{(x^2+1)^3}\right)\right)\cdot\frac{e^{(x^2+1)^3}}{1+e^{(x^2+1)^3}}\\{}\cdot3(x^2+1)^2\cdot2x\end{gathered}`);
      product.append(line,narrow);targets.push(line,narrow);
    }else{
      for(let i=0;i<Math.min(step,5);i++){
        const factor=document.createElement('div');factor.className=`calc-factor factor-${i}`;factor.dataset.factor=String(i+1);
        math(factor,(i===0?raw`y'=`:raw`\cdot `)+chainFactors[i]);product.append(factor);
        if(step>previous&&i===step-1)targets.push(factor);
      }
      if(step<5)math(pending,(step?raw`\cdot `:'')+raw`\frac{d}{dx}\left[`+accent[step]+raw`\right]`);
      else pending.textContent='All five rates are present. Now collect the product.';
      targets.push(pending);
    }
    w.output.textContent=step<5?`Peel the ${labels[step]}; retain the derivative of everything inside.`:step===5?'The final inner rate is 2x. Multiply the five rates.':'One derivative: group the exponential and reciprocal, without cancelling them.';
    w.figure.dataset.layer=String(Math.min(step,5));w.figure.dataset.consolidated=String(step===6);return targets;
  });
  seq.labels=['Start outside: sine','Sine peeled → logarithm','Logarithm peeled → exponential','Exponential peeled → cube','Cube peeled → quadratic','All five rates','Consolidate into one horizontal equation'];
  sequenceControls(w.controls,seq,'Peel one layer / assemble','Previous layer');seq.setStep(0);return w.figure;
};
export const logarithm: BlockRenderer = () => {
  const w=widget('Transform x to the power x using logarithms');
  const formulas=[raw`y=x^x,\quad x>0`,raw`\ln y=x\ln x`,raw`\frac{y'}y=\ln x+1`,raw`y'=x^x(\ln x+1)`];
  const seq=demoSequence(w.figure,3,step=>{
    w.drawing.innerHTML='<div class="calc-formula-panel"></div>';math(w.drawing.firstElementChild as HTMLElement,formulas[step]);
    w.output.textContent=['A changing base and a changing exponent.','The exponent becomes a product.','Chain Rule on the left; product rule on the right.','Multiply by y, then restore x^x.'][step];return [w.drawing];
  });sequenceControls(w.controls,seq,'Transform');seq.setStep(0);return w.figure;
};

export const circle: BlockRenderer = () => {
  const w = widget('Branch-aware tangent on the implicit unit circle'); let angle = 55;
  const draw = () => {
    const t = angle * Math.PI / 180, x = Math.cos(t), y = Math.sin(t);
    // Equal unit scale in a centered square; avoid turning a circle into an ellipse.
    const sx = (x: number) => 450 + 105 * x, sy = (y: number) => 157 - 105 * y;
    const a = [x - .75 * y, y + .75 * x], b = [x + .75 * y, y - .75 * x];
    w.drawing.innerHTML = `<svg viewBox="0 0 900 320" role="img" aria-label="Circle with a geometrically vertical tangent at y=0"><path class="calc-axis" d="M290 157H610M450 10V305"/><circle class="calc-curve" cx="450" cy="157" r="105"/><path class="calc-tangent" d="M${sx(a[0])},${sy(a[1])}L${sx(b[0])},${sy(b[1])}"/><circle class="calc-point" cx="${sx(x)}" cy="${sy(y)}" r="6"/><text x="100" y="110">x² + y² = 1</text><text x="630" y="120">2x + 2yy′ = 0</text><text x="630" y="190">local branches</text><text x="515" y="300">x</text><text x="455" y="18">y</text></svg>`;
    const vertical = Math.abs(y) < 1e-10;
    w.figure.dataset.vertical = String(vertical);
    math(w.output, raw`(x,y)\approx(` + fixed(x) + ',' + fixed(y) + raw`):\quad ` + (vertical ? raw`y=0\Rightarrow\text{vertical tangent; no finite }dy/dx` : raw`y'=-x/y\approx` + fixed(-x / y)));
  };
  const input = slider(w.controls, 'Position angle (degrees)', 0, 360, angle, n => { angle = n; draw(); }, 1);
  button(w.controls,'At y = 0',()=>{angle=0;input.value='0';draw();});
  teachingBeats(w,[{label:'A local circle branch has a finite slope',state:{angle:55}},{label:'Approach the branch boundary',state:{angle:20}},{label:'At y = 0 the tangent is vertical',state:{angle:0}},{label:'The opposite branch also has a vertical tangent',state:{angle:180}}],state=>{angle=state.angle;input.value=String(angle);draw();},['angle']);return w.figure;
};

export const inverse: BlockRenderer = () => {
  const w = widget('A reflected marked tangent has reciprocal slope'); let a = 1.1;
  const draw = () => {
    const m = 2 * a;
    w.drawing.innerHTML = squareInverse(a);
    w.figure.dataset.originalSlope = String(m); w.figure.dataset.inverseSlope = String(1 / m);
    math(w.output, raw`f'(a)=2a=` + fixed(m) + raw`,\qquad(f^{-1})'(b)=\frac1{2a}=` + fixed(1 / m));
  };
  const input=slider(w.controls,'Original input a',.45,1.7,a,n=>{a=n;draw();});
  teachingBeats(w,[{label:'Reflect a marked tangent pair',state:{a:1.1}},{label:'A steeper original means a flatter inverse',state:{a:1.5}},{label:'Reciprocal slopes, with a nonzero original slope',state:{a:.5}}],state=>{a=state.a;input.value=String(a);draw();},['a']);return w.figure;
};

function squareInverse(a: number) {
  const p = (x: number, y: number) => `${330 + x * 72},${278 - y * 72}`;
  const curve = (f: (x: number) => number, lo: number, hi: number) => Array.from({ length: 200 }, (_, i) => { const x = lo + (hi - lo) * i / 199; return `${i ? 'L' : 'M'}${p(x, f(x))}`; }).join('');
  const b = a * a, m = 2 * a;
  return `<svg viewBox="0 0 900 320" role="img" aria-label="Equal-scale reflection of x squared and square root across y=x"><path class="calc-axis" d="M330 278H590M330 278V20"/><path class="calc-guide" d="M${p(0, 0)}L${p(3.5, 3.5)}"/><path class="calc-curve" d="${curve(x => x * x, 0, 1.85)}"/><path class="calc-bound" d="${curve(Math.sqrt, 0, 3.5)}"/><path class="calc-tangent" d="M${p(a - .4, b - .4 * m)}L${p(a + .4, b + .4 * m)}M${p(b - .4 * m, a - .4)}L${p(b + .4 * m, a + .4)}"/><circle class="calc-point" cx="${330 + 72 * a}" cy="${278 - 72 * b}" r="5"/><circle class="calc-point" cx="${330 + 72 * b}" cy="${278 - 72 * a}" r="5"/><text x="100" y="100">f(x) = x², x &gt; 0</text><text x="620" y="210">f⁻¹(x) = √x</text><text x="610" y="45">y = x</text><text x="346" y="300">0</text></svg>`;
}

export const sine: BlockRenderer = () => {
  const w = widget('Retain the principal sine branch and reflect it with equal axis scales'); let phase = 0;
  const draw = () => {
    const p = (x: number, y: number) => `${450 + 74 * x},${160 - 74 * y}`;
    const path = (lo: number, hi: number, reflected: boolean) => Array.from({ length: 240 }, (_, i) => {
      const x = lo + (hi - lo) * i / 239, y = Math.sin(x); return `${i ? 'L' : 'M'}${reflected ? p(y, x) : p(x, y)}`;
    }).join('');
    let ink = `<path class="calc-axis" d="M200 160H700M450 15V305"/>`;
    if (phase === 0) ink += `<path class="calc-curve" d="${path(-3.1, 3.1, false)}"/>`;
    else ink += `<path class="calc-curve" d="${path(-Math.PI / 2, Math.PI / 2, false)}"/>`;
    if (phase === 2) ink += `<path class="calc-guide" d="M${p(-1.8, -1.8)}L${p(1.8, 1.8)}"/><path class="calc-bound" d="${path(-Math.PI / 2, Math.PI / 2, true)}"/>`;
    ink += '<text x="200" y="35">sine: restrict input</text><text x="615" y="290">arcsine: principal range</text>';
    w.drawing.innerHTML = `<svg viewBox="0 0 900 320" role="img" aria-label="Principal sine branch reflected into arcsine">${ink}</svg>`;
    math(w.output, phase < 2 ? raw`\sin:[-\pi/2,\pi/2]\to[-1,1]` : raw`\arcsin:[-1,1]\to[-\pi/2,\pi/2]`);
  };
  const seq=demoSequence(w.figure,2,step=>{phase=step;draw();return [w.drawing];}); sequenceControls(w.controls,seq,'Restrict / reflect'); seq.setStep(0); return w.figure;
};

export const ladder: BlockRenderer = () => {
  const w = widget('A five-metre sliding ladder with consistent instantaneous rates'); let x = 3;
  const draw = () => {
    const y = Math.sqrt(25 - x * x), rate = -x / y;
    const ox = 290, oy = 277, scale = 45;
    w.drawing.innerHTML = `<svg viewBox="0 0 900 320" role="img" aria-label="Ladder with base moving right and top moving down"><path class="calc-axis" d="M${ox},25V${oy}H600"/><path class="calc-curve" d="M${ox + x * scale},${oy}L${ox},${oy - y * scale}"/><circle class="calc-point" cx="${ox + x * scale}" cy="${oy}" r="5"/><circle class="calc-point" cx="${ox}" cy="${oy - y * scale}" r="5"/><text x="${ox + x * scale / 2}" y="303">x = ${fixed(x)} m</text><text x="90" y="${oy - y * scale / 2}">y = ${fixed(y)} m</text><text x="520" y="100">ℓ = 5 m (fixed)</text><text x="520" y="150">ẋ = +1 m/s →</text><text x="520" y="200">ẏ = ${fixed(rate)} m/s ↓</text></svg>`;
    w.figure.dataset.x = String(x); w.figure.dataset.y = String(y); w.figure.dataset.rate = String(rate);
    math(w.output, raw`x^2+y^2=25\quad\Rightarrow\quad2x\dot x+2y\dot y=0,\quad\dot y=-\frac xy\dot x`);
  };
  const input=slider(w.controls,'Base position x (metres)',.5,4.5,x,n=>{x=n;draw();});
  teachingBeats(w,[{label:'At the 3–4–5 instant, the top rate is −3/4',state:{x:3}},{label:'Moving the base right moves the top down',state:{x:4}},{label:'The downward rate grows; stay away from y = 0',state:{x:4.5}}],state=>{x=state.x;input.value=String(x);draw();},['x']);return w.figure;
};
