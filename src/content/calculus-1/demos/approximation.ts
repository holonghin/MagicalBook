import type { BlockRenderer } from '../../../engine/types';
import { widget, slider, choices, math, fixed, teachingBeats, reflectChoice } from './ink';
const raw = String.raw;

export function approximationValues(dx: number, up = false) {
  const sign = up ? -1 : 1, a = 4, base = 2;
  const actual = up ? 4 - Math.sqrt(a + dx) : Math.sqrt(a + dx);
  const dy = sign * dx / 4, delta = actual - base;
  return { actual, dy, delta, error: delta - dy, predicted: base + dy };
}

const SVG = 'http://www.w3.org/2000/svg';
/** Patch the ink in place: keep the plot and its paths alive between frames. */
function updateSvg(root: SVGElement, markup: string) {
  const source=document.createElementNS(SVG,'svg');source.innerHTML=markup;
  const patch=(target:Node,next:Node)=>{
    if(target.nodeType===Node.TEXT_NODE){if(target.nodeValue!==next.nodeValue)target.nodeValue=next.nodeValue;return;}
    const a=target as Element,b=next as Element;
    for(const attr of [...a.attributes])if(!b.hasAttribute(attr.name))a.removeAttribute(attr.name);
    for(const attr of [...b.attributes])if(a.getAttribute(attr.name)!==attr.value)a.setAttribute(attr.name,attr.value);
    children(a,b);
  };
  const children=(a:Node,b:Node)=>{
    [...b.childNodes].forEach((next,i)=>{const current=a.childNodes[i];
      if(!current)a.appendChild(next.cloneNode(true));
      else if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName)a.replaceChild(next.cloneNode(true),current);
      else patch(current,next);
    });
    while(a.childNodes.length>b.childNodes.length)a.removeChild(a.lastChild!);
  };
  children(root,source);
}
interface LocalState { dx: number; zoom: number; up: boolean; errorScale: number; ink?: string[] }
export function approximation(mode: 'linear' | 'differential' | 'error'): BlockRenderer {
  return () => {
    const w=widget(`${mode}: square root at 4 with its local model`);
    w.figure.dataset.demoContinuity='local-model';
    const plot=document.createElementNS(SVG,'svg');plot.classList.add('calc-approx-plot');plot.setAttribute('viewBox','0 0 1000 360');plot.setAttribute('role','img');plot.setAttribute('aria-label','True-scale curve and tangent with separate change callouts');w.drawing.append(plot);
    const layers=new Map<string,HTMLElement>();let activeInk=new Set<string>(),handoffTargets:HTMLElement[]=[],exploration=false;
    const label=(key:string,markup:string)=>{
      activeInk.add(key);let layer=layers.get(key);
      if(!layer){layer=document.createElement('div');layer.className='calc-ink-layer';layer.dataset.demoInk=key;const svg=document.createElementNS(SVG,'svg');svg.classList.add('calc-approx-plot');svg.setAttribute('viewBox','0 0 1000 360');layer.append(svg);layers.set(key,layer);w.drawing.append(layer);}
      layer.hidden=false;updateSvg(layer.firstElementChild as SVGElement,markup);
    };
    const marks=()=>new Set([...activeInk,...(cases?['case-down','case-up']:[])]);
    const introduced=(before:Set<string>)=>[w.output,...[...activeInk].filter(key=>!before.has(key)).map(key=>layers.get(key)!),...(cases??[]).filter((_,i)=>!before.has(i?'case-up':'case-down'))];
    const initial:LocalState={dx:.1,zoom:.65,up:false,errorScale:Math.abs(approximationValues(.1).error)*1.4};
    let dx=.1,zoom=.65,up=false,stage=0,inkProgress=1,errorScale=initial.errorScale,origin:LocalState={...initial};
    const draw=()=>{
      // Include the moving point even at slider extremes. Both coordinate axes
      // retain their mathematical units; the error is enlarged only in its inset.
      const span=Math.max(.22+3.4*(1-zoom),Math.abs(dx)*1.3),sign=up?-1:1;
      const xmin=4-span,xmax=4+span,ymin=2-span*.34,ymax=2+span*.34;
      const sx=(x:number)=>80+(x-xmin)/(xmax-xmin)*510,sy=(y:number)=>274-(y-ymin)/(ymax-ymin)*208;
      const f=(x:number)=>up?4-Math.sqrt(x):Math.sqrt(x),L=(x:number)=>2+sign*(x-4)/4;
      const v=approximationValues(dx,up),target=4+dx,px=sx(target),base=sy(2),py=sy(v.predicted),ay=sy(v.actual);
      const horizontal=mode==='error'||stage>=1,dyVisible=mode==='error'||mode==='differential'&&stage>=2||mode==='linear'&&stage>=1;
      const actualVisible=mode==='error'||mode==='differential'&&stage>=3||mode==='linear'&&stage>=2;
      const inset=mode==='error'||mode==='differential'&&stage>=4;
      const path=(fn:(x:number)=>number)=>Array.from({length:181},(_,i)=>{const x=xmin+(xmax-xmin)*i/180;return `${i?'L':'M'}${sx(x)},${sy(fn(x))}`;}).join('');
      const horizontalTip=sx(4)+(px-sx(4))*(mode==='differential'&&stage===1?inkProgress:1);
      const dyTip=base+(py-base)*(mode==='differential'&&stage===2?inkProgress:1);
      const actualTip=base+(ay-base)*(mode==='differential'&&stage===3?inkProgress:1);
      let geometry=`<path class="calc-curve" d="${path(f)}"/><path class="calc-tangent" d="${path(L)}"/><circle class="calc-point" cx="${sx(4)}" cy="${base}" r="5"/>`;
      if(mode==='differential'&&stage===0){
        const l=4-span*.7,r=4-span*.25;
        geometry+=`<path class="calc-slope-triangle" d="M${sx(l)} ${sy(L(l))}H${sx(r)}V${sy(L(r))}Z"/>`;
      }
      if(horizontal)geometry+=`<path class="calc-change-dx" d="M${sx(4)} ${base}H${horizontalTip}"/>`;
      if(dyVisible)geometry+=`<circle class="calc-point hollow" cx="${px}" cy="${py}" r="6"/><path class="calc-change-dy" d="M${px-15} ${base}V${dyTip}m-4 ${Math.sign(v.dy)*6}l4 ${-Math.sign(v.dy)*6}l4 ${Math.sign(v.dy)*6}"/>`;
      if(actualVisible)geometry+=`<circle class="calc-point" cx="${px}" cy="${ay}" r="4"/><path class="calc-change-actual" d="M${px+15} ${base}V${actualTip}m-4 ${Math.sign(v.delta)*6}l4 ${-Math.sign(v.delta)*6}l4 ${Math.sign(v.delta)*6}"/>`;
      activeInk=new Set();
      label(up?'function-up':'function-down',`<text x="80" y="28">${up?'f(x) = 4 − √x':'f(x) = √x'}; a = 4</text>`);
      label('slope',`<text x="650" y="28">Slope / rate: ${sign}/4</text>`);
      // Independent, stable annotation regions can inscribe without masking the
      // curve or replacing the diagram. Coordinates and copy are unchanged.
      if(dyVisible){geometry+=`<path class="calc-leader" d="M${px} ${py}H610V86H636"/>`;label('dy',`<text class="calc-label-dy" x="650" y="80">dy: tangent change</text><text x="650" y="107">${fixed(v.dy,7)}</text>`);}
      if(actualVisible){geometry+=`<path class="calc-leader" d="M${px} ${ay}H623V145H636"/>`;label('actual',`<text class="calc-label-actual" x="650" y="139">Δy: actual change</text><text x="650" y="166">${fixed(v.delta,7)}</text>`);}
      label(horizontal?'dx':'triangle-note',`<text x="80" y="343">${horizontal?`dx = Δx = ${fixed(dx)}`:'Tangent slope: rise / run'}</text>`);
      label('legend','<text x="405" y="343">open dot: tangent · solid dot: curve</text>');
      let ticks='';for(const x of [xmin,4,xmax])ticks+=`<text class="calc-tick" x="${sx(x)}" y="307" text-anchor="middle">${fixed(x,2)}</text>`;
      for(const y of [ymin,2,ymax])ticks+=`<text class="calc-tick" x="65" y="${sy(y)+6}" text-anchor="end">${fixed(y,2)}</text>`;
      label('axes',ticks+'<text class="calc-tick" x="635" y="307">x</text><text class="calc-tick" x="25" y="28">y</text>');
      errorScale=Math.max(.00002,origin.errorScale,Math.abs(v.error)*1.4);
      if(inset){
        const extent=errorScale,ey=230-v.error/extent*30;
        label('error-inset',`<g class="calc-error-inset" data-error="${v.error}" data-error-scale="${errorScale}" aria-label="Magnified signed error on a separate reference-scaled axis"><text x="650" y="201">E = Δy − dy · magnified</text><path class="calc-axis" d="M685 209V266M675 230H710"/><path class="calc-error-gap" d="M698 230V${ey}"/><circle class="calc-point" cx="698" cy="${ey}" r="4"/><text x="728" y="232">0</text><text x="755" y="257">${fixed(v.error,7)}</text><text class="calc-inset-scale" x="650" y="292">separate scale: ±${fixed(extent,7)}</text></g>`);
      }
      layers.forEach((layer,key)=>layer.hidden=!activeInk.has(key));
      updateSvg(plot,`<path class="calc-axis" d="M80 274H590M80 66V274"/><svg x="80" y="66" width="510" height="208" viewBox="80 66 510 208" overflow="hidden">${geometry}</svg>`);
      Object.assign(w.figure.dataset,{dy:String(v.dy),delta:String(v.delta),error:String(v.error),dx:String(dx),zoom:String(zoom),up:String(up),stage:String(stage)});
      if(mode==='linear')math(w.output,stage===0?raw`f'(4)=`+(up?'-':'')+raw`1/4,\quad L(x)=2`+(up?'-':'+')+raw`(x-4)/4`:raw`L(4+(`+fixed(dx)+raw`))=`+fixed(v.predicted,7)+(stage>=2?raw`,\quad f(4+(`+fixed(dx)+raw`))=`+fixed(v.actual,7):''));
      else if(mode==='differential')w.output.textContent=stage===0?'f′(4) is a slope, not a change. The triangle measures rise / run.':stage===1?'Choose dx = Δx: the same horizontal displacement.':stage===2?'dy is defined exactly by f′(4)dx; it is the tangent-line change.':stage===3?'Δy is the curve’s actual change; Δy ≈ dy is the approximation.':'The magnified inset shows the small difference; the main graph is unchanged.';
      else math(w.output,raw`E=\Delta y-dy=`+fixed(v.error,7)+raw`\quad(`+(up?raw`f''>0:\ \text{tangent below}`:raw`f''<0:\ \text{tangent above}`)+')');
    };
    const increment=slider(w.controls,'Increment dx',-.6,.6,dx,n=>{dx=n;draw();},.005);
    const magnification=slider(w.controls,'Zoom near a',0,1,zoom,n=>{zoom=n;draw();});
    const cases=mode==='error'?choices(w.controls,['√x: concave down','4 − √x: concave up'],i=>{up=i===1;draw();exploration=true;seq.request(seq.step);}):undefined;
    const labels=mode==='linear'?['The tangent is a local model','Zoom in and predict with the tangent','Compare the actual value']:mode==='differential'?['Slope is a rate: inspect the slope triangle','Move horizontally by dx = Δx','dy is the exact linearized change','Compare the actual change Δy','Magnify only the small difference']:['Concavity gives the sign of error','Halve dx: the error shrinks quadratically','Reflect the curve: the error changes sign','Halve dx on the reflected curve'];
    const seq=teachingBeats(w,labels.map((label,i)=>({label,state:{stage:mode==='error'?4:i,zoom:mode==='linear'?(i===1?.88:.65):mode==='differential'?(i===0?.65:.94):(i%2===1?.98:.94),fraction:mode==='error'&&i%2===1?.5:1,reflected:mode==='error'&&i>=2}})),state=>{
      stage=state.stage;zoom=state.zoom;dx=origin.dx*state.fraction;up=state.reflected?!origin.up:origin.up;reflectChoice(cases,up?1:0);increment.value=String(dx);magnification.value=String(zoom);draw();
    },['zoom','fraction']);
    // Begin camera travel at the actual explored pose, including a handoff's
    // slider values, rather than jumping back to a canned teaching snapshot.
    let fromPose={dx,zoom},toPose={dx,zoom};const setStep=seq.setStep.bind(seq);
    seq.revealAfterMotion=true;
    seq.setStep=step=>{
      fromPose={dx,zoom};const before=marks();
      if(exploration){exploration=false;seq.targets=[layers.get(up?'function-up':'function-down')!,w.output];}
      else {setStep(step);seq.targets=introduced(before);}
      toPose={dx,zoom};
    };
    seq.transition=(from,to,p)=>{inkProgress=from<to?p:1;const t=p*p*(3-2*p);dx=fromPose.dx+(toPose.dx-fromPose.dx)*t;zoom=fromPose.zoom+(toPose.zoom-fromPose.zoom)*t;increment.value=String(dx);magnification.value=String(zoom);draw();};
    seq.continuity={reset:()=>{origin={...initial};},key:'local-model',revealTargets:()=>handoffTargets,capture:()=>({dx,zoom,up,errorScale,ink:[...marks()]}),restore:value=>{origin={...(value as LocalState)};seq.setStep(seq.step);dx=origin.dx;zoom=origin.zoom;up=origin.up;increment.value=String(dx);magnification.value=String(zoom);reflectChoice(cases,up?1:0);draw();handoffTargets=introduced(new Set(origin.ink??[]));}};
    return w.figure;
  };
}
