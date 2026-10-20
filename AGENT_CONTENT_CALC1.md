# AGENT_CONTENT_CALC1.md — CALCULUS I Midterm Review Deck

> **Deck content / pedagogy, not engine design.** Implement this presentation with the **subject-independent** grimoire engine specified in `AGENT_TEMPLATE.md`. This file owns the mathematical content, graph, slide sequence, timing, demo intent, and ending words. It must not implement the common animations or book infrastructure.

## 1. Deck metadata and learning goal

- **Cover:** `CALCULUS I` (gold-embossed by the generic cover component)
- **Language:** concise mathematical English (teacher can speak Chinese as desired)
- **Run time:** approximately **30 minutes** of review; past-exam problems come **afterwards**, separately using a LaTeX question sheet and tablet, not a “Problem Mode” inside the book.
- **Target duration: approximately 30 minutes (flexible).** The presentation may run slightly shorter or longer depending on explanations, animations, and student interaction. **Clarity and mathematical understanding take priority over hitting exactly 30 minutes.** Do not force a fixed time limit for every node. Allow F0 about **1–2 minutes**; keep slide text short, and split dense material into additional slides when needed.
- **Subject story:** *From Local Behavior to Global Understanding — and Back to Local Approximation*
- **Root:** `F0 — Function`
- **Five goal branches:** `G1 — Evaluate Limits`; `G2 — Properties of Functions`; `G3 — Find Derivatives & Rates`; `G4 — Analyze & Optimize Functions`; `G5 — Approximate a Value`
- **Inventory:** 1 root + **33 knowledge nodes** (L1–L7, P1–P6, D1–D8, A1–A9, X1–X3). Branch labels are navigation objects, not counted as knowledge nodes.
- **Primary emphasis:** the mathematical *essence*, not a memorized technique list. However, preserve useful **problem-solving skills** and precise theorem hypotheses.

### Authoring style — slide content, not prose notes

Make a presentation in the user's math-review style: **short English phrases, clear formulas, minimal transitions, and math more prominent than prose**. A default node page should have (i) a short essence/intuition line, (ii) the definition or theorem, (iii) 1–2 applications or warnings, with an illustration where useful. **Split dense material across two or more pages**. Never shrink everything to fit one screen or dump this spec as paragraphs onto slides. A content section may be reviewed in a few seconds even if the specification below is longer.

Within one reveal beat, **multiple lines may burn into view concurrently from scattered points**, as required by the template. A conceptual step (e.g. proving a derivative formula) may explicitly use successive beats. Each visualization is an enchanted manuscript diagram rendered *within the page*, never a modern chart UI.

## 2. Narrative and ordered teaching route (about 30 min)

| Target window | Scene / node order | Why it comes here |
|---|---|---|
| 0:00–0:30 | F0 | What are we studying? |
| 0:30–5:00 | G1: L1 → L2 → L3 → L4 → L5 → L6 → L7 | Behavior near a point; limits and useful methods |
| 5:00–7:30 | G2 first visit: P1 → P2 | Continuity at points → IVT on an interval: first local-to-global bridge |
| 7:30–15:00 | G3: D1 → **P3** → D2 → D3 → D4 → D5 → D6 → D7 → D8 | Derivative: new tool to measure change; P3 immediately after its definition |
| 15:00–19:00 | G2 return: P4 → P5 → P6 | Rolle/MVT: rates over an interval; second local-to-global bridge |
| 19:00–26:00 | G4: A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9 | Combine local/interval information to understand a graph and optimize |
| 26:00–29:00 | G5: X1 → X2 → X3 | Local linearity; approximation and error |
| 29:00–30:00 (flexible) | Completed map → optional second-act recap (Point → Approximation, repeated parchment drop) → parchment drop back to saved map → close | Reveal the full structure, conclude with a cinematic full-circle recap |

Timing is approximate; **wait for teacher input** rather than timed autoplay. In a 30-minute class, the vast majority of nodes must be concise. Spend more time on the few vivid demonstrations. If time is tight, reduce decorative dwell times and redundant formula tables **before** removing conceptual material or proof conditions.

**Opening behavior:** book cover → click to open → rapid page flip → `Function` burns onto the first page → after F0, trace and reveal G1–G5 branch entrances together (staggered but overlapping), then pause. Only the *partial* map is known; the full graph and cross-links must remain hidden until taught. Click an available branch to trace to its next node; click that node to enter the node's page(s); when finished, return to the partial route. Revisiting G2 must resume exactly where it stopped.

## 3. Shared pedagogical rules for EVERY node

Use these concepts in the writing and visual logic, not necessarily as five literal onscreen headings:

1. **Essence:** what does the concept *mean*?
2. **Intuition:** what is the mental or geometric picture?
3. **Mathematics:** precise hypotheses and result.
4. **Applications / technique:** what does this let us prove or compute?
5. **Connections:** why does another node depend on it / how is it reused?

