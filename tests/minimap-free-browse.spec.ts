import {test,expect,type Page} from '@playwright/test';
async function key(p:Page,k='ArrowRight'){await p.keyboard.press(k);}
async function skip(p:Page){await key(p,'s');}
async function start(p:Page){await p.emulateMedia({reducedMotion:'reduce'});await p.goto('/MagicalBook/?deck=calculus-1&rehearsal');await expect(p.locator('.cover-title')).toHaveText('CALCULUS I');}
const app=(p:Page)=>p.locator('#app');
async function progress(p:Page){return p.evaluate(()=>{const g=(window as any).grimoire;return {cursor:g.guided.cursor,completed:[...g.guided.completed],unlocked:[...g.guided.unlocked],step:g.graphState.progressStep,cue:g.graphState.progressCue};});}
test.beforeEach(async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))errors.push(m.text());});(page as any).errors=errors;});
test.afterEach(async({page})=>expect((page as any).errors).toEqual([]));
test('cover Mini-map enables every content node; empty category labels cannot open or earn progress',async({page})=>{
  test.setTimeout(90_000);await start(page);const original=await progress(page);await key(page,'g');await expect(app(page)).toHaveAttribute('data-mini-map-preview','true');
  const nodes=await page.locator('.route-node').evaluateAll(els=>els.map(el=>({id:(el as HTMLElement).dataset.node!,disabled:(el as HTMLButtonElement).disabled,inert:(el as HTMLElement).inert})));expect(nodes).toHaveLength(39);expect(nodes.filter(n=>!n.id.startsWith('G')).some(n=>n.disabled||n.inert)).toBe(false);
  const inventory=await page.evaluate(()=>{const g=(window as any).grimoire;return {branches:g.deck.routeGraph.nodes.filter((n:any)=>n.role==='branch'),slides:g.slides.map((s:any)=>s.id)};});expect(inventory.branches).toHaveLength(5);expect(inventory.branches.every((n:any)=>n.slideIds.length===0)).toBe(true);expect(inventory.slides.some((id:string)=>/^G[1-5]-overview$/.test(id))).toBe(false);
  for(const node of nodes.filter(n=>n.id.startsWith('G'))){await expect(page.locator(`.route-node[data-node="${node.id}"]`)).toBeDisabled();await page.locator(`.route-node[data-node="${node.id}"]`).evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));await expect(app(page)).toHaveAttribute('data-scene','@completed-graph');}
  // Exercise the real click handler of all 34 content seals.
  for(const {id} of nodes.filter(n=>!n.id.startsWith('G'))){
    await page.getByRole('button',{name:'Fit graph',exact:true}).click();
    const button=page.locator(`.route-node[data-node="${id}"]`);await button.click();
    const expected=await page.evaluate(id=>(window as any).grimoire.deck.routeGraph.nodes.find((n:any)=>n.id===id).slideIds[0],id);
    await expect(app(page)).toHaveAttribute('data-scene',expected);expect(await progress(page)).toEqual(original);await key(page,'Escape');await expect(app(page)).toHaveAttribute('data-scene','@completed-graph');
  }
  // Native keyboard activation also works for a not-yet-taught seal.
  await page.locator('.route-node[data-node="D3"]').focus();await key(page,'Enter');await expect(app(page)).toHaveAttribute('data-scene','D3-chain');
  for(let i=0;i<7;i++)await key(page);await expect(app(page)).toHaveAttribute('data-scene','@completed-graph');expect(await progress(page)).toEqual(original);
  await key(page,'Home');await key(page,'Enter');await expect(app(page)).toHaveAttribute('data-scene','map-root');await expect(page.locator('.route-node[data-node="X3"]')).toBeDisabled();await key(page);await expect(app(page)).toHaveAttribute('data-scene','F0-function');
});
test('ordinary-slide Mini-map permits future lessons, preserves the guided cue, and gates clicks until animation ends',async({page})=>{
  await start(page);await key(page,'Enter');await key(page);await expect(app(page)).toHaveAttribute('data-scene','F0-function');const original=await progress(page);
  await key(page,'m');await key(page,'g');await page.evaluate(()=>{const t=(window as any).grimoire.timeline;if(!t.paused)t.togglePause();t.seek(.4);});
  await expect(page.locator('.scene-host')).toHaveJSProperty('inert',true);await page.screenshot({path:'docs/qa/minimap-free-browse-middle.png'});await skip(page);
  await expect(page.locator('.route-node:disabled')).toHaveCount(5);await page.getByRole('button',{name:'Fit graph',exact:true}).click();await page.locator('.route-node[data-node="X3"]').click();await skip(page);await expect(app(page)).toHaveAttribute('data-scene','X3-error');
  await key(page,'Escape');await skip(page);await expect(app(page)).toHaveAttribute('data-scene','@completed-graph');await key(page,'ArrowLeft');await skip(page);await expect(app(page)).toHaveAttribute('data-scene','map-root');expect(await progress(page)).toEqual(original);
  await expect(page.locator('.route-node[data-node="X3"]')).toBeDisabled();await key(page);await skip(page);await expect(app(page)).toHaveAttribute('data-scene','F0-function');
});
