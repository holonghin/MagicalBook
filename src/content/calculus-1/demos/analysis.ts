import type { BlockRenderer } from '../../../engine/types';
import { Plot, widget, slider, choices, button, math, fixed, demoSequence, sequenceControls, teachingBeats, reflectChoice } from './ink';
const raw = String.raw;
export const model = { f: (x: number) => x + 1 / x, first: (x: number) => 1 - 1 / (x * x), second: (x: number) => 2 / (x ** 3) };

export function critical(fermat = false): BlockRenderer {
  return () => {
    const w=widget(fermat?'Test the assumptions and one-way implication of Fermat':'Compare three kinds of critical-number candidates');
    const specs=[
      {f:(x:number)=>x*x,title:'x²',comment:'f′(0)=0 · minimum',check:'Interior + differentiable + local minimum ⇒ slope 0.'},
      {f:(x:number)=>x**3,title:'x³',comment:'f′(0)=0 · no extremum',check:'Slope 0 does not imply an extremum: the converse fails.'},
      {f:Math.abs,title:'|x|',comment:'f′(0) DNE · minimum',check:'Interior minimum, but not differentiable: Fermat does not apply.'},
      {f:(x:number)=>x,title:'x on [0,1]',comment:'endpoint minimum · slope 1',check:'Differentiable minimum at a boundary: not an interior point.'},
    ];
    if(!fermat){
      w.drawing.classList.add('calc-three-plots');specs.slice(0,3).forEach(spec=>{const panel=document.createElement('div'),p=new Plot(-1.3,1.3,-.8,2);panel.innerHTML=`<h3>${spec.title}</h3>${p.svg(p.curve(spec.f)+p.point(0,0))}<p>${spec.comment}</p>`;w.drawing.append(panel);});
      w.output.textContent='All three are critical at 0: f is defined and f′=0 or does not exist. Only two are extrema.';
    }else{
      const seq=demoSequence(w.figure,3,step=>{const spec=specs[step],p=new Plot(-1.3,1.3,-.8,2);w.drawing.innerHTML=p.svg(p.curve(spec.f,step===3?0:undefined,step===3?1:undefined)+p.point(0,0,spec.title));w.output.textContent=spec.check;return [w.output];});
      sequenceControls(w.controls,seq,'Check next assumption');seq.setStep(0);
    }return w.figure;
  };
}

export const evt: BlockRenderer = () => {
  const w = widget('Attainment of extrema when hypotheses are retained or lost'); let mode = 0;
  const draw = () => {
    const p = new Plot(-.15, 1.15, -.15, 1.15);
    w.drawing.innerHTML = p.svg(p.curve(x => x, 0, 1) + p.point(0, 0, mode === 1 ? 'not attained' : 'minimum', 'calc-point', mode === 1) + p.point(1, 1, mode === 0 ? 'maximum' : 'not attained', 'calc-point', mode !== 0));
    math(w.output, mode === 0 ? raw`f(x)=x\text{ on }[0,1]:\quad\min=0,\ \max=1` : mode === 1 ? raw`f(x)=x\text{ on }(0,1):\quad\text{neither bound attained}` : raw`f(x)=x\text{ on }[0,1):\quad\min=0,\ \sup=1\text{ not attained}`);
  };
  const cases=choices(w.controls,['Closed interval','Open interval','Remove the highest point'],i=>{mode=i;draw();});
  teachingBeats(w,[{label:'Closed interval: both extrema attained',state:{mode:0}},{label:'Open both endpoints: neither bound attained',state:{mode:1}},{label:'Remove the highest point: no maximum',state:{mode:2}}],state=>{mode=state.mode;reflectChoice(cases,mode);draw();});return w.figure;
};

export const signs: BlockRenderer = () => {
  const w = widget('Moving tangent and first-derivative sign chart'); let x = -1.6;
  const draw = () => {
    const p = new Plot(-2.1, 2.1, -3.2, 3.2), f = (t: number) => t ** 3 - 3 * t, slope = 3 * (x * x - 1);
    w.drawing.innerHTML = p.svg(p.curve(f) + p.curve(t => f(x) + slope * (t - x), x - .35, x + .35, 'calc-tangent') + p.point(x, f(x)) + p.point(-1, 2, 'local max') + p.point(1, -2, 'local min'));
    math(w.output, raw`f'=3(x^2-1):\quad +\ \big|_{-1}\ -\ \big|_1\ +\qquad f'(` + fixed(x) + raw`)=` + fixed(slope));
    w.figure.dataset.slope = String(slope);
  };
  const input=slider(w.controls,'Tangent position',-1.95,1.95,x,n=>{x=n;draw();});
  teachingBeats(w,[-1.6,-1,0,1,1.6].map((x,i)=>({label:['Positive slope','At −1: + to − gives a maximum','Negative slope between the candidates','At 1: − to + gives a minimum','Positive slope after the minimum'][i],state:{x}})),state=>{x=state.x;input.value=String(x);draw();},['x']);return w.figure;
};

