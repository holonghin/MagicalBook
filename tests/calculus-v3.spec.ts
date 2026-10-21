import { test, expect, type Page } from '@playwright/test';

const root = (p: Page) => p.locator('#app');
async function key(p: Page, k='ArrowRight') { await p.keyboard.press(k); }
async function skip(p: Page) { for(let i=0;i<3;i++) if(await p.evaluate(()=>(window as any).grimoire.timeline.active)) await key(p,'s'); }
async function seek(p: Page, fraction: number) { await p.evaluate(f=>{const t=(window as any).grimoire.timeline;if(!t.paused)t.togglePause();t.seek(f);},fraction); }
async function start(p: Page) {
  await p.emulateMedia({reducedMotion:'reduce'}); await p.goto('/MagicalBook/?deck=calculus-1&rehearsal');
  await expect(p.locator('.cover-title')).toHaveText('CALCULUS I');await key(p,'Enter');
}
async function until(p: Page, id: string) {
  for(let i=0;i<400;i++){if(await root(p).getAttribute('data-scene')===id)return;await key(p);}
  throw new Error(`Guided route did not reach ${id}`);
}
test.beforeEach(async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});(page as any).errors=errors;
});
test.afterEach(async({page})=>expect((page as any).errors).toEqual([]));

test('v3: every slider has content-authored beats; L2 cases, cube factoring, uniqueness and restart are keyboard complete',async({page})=>{
  test.setTimeout(120_000);await start(page);const seen=new Set<string>(), scenarios=new Set<string>();let inspected=false;
  for(let press=0;press<400;press++){
    const id=(await root(page).getAttribute('data-scene'))!;seen.add(id);if(id==='taught-map')break;
    if(id==='map-goals')await expect(page.locator('.presenter-cue')).toContainText('Trace next idea');
    const demo=page.locator('article:not(.outgoing-scene) .calc-demo');
    if(await demo.count()){
      if(await demo.locator('input').count())await expect(demo).toHaveAttribute('data-demo-sequence','true');
      const scenario=await demo.getAttribute('data-scenario'),step=Number(await demo.getAttribute('data-demo-step'));
      scenarios.add(`${scenario}:${step}`);
      if(id==='L2-sides'&&step===3&&!inspected){
        await expect(demo).toHaveAttribute('data-case','1');await expect(demo).toHaveAttribute('data-verdict','true');
        await expect(page.getByRole('button',{name:'Disagree',exact:true})).toHaveAttribute('aria-pressed','true');
        await expect(page.locator('.calc-readout')).toContainText('≠');
        const cursor=await root(page).getAttribute('data-guided-step');
        await page.getByRole('button',{name:'Restart demo',exact:true}).click();await expect(demo).toHaveAttribute('data-demo-step','0');
        await expect(root(page)).toHaveAttribute('data-guided-step',cursor!);inspected=true;
      }
    }
    await key(page);
  }
  await expect(root(page)).toHaveAttribute('data-scene','taught-map');
  const expected=await page.evaluate(()=>(window as any).grimoire.deck.routeGraph.nodes.filter((n:any)=>!n.role).flatMap((n:any)=>n.slideIds));
  expect(expected).toHaveLength(51);expect(expected.filter((s:string)=>!seen.has(s))).toEqual([]);
  for(const step of [0,1,2,3,4,5])expect(scenarios.has(`calc-sides:${step}`)).toBe(true);
  for(const step of [0,1,2,3])expect(scenarios.has(`calc-cubes:${step}`)).toBe(true);
  for(const step of [0,1,2,3])expect(scenarios.has(`calc-unique-root:${step}`)).toBe(true);
  await key(page,'c');await expect(page.locator('.presenter-cue')).toBeHidden();await key(page,'c');await expect(page.locator('.presenter-cue')).toBeVisible();
});

