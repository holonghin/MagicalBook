import { test, expect, type Page } from '@playwright/test';
async function key(p:Page,k='ArrowRight'){await p.keyboard.press(k);}
async function start(p:Page){await p.emulateMedia({reducedMotion:'reduce'});await p.goto('/MagicalBook/?deck=calculus-1&rehearsal');await expect(p.locator('.cover-title')).toHaveText('CALCULUS I');await key(p,'Enter');}
async function scene(p:Page,id:string){await p.evaluate(id=>{const g=(window as any).grimoire;g.enter(g.slides.findIndex((s:any)=>s.id===id),1);},id);}
async function range(p:Page,name:string,value:number){await p.getByRole('slider',{name,exact:true}).evaluate((el,v)=>{(el as HTMLInputElement).value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);}
async function until(p:Page,id:string){for(let i=0;i<450;i++){if(await p.locator('#app').getAttribute('data-scene')===id)return;await key(p);}throw Error(`Missing ${id}`);}
async function seek(p:Page,f:number){await p.evaluate(f=>{const t=(window as any).grimoire.timeline;if(!t.paused)t.togglePause();t.seek(f);},f);}
async function skip(p:Page){await key(p,'s');}
test.beforeEach(async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});(page as any).errors=errors;});
test.afterEach(async({page})=>expect((page as any).errors).toEqual([]));
for(const size of [{width:1440,height:900},{width:1920,height:1080},{width:1024,height:768}])test(`v4 teaching layouts and honest geometry at ${size.width}`,async({page})=>{
  test.setTimeout(90_000);await page.setViewportSize(size);await start(page);
  await scene(page,'L6-rule');await expect(page.locator('article')).not.toContainText(/deleted interval|punctured neighborhood/);
  for(let i=0;i<4;i++){await key(page);await expect(page.locator('.calc-hospital-checks li').nth(i)).toBeVisible();}
  await page.screenshot({path:`docs/qa/calculus-v4/lhospital-${size.width}.png`});
  await scene(page,'D3-chain');
  for(let i=1;i<=6;i++){await key(page);await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step',String(i));if(i<6)await expect(page.locator('.calc-factor')).toHaveCount(i);}
  await expect(page.locator('.calc-chain-final')).toBeVisible();await expect(page.locator('.calc-pending')).toBeHidden();
  const final=await page.locator('.calc-chain-final .katex-html').evaluate(el=>({r:el.getBoundingClientRect().toJSON(),p:el.closest('.calc-drawing')!.getBoundingClientRect().toJSON(),font:parseFloat(getComputedStyle(el).fontSize)}));
  expect(final.r.left).toBeGreaterThanOrEqual(final.p.left-2);expect(final.r.right).toBeLessThanOrEqual(final.p.right+2);expect(final.font).toBeGreaterThanOrEqual(23);
  await page.screenshot({path:`docs/qa/calculus-v4/chain-final-${size.width}.png`});
  await scene(page,'A9-optimize');await expect(page.locator('article')).toContainText('A farmer has 12 m');await expect(page.locator('.calc-readout')).not.toContainText('max');
  await key(page);await key(page);await expect(page.locator('.calc-readout')).not.toContainText('max');await key(page);
  await expect(page.locator('.calc-demo')).toHaveAttribute('data-area','9');await expect(page.locator('.calc-readout')).toContainText('max');
  await page.screenshot({path:`docs/qa/calculus-v4/fencing-${size.width}.png`});
  for(const id of ['X2-change','X3-error']){
    await scene(page,id);if(id==='X2-change')for(let i=0;i<4;i++)await key(page);
    for(const dx of [-.6,0,.1,.6])for(const zoom of [0,1]){
      await range(page,'Increment dx',dx);await range(page,'Zoom near a',zoom);
      const d=await page.locator('.calc-demo').evaluate(el=>({...((el as HTMLElement).dataset)}));
      expect(Number(d.dy)).toBeCloseTo(dx/4,10);expect(Number(d.delta)).toBeCloseTo(Math.sqrt(4+dx)-2,10);expect(Number(d.error)).toBeCloseTo(Number(d.delta)-Number(d.dy),10);
      const boxes=await page.locator('.calc-approx-plot > text,.calc-error-inset text').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,r:n.getBoundingClientRect().toJSON()})));
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i].r,b=boxes[j].r;expect(a.right<=b.left+1||b.right<=a.left+1||a.bottom<=b.top+1||b.bottom<=a.top+1,`${id}: ${boxes[i].text} overlaps ${boxes[j].text}`).toBe(true);}
    }
    await range(page,'Increment dx',.1);await page.screenshot({path:`docs/qa/calculus-v4/${id}-${size.width}.png`});
  }
  await expect(page.locator('.katex-error,.renderer-fallback')).toHaveCount(0);
});
test('v4 joined local-model story retains state, reverses boundaries, and reveals accumulated map progress in parallel',async({page})=>{
  test.setTimeout(150_000);await start(page);const seen=new Set<string>();
  for(let i=0;i<450;i++){const id=(await page.locator('#app').getAttribute('data-scene'))!;seen.add(id);if(id==='X2-change')break;await key(page);}
  expect(seen.has('map-X2')).toBe(false);await expect(page.locator('#app')).toHaveAttribute('data-scene','X2-change');
  await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step','0');for(let i=0;i<4;i++)await key(page);
  await range(page,'Increment dx',.3);await range(page,'Zoom near a',.82);await page.locator('.calc-demo').evaluate(()=>{(document.activeElement as HTMLElement)?.blur();});
  await key(page,'m');await key(page);await seek(page,.5);
  await expect(page.locator('#app')).toHaveAttribute('data-scene','X3-error');await expect(page.locator('article:not(.outgoing-scene) .calc-demo:not(.ink-front)')).toHaveAttribute('data-dx','0.3');
  await expect(page.locator('.paper-burn-outgoing,.flutter-leaf')).toHaveCount(0);await expect(page.locator('article.outgoing-scene .calc-demo')).toBeHidden();await expect(page.locator('article:not(.outgoing-scene) .calc-demo.ink-front')).toHaveCount(0);await page.screenshot({path:'docs/qa/calculus-v4/join-middle.png'});await skip(page);
  await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step','0');await expect(page.locator('.calc-demo')).toHaveAttribute('data-zoom','0.82');
  await key(page,'m');await key(page,'ArrowLeft');await expect(page.locator('#app')).toHaveAttribute('data-scene','X2-change');await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step','4');await key(page);await expect(page.locator('#app')).toHaveAttribute('data-scene','X3-error');await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step','0');
  const priorScale=await page.locator('.calc-error-inset').getAttribute('data-error-scale');const priorGap=await page.locator('.calc-error-inset .calc-error-gap').evaluate(e=>(e as SVGPathElement).getTotalLength());await key(page);await expect(page.locator('.calc-demo')).toHaveAttribute('data-dx','0.15');await expect(page.locator('.calc-error-inset')).toHaveAttribute('data-error-scale',priorScale!);expect(await page.locator('.calc-error-inset .calc-error-gap').evaluate(e=>(e as SVGPathElement).getTotalLength())).toBeLessThan(priorGap/3);await key(page);await expect(page.locator('.calc-demo')).toHaveAttribute('data-up','true');expect(Number(await page.locator('.calc-demo').getAttribute('data-error'))).toBeGreaterThan(0);
  await until(page,'X3-area');for(let i=0;i<3;i++)await key(page);await key(page,'m');await key(page);
  let concurrent=false;for(const fraction of [.25,.35,.45,.55]){await seek(page,fraction);const p=await page.locator('.route-edge[data-edge="branch-X2"],.route-edge[data-edge="branch-X3"]').evaluateAll(edges=>edges.map(e=>Number((e as SVGElement).dataset.progress)));if(p.length===2&&p.every(n=>n>0&&n<1))concurrent=true;}expect(concurrent).toBe(true);await seek(page,.86);
  await expect(page.locator('#app')).toHaveAttribute('data-scene','taught-map');
  const states=await page.locator('.route-node[data-node="X2"],.route-node[data-node="X3"]').evaluateAll(nodes=>nodes.map(n=>({id:(n as HTMLElement).dataset.node,visible:getComputedStyle(n).visibility,progress:(n as HTMLElement).dataset.progress})));
  expect(states).toHaveLength(2);expect(states.every(n=>n.visible!=='hidden')).toBe(true);
  await page.screenshot({path:'docs/qa/calculus-v4/accumulated-map-middle.png'});await skip(page);await key(page,'m');
  await expect(page.locator('#app')).toHaveAttribute('data-completed-nodes',/X2/);await expect(page.locator('#app')).toHaveAttribute('data-completed-nodes',/X3/);
  await key(page,'ArrowLeft');await expect(page.locator('#app')).toHaveAttribute('data-scene','X3-area');await key(page,'Home');await expect(page.locator('#app')).toHaveAttribute('data-phase','closed');
});

