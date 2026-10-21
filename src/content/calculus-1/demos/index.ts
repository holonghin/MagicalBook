import type { BlockRenderer } from '../../../engine/types';
import { hole, sideDemo, dominant, squeeze, epsilon, hospitalRule, hospital, cubes } from './limits';
import { mapping, injectivity, ivt, secant, meanValue, monotone, uniqueRoot } from './functions';
import { chain, logarithm, circle, inverse, sine, ladder } from './derivatives';
import { critical, evt, signs, curvature, sketch, rectangle } from './analysis';
import { approximation } from './approximation';
import { limitForms, limitConversion } from './limit-forms';
import { errorQuantities, circlePropagation } from './error-propagation';
import { connectionsPanel, calculusRoute } from '../knowledge-graph/legend';

const renderers: Record<string, BlockRenderer> = {
  'calc-title': block => { const h = document.createElement('h1'); h.className = 'calc-title block-title'; h.textContent = block.text ?? ''; return h; },
  'calc-mapping': mapping, 'calc-injectivity': injectivity,
  'calc-hole': hole, 'calc-sides': sideDemo(), 'calc-continuity': sideDemo(true),
  'calc-cubes': cubes, 'calc-dominant': dominant, 'calc-squeeze': squeeze, 'calc-epsilon': epsilon,
  'calc-hospital-rule': hospitalRule, 'calc-hospital': hospital,
  'calc-limit-forms': limitForms, 'calc-limit-product': limitConversion('product'),
  'calc-limit-difference': limitConversion('difference'), 'calc-limit-power': limitConversion('power'),
  'calc-ivt': ivt, 'calc-secant': secant(), 'calc-corner': secant(true),
  'calc-rolle': meanValue(true), 'calc-mvt': meanValue(), 'calc-monotone': monotone, 'calc-unique-root': uniqueRoot,
  'calc-chain': chain, 'calc-log': logarithm, 'calc-circle': circle,
  'calc-inverse': inverse, 'calc-sine': sine, 'calc-ladder': ladder,
  'calc-critical': critical(), 'calc-fermat': critical(true), 'calc-evt': evt,
  'calc-signs': signs, 'calc-curvature': curvature,
  'calc-domain': sketch('domain'), 'calc-asymptotes': sketch('asymptotes'), 'calc-sketch': sketch('assembly'),
  'calc-rectangle': rectangle,
  'calc-linear': approximation('linear'), 'calc-differential': approximation('differential'), 'calc-error': approximation('error'),
  'calc-error-quantities': errorQuantities, 'calc-circle-propagation': circlePropagation,
  'calc-connections': connectionsPanel, route: calculusRoute,
};
export const demos: Record<string, BlockRenderer> = Object.fromEntries(Object.entries(renderers).map(([id, render]) => [id, (block, context) => {
  const element = render(block, context);
  if (element.classList.contains('calc-demo')) {
    const owner = context.deck.routeGraph?.nodes.find(n => n.slideIds.includes(context.slide.id));
    element.dataset.demoInstance = `${context.slide.id}:${block.id}`;
    element.dataset.nodeId = owner?.id ?? '';
    element.dataset.scenario = id;
  }
  return element;
}]));
