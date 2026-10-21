import { test, expect, type Page } from '@playwright/test';

async function key(page: Page, value='ArrowRight') { await page.keyboard.press(value); }
async function ready(page: Page) { await expect(page.locator('#app')).toHaveAttribute('data-phase','ready'); }
async function at(page: Page, scene: string) { await expect(page.locator('#app')).toHaveAttribute('data-scene',scene); }
async function start(page: Page) {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/MagicalBook/?deck=calculus-1&rehearsal');
  await expect(page.locator('.cover-title')).toHaveText('CALCULUS I'); await key(page,'Enter'); await ready(page);
}
async function until(page: Page, target: string) {
  for(let i=0;i<400;i++){if(await page.locator('#app').getAttribute('data-scene')===target)return;await key(page);}
  throw new Error(`Never reached ${target}`);
}
test.beforeEach(async({page})=>{
  const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});(page as any).errors=errors;
});
test.afterEach(async({page})=>expect((page as any).errors).toEqual([]));

test('root-first, locks, Escape, past revisits and reversible consecutive one-page nodes',async({page})=>{
  test.setTimeout(90_000);await start(page);await at(page,'map-root');
  await expect(page.locator('.route-node[aria-current="step"]')).toHaveAttribute('data-node','F0');
  await key(page,'Enter');await at(page,'F0-function');await key(page);await key(page);await at(page,'F0-inverse');
  for(let i=0;i<4;i++)await key(page);await at(page,'map-goals');
  await expect(page.locator('.route-node[data-node="G2"]')).toBeDisabled();
  await expect(page.locator('.route-node[data-node="G1"]')).toBeDisabled();
  await page.locator('.route-node[data-node="G2"]').evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
  await at(page,'map-goals');await key(page);await at(page,'map-L1');await key(page);await at(page,'L1-limit');
  await key(page,'Escape');await at(page,'map-L1');await until(page,'map-L2');
  await page.getByRole('button',{name:'Fit graph',exact:true}).click();
  await page.locator('.route-node[data-node="F0"]').click();await at(page,'F0-function');await key(page);await at(page,'F0-inverse');await key(page);await at(page,'map-L2');
  await key(page);await at(page,'L2-sides');await until(page,'map-L3');
  await key(page,'ArrowLeft');await at(page,'L2-sides');await key(page);await at(page,'map-L3');
  await key(page);await at(page,'L3-algebra'); await until(page,'L3-infinity');
  // Finish the node's instructional beat if it has one, then the next two one-page lessons.
  await until(page,'map-L4');await key(page);await at(page,'L4-patterns');await key(page);await at(page,'map-L5');await key(page);await at(page,'L5-squeeze');await until(page,'map-L6');
  const earned=await page.locator('#app').getAttribute('data-unlocked-nodes');
  await key(page,'g');await expect(page.locator('#app')).toHaveAttribute('data-mini-map-preview','true');
  await expect(page.locator('.route-node[data-node="X3"]')).toBeEnabled();
  await page.getByRole('button',{name:'Fit graph',exact:true}).click();
  await page.locator('.route-node[data-node="X3"]').click();await at(page,'X3-error');await key(page,'Escape');await at(page,'@completed-graph');
  await expect(page.locator('#app')).toHaveAttribute('data-unlocked-nodes',earned!);
  await key(page,'ArrowLeft');await at(page,'map-L6');await expect(page.locator('.route-node[data-node="X3"]')).toBeDisabled();
  await key(page,'Home');await expect(page.locator('#app')).toHaveAttribute('data-phase','closed');
  await key(page,'g');await expect(page.locator('.route-node[data-node="X3"]')).toBeEnabled();
  await key(page,'Home');await key(page,'Enter');await at(page,'map-root');
  await expect(page.locator('#app')).toHaveAttribute('data-unlocked-nodes','F0');
});

test('Chain Rule adds exactly one factor per key, rewinds and resets without overflowing',async({page})=>{
  test.setTimeout(90_000);await page.setViewportSize({width:1280,height:720});await start(page);await until(page,'D3-chain');
  for(let step=1;step<=6;step++){
    await key(page);await at(page,'D3-chain');await expect(page.locator('.calc-factor')).toHaveCount(step===6?0:step);
    await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step',String(step));
    const overflow=await page.locator('.calc-chain').evaluate(el=>[...el.querySelectorAll('.katex-html')].some(m=>m.getBoundingClientRect().right>el.getBoundingClientRect().right+2)||el.scrollHeight>el.clientHeight+8);
    expect(overflow).toBe(false);await page.screenshot({path:`docs/qa/calculus-flow/chain-${step}.png`});
  }
  await expect(page.locator('.calc-demo')).toHaveAttribute('data-consolidated','true');
  await key(page,'ArrowLeft');await key(page,'ArrowLeft');await expect(page.locator('.calc-factor')).toHaveCount(4);
  await key(page);await key(page);await key(page);await at(page,'map-D4');
  await key(page,'ArrowLeft');await at(page,'D3-chain');await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step','6');
  await key(page,'Home');await key(page,'Enter');await until(page,'D3-chain');await expect(page.locator('.calc-factor')).toHaveCount(0);
});