Classify edges accurately: **prerequisite**, **logical implication (with hypotheses)**, **application**, or **conceptual connection**. An application edge does not assert a theorem.

## 4. F0 — Function (Opening; ~1–2 min)

**Essence:** A function assigns **exactly one output** to each input in its domain. A one-to-one function can reverse this assignment through an inverse function defined on its range.

Keep F0 as a short, visual review—not a full lecture on sets or inverse functions. Use **2–3 concise slides**; split rather than crowding a page.

### Slide 1 — What Is a Function?

**On-slide core:**

$$
f:A\to B,\qquad x\mapsto f(x).
$$

- **Domain:** $A$
- **Codomain:** $B$
- **Range:** $f(A)=\{f(x):x\in A\}\subseteq B$
- **Graph:** $\{(x,f(x)):x\in A\}$

**Animated demo:** Draw the input-to-output mapping as an enchanted ink diagram. Show that each input has exactly one arrow; distinguish the **range** from the larger **codomain** using a subtle highlight. Morph the mapping into a coordinate graph. All graphics, annotations, and interactive elements must match the illustrated ancient-grimoire aesthetic.

### Slide 2 — Can We Reverse a Function?

**On-slide core:**

$$
f(x_1)=f(x_2)\implies x_1=x_2
\qquad\text{(one-to-one)}.
$$

For a one-to-one function $f:A\to B$,

$$
f^{-1}:f(A)\to A,\qquad f^{-1}(f(x))=x.
$$

**Animated demo:** Reverse the mapping arrows; contrast a one-to-one map with a many-to-one map. Demonstrate the **Horizontal Line Test**, then reflect a graph across $y=x$ to reveal its inverse. For a quick domain-restriction example, compare $f(x)=x^2$ on $\mathbb R$ (not one-to-one) with $f(x)=x^2$ on $[0,\infty)$ (inverse $\sqrt{x}$).

**Precision note:** The natural domain of $f^{-1}$ is the **range** $f(A)$, not automatically the codomain $B$. An inverse $f^{-1}:B\to A$ exists when $f$ is bijective onto $B$. Also, $f^{-1}(x)$ is **not** $1/f(x)$.

### Slide 3 — How Can We Understand a Function?

**On-slide question:** *How can we understand a function?*

**Animated transition:** Return to the function's graph and let the paths ignite outward toward the five main goals **G1–G5**, in parallel. Reveal only the goal branches at this moment, **not** the complete knowledge graph. This is the opening transition into the review.

**Later connections:** Domain and range → limits/continuity/function analysis; one-to-one and inverse → inverse-function differentiation and inverse trigonometric functions; graph → derivatives, curve sketching, and approximation. Leave those detailed topics to their later nodes.

## 5. G1 — Evaluate Limits (L1–L7)

### L1. Limit Laws & Direct Substitution

**Essence:** limits describe behavior *near* a point, possibly different from the value *at* that point.

**Main math:** `\lim_{x\to a}f(x)=L`. Limit laws: sum/product/quotient (nonzero denominator limit), powers/exponentials/roots when hypotheses permit. **Direct substitution** follows when `f` is continuous at `a`: `\lim_{x\to a}f(x)=f(a)`.

**Technique:** polynomials: direct substitution; rational functions: denominator nonzero at the point; logarithms: positive argument; roots: domain / one-sided endpoint; compositions: outer function continuous at the inner limiting value. `0/0` is indeterminate, not a value. Illustrate removable hole versus continuous point.

### L2. One-Sided Limits

**Math:** `\lim_{x\to a}f(x)=L\iff\lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)=L` (where both sides of the domain are available). Both one-sided **finite** limits must exist **and agree** for the two-sided finite limit to exist. **Demo:** moving dots approach a join from opposite directions; matching and mismatching heights.

### L3. Algebraic Techniques

**Essence:** rewrite the expression to expose its limiting behavior.

**Tools:** factoring/canceling away from the target, rationalization, dividing by a dominant power as `x\to\pm\infty`.

**Nonnegotiable:** do NOT silently throw away lower-order terms. Explicitly show division, e.g.

```tex
\lim_{x\to\pm\infty}\frac{3x^2-2x+1}{2x^2+x-4}
=\lim_{x\to\pm\infty}\frac{3-2/x+1/x^2}{2+1/x-4/x^2}=\frac32.
```

For radicals, explicitly show `\sqrt{x^2}=|x|`, so the result may differ for `+\infty` and `-\infty`: `\frac{\sqrt{x^2+2x}}x=\frac{|x|}{x}\sqrt{1+2/x}` for large `|x|`. **Animation:** dividing by `x^2`, then small terms diminish; the `|x|/x` factor changes sign by direction.

### L4. Special Limits