export const curvature: BlockRenderer = () => {
  const w = widget('Changing slope, concavity and genuine inflection'); let which = 0, x = .8;
  const draw = () => {
    const p = new Plot(-1.5, 1.5, -3.2, 3.2);
    const f = which === 0 ? (t: number) => t ** 3 : which === 1 ? (t: number) => t ** 4 : (t: number) => 1 / t;
    const d = which === 0 ? 3 * x * x : which === 1 ? 4 * x ** 3 : -1 / (x * x);
    let ink = which === 2 ? p.curve(f, -1.5, -.04) + p.curve(f, .04, 1.5) : p.curve(f);
    if (which !== 2 || Math.abs(x) > .04) ink += p.curve(t => f(x) + d * (t - x), x - .3, x + .3, 'calc-tangent') + p.point(x, f(x));
    w.drawing.innerHTML = p.svg(ink);
    math(w.output, which === 0 ? raw`x^3:\quad f''=6x\text{ changes sign; continuous at }0\Rightarrow\text{inflection}` : which === 1 ? raw`x^4:\quad f''=12x^2\ge0\text{ on both sides; no inflection at }0` : raw`1/x:\quad f''=2/x^3,\quad 0\notin\operatorname{Dom}f\Rightarrow\text{no inflection at }0`);
  };
  const cases=choices(w.controls, ['x³: sign change', 'x⁴: no sign change', '1/x: missing point'], i => { which = i; draw(); });
  const input=slider(w.controls,'Tangent position',-1.3,1.3,x,n=>{x=n;draw();});
  teachingBeats(w,[{label:'x³: negative curvature on the left',state:{which:0,x:-.8}},{label:'x³: positive curvature on the right, continuous inflection',state:{which:0,x:.8}},{label:'x⁴: zero second derivative is not enough',state:{which:1,x:0}},{label:'x⁴: still concave up on the other side',state:{which:1,x:.8}},{label:'1/x: a domain hole is not an inflection point',state:{which:2,x:-.8}},{label:'Opposite concavity, but still no point at zero',state:{which:2,x:.8}}],state=>{which=state.which;reflectChoice(cases,which);x=state.x;input.value=String(x);draw();},['x']);return w.figure;
};