for(const viewportSize of [{width:1440,height:900},{width:1024,height:768}])test(`v3: 33 delta reveals retain old ink and readable labels at ${viewportSize.width}`,async({page})=>{
  test.setTimeout(120_000);await page.setViewportSize(viewportSize);await start(page);const audited:string[]=[];
  for(let press=0;press<400;press++){
    const id=(await root(page).getAttribute('data-scene'))!;if(id==='taught-map')break;
    const leaving=await page.evaluate(()=>{
      const g=(window as any).grimoire;
      if(g.guided.current.advanceOnly&&g.slides[g.state.index].routeStep!==undefined)return true;
      if(!g.activeNode||!g.state.routeReturn)return false;
      if(g.guided.current.continuationGroup&&g.guided.current.continuationGroup===g.guided.steps[g.guided.cursor+1]?.continuationGroup)return false;
      const n=g.deck.routeGraph.nodes.find((n:any)=>n.id===g.activeNode),d=document.querySelector('.calc-demo') as HTMLElement|null;
      return n.slideIds.at(-1)===g.slides[g.state.index].id&&(!d?.dataset.demoSequence||d.dataset.demoStep===d.dataset.demoMax);
    });
    if(leaving){
      const known=await page.evaluate(()=>{const g=(window as any).grimoire;const view=g.graphViews.get(g.graphState.id) as HTMLElement;return [...view.querySelectorAll<SVGPathElement>('.route-edge[data-progress="1.000"]')].map(e=>e.dataset.edge);});
      await key(page,'m');await key(page);await expect(page.locator('.flutter-leaf')).toHaveCount(0);
      await seek(page,.48);
      const progress=await page.locator('.route-edge').evaluateAll(edges=>Object.fromEntries(edges.map(e=>[(e as SVGElement).dataset.edge,(e as SVGElement).dataset.progress])));
      expect(known.filter((id:string)=>progress[id]!=='1.000')).toEqual([]);
      const target=await page.evaluate(()=>(window as any).grimoire.guided.current.nodeId as string|undefined);
      if(target&&!target.startsWith('G')){
        await seek(page,.94);
        if(['L1','L7','D3','A8','X3'].includes(target))await page.screenshot({path:`docs/qa/calculus-v3/reveal-${target}-${viewportSize.width}.png`});
        await skip(page);audited.push(target);
        if(['L1','L7','D3','A8','X3'].includes(target))await page.screenshot({path:`docs/qa/calculus-v3/settled-${target}-${viewportSize.width}.png`});
        const box=await page.locator(`.route-node[data-node="${target}"] .node-title`).evaluate(el=>el.getBoundingClientRect().toJSON()),viewport=(await page.locator('.graph-scroll').boundingBox())!;
        expect(box!.height).toBeGreaterThanOrEqual(18);expect(box!.left).toBeGreaterThan(viewport.x+4);expect(box!.right).toBeLessThan(viewport.x+viewport.width-4);
        expect(box!.top).toBeGreaterThan(viewport.y+4);expect(box!.bottom).toBeLessThan(viewport.y+viewport.height-4);
        expect(Number(await page.locator('.route-diagram').getAttribute('data-zoom'))).toBeGreaterThanOrEqual(.9);
        const card=await page.locator(`.route-node[data-node="${target}"]`).evaluate(el=>el.getBoundingClientRect().toJSON());
        expect(box.top).toBeGreaterThan(card.top+5);expect(box.bottom).toBeLessThan(card.bottom-5);
      }else {
        await skip(page);
        if(await root(page).getAttribute('data-scene')==='taught-map') {
          for(const id of ['X2','X3'])await expect(page.locator(`.route-edge[data-edge="branch-${id}"]`)).toHaveAttribute('data-progress','1.000');
          audited.push('X2','X3');
        }
      }
      await key(page,'m');
    }else await key(page);
  }
  expect(audited).toHaveLength(33);
});