Display a compact formula row:

```tex
\lim_{x\to0}\frac{\sin x}{x}=1,\qquad
\lim_{x\to0}\frac{e^x-1}{x}=1,\qquad
\lim_{x\to0}\frac{1-\cos x}{x^2}=\frac12.
```

**Technique:** normalize a complicated expression into these familiar forms. A tiny zooming plot of `sin(x)/x` is enough; no long derivation.

### L5. Squeeze Theorem

**Essence:** the same upper and lower limiting value forces the middle function's limit. State `g\le f\le h` near target and `\lim g=\lim h=L \Rightarrow \lim f=L`; also works for `x\to\pm\infty`.

**Demo:** three ink curves; upper and lower envelopes contract around an oscillating middle curve. **Applications:** bounded oscillation, floor/ceiling estimates, derivative bounds (later MVT cross-link).

### L6. L’Hôpital’s Rule

**Essence:** quotient limits can be determined by relative rates under suitable hypotheses.

**Main math:** for appropriate `0/0` or `\infty/\infty` conditions, with differentiability, `g'\ne0` nearby and a derivative quotient limit (finite or extended),

```tex
\lim_{x\to a}\frac{f(x)}{g(x)}=\lim_{x\to a}\frac{f'(x)}{g'(x)}.
```

**Exam strategy (short decision diagram):** direct substitute → inspect form → simplify first → rewrite `0\cdot\infty`, `\infty-\infty`, `0^0`, `1^\infty`, `\infty^0` suitably → check hypotheses → differentiate numerator and denominator separately → evaluate. **Warning:** if `\lim f'/g'` fails to exist, the original quotient limit may still exist. Do not use L’Hôpital mechanically on arbitrary fractions.

### L7. Precise Definition of Limits

**Essence:** “arbitrarily close” has a precise quantifier meaning.

```tex
\lim_{x\to a}f(x)=L\iff
\forall\varepsilon>0\ \exists\delta>0:
0<|x-a|<\delta\Rightarrow |f(x)-L|<\varepsilon.
```

**Technique:** start from target inequality to *discover* a suitable `\delta`, then verify the forward implication. **Demo:** adjustable horizontal epsilon strip and vertical delta strip, glowing onto parchment. The point `x=a` is excluded.

## 6. G2 — Properties of Functions (P1–P6, split teaching route)

### P1. Continuity (first G2 visit)

**Essence:** the nearby behavior and actual value agree.

**Three checks:** `f(a)` defined; finite `\lim_{x\to a}f(x)` exists; equality `\lim_{x\to a}f(x)=f(a)`. At a domain endpoint, use appropriate one-sided continuity. **Demo:** removable hole, jump, unbounded discontinuity. **Edge:** continuity → direct substitution and interval theorems.

### P2. Intermediate Value Theorem (first local→global bridge)

**Essence:** on a connected interval, a continuous curve cannot skip intermediate heights.

**Theorem:** if `f` continuous on `[a,b]` and `N` lies between `f(a)` and `f(b)`, then some `c\in[a,b]` has `f(c)=N`. If `f(a)f(b)<0`, then some `c\in(a,b)` has `f(c)=0`.

**Demo:** draw a continuous curve and animate a horizontal `y=N` line moving between endpoints, landing on an intersection; multiple intersections possible. **Important:** IVT proves **existence**, not uniqueness. Transition narration: *What can continuity at every point tell us about an entire interval?*

### P3. Differentiability and Continuity (insert after D1, not before derivative definition)

**Essence:** a finite well-defined tangent slope forces continuity, but a continuous corner need not have a tangent slope.

**Theorem:** differentiable at `a` ⇒ continuous at `a`; converse false (`|x|` at `0`). For piecewise joins, check **continuity and the one-sided difference quotients**, not just the adjacent derivative formulas.

**Requested short extension:** If the **finite** limit

```tex
\lim_{x\to a}\frac{f(x)}{x-a}=L
```

exists (with the quotient defined near but not at `a`), then

```tex
f(x)=\frac{f(x)}{x-a}(x-a)\quad(x\ne a)
\ \Longrightarrow\ \lim_{x\to a}f(x)=0.
```

This **does not automatically mean `f` is continuous at `a`** unless also `f(a)=0` (and the point is in its domain). Relate to the standard proof: `f(x)-f(a)=\frac{f(x)-f(a)}{x-a}(x-a)\to0` when `f'(a)` exists.

### P4. Rolle’s Theorem (second G2 visit)

**Essence:** equal endpoint heights force a horizontal tangent somewhere between them.

**Precise statement:** `f` continuous on `[a,b]`, differentiable on `(a,b)`, `f(a)=f(b)` ⇒ `\exists c\in(a,b):f'(c)=0`. **Technique:** two distinct roots would force a zero of `f'` between them; use contradiction for at most one root when `f'\ne0` throughout the interval. **Demo:** level secant becomes a horizontal tangent.