/** One verified model; three distinct objectives without future-topic controls. */
export function sketch(mode: 'domain' | 'asymptotes' | 'assembly'): BlockRenderer {
  return () => {
    const w=widget(`${mode}: x plus reciprocal x on disconnected domain branches`);
    const seq=demoSequence(w.figure,mode==='assembly'?4:2,step=>{
      const p=new Plot(-4,4,-6,6);let ink=mode==='assembly'?'':p.text(-2.5,5.2,'f(x) = x + 1/x');
      const stage=mode==='domain'?0:mode==='asymptotes'?1:step;
      if(mode==='domain'){
        ink+=p.text(0,5,'x = 0 excluded');
        if(step>=1)ink+=p.line(0,-6,0,6,'calc-guide');
        if(step===2)ink+=p.text(-2,-4,'x² + 1 has no real zero')+p.text(2,4,'no y-intercept');
      }else{
        if(stage>=1)ink+=p.line(0,-6,0,6,'calc-bound');
        if(mode==='assembly'&&stage>=1||mode==='asymptotes'&&step>=1)ink+=p.line(-4,-4,4,4,'calc-bound');
        if(mode==='asymptotes'&&step===2||mode==='assembly'&&stage===4)ink+=p.curve(model.f,-4,-.05)+p.curve(model.f,.05,4);
        if(mode==='assembly'&&stage>=2)ink+=p.point(-1,-2,'local max')+p.point(1,2,'local min');
        if(mode==='assembly'&&stage>=3)ink+=p.text(-2.5,-5,'concave down')+p.text(2.5,5,'concave up');
      }
      w.drawing.innerHTML=p.svg(ink);w.figure.dataset.stage=String(step);w.figure.dataset.model='x+1/x';
      const texts=mode==='domain'?[raw`\operatorname{Dom}f=\mathbb R\setminus\{0\}`,raw`(-\infty,0)\ \text{and}\ (0,\infty):\quad\text{two domain components}`,raw`f(x)=0\iff x^2+1=0:\quad\text{no real intercepts}`]:mode==='asymptotes'?[raw`x\to0^-:\ f\to-\infty;\quad x\to0^+:\ f\to+\infty`,raw`\lim_{x\to\pm\infty}\big(f(x)-x\big)=\lim_{x\to\pm\infty}1/x=0`,raw`x=0\text{ vertical},\quad y=x\text{ slant; no horizontal asymptote}`]:[raw`\operatorname{Dom}f=\mathbb R\setminus\{0\};\quad\text{odd, no intercepts}`,raw`x=0\text{ vertical},\quad y=x\text{ slant at both ends}`,raw`f':\quad +\ \big|_{-1}\ -\ \big\|_0\ -\ \big|_1\ +`,raw`f''=2/x^3:\quad\text{down for }x<0,\ \text{up for }x>0`,raw`\text{No global extrema, zeros or inflection; }0\text{ excluded}`];
      math(w.output,texts[step]);return [w.drawing,w.output];
    });sequenceControls(w.controls,seq,mode==='assembly'?'Add next constraint':mode==='domain'?'Inspect domain / intercepts':'Inspect boundary / infinity');seq.setStep(0);return w.figure;
  };
}

export const rectangle: BlockRenderer = () => {
  const w = widget('A farmer’s rectangular field, constrained by twelve metres of fencing'); let x=2,stage=0;
  const draw = () => {
    const y=6-x,area=x*y,scale=38,left=425-scale*x/2,top=157-scale*y/2,right=left+scale*x,bottom=top+scale*y;
    const posts=Array.from({length:9},(_,i)=>{const t=i/8;return `<path class="calc-fence-post" d="M${left+(right-left)*t} ${top-4}v8M${left+(right-left)*t} ${bottom-4}v8M${left-4} ${top+(bottom-top)*t}h8M${right-4} ${top+(bottom-top)*t}h8"/>`;}).join('');
    w.drawing.innerHTML=`<svg viewBox="0 0 900 320" role="img" aria-label="Four fence segments enclose a rectangular field; total fencing stays twelve metres"><rect class="calc-field" x="${left}" y="${top}" width="${scale*x}" height="${scale*y}"/><path class="calc-bound" d="M${left} ${top}H${right}V${bottom}H${left}Z"/>${posts}<text x="425" y="${bottom+30}" text-anchor="middle">x = ${fixed(x)} m</text><text x="${right+24}" y="157">y = ${fixed(y)} m</text><text x="45" y="30">Fence: 2x + 2y = 12 m</text><text x="45" y="296">Feasible: 0 &lt; x &lt; 6 m</text><text x="690" y="85">Area</text><text x="690" y="119">${fixed(area)} m²</text></svg>`;
    w.figure.dataset.area=String(area);w.figure.dataset.width=String(x);w.figure.dataset.stage=String(stage);
    if(stage===0)math(w.output,raw`2x+2y=12\quad\Rightarrow\quad y=6-x`);
    else if(stage===1)math(w.output,raw`A(x)=x(6-x),\quad 0<x<6`);
    else if(stage===2)math(w.output,raw`A'(x)=6-2x=0\quad\Rightarrow\quad x=3`);
    else math(w.output,raw`A(x)=9-(x-3)^2\le9:\quad x=y=3\,\mathrm m,\quad A_{\max}=9\,\mathrm m^2`);
  };
  const input=slider(w.controls,'Rectangle width',.1,5.9,x,n=>{x=n;draw();});
  teachingBeats(w,[{label:'A farmer has 12 m of fencing: the constraint',state:{x:2,stage:0}},{label:'Vary the shape; maximize its area within the domain',state:{x:4.7,stage:1}},{label:'Find the interior critical candidate',state:{x:3.6,stage:2}},{label:'The square attains the proved global maximum',state:{x:3,stage:3}}],state=>{x=state.x;stage=state.stage;input.value=String(x);draw();},['x']);return w.figure;
};
