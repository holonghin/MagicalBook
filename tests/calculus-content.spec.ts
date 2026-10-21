import { test, expect, type Page } from '@playwright/test';

async function act(page: Page, action: string) { await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function open(page: Page, effects = false) {
  await page.goto('/MagicalBook/?deck=calculus-1&rehearsal');
  await expect(page.locator('.cover-title')).toHaveText('CALCULUS I');
  if (!effects) await act(page, 'effects');
  await page.locator('.cover').click(); await act(page, 'skip');
}
async function scene(page: Page, id: string) {
  await page.evaluate(id => { const g = (window as any).grimoire; g.enter(g.slides.findIndex((s: any) => s.id === id), 1); }, id);
  await act(page, 'skip');
}
async function range(page: Page, label: string, value: number) {
  await page.getByRole('slider', { name: label, exact: true }).evaluate((el, value) => { (el as HTMLInputElement).value = String(value); el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
}
test.beforeEach(async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors;
});
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('all 34 knowledge nodes, five branches and every authored page render without clipping or formula errors', async ({ page }) => {
  test.setTimeout(120_000); await open(page);
  const data = await page.evaluate(() => { const g = (window as any).grimoire; return { nodes: g.deck.routeGraph.nodes, slides: g.slides.map((s: any) => ({ id: s.id, kind: s.kind })), flow: g.deck.flow, edges: g.deck.routeGraph.edges }; });
  expect(data.nodes).toHaveLength(39); expect(data.edges).toHaveLength(71);
  const expected = ['F0', ...Array.from({ length: 7 }, (_, i) => `L${i + 1}`), ...Array.from({ length: 6 }, (_, i) => `P${i + 1}`), ...Array.from({ length: 8 }, (_, i) => `D${i + 1}`), ...Array.from({ length: 9 }, (_, i) => `A${i + 1}`), 'X1', 'X2', 'X3'];
  expect(data.nodes.filter((n: any) => !n.role).map((n: any) => n.id).sort()).toEqual(expected.sort());
  expect(data.flow.indexOf('map-P3')).toBe(data.flow.indexOf('map-D1') + 1);
  expect(data.flow.indexOf('map-P4')).toBeGreaterThan(data.flow.indexOf('map-D8'));
  const issues: { id: string; problem: string }[] = [];
  for (const s of data.slides.filter((s: any) => s.kind === 'node' || s.kind === 'recap')) {
    await scene(page, s.id); await expect(page.locator('.katex-error,.renderer-fallback,.content-error')).toHaveCount(0);
    const overflow = await page.locator('article').evaluate(el => {
      const rect = el.getBoundingClientRect(), content = el.querySelector('.page-content')!.getBoundingClientRect();
      const problems: string[] = [];
      el.querySelectorAll<HTMLElement>('.ink-slot').forEach(slot => {
        const r = slot.getBoundingClientRect();
        if (r.bottom > rect.bottom - 5 || r.top < rect.top - 1) problems.push(`${slot.dataset.block} outside page`);
      });
      el.querySelectorAll<HTMLElement>('.katex-html').forEach(math => { if (math.getBoundingClientRect().width > content.width + 2) problems.push('formula wider than page'); });
      if ((el.querySelector('.page-content') as HTMLElement).scrollHeight > content.height + 8) problems.push('content taller than its frame');
      return problems;
    });
    overflow.forEach(problem => issues.push({ id: s.id, problem }));
    if (['F0-function', 'D2-reference', 'D3-chain', 'D7-reference', 'P2-ivt', 'A8-assemble', 'X2-change'].includes(s.id)) await page.screenshot({ path: `docs/qa/calculus/${s.id}.png` });
  }
  expect(issues).toEqual([]);
});

test('the complete guided route is keyboard-only and leaves every lesson accessible', async ({ page }) => {
  test.setTimeout(120_000); await open(page);
  await expect(page.locator('#app')).toHaveAttribute('data-scene','map-root');
  await expect(page.locator('.route-node[style*="visibility: visible"]')).toHaveCount(1);
  const steps=await page.evaluate(()=>(window as any).grimoire.deck.guidedRoute.steps);
  const seen=new Set<string>();
  for(let presses=0;presses<400;presses++){
    const current=await page.locator('#app').getAttribute('data-scene'); seen.add(current!);
    if(current==='taught-map')break;
    await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('#app')).toHaveAttribute('data-scene','taught-map');
  const ids=await page.evaluate(()=>(window as any).grimoire.deck.routeGraph.nodes.filter((n:any)=>!n.role).flatMap((n:any)=>n.slideIds));
  expect(ids.filter((id:string)=>!seen.has(id))).toEqual([]);
  expect((await page.locator('#app').getAttribute('data-completed-nodes'))!.split(',')).toHaveLength(34);
  for(let i=0;i<steps.length;i++){const joined=i>0&&steps[i].continuationGroup&&steps[i].continuationGroup===steps[i-1].continuationGroup;expect(seen.has(steps[i].sceneId)).toBe(!joined);}
  await page.keyboard.press('ArrowLeft'); await expect(page.locator('#app')).toHaveAttribute('data-scene','X3-area');
  await page.keyboard.press('ArrowRight'); await expect(page.locator('#app')).toHaveAttribute('data-scene','taught-map');
  await page.screenshot({path:'docs/qa/calculus/completed-map.png'});
});

test('IVT, MVT, inverse/circle, ladder and optimization controls encode the correct mathematics', async ({ page }) => {
  await open(page);
  await scene(page, 'P2-ivt'); await expect(page.locator('.calc-demo')).toHaveAttribute('data-intersections', '3');
  await range(page, 'Target height N', 1); await expect(page.locator('.calc-demo')).toHaveAttribute('data-intersections', '1');
  await page.getByRole('button', { name: 'At a turning height', exact: true }).click(); await expect(page.locator('.calc-demo')).toHaveAttribute('data-intersections', '2');
  await scene(page,'P1-continuity'); await page.getByRole('button',{name:'Mismatch sides',exact:true}).click();
  await expect(page.locator('.calc-readout')).toContainText('left limit 1 ≠ right limit 2');
  await expect(page.locator('.calc-drawing .hollow')).toHaveCount(1);
  await scene(page, 'P5-mvt'); await range(page, 'Secant tilt', -1.1); await range(page,'Tangent position c',0);
  await expect(page.locator('.calc-demo')).toHaveAttribute('data-secant-slope', '-1.1'); await expect(page.locator('.calc-demo')).toHaveAttribute('data-tangent-slope', '-1.1');
  await scene(page, 'D5-implicit'); await page.getByRole('button', { name: 'At y = 0', exact: true }).click(); await expect(page.locator('.calc-demo')).toHaveAttribute('data-vertical', 'true');
  await expect(page.locator('.calc-readout')).toContainText('no finite');
  await scene(page, 'D8-rates'); await range(page, 'Base position x (metres)', 3);
  await expect(page.locator('.calc-demo')).toHaveAttribute('data-y', '4'); await expect(page.locator('.calc-demo')).toHaveAttribute('data-rate', '-0.75');
  await scene(page, 'A9-optimize'); await range(page, 'Rectangle width', 3); await expect(page.locator('.calc-demo')).toHaveAttribute('data-area', '9');
  await range(page, 'Rectangle width', .1); expect(Number(await page.locator('.calc-demo').getAttribute('data-area'))).toBeCloseTo(.59);
  await scene(page, 'L7-guarantee'); await range(page, 'ε', .4); await expect(page.locator('.calc-demo')).toHaveAttribute('data-delta', '0.2');
});

test('five Chain Rule factors, three L’Hôpital verdicts and signed differential errors are complete', async ({ page }) => {
  await open(page); await scene(page, 'D3-chain');
  for (let i = 1; i <= 5; i++) { await page.getByRole('button', { name: 'Peel one layer / assemble', exact: true }).click(); await expect(page.locator('.calc-factor')).toHaveCount(i); }
  await expect(page.locator('.calc-pending')).toContainText('All five rates');
  await expect(page.locator('.calc-factors')).not.toContainText('…'); await expect(page.locator('.calc-factors')).not.toContainText('u₁');
  await page.screenshot({ path: 'docs/qa/calculus/chain-complete.png' });
  await scene(page, 'L6-diagnosis'); await page.getByRole('button', { name: 'Reveal verdict', exact: true }).click(); await expect(page.locator('.calc-verdict')).toContainText('Applicable');
  await page.getByRole('button', { name: 'Only f′(0) is known', exact: true }).click(); await page.getByRole('button', { name: 'Reveal verdict', exact: true }).click(); await expect(page.locator('.calc-verdict')).toContainText('Conditions not established');
  await page.getByRole('button', { name: 'Derivative limit fails', exact: true }).click(); await page.getByRole('button', { name: 'Reveal verdict', exact: true }).click(); await page.getByRole('button', { name: 'Optional lecture witness', exact: true }).click(); await expect(page.locator('.calc-verdict')).toContainText('Inconclusive');
  await scene(page, 'X2-change');
  const values = await page.locator('.calc-demo').evaluate(el => ({ ...((el as HTMLElement).dataset) }));
  expect(Number(values.dy)).toBeCloseTo(.025, 10); expect(Number(values.delta)).toBeCloseTo(Math.sqrt(4.1) - 2, 10); expect(Number(values.error)).toBeLessThan(0);
  await scene(page, 'X3-error'); await page.getByRole('button', { name: '4 − √x: concave up', exact: true }).click();
  const e = Number(await page.locator('.calc-demo').getAttribute('data-error')); expect(e).toBeGreaterThan(0);
  await range(page, 'Increment dx', .05); expect(Number(await page.locator('.calc-demo').getAttribute('data-error'))).toBeLessThan(e / 3);
  await expect(page.locator('.katex-error')).toHaveCount(0);
});

test('book travel, graph path/target frames, printed recap chain and cached-map return work with effects', async ({ page }) => {
  test.setTimeout(120_000); await page.goto('/MagicalBook/?deck=calculus-1&rehearsal'); await page.locator('.cover').click();
  for (const p of [.24, .52, .76, .92]) { await seek(page, p); await page.screenshot({ path: `docs/qa/calculus/open-${p}.png` }); }
  await act(page, 'skip');
  // Complete F0's reversible teaching beats, then reach the first branch cue.
  for(let i=0;i<7;i++){await act(page,'next');await act(page,'skip');}
  await act(page, 'next');
  for (const p of [.1, .45, .8]) { await seek(page, p); await page.screenshot({ path: `docs/qa/calculus/path-${p}.png` }); }
  await act(page, 'skip');
  await page.evaluate(() => (window as any).grimoire.visitNode('L1'));
  for (const p of [.25, .65]) { await seek(page, p); await page.screenshot({ path: `docs/qa/calculus/node-burn-${p}.png` }); }
  await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-scene', 'L1-limit');
  await act(page,'next');await act(page,'skip');await act(page,'next'); await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-scene', 'map-L2');
  await scene(page, 'taught-map'); await page.screenshot({ path: 'docs/qa/calculus/completed-map.png' }); await page.evaluate(() => (window as any).savedGraph = document.querySelector('.route-diagram'));
  await act(page, 'next');
  for (const p of [.25, .55, .85]) { await seek(page, p); await expect(page.locator('article')).toHaveCount(2); await page.screenshot({ path: `docs/qa/calculus/recap-${p}.png` }); }
  await act(page, 'skip');
  for (let i = 1; i <= 6; i++) { await expect(page.locator('#app')).toHaveAttribute('data-scene', `recap-${i}`); await act(page, 'next'); await act(page, 'skip'); }
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-map-return');
  expect(await page.locator('.route-diagram').evaluate(el => el === (window as any).savedGraph)).toBe(true);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-step', '35');
  await act(page, 'back'); await seek(page, .4); await page.screenshot({ path: 'docs/qa/calculus/recap-map-lift.png' }); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-6'); await act(page, 'next'); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-map-return');
  await act(page, 'next');
  for (const p of [.2, .6, .85]) { await seek(page, p); await page.screenshot({ path: `docs/qa/calculus/close-${p}.png` }); }
  await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  await act(page, 'minimap'); await act(page, 'skip'); await expect(page.locator('.route-node')).toHaveCount(39);
  await act(page, 'home'); await act(page, 'skip'); await page.locator('.cover').click(); await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-scene', 'map-root');
});

test('remaining illustrated controls, staged construction and landscape slide frames are usable', async ({ page }) => {
  test.setTimeout(90_000); await page.setViewportSize({ width: 1280, height: 720 }); await open(page);
  await scene(page,'F0-function'); await page.getByRole('button', { name: 'Mapping → graph', exact: true }).click();
  await page.waitForTimeout(350); await page.screenshot({ path: 'docs/qa/calculus/mapping-moving.png' });
  await expect(page.locator('.calc-readout')).toContainText('Graph');
  await scene(page, 'F0-inverse'); await page.keyboard.press('ArrowRight');
  await expect(page.locator('.calc-note')).toContainText('each reached height');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await expect(page.locator('.calc-drawing')).toContainText('strictly decreasing');
  await scene(page, 'L2-sides'); await page.getByRole('button', { name: 'Signed infinity', exact: true }).click(); await expect(page.locator('.calc-readout')).toContainText('∞');
  await scene(page, 'L3-infinity'); await page.getByRole('button', { name: 'Divide each term by x²', exact: true }).click(); await page.getByRole('button', { name: 'Toward −∞', exact: true }).click(); await range(page, '|x|', 100); await expect(page.locator('.calc-readout')).toContainText('−1');
  await scene(page, 'L5-squeeze'); await range(page, 'Neighborhood radius', .02); await expect(page.locator('.calc-drawing .calc-curve')).toHaveCount(1);
  await scene(page, 'P3-smooth'); await range(page, 'Signed secant step h', 0); await expect(page.locator('.calc-readout')).toContainText('DNE');
  await scene(page, 'D4-logs'); for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Transform', exact: true }).click(); await expect(page.locator('.calc-drawing')).toContainText('ln');
  await scene(page, 'D6-inverse'); await range(page, 'Original input a', 1.5); await expect(page.locator('.calc-demo')).toHaveAttribute('data-original-slope', '3'); expect(Number(await page.locator('.calc-demo').getAttribute('data-inverse-slope'))).toBeCloseTo(1 / 3);
  await scene(page, 'D7-branches'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await expect(page.locator('.calc-drawing .calc-bound')).toHaveCount(1);
  await scene(page, 'A3-evt'); await page.getByRole('button', { name: 'Open interval', exact: true }).click(); await expect(page.locator('.calc-readout')).toContainText('neither');
  await scene(page, 'A6-curvature'); await page.getByRole('button', { name: '1/x: missing point', exact: true }).click(); await range(page, 'Tangent position', 0); await expect(page.locator('.calc-drawing .calc-tangent')).toHaveCount(0);
  await scene(page, 'A8-assemble');
  for (let i = 1; i <= 4; i++) { await page.getByRole('button', { name: 'Add next constraint', exact: true }).click(); await expect(page.locator('.calc-demo')).toHaveAttribute('data-stage', String(i)); }
  await expect(page.locator('.calc-drawing .calc-curve')).toHaveCount(2);
  await expect(page.locator('.calc-drawing svg svg')).toHaveCSS('overflow', 'hidden');
  await page.screenshot({ path: 'docs/qa/calculus/sketch-complete.png' });
  const invalid = await page.locator('.calc-drawing path').evaluateAll(paths => paths.some(p => /NaN|Infinity/.test(p.getAttribute('d') ?? ''))); expect(invalid).toBe(false);
  await scene(page, 'X1-linear'); await range(page, 'Zoom near a', 1); await page.screenshot({ path: 'docs/qa/calculus/linear-zoom.png' });
  await scene(page, 'X3-error'); await page.screenshot({ path: 'docs/qa/calculus/error-gap.png' });
  await expect(page.locator('.katex-error')).toHaveCount(0);
  const ids: string[] = await page.evaluate(() => (window as any).grimoire.slides.filter((s: any) => s.kind === 'node').map((s: any) => s.id));
  const overflow: string[] = [];
  for (const id of ids) {
    await scene(page, id);
    if (await page.locator('.page-content').evaluate(el => el.scrollHeight > el.clientHeight + 8)) overflow.push(id);
  }
  expect(overflow).toEqual([]);
});

test('completed Calculus graph supports touch pan/pinch and remains available offline with reduced motion', async ({ page, context }) => {
  await page.setViewportSize({ width: 1024, height: 768 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/MagicalBook/?deck=calculus-1&rehearsal'); await expect(page.locator('.cover-title')).toHaveText('CALCULUS I'); await act(page, 'minimap');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.route-node')).toHaveCount(39);
  const world = page.locator('.graph-world'), before = await world.getAttribute('style');
  const box = (await page.locator('.graph-scroll').boundingBox())!, x = box.x + box.width * .6, y = box.y + box.height * .45;
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 70, y: y + 30 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await world.getAttribute('style')).not.toBe(before);
  const pan = await world.getAttribute('style');
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 40, y, id: 1 }, { x: x + 40, y, id: 2 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 90, y, id: 1 }, { x: x + 90, y, id: 2 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await world.getAttribute('style')).not.toBe(pan);
  await context.setOffline(true); await act(page, 'home'); await page.locator('.cover').click();
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'map-root'); await act(page, 'next'); await act(page,'next'); await act(page,'next');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'F0-inverse');
  await page.keyboard.press('ArrowRight'); await expect(page.locator('.calc-note')).toContainText('each reached height');
  await context.setOffline(false);
});