test('v3: source viewport returns, reverse delta and optional Mini-map page travel stay distinct',async({page})=>{
  test.setTimeout(90_000);await start(page);await until(page,'map-L4');await key(page,'m');
  const identity=await page.locator('.route-diagram').evaluate(el=>{(window as any).retainedMap=el;return el.getAttribute('data-graph-id');});
  const pose=await page.locator('.graph-world').getAttribute('style');await key(page);await skip(page);await expect(root(page)).toHaveAttribute('data-scene','L4-patterns');
  await key(page,'Escape');await seek(page,.5);await expect(page.locator('.flutter-leaf')).toHaveCount(0);await expect(page.locator('.route-edge[data-edge="branch-L3"]')).toHaveAttribute('data-progress','1.000');await skip(page);
  expect(await page.locator('.graph-world').getAttribute('style')).toBe(pose);expect(await page.locator('.route-diagram').evaluate(el=>el===(window as any).retainedMap)).toBe(true);
  await key(page);await skip(page);await key(page);await seek(page,.6);await expect(page.locator('.flutter-leaf')).toHaveCount(0);await skip(page);await expect(root(page)).toHaveAttribute('data-scene','map-L5');
  await key(page,'ArrowLeft');await seek(page,.5);await expect(page.locator('.route-edge[data-edge="branch-L3"]')).toHaveAttribute('data-progress','1.000');await expect(page.locator('.flutter-leaf')).toHaveCount(0);await skip(page);
  await expect(root(page)).toHaveAttribute('data-scene','L4-patterns');
  await key(page,'g');await expect(page.locator('.flutter-leaf')).toHaveCount(4);await skip(page);await expect(root(page)).toHaveAttribute('data-mini-map-preview','true');
  await expect(page.locator('.route-node[data-node="X3"]')).toBeEnabled();expect(await page.locator('.route-diagram').getAttribute('data-graph-id')).toBe(identity);
});

test('v3: ten repeated L3/L6 entrances keep glow geometry local and finish with complete, unmasked math',async({page})=>{
  test.setTimeout(150_000);await start(page);await key(page,'c');await key(page,'m');
  // Use real Left/Right page travel inside each already-unlocked node.
  // Re-entering a cached page must not retain a previous mask or callback.
  await key(page,'m'); await until(page,'L3-infinity'); await key(page,'m');
  for(const destination of ['L3-infinity','L6-diagnosis']) {
    if(destination==='L6-diagnosis'){await key(page,'m');await until(page,destination);await key(page,'m');}
    for(let round=0;round<10;round++)for(const direction of ['ArrowLeft','ArrowRight']) {
      await key(page,direction);
      const id=(await root(page).getAttribute('data-scene'))!;
    for(const fraction of [.25,.5,.75,1]){
      await seek(page,fraction);
      const displaced=await page.locator('.ink-front').evaluateAll(copies=>copies.flatMap(copy=>{
        const target=copy.parentElement?.querySelector<HTMLElement>(`[data-reveal-id="${(copy as HTMLElement).dataset.inkFor}"]`);if(!target)return [];
        const a=target.getBoundingClientRect(),b=copy.getBoundingClientRect();return Math.abs(a.left-b.left)>1.5||Math.abs(a.top-b.top)>1.5||Math.abs(a.width-b.width)>1.5||Math.abs(a.height-b.height)>1.5?[{a:a.toJSON(),b:b.toJSON()}]:[];
      }));expect(displaced).toEqual([]);
      if(round===0)await page.screenshot({path:`docs/qa/calculus-v3/${id}-${fraction}.png`});
    }
    await skip(page);await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
    const masks=await page.locator('.ink-content,.calc-demo [data-reveal-progress]').evaluateAll(els=>els.some(el=>getComputedStyle(el).clipPath!=='none'||getComputedStyle(el).maskImage!=='none'||getComputedStyle(el).opacity==='0'));expect(masks).toBe(false);
    await expect(page.locator('.katex-error,.content-error')).toHaveCount(0);
    }
  }
  await key(page);await seek(page,.5);await expect(page.locator('.scene-host')).toHaveJSProperty('inert',true);
  const shifts=await page.locator('.ink-front').evaluateAll(copies=>copies.some(copy=>{
    const source=copy.parentElement?.querySelector(`[data-reveal-id="${(copy as HTMLElement).dataset.inkFor}"]`);if(!source)return false;
    const a=source.getBoundingClientRect(),b=copy.getBoundingClientRect();return Math.abs(a.left-b.left)>1.5||Math.abs(a.top-b.top)>1.5||Math.abs(a.height-b.height)>1.5;
  }));expect(shifts).toBe(false);
  await page.screenshot({path:'docs/qa/calculus-v3/diagnosis-middle.png'});await skip(page);await expect(page.locator('.calc-verdict')).toContainText('Applicable');
  await expect(page.locator('.scene-host')).toHaveJSProperty('inert',false);
});