### P5. Mean Value Theorem (second local→global bridge)

**Essence:** the average rate across an interval equals an instantaneous rate at some interior point.

**Theorem:** continuous on `[a,b]`, differentiable on `(a,b)` ⇒ `\exists c\in(a,b):f'(c)=\frac{f(b)-f(a)}{b-a}`.

**Demo:** seamlessly transform the horizontal secant of Rolle into a sloping secant, and find a parallel tangent along the curve. **Applications:** monotonicity, uniqueness via Rolle/MVT, inequalities and derivative bounds such as `|f(x)-f(y)|\le M|x-y|` when `|f'|\le M` and appropriate interval hypotheses hold. Cross-link to Squeeze and error estimation. Rolle is the equal-endpoint special case.

### P6. Monotonicity

**Essence:** a consistently positive/negative derivative constrains all function values across the interval.

**Math:** `f'>0` on an interval ⇒ strictly increasing; `f'<0` ⇒ strictly decreasing; `f'\ge0` ⇒ nondecreasing, with the usual continuity/differentiability conditions. Strictly monotonic ⇒ every output is attained **at most once**. **Technique:** IVT for existence + strict monotonicity for uniqueness. **Demo:** one horizontal level intersects a monotone curve at most once.

## 7. G3 — Find Derivatives & Rates (D1–D8)

### D1. Definition of Derivative

**Essence:** a derivative is an instantaneous rate / tangent slope, obtained by shrinking a secant.

```tex
f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}h
=\lim_{x\to a}\frac{f(x)-f(a)}{x-a}.
```

Finite limit required. **Demo:** two points approach one another, secant rotates into tangent. Immediately after D1, briefly visit **P3**; then continue with D2.

### D2. Differentiation Rules

**Essence:** rules compute change without repeating limit proofs. A small formula-table page (split if needed):

```tex
(fg)'=f'g+fg',\qquad (f/g)'=(f'g-fg')/g^2,
(x^\alpha)'=\alpha x^{\alpha-1}\quad(x>0),
(e^x)'=e^x,\quad(\ln x)'=1/x,\quad
(\sin x)'=\cos x,\quad(\cos x)'=-\sin x,
(\tan x)'=\sec^2x,\quad (\cot x)'=-\csc^2x,
(\sec x)'=\sec x\tan x,\quad (\csc x)'=-\csc x\cot x.
```

Also sum, constant multiple, general base exponential/logarithm, and inverse trig derivatives in D7. Avoid a crowded all-in-one formulas page.

### D3. Chain Rule (major animated demo)

**Essence:** rates propagate through function composition. **Visual metaphor:** peel nested parentheses **outer → inner**; multiply the derivative factor from each removed layer.

**Main formula:** `(f\circ g)'(x)=f'(g(x))g'(x)`.

**Five-layer example, do not introduce `u` substitutions into the teaching animation:**

```tex
y=\sin\left(\ln\left(1+e^{(x^2+1)^3}\right)\right).
```

**Progressive expression (each factor accumulates on the left while the remaining differentiation shrinks on the right):**

```tex
y'=
\cos\!\left(\ln(1+e^{(x^2+1)^3})\right)
\cdot\frac{d}{dx}\left[\ln(1+e^{(x^2+1)^3})\right]
```

```tex
\frac{d}{dx}\left[\ln(1+e^{(x^2+1)^3})\right]
=\frac{1}{1+e^{(x^2+1)^3}}
\cdot\frac{d}{dx}\left[e^{(x^2+1)^3}\right]
```

```tex
\frac{d}{dx}\left[e^{(x^2+1)^3}\right]
=e^{(x^2+1)^3}\frac{d}{dx}\left[(x^2+1)^3\right]
```

```tex
\frac{d}{dx}\left[(x^2+1)^3\right]
=3(x^2+1)^2\frac{d}{dx}(x^2+1),\qquad
\frac{d}{dx}(x^2+1)=2x.
```

Preserve the *fully written original `x`-expressions* in each factor. Do not convert to `u_1,u_2,\dots` or replace with ellipses. On screen, accumulated factors remain still while the last pending derivative shortens. Keep intermediate states readable; if necessary split into consecutive pages with continuous visual positioning.

**Links:** Function composition F0; D4 log differentiation, D5 implicit differentiation, D8 related rates all use chain rule.

### D4. Logarithmic Differentiation

**Essence:** logarithms convert variable powers into products and products into sums.

For `y=u(x)^{v(x)}`, `u>0`: `\ln y=v\ln u`, then `y'/y=v'\ln u+v u'/u`. The `u,v` here are just the mathematical **formula statement**, not substitutes in the D3 five-layer demo. **Technique:** useful for variable exponents / complicated products. Brief conversion animation.

