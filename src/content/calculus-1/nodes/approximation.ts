import type { ContentNode } from '../../../engine/content';
import { page, tex } from '../slides/builders';

export const approximation: ContentNode[] = [
  { id: 'X1', slides: [page('X1-linear', 'Return to One Point', tex`L(x)=f(a)+f'(a)(x-a),\qquad \lim_{x\to a}\frac{f(x)-L(x)}{x-a}=0`,
    'Predict with the tangent, then compare the curve. Carry the same model into changes and error.', 'calc-linear',
    'Limit excludes x=a and uses the function domain. Use the zoom control on the same sqrt(x) curve and tangent used throughout X1–X3. Tangent approximation improves as x approaches a; no claim it is exact away from a.'),
  ] },
  { id: 'X2', slides: [page('X2-change', 'Rate, Predicted Change, Actual Change', tex`\underbrace{f'(a)}_{\text{slope / rate}},\qquad\underbrace{dy=f'(a)dx}_{\text{linearized change}},\qquad\underbrace{\Delta y=f(a+\Delta x)-f(a)}_{\text{actual change}}`,
    'When dx = Δx, dy is defined exactly by f′(a)dx. The approximation is Δy ≈ dy.', 'calc-differential',
    'Differential dy is defined by the linear map f′(a)dx. Actual increment is not identical to it. Reuse the X1 geometry: horizontal dx, tangent-predicted rise dy, actual rise Δy. Signed error Δy−dy equals f(a+dx)−L(a+dx).'),
  ] },
  { id: 'X3', slides: [
    page('X3-error', 'Curvature Predicts the Sign of Error', tex`E=\Delta y-dy=f(a+dx)-\bigl[f(a)+f'(a)dx\bigr]`,
      'f″ ≥ 0 throughout the segment ⇒ tangent below. f″ ≤ 0 throughout ⇒ tangent above, under the usual smoothness.', 'calc-error',
      'Keep the same sqrt(x) curve and tangent. Compare with the reflected concave-up curve 4−sqrt(x), also based at (4,2), and move dx toward 0 to shrink the gap. Both models stay in x>0. Tangent bounds need the whole segment between a and x, not the sign at a alone.'),
    page('X3-bound', 'A Quantitative Error Bound', tex`\begin{gathered}E(x)=\frac{f''(c)}2(x-a)^2\quad(c\text{ between }a,x)\\ |f''(t)|\le M\Rightarrow |E(x)|\le\frac M2|x-a|^2\end{gathered}`,
      'Assume f is C² on a neighborhood of the segment. Half the step gives at most one quarter of this bound.', undefined,
      'Lecture pp. 79–80 and 106. This is a short optional quantitative reveal, not a Taylor-polynomial lecture. For sqrt on [4,4.1], |f″|≤1/32, so |E|≤0.00015625; actual |E|≈0.000154327. Sufficient C² hypothesis stated for clarity. If x=a, error is zero.'),
    page('X3-magnitudes', 'From Input Uncertainty to Output Error', tex`y=f(x)\ne0,\qquad dx=\Delta x\text{ small}`,
      'Measurement-error magnitudes use |Δy|. The signed tangent residual E = Δy − dy is a different quantity.', 'calc-error-quantities',
      'Regard x as the reference input and Δx as its small perturbation, with f differentiable there and x+Δx in the domain. Absolute, relative and percentage output errors are estimated using dy=f′(x)dx. Relative error requires f(x)≠0. Differentiability gives Δy=dy+o(dx); when f′(x)=0 a zero first-order prediction need not capture the leading nonzero error. These are local first-order estimates, not certified upper error bounds.'),
    page('X3-area', 'A Small Radius Error, Twice the Area Error', tex`\left|\frac{dr}{r}\right|\approx1\%\quad\Rightarrow\quad\left|\frac{dA}{A}\right|\approx2\%`,
      'r > 0; choose dr = Δr with |dr| ≪ r. Differential prediction ≈ actual change; the quadratic remainder is not zero.', 'calc-circle-propagation',
      'Reference r=10 cm, A=100π cm². With δ=Δr/r and dr=Δr, dA/A=2δ exactly, while ΔA/A=2δ+δ² exactly. For δ=+1%, predict +2% vs exact +2.01%; for −1%, predict −2% vs exact −1.99%; magnitudes are positive. Halving to +0.5% predicts 1% vs exact 1.0025%. The highlighted annulus is drawn at its true geometric scale. Slider stays between −5% and +5%, so both radii remain positive.'),
  ] },
];