test('v4 changed scenes replay with aligned masks; mathematical camera beats settle and Home interrupts safely',async({page})=>{
  test.setTimeout(90_000);await start(page);await key(page,'m');
  for(const id of ['L6-rule','D3-chain','A9-optimize','X2-change','X3-error']){
    for(let visit=0;visit<2;visit++){
      await scene(page,id);await seek(page,.25);await page.screenshot({path:`docs/qa/calculus-v4/${id}-entrance-${visit}.png`});await seek(page,.7);
      const aligned=await page.locator('[data-ink-for]').evaluateAll(fronts=>fronts.every(f=>{const t=document.querySelector(`[data-reveal-id="${(f as HTMLElement).dataset.inkFor}"]`)!;const a=f.getBoundingClientRect(),b=t.getBoundingClientRect();return Math.abs(a.x-b.x)<2&&Math.abs(a.y-b.y)<2&&Math.abs(a.width-b.width)<2&&Math.abs(a.height-b.height)<2;}));expect(aligned).toBe(true);await skip(page);
    }
    await key(page);await seek(page,.45);await page.screenshot({path:`docs/qa/calculus-v4/${id}-beat-middle.png`});await skip(page);if(id==='X2-change')await expect(page.locator('.calc-demo')).toHaveAttribute('data-zoom','0.94');await expect(page.locator('[data-ink-for]')).toHaveCount(0);
  }
  await key(page,'Home');await seek(page,.4);await key(page,'s');await expect(page.locator('.scene-host article')).toHaveCount(0);
});
test('v4 tablet touch controls and narrow Chain Rule layout remain usable',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await start(page);await scene(page,'X3-error');await page.getByRole('button',{name:'4 − √x: concave up',exact:true}).tap();await expect(page.locator('.calc-demo')).toHaveAttribute('data-up','true');
  const client=await context.newCDPSession(page),box=(await page.getByRole('slider',{name:'Increment dx',exact:true}).boundingBox())!,x=box.x+box.width*.55,y=box.y+box.height*.5;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+box.width*.2,y}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(Number(await page.locator('.calc-demo').getAttribute('data-dx'))).not.toBe(.1);
  await page.setViewportSize({width:640,height:900});await scene(page,'D3-chain');for(let i=0;i<6;i++)await key(page);await expect(page.locator('.calc-chain-final-narrow')).toBeVisible();await expect(page.locator('.calc-chain-final')).toBeHidden();
  const fits=await page.locator('.calc-chain-final-narrow .katex-html').evaluate(el=>el.getBoundingClientRect().right<=el.closest('.calc-drawing')!.getBoundingClientRect().right+2);expect(fits).toBe(true);await page.screenshot({path:'docs/qa/calculus-v4/chain-narrow.png'});
  expect(errors).toEqual([]);await context.close();
});