### D5. Implicit Differentiation

**Essence:** an equation relating two quantities constrains their instantaneous change even without explicitly solving for one of them.

For a differentiable local branch `F(x,y(x))=0`, `F_x+F_y y'=0`, hence `y'=-F_x/F_y` where partials exist continuously nearby and `F_y\ne0` (usual local implicit-function hypotheses). For direct calculations, each `y` term contributes `y'` via chain rule. **Demo:** a point and tangent on `x^2+y^2=1`; `2x+2yy'=0`, so `y'=-x/y` for `y\ne0`. Circle is not globally one graph `y=f(x)`. Second implicit derivative: differentiate entire equation again **before** substituting point values; track `y'^2` and `y''` terms.

### D6. Inverse Functions

**Essence:** invert a one-to-one correspondence, swapping input and output.

`f^{-1}(f(x))=x` on proper domain; reflect graph across `y=x`. If a differentiable local inverse exists and `f'(a)\ne0`, `(f^{-1})'(f(a))=1/f'(a)` under standard conditions. `f^{-1}(x)` does **not** generally mean `1/f(x)`. **Demo:** reflected points and reciprocal nonzero slopes.

### D7. Inverse Trigonometric Functions

**Essence:** restrict a non-injective trig function to a one-to-one principal branch and then invert it.

`\arcsin:[-1,1]\to[-\pi/2,\pi/2]`; `\arccos:[-1,1]\to[0,\pi]`; `\arctan:\mathbb R\to(-\pi/2,\pi/2)`.

```tex
(\arcsin x)'=\frac1{\sqrt{1-x^2}},\quad
(\arccos x)'=-\frac1{\sqrt{1-x^2}}\quad(|x|<1),\quad
(\arctan x)'=\frac1{1+x^2}.
```

`\arcsin(\sin\theta)=\theta` only in the principal interval. **Demo:** shade away the unchosen sine branches; reflect the remaining curve.

### D8. Related Rates

**Essence:** connected changing quantities have connected rates.

```tex
\frac{dy}{dt}=\frac{dy}{dx}\frac{dx}{dt},\qquad
F_x\frac{dx}{dt}+F_y\frac{dy}{dt}=0.
```

**Technique:** draw/name changing variables → establish geometric/algebraic relation → differentiate with respect to `t` → **only then** substitute the requested instant → solve, check units/sign. **Demo:** ladder sliding against a wall: `x^2+y^2=\ell^2` ⇒ `2x\dot x+2y\dot y=0`, visual slope and rates update; old parchment ink styling.

## 8. G4 — Analyze & Optimize Functions (A1–A9)

**Shared organizing idea:** `f` gives values, `f'` gives rates, `f''` describes how the slope changes. Limits supply boundary and far-away behavior. Build the whole shape from these constraints.

### A1. Domain & Boundary Behavior

**Essence:** first know where a function exists and how it behaves at the edges. Fast checks: domain, intercepts, even/odd symmetry, one-sided boundary limits, `x\to\pm\infty`. Link to asymptotes. A small annotated ink graph.

### A2. Critical Numbers

**Essence:** possible extremum locations are candidates, not answers.

`c\in\operatorname{dom}f` critical if `f'(c)=0` **or** `f'(c)` does not exist. Use `x^2`, `x^3`, `|x|` at zero to contrast min / non-extremum / nondifferentiable min. Domain requirement essential.

### A3. Extreme Value Theorem

**Essence:** a continuous curve on a closed bounded interval actually attains greatest and least values.

`f` continuous on `[a,b]` ⇒ absolute max and min achieved there. **Existence guarantee**, not a location algorithm; endpoints matter. Animate a continuous ink curve, then show an open endpoint/discontinuity to distinguish why hypotheses matter; note sufficient, not necessary.

### A4. Fermat’s Theorem

**Essence:** if an interior local extremum is differentiable, its tangent must be horizontal.

`f` has local extremum at interior `c`, differentiable at `c` ⇒ `f'(c)=0`. **Necessary, not sufficient**: `x^3` also has zero derivative at origin. Doesn't directly apply to endpoints or non-smooth corners.

### A5. First Derivative Test

**Essence:** derivative sign tells the direction of motion; sign reversal indicates turning points.

`f'>0`: increasing; `f'<0`: decreasing. At a critical number, `+→−` gives local max, `−→+` gives local min under the test's assumptions. A moving tangent on an ink curve drives a sign chart below.

### A6. Second Derivative & Concavity

**Essence:** `f''` describes how the *slope* changes, not just whether `f` rises or falls.

`f''>0` ⇒ concave upward; `f''<0` ⇒ concave downward on an interval under usual differentiability hypotheses. An inflection requires **change of concavity**; `f''(c)=0` alone does not prove one (`x^3` versus `x^4`). If `f'(c)=0` and `f''(c)>0`/`<0`, second derivative test gives a strict local min/max; zero is inconclusive. **Demo:** slopes of tangent lines increase/decrease as a point moves; connect concavity to linear-approximation error.