test('v3: tablet layouts keep cube cancellation and the IVT uniqueness bridge precise and legible',async({page})=>{
  test.setTimeout(90_000);await page.setViewportSize({width:1024,height:768});await start(page);await until(page,'L3-algebra');
  for(let step=0;step<4;step++){
    await expect(root(page)).toHaveAttribute('data-scene','L3-algebra');await expect(page.locator('.calc-demo')).toHaveAttribute('data-demo-step',String(step));
    expect(await page.locator('.page-content').evaluate(el=>el.scrollHeight>el.clientHeight+8)).toBe(false);
    await page.screenshot({path:`docs/qa/calculus-v3/cubes-${step}.png`});if(step<3)await key(page);
  }
  await expect(page.locator('.calc-drawing')).toContainText('12');await until(page,'P6-unique-root');
  await expect(page.locator('.block-math')).toContainText('strictly monotone');
  for(const claim of ['hypotheses','at-least-one','at-most-one','exactly-one']){
    await expect(page.locator('.calc-demo')).toHaveAttribute('data-claim',claim);await expect(page.locator('.katex-error')).toHaveCount(0);
    expect(await page.locator('.page-content').evaluate(el=>el.scrollHeight>el.clientHeight+8)).toBe(false);
    const c=Number(await page.locator('.calc-demo').getAttribute('data-root'));expect(Math.abs(c**3+c-1)).toBeLessThan(1e-12);
    await page.screenshot({path:`docs/qa/calculus-v3/unique-${claim}.png`});if(claim!=='exactly-one')await key(page);
  }
  await expect(page.locator('.calc-readout')).toContainText('exactly one');await key(page,'ArrowLeft');await expect(page.locator('.calc-demo')).toHaveAttribute('data-claim','at-most-one');
});

test('v3: resize inside a lesson restores the retained graph in the new coordinate frame',async({page})=>{
  await start(page);await until(page,'map-L4');await key(page);await expect(root(page)).toHaveAttribute('data-scene','L4-patterns');
  await page.setViewportSize({width:1024,height:768});await key(page,'Escape');
  await expect(root(page)).toHaveAttribute('data-scene','map-L4');await expect(page.locator('.route-edge[data-edge="branch-L4"]')).toHaveAttribute('data-progress','1.000');
  const title=await page.locator('.route-node[data-node="L4"] .node-title').boundingBox(),view=(await page.locator('.graph-scroll').boundingBox())!;
  expect(title!.x).toBeGreaterThan(view.x);expect(title!.x+title!.width).toBeLessThan(view.x+view.width);
  expect(title!.y).toBeGreaterThan(view.y);expect(title!.y+title!.height).toBeLessThan(view.y+view.height);
  await key(page,'ArrowLeft');await expect(root(page)).toHaveAttribute('data-scene','L3-infinity');
  await key(page);await expect(root(page)).toHaveAttribute('data-scene','map-L4');await expect(page.locator('.flutter-leaf')).toHaveCount(0);
});