test('v4 deferred lessons support Escape, Mini-map, re-entry and a clean cover restart',async({page})=>{
  test.setTimeout(120_000);await start(page);await until(page,'X2-change');await key(page,'Escape');await expect(page.locator('#app')).toHaveAttribute('data-scene','map-X2');await expect(page.locator('.route-edge[data-edge="branch-X2"]')).toHaveAttribute('data-progress','1.000');await expect(page.locator('.route-node[data-node="X3"]')).toHaveAttribute('aria-disabled','true');await key(page);await expect(page.locator('#app')).toHaveAttribute('data-scene','X2-change');
  await key(page,'g');await expect(page.locator('#app')).toHaveAttribute('data-mini-map-preview','true');await key(page,'ArrowLeft');await expect(page.locator('#app')).toHaveAttribute('data-scene','map-X2');await expect(page.locator('#app')).toHaveAttribute('data-mini-map-preview','false');await key(page);await expect(page.locator('#app')).toHaveAttribute('data-scene','X2-change');
  for(let i=0;i<4;i++)await key(page);await range(page,'Increment dx',-.4);await page.locator('.calc-demo').evaluate(()=>{(document.activeElement as HTMLElement)?.blur();});await key(page);await expect(page.locator('.calc-demo')).toHaveAttribute('data-dx','-0.4');await key(page,'Home');await key(page,'Enter');await until(page,'X2-change');await expect(page.locator('.calc-demo')).toHaveAttribute('data-dx','0.1');
});
