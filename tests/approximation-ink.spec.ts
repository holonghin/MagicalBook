import {test,expect,type Page} from '@playwright/test';
const app=(p:Page)=>p.locator('#app');
const live=(p:Page)=>p.locator('article:not(.outgoing-scene)');
async function key(p:Page,k='ArrowRight'){await p.keyboard.press(k);}
async function skip(p:Page){await key(p,'s');}
async function seek(p:Page,f:number){await p.evaluate(f=>{const t=(window as any).grimoire.timeline;if(!t.paused)t.togglePause();t.seek(f);},f);}
async function start(p:Page){await p.emulateMedia({reducedMotion:'reduce'});await p.goto('/MagicalBook/?deck=calculus-1&rehearsal');await expect(p.locator('.cover-title')).toHaveText('CALCULUS I');await key(p,'Enter');}
async function scene(p:Page,id:string){await p.evaluate(id=>{const g=(window as any).grimoire;g.enter(g.slides.findIndex((s:any)=>s.id===id),1);},id);}
async function until(p:Page,id:string){for(let i=0;i<450;i++){if(await app(p).getAttribute('data-scene')===id)return;await key(p);}throw Error(`Missing ${id}`);}
async function assertClean(p:Page){await expect(p.locator('.ink-front,.effect-defs')).toHaveCount(0);const concealed=await live(p).locator('.calc-readout,.calc-ink-layer:not([hidden])').evaluateAll(els=>els.filter(el=>getComputedStyle(el).visibility==='hidden'||getComputedStyle(el).clipPath!=='none'||getComputedStyle(el).maskImage!=='none').length);expect(concealed).toBe(0);}
async function aligned(p:Page){const wrong=await p.locator('[data-ink-for]').evaluateAll(fronts=>fronts.filter(front=>{const target=document.querySelector(`[data-reveal-id="${(front as HTMLElement).dataset.inkFor}"]`);if(!target)return true;const a=front.getBoundingClientRect(),b=target.getBoundingClientRect();return Math.abs(a.x-b.x)>2||Math.abs(a.y-b.y)>2||Math.abs(a.width-b.width)>2||Math.abs(a.height-b.height)>2;}).length);expect(wrong).toBe(0);}
test.beforeEach(async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});(page as any).errors=errors;});
test.afterEach(async({page})=>expect((page as any).errors).toEqual([]));
for(const width of [1440,1024])test(`new approximation ink settles after live geometry at ${width}, including repeat and backward seeks`,async({page})=>{
  test.setTimeout(120_000);await page.setViewportSize({width,height:width===1440?900:768});await start(page);
  for(const [id,count] of [['X1-linear',2],['X2-change',4],['X3-error',3]] as const){
    await scene(page,id);await key(page,'m');
    await live(page).locator('.calc-drawing > svg').evaluate(el=>{(window as any).plotInkRoot=el;(window as any).plotCurve=el.querySelector('.calc-curve');});
    for(let step=1;step<=count;step++){
      await key(page);await seek(page,.25);await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveCSS('visibility','hidden');
      expect(await live(page).locator('.calc-drawing > svg').evaluate(el=>el===(window as any).plotInkRoot&&el.querySelector('.calc-curve')===(window as any).plotCurve)).toBe(true);
      await expect(live(page).locator('.calc-demo:not(.ink-front)')).not.toHaveAttribute('data-reveal-id',/.+/);
      await seek(page,.8);await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await aligned(page);
      if(id==='X2-change'&&step===2){await expect(live(page).locator('[data-demo-ink="dy"]:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await expect(live(page).locator('[data-demo-ink="axes"]:not(.ink-front)')).not.toHaveAttribute('data-reveal-id',/.+/);}
      if(id==='X2-change'&&step===3){await expect(live(page).locator('[data-demo-ink="actual"]:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await expect(live(page).locator('[data-demo-ink="dy"]:not(.ink-front)')).not.toHaveAttribute('data-reveal-id',/.+/);}
      if(step===1)await page.screenshot({path:`docs/qa/approximation-ink/${id}-${width}-middle.png`});
      // The single clock also seeks back before masks exist, then re-inscribes.
      await seek(page,.2);await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveCSS('visibility','hidden');await seek(page,.85);await aligned(page);await skip(page);await assertClean(page);
      const fits=await live(page).locator('.calc-readout .katex-html').evaluateAll(els=>els.every(el=>{const a=el.getBoundingClientRect(),b=el.closest('.calc-demo')!.getBoundingClientRect();return a.left>=b.left-2&&a.right<=b.right+2;}));expect(fits).toBe(true);
    }
    for(let repeat=0;repeat<2;repeat++){await key(page,'ArrowLeft');await skip(page);await key(page);await seek(page,.8);await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await skip(page);await assertClean(page);}
    await key(page,'m');
  }
});
test('shared-node handoffs burn only new explanations; repeated X2/X3 entrances preserve the explored plot',async({page})=>{
  test.setTimeout(120_000);await start(page);await until(page,'X1-linear');await key(page);await key(page);await key(page,'m');await key(page);await seek(page,.5);
  await expect(app(page)).toHaveAttribute('data-scene','X2-change');await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await expect(live(page).locator('.calc-demo:not(.ink-front)')).not.toHaveAttribute('data-reveal-id',/.+/);await aligned(page);await skip(page);
  for(let i=0;i<4;i++){await key(page);await skip(page);}
  for(const [name,v] of [['Increment dx',.3],['Zoom near a',.82]] as const)await page.getByRole('slider',{name,exact:true}).evaluate((el,v)=>{(el as HTMLInputElement).value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},v);
  await page.evaluate(()=>{(document.activeElement as HTMLElement)?.blur();});
  const path=await live(page).locator('.calc-drawing > svg .calc-curve').getAttribute('d');
  for(let repeat=0;repeat<3;repeat++){
    await key(page);await seek(page,.45);await expect(app(page)).toHaveAttribute('data-scene','X3-error');await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);
    await expect(live(page).locator('.calc-demo:not(.ink-front)')).toHaveAttribute('data-dx','0.3');await expect(live(page).locator('.calc-demo:not(.ink-front)')).toHaveAttribute('data-zoom','0.82');expect(await live(page).locator('.calc-drawing > svg .calc-curve').getAttribute('d')).toBe(path);
    for(const region of ['dy','actual','axes','error-inset'])await expect(live(page).locator(`[data-demo-ink="${region}"]:not(.ink-front)`)).not.toHaveAttribute('data-reveal-id',/.+/);
    await expect(live(page).getByRole('button',{name:'4 − √x: concave up',exact:true})).toHaveAttribute('data-reveal-id',/ink-/);await aligned(page);await page.screenshot({path:`docs/qa/approximation-ink/handoff-${repeat}.png`});await skip(page);await assertClean(page);
    await key(page,'ArrowLeft');await skip(page);await expect(app(page)).toHaveAttribute('data-scene','X2-change');
  }
  // A direct visit/replay still inscribes the whole arriving illustration.
  await key(page,'m');await scene(page,'X3-error');await key(page,'m');await key(page,'r');await seek(page,.8);await expect(live(page).locator('.calc-demo:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await skip(page);await assertClean(page);
  await page.getByRole('button',{name:'4 − √x: concave up',exact:true}).click();await seek(page,.5);await expect(live(page).locator('[data-demo-ink="function-up"]:not(.ink-front)')).toHaveAttribute('data-reveal-id',/ink-/);await skip(page);await assertClean(page);
  await key(page);await seek(page,.2);await key(page,'Home');await skip(page);await expect(app(page)).toHaveAttribute('data-phase','closed');await expect(page.locator('.scene-host article')).toHaveCount(0);
});