### A7. Asymptotes

**Essence:** simple lines capture a curve's boundary / far-away behavior.

- Vertical `x=a`: at least one one-sided limit at `a` is `+∞` or `−∞`.
- Horizontal `y=L`: `\lim_{x\to+\infty}f(x)=L` or independently for `-\infty`.
- Slant `y=mx+b`, `m\ne0`: `f(x)-(mx+b)\to0` in a fixed infinite direction. Compute `m=\lim f(x)/x`, then `b=\lim(f(x)-mx)` **in the same direction** when both are finite.

**Technique:** do `+∞` and `−∞` separately; a curve can cross an asymptote. **Demo:** curve approaches a vertical line and later an oblique ink guideline.

### A8. Curve Sketching

**Essence:** a few decisive constraints can largely determine the shape without knowing every value.

**Build-up demo:** empty page → domain/intercepts → asymptotes → critical numbers / sign of `f'` → concavity / inflection → local and absolute extrema → coherent final sketch. This is an especially high-priority ancient-book demo: each construction line burns into parchment, then stays readable.

### A9. Optimization

**Essence:** maximize/minimize a modeled quantity under constraints, then **justify the absolute result**.

**Method:** choose objective → express in one variable → feasible domain → critical numbers and nondifferentiable points → endpoints/boundary behavior → compare candidates or give global proof. On `[a,b]`, use the closed interval method under continuity. `f'(c)=0` alone proves nothing about a global optimum. **Demo:** fixed-perimeter rectangle changing aspect ratio; area reaches max for a square.

## 9. G5 — Approximate a Value (X1–X3)

**Bridge from G4:** seeing the shape of a curve still doesn't give an easy numeric value. Can we estimate a value using information nearby? G5 closes the conceptual loop by zooming back into one point.

### X1. Linear Approximation

**Essence:** differentiability means the function is locally linear to first order. The tangent is not just a picture: it approximates nearby values.

```tex
L(x)=f(a)+f'(a)(x-a),\qquad f(x)\approx L(x).
```

A precise local statement: `\lim_{x\to a}\frac{f(x)-L(x)}{x-a}=0` (when `x\ne a`). **Demo:** zoom deep into a differentiable curve until tangent and curve visually merge, zoom slightly back and compare heights. Quick example `\sqrt{4.1}\approx2.025` using `a=4`.

### X2. Differentials — important conceptual distinction

**Essence:** derivative is a *rate*, differential is the *change predicted by the tangent*, and actual change is a property of the real curve.

```tex
f'(x)=\lim_{\Delta x\to0}\frac{\Delta y}{\Delta x},\qquad
\Delta y=f(x+\Delta x)-f(x),\qquad
dy=f'(x)\,dx.
```

If `dx=\Delta x`, then `\Delta y\approx dy`. **`dy=f'(x)dx` is exact by definition; `\Delta y\approx dy` is approximate**. This must be said explicitly; do not present them as equivalent identities or treat `dy` simply as a decorative rearrangement of `dy/dx`.

**Demo:** same curve and tangent, show horizontal `dx=0.1`, predicted tangent height `dy`, actual curve height `Δy`. At `f(x)=x^2`, `x=2`: `f'(2)=4`, `dy=0.4`, `Δy=0.41`. Indicate absolute/relative error succinctly when appropriate.

### X3. Approximation Error

**Essence:** curvature controls how tangent and curve separate.

Set `E(x)=f(x)-L(x)`. If `f''>0` throughout the relevant neighborhood, tangent is below the curve (underestimate); if `f''<0`, tangent above (overestimate). `\sqrt{x}` for `x>0` has `f''<0`, so `\sqrt{4.1}<2.025`. Optional **short** MVT link: `E(x)=(f'(c)-f'(a))(x-a)` for some `c` between `a` and `x` (with proper hypotheses); use derivative bounds for error estimates when available. **Demo:** show the shrinking vertical gap as `x→a`, then compare concave-up and concave-down pictures.

## 10. Cross-branch connections and graph semantics

Represent connections as data, with stable IDs, labels, and relationship types. A link between topics does *not* itself imply a mathematical theorem. Highlight only connections earned by the teaching path; hide the complete topology before the final reveal.

**High-priority mathematical links:**

