import type { ContentNode } from '../../../engine/content';
import { page, tex } from '../slides/builders';

export const properties: ContentNode[] = [
  { id: 'P1', slides: [page('P1-continuity', 'Value Meets Nearby Behavior', tex`f\text{ continuous at }a\ \Longleftrightarrow\ f(a)\text{ exists and }\lim_{x\to a}f(x)=f(a)`,
    'Defined value · finite limit · equality. At endpoints, continuity is relative to the domain.', 'calc-continuity',
    'Contrast a filled smooth point, a removable discontinuity, a jump, and unbounded behavior using the same coordinate view. Continuity at one point licenses substitution there; IVT needs continuity at every point of the whole closed interval.')] },
  { id: 'P2', slides: [page('P2-ivt', 'A Continuous Curve Cannot Skip a Height', tex`f\in C[a,b],\quad N\text{ between }f(a),f(b)\quad\Rightarrow\quad\exists c\in[a,b]:f(c)=N`,
    'A sign change gives an interior zero. Existence is not uniqueness: add strict monotonicity for exactly one.', 'calc-ivt',
    'f(a)f(b)<0 implies c∈(a,b). Endpoint target values may be attained at an endpoint. Demo f(x)=x³−x on [−1.4,1.4], with a movable target between actual endpoint heights. All intersections are marked, including tangencies. No differentiability assumption for IVT.')] },
  { id: 'P3', slides: [
    page('P3-smooth', 'A Finite Slope Forces Continuity', tex`f'(a)\in\mathbb R\quad\Rightarrow\quad f(x)-f(a)=(x-a)\frac{f(x)-f(a)}{x-a}\to0`,
      'Not conversely. At a join: check continuity, then one-sided difference quotients from the definition.', 'calc-corner',
      'Teach immediately after D1 using the same secant/tangent frame. |x| is continuous at 0 but its left and right difference quotients are −1 and +1. Matching derivative formulas on punctured sides alone does not establish differentiability at the join.'),
    page('P3-quotient', 'A Useful Limit Without a Derivative', tex`\square \to 0 \quad\frac{f(x)}{\square}\to L\in\mathbb R\quad\Rightarrow\quad f(x)=\square \cdot \frac{f(x)}{\square}\to0`,
      'This proves lim f(x) = 0. Continuity at a follows only if f(a) = 0 is also known.', undefined,
      'Assume the quotient is defined on a deleted neighborhood in the domain. f(a) may be undefined or assigned another value. This is a limit-law corollary, not an assertion of differentiability.'),
  ] },
  { id: 'P4', slides: [page('P4-rolle', 'Equal Heights, a Horizontal Tangent', tex`f\in C[a,b],\ f\text{ differentiable on }(a,b),\ f(a)=f(b)\Rightarrow\exists c\in(a,b):f'(c)=0`,
    'Two distinct roots force a zero derivative between them. If f′ never vanishes, there is at most one root.', 'calc-rolle',
    'Continuity on the closed interval and differentiability on the open interval are indispensable. This same geometry tilts into the MVT picture. Existence of c does not imply uniqueness.')] },
  { id: 'P5', slides: [page('P5-mvt', 'Local Rate Equals Interval Rate', tex`\exists c\in(a,b):\qquad f'(c)=\frac{f(b)-f(a)}{b-a}`,
    'Continuous on [a,b], differentiable on (a,b). Local slopes now constrain an entire interval.', 'calc-mvt',
    'Rolle is the equal-endpoint case. If |f′|≤M on the relevant interior intervals and MVT hypotheses hold on each segment, |f(x)−f(y)|≤M|x−y|. This yields bounds/squeeze; Cauchy’s variant provides the deeper link to L’Hôpital. The demo f=x²+tx on [−1,1] has secant slope t and matching tangent at c=0 for every t.')] },
  { id: 'P6', slides: [page('P6-monotone', 'From Slopes to Every Pair of Values', tex`\begin{gathered}f(b)-f(a)=f'(c)(b-a),\quad a<b\\ f'>0\Rightarrow\text{strictly increasing},\quad f'<0\Rightarrow\text{strictly decreasing}\end{gathered}`,
    'f′ ≥ 0 ⇒ nondecreasing; f′ = 0 ⇒ constant. IVT + strict monotonicity ⇒ a unique root when signs differ.', 'calc-monotone',
    'Assume f continuous on the interval and differentiable in its interior, with the indicated derivative condition throughout. Strictly increasing does not imply f′>0 everywhere: x³ has f′(0)=0. f′≥0 alone need not imply strict increase (constant function). Strict monotonicity implies injectivity on the whole interval.'),
    page('P6-unique-root', 'Existence + Uniqueness', tex`\begin{gathered}f\in C[a,b],\quad f(a)f(b)<0\\ f\text{ strictly monotone on }[a,b]\Rightarrow\exists!c\in(a,b):f(c)=0\end{gathered}`,
      'IVT gives at least one; strict monotonicity gives at most one. Non-strict monotonicity may allow a whole interval of zeros.', 'calc-unique-root',
      'Two distinct zeros contradict strict increase or strict decrease. A derivative strictly positive or strictly negative on (a,b), together with MVT hypotheses, is sufficient for strict monotonicity; it is not its definition. The short example x³+x−1 is continuous on [0,1], has endpoint values −1,1 and derivative 3x²+1>0.'),
  ] },
];