test('F0 tips share target anchors on desktop and tablet; scenarios never share state or future controls',async({page})=>{
  test.setTimeout(90_000);await start(page);await key(page);
  for(const size of [{width:1440,height:900},{width:1024,height:768}]){
    await page.setViewportSize(size);
    const arrows=await page.locator('.calc-map-arrow').evaluateAll(paths=>paths.map(path=>{
      const p=path as SVGPathElement,end=p.getPointAtLength(p.getTotalLength()),t=p.ownerSVGElement!.querySelector(`[data-output="${(p as unknown as HTMLElement).dataset.target}"]`)!;
      return {input:p.getAttribute('data-input'),target:p.getAttribute('data-target'),gap:Math.hypot(end.x-Number(t.getAttribute('cx')),end.y-Number(t.getAttribute('cy')))};
    }));expect(arrows.map(a=>[a.input,a.target])).toEqual([['-1','1'],['0','0'],['1','1']]);arrows.forEach(a=>expect(a.gap).toBeCloseTo(9,3));
    await page.screenshot({path:`docs/qa/calculus-flow/mapping-${size.width}.png`});
  }
  await page.setViewportSize({width:1440,height:900});await until(page,'D1-rate');
  await expect(page.getByRole('button',{name:'Continuous corner',exact:true})).toHaveCount(0);
  const d1=await page.locator('.calc-demo').getAttribute('data-demo-instance');await until(page,'P3-smooth');
  expect(await page.locator('.calc-demo').getAttribute('data-demo-instance')).not.toBe(d1);
  await expect(page.getByRole('button',{name:'Smooth curve',exact:true})).toHaveCount(0);await key(page);await expect(page.locator('.calc-demo')).toHaveAttribute('data-slope','-1');
  await until(page,'A1-domain');await expect(page.getByRole('button',{name:'Complete picture',exact:true})).toHaveCount(0);
  await key(page);await key(page);await expect(page.locator('.calc-drawing .calc-curve')).toHaveCount(0);
  await until(page,'X2-change');await expect(page.locator('.calc-error-inset')).toHaveCount(0);await key(page);await key(page);await expect(page.locator('.calc-readout')).toContainText('defined exactly');await key(page);await expect(page.locator('.calc-readout')).toContainText('Δ');
});

test('intermediate opening, concurrent branches, mapping, Chain Rule burn and closing stay in the book',async({page})=>{
  test.setTimeout(90_000);await page.goto('/MagicalBook/?deck=calculus-1&rehearsal');await expect(page.locator('.cover-title')).toHaveText('CALCULUS I');
  const seek=async(p:number)=>page.evaluate(p=>{const t=(window as any).grimoire.timeline;if(!t.paused)t.togglePause();t.seek(p);},p);
  await key(page,'Enter');await seek(.55);await at(page,'map-root');await expect(page.locator('.scene-host')).toHaveCSS('visibility','hidden');await page.screenshot({path:'docs/qa/calculus-flow/open-middle.png'});await key(page,'s');
  await key(page);await key(page,'s');await key(page);await seek(.5);await page.screenshot({path:'docs/qa/calculus-flow/mapping-middle.png'});await key(page,'s');
  await key(page);await key(page,'s');for(let i=0;i<3;i++){await key(page);await key(page,'s');}await key(page);
  await seek(.78);await page.screenshot({path:'docs/qa/calculus-flow/branches-middle.png'});await key(page,'s');await at(page,'map-goals');
  await expect(page.locator('.route-edge[data-edge^="goal-"][data-progress="1.000"]')).toHaveCount(5);
  // Continue the genuine route with effects disabled, then inspect an in-flight mathematical beat.
  await key(page,'m');await until(page,'D3-chain');await key(page,'m');await key(page);await seek(.45);await page.screenshot({path:'docs/qa/calculus-flow/chain-ember.png'});await key(page,'s');await at(page,'D3-chain');
  await key(page,'Home');await seek(.35);await page.screenshot({path:'docs/qa/calculus-flow/close-middle.png'});await key(page,'s');await expect(page.locator('#app')).toHaveAttribute('data-phase','closed');await expect(page.locator('.scene-host article')).toHaveCount(0);
});