- `L1 → P1`: continuity justifies direct substitution (application).
- `L2 ↔ P1/P3`: one-sided limits at joins; difference quotients (prerequisite).
- `L5 ← P5`: MVT derivative bounds can be squeezed (application).
- `L6 ← D2/D3`: derivative computation supports L’Hôpital (application).
- `P1 → P2`: interval continuity → IVT (prerequisite/theorem use).
- `D1 → P3`: differentiability ⇒ continuity (implication).
- `P4 ↔ P5`: Rolle = special case of MVT; MVT may be proved using Rolle (mathematical connection).
- `P5 → P6 → A5`: MVT gives derivative-sign monotonicity (implication/application).
- `P2 + P6 → root existence & uniqueness`: two complementary arguments (strategy, not one theorem).
- `D3 → D4/D5/D8`: chain rule supplies derivative of composed or related quantities (technique).
- `D5 → X1`: implicit derivative gives slope for linearization (application).
- `A3/A4/A2 → A9`: EVT, candidate points, and critical numbers in optimization (applications).
- `A5 + A6 + A7 → A8`: monotonicity, concavity, asymptotes combine into sketch (applications).
- `D1 → X1 → X2 → X3`: tangent slope, approximation, differential, error (conceptual/application).
- `A6 → X3`: concavity determines tangent-line over/underestimate (under relevant hypotheses).

**Two highlighted bridges:** `P1 → P2` (continuity over interval → intermediate values), and `P4 → P5 → P6` (derivative information → interval behavior). Reuse a common visual style but do not claim IVT needs differentiability.

## 11. Ending configuration — Calculus I opts into an optional template feature

**This deck sets `ending.enabled = true`.** This is a **Calculus I content decision**, **not** a rule for the universal template. Future decks may set `ending.enabled = false` (skip the second-act recap completely), or author completely different titles, counts, orders, and scene effects. None of this sequence should be hardcoded in the presentation engine.

**The core rule for this deck:** In the second act, **every card from `Point` through `Approximation` uses the SAME foreground falling-parchment effect**, not ordinary page turns for the earlier recap cards and a unique effect reserved for the last one. **One additional parchment-drop transition** carries the audience back to the previously completed Knowledge Graph. The parchment-drop engine is written once and invoked with different content/configuration; the usual multi-origin ember-to-ink text reveal **begins while each sheet is falling**, not only after landing.

### Configured scene order

| Step | Scene | Effect chosen by *this deck* | On-screen wording |
|---|---|---|---|
| 1 | Fully completed Knowledge Graph | Existing `showGraph` / pull-back | Entire connected map; hold for teacher |
| 2 | Point | Optional `focusView` toward a mathematical point, then `parchmentDrop(content)` | Large `Point` / small `Limits · Continuity` |
| 3 | Interval | `parchmentDrop(content)` | Large `Interval` / small `IVT · Existence` |
| 4 | Change | `parchmentDrop(content)` | Large `Change` / small `Derivative · Chain Rule` |
| 5 | Across an Interval | `parchmentDrop(content)` | Large `Across an Interval` / small `Rolle · MVT · Monotonicity` |
| 6 | Graph | `parchmentDrop(content)` | Large `Graph` / small `Extrema · Concavity · Asymptotes · Optimization` |
| 7 | Approximation | `parchmentDrop(content)` | Large `Approximation` / small `Linearization · Differentials · Error` |
| 8 | Restore completed Knowledge Graph | **Same `parchmentDrop(transition)` effect** as scene bridge; reveal/return to existing saved map | No repeated inscription of map nodes; hold for teacher |
| 9 | Close book → original cover | Shared `closeBook()` operation | Same gold-embossed `CALCULUS I` cover as opening |

**Presentation and motion notes:** Each concept is a brief standalone recap leaf, with only one large title and a small related-topics line. Each sheet comes down front-facing from the upper foreground; **at roughly two-thirds of the fall**, scattered warm ember points **already start writing the title and caption concurrently**. At landing the inscription is **almost—but deliberately not quite—finished** (aim for roughly 80–90% revealed), and the remaining glow-fronts finish spreading over the settled sheet. This is **one overlapping paper-and-fire animation**, without a pause or hard cut at impact. On the next beat the new sheet replaces or neatly overlays the old one; no unreadable page pile. `Approximation` may have a slightly more ceremonial glow/pause **using configurable parameters of the same animation**, not a separate implementation. For the handoff to the completed graph, another sheet drops with the **same overlapping transition-light timing**, briefly veils the page, then peels/dissolves/turns away to expose the **already-built graph scene**. Do not rebuild graph geometry, revisit labels, or burn out all connections from scratch. Pause for instructor input between meaningful beats; allow skips.

Optional small chapter marker: `From Point to Approximation`. No new theorem proof or dense text in the recap.

### Example content-owned sequence (illustrative schema; adapt to implemented engine)

```js
ending: {
  enabled: true,
  // All parchment-drop steps share the generic engine preset.
  // Fire starts during descent (~2/3), and the last ink finishes AFTER landing.
  effects: {
    parchmentDrop: { revealStartDropProgress: 0.67, targetRevealAtLanding: 0.85 }
  },
  steps: [
    { scene: 'completed-map', action: 'showGraph', waitForInput: true },
    { scene: 'point', action: 'focusView', target: 'local-point' },
    { scene: 'recap', title: 'Point', caption: 'Limits · Continuity', effect: 'parchmentDrop', waitForInput: true },
    { scene: 'recap', title: 'Interval', caption: 'IVT · Existence', effect: 'parchmentDrop', waitForInput: true },
    { scene: 'recap', title: 'Change', caption: 'Derivative · Chain Rule', effect: 'parchmentDrop', waitForInput: true },
    { scene: 'recap', title: 'Across an Interval', caption: 'Rolle · MVT · Monotonicity', effect: 'parchmentDrop', waitForInput: true },
    { scene: 'recap', title: 'Graph', caption: 'Extrema · Concavity · Asymptotes · Optimization', effect: 'parchmentDrop', waitForInput: true },
    { scene: 'recap', title: 'Approximation', caption: 'Linearization · Differentials · Error', effect: 'parchmentDrop', waitForInput: true },
    { scene: 'completed-map', action: 'restoreScene', target: 'completed-map', effect: 'parchmentDrop', effectMode: 'transition', waitForInput: true },
    { scene: 'cover', action: 'closeBook' }
  ]
}
```

## 12. Visual demo requirements (deck-specific, template-styled)

These are the **mathematical actions**, not instructions to build separate CSS effects. All drawings use the parchment/ink/gold style and the shared magical inscription behavior.

| Node(s) | Demo to implement |
|---|---|
| F0 | Domain-to-range mapping → graph |
| L1/L2 | Continuity hole and two-sided approaching points |
| L3 | Divide by leading `x`-power; `|x|` sign at ±infinity |
| L5 | Squeeze envelopes around middle curve |
| L7 | Epsilon/delta bands and adjustable tolerance |
| P2 | Horizontal level moving across continuous curve |
| D1/P3 | Secant → tangent; smooth vs corner |
| P4/P5 | Horizontal Rolle tangent → tilted MVT secant with parallel tangent |
| D3 | Five nested derivatives peel; factors accumulate on left, remaining `d/dx` shrinks on right |
| D5 | Implicit circle with moving tangent |
| D6/D7 | Reflect inverse graph; restrict trig branch |
| D8 | Ladder geometry evolving in time |
| A2/A4 | `x²`, `x³`, `|x|` critical-number contrast |
| A5/A6 | Moving tangent, sign chart, curvature / inflection comparison |
| A7/A8 | Asymptotes then staged construction of full curve |
| A9 | Rectangle with fixed perimeter / changing area |
| X1/X2/X3 | Same smooth curve and tangent: zoom, actual change vs differential, signed error gap |

**Demo priorities:** keep IVT, MVT/Rolle, Chain Rule, Concavity/Curve Sketching, and Linear Approximation/Differentials especially strong. Other demos may be brief/low interaction so 30-minute delivery remains feasible. Avoid wasting time on intricate animations for raw derivative tables.

## 13. Content QA checklist for Codex

- [ ] Every one of F0 and the 33 knowledge nodes is reachable by the planned path, including P3 after D1 and the two G2 visits.
- [ ] Mathematical meaning precedes procedure across **all** G1–G5; exam strategies remain accessible.
- [ ] L1 and L2: direct-substitution conditions and agreeing one-sided limits are explicit.
- [ ] L3: a **written division step** for dominant terms, not hand-waving; `√(x²)=|x|` and ±∞ distinction.
- [ ] L6: L’Hôpital hypotheses checked and derivative-quotient-failure caveat included.
- [ ] P2: IVT gives existence, not uniqueness.
- [ ] P3: requested finite quotient-limit corollary `f(x)/(x-a)` ⇒ `f(x)→0`, without claiming continuity at `a` if `f(a)` is unknown.
- [ ] D3: full `x` expressions and five factor reveal; no `u` substitutions in animation.
- [ ] D5: local-branch and nonzero-denominator assumptions; differentiate before plugging numbers.
- [ ] A2/A4/A6: necessary versus sufficient distinctions; inflection requires a concavity change.
- [ ] G5: `dy=f'(x)dx` is exact, `Δy≈dy` is approximate, derivative is a rate and differential a predicted change.
- [ ] Interactive geometry remains mathematically correct at every frame and visually integrated in the ancient book.
- [ ] Sparse, readable, formula-forward slides; split long content; allow instant skip of decorative effects.
- [ ] Finale (this deck enables it): completed graph → Point → Interval → Change → Across an Interval → Graph → Approximation (**same parchment-drop animation on every recap card**) → **parchment-drop transition** to the **same saved complete graph**, not a reconstructed graph → close to original cover.
- [ ] The second-act recap is a **deck-level option**; other subjects can omit it entirely or choose different content/effects without changing the template engine.

