# AGENT_CONTENT_CALC1.md — CALCULUS I Midterm Review Deck

> **Deck content / pedagogy, not engine design.** Implement this presentation with the **subject-independent** grimoire engine specified in `AGENT_TEMPLATE.md`. This file owns the mathematical content, graph, slide sequence, timing, demo intent, and ending words. It must not implement the common animations or book infrastructure.

## 1. Deck metadata and learning goal

> **Content/pedagogy specification, NOT engine design.** Build this deck using the **subject-independent** grimoire engine defined in `AGENT_TEMPLATE.md`. Mathematical text, graph data, teaching order, content-specific demos, and closing captions belong here; shared book infrastructure and generic motion primitives do not.

- **Cover:** `CALCULUS I` (generic gold-embossed book-cover component).
- **Language:** concise mathematical English on slides; instructor may explain in Chinese.
- **Format:** interactive knowledge graph + illustrated grimoire pages, controlled by instructor clicks.
- **Audience:** NTU Calculus I students who have *already learned* these topics; this is a **midterm review**, not a first lecture.
- **Duration:** approximately **30 minutes, flexible**. Afterwards, the instructor works through **1–2 past-exam problems separately** with a tablet/LaTeX sheet. Do **not** reproduce or solve those past-exam problems in this deck, and do **not** create a separate book "Problem Mode".
- **Subject story:** *From Local Behavior to Global Understanding — and Back to Local Approximation*; final recap wording: *From Local to Global, and Back Again*.
- **Root:** `F0 — Function`.
- **Goal branches:** `G1 — Evaluate Limits`; `G2 — Properties of Functions`; `G3 — Find Derivatives & Rates`; `G4 — Analyze & Optimize Functions`; `G5 — Approximate a Value`.
- **Stable inventory:** 1 root + **33 knowledge nodes** (L1–L7, P1–P6, D1–D8, A1–A9, X1–X3). Branch headings/transition scenes are **not** additional knowledge nodes.

### Authoring priorities — review slides, not textbook pages

Each node should foreground (1) **meaning**; (2) a mathematically correct **definition/theorem with indispensable hypotheses**; (3) at most one **exam technique/pitfall**; and (4) its **connection** to the next idea. Those are content priorities, **not** headings that should appear on every slide. Use formulas, small diagrams, and short natural English instead of paragraphs. The specification can be detailed; the **projected slide must remain sparse**. Split material only when needed for legibility or a purposeful reveal.

**Few examples, chosen for conceptual discrimination.** Most nodes need **no worked example**. Short micro-examples are appropriate for a subtle distinction (notably L6, P3, A6), but **avoid duplicating E1–E13 from the separate midterm-review worksheet**. Emphasize *when* and *why* a method applies, not a second round of computation. Do not invent extra exam-style exercises for every node.

Retain core visual teaching moments: IVT, Rolle/MVT, nested Chain Rule, tangent/curvature/curve reconstruction, and linearization. Reduce repetitive formula/graph animations first. Within one reveal beat, related formula lines may inscribe concurrently; successive mathematical arguments may require distinct beats. All diagrams are enchanted **mathematical ink on parchment**, not modern chart UI.

## 2. Narrative and ordered teaching route (roughly 30 min)

| Target window (flexible) | Route | Mathematical purpose |
|---|---|---|
| 0:00–2:00 | F0 (two compact content pages → goal-branch transition) | What is a function? What makes inversion possible? |
| 2:00–7:00 | G1: L1 → L2 → L3 → L4 → L5 → L6 → L7 | What happens **near a point**? How can a limit be established? |
| 7:00–9:00 | G2 first visit: P1 → P2 | From pointwise continuity to intermediate values **on an interval** |
| 9:00–16:00 | G3: D1 → **P3** → D2 → D3 → D4 → D5 → D6 → D7 → D8 | Instantaneous change, computational tools, linked rates |
| 16:00–19:00 | G2 return: P4 → P5 → P6 | What can local slopes say about **an entire interval**? |
| 19:00–26:00 | G4: A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9 | Derivative and limit information constrain graph shape and optima |
| 26:00–29:00 | G5: X1 → X2 → X3 | Zoom back near a point to approximate values and quantify error |
| 29:00–30:00+ | Completed map → optional same-effect parchment recap → restored map → cover | Make the mathematical connections visible once more |

The windows are **planning guides, not automatic timers**. Wait for teacher clicks. L6 is allowed extra time for a rapid "Can we apply it?" diagnostic; other formula nodes may occupy only a few seconds. The presentation may run longer than 30 minutes if needed for clear hypotheses; **never shrink or delete essential math to hit a clock target**. If delayed, abbreviate ornamental holds and repeated examples/graph demonstrations. The whole lesson includes the **separate practice after the deck**.

**Opening behavior:** cover → click to open → fast page flip → `Function` inscribes → F0's two pages → ask "How can we understand a function?" while the first five **goal entrances** ignite together (overlapping stagger). Only the partial known map appears initially. Click an available branch to trace to its next knowledge node; click the node to enter its page(s); return to the partial map at the end. G2's second visit **resumes** at P4, without replaying P1/P2. Cross-edges and untaught nodes appear **only after their concepts have been visited**, and the whole graph is revealed at the end.

## 3. Shared pedagogical and mathematical rules

1. **Meaning before recipe:** what does the idea describe geometrically/algebraically?
2. **Exact mathematics:** keep the hypotheses that affect validity; place technical domain notes in small text or instructor-only metadata when too long for the stage.
3. **Exam usefulness:** prefer one common mistake or strategic decision over a long solved exercise.
4. **Connection:** show whether an edge means a **prerequisite**, **theorem/implication (with its conditions)**, **application**, or merely a **conceptual relation**. Do not label every dotted association as a logical theorem.
5. **Precision of moving graphs:** every frame must respect domains, one-sided behavior, tangent existence, asymptote/branch restrictions, and actual equation geometry. A "visual explanation" must not encode a false statement.
6. **Reveal economy:** keep core demonstrations interactive, formula tables largely static, and decorations skippable. Avoid re-teaching F0's inversion facts in D6 and A2's extremum contrasts in A4.
7. **Transition sentences (short, spoken or subtly captioned):** Limits: "near a point" → IVT: "across an interval" → MVT: "local rates constrain interval behavior" → curve analysis: "assemble the graph" → approximation: "return to one point". No extra paragraph slides.

## 4. F0 — Function (opening; roughly 1–2 min)

**Essence:** one input has exactly one output. A function can be reversed **as a function** on its range exactly when it is one-to-one. Keep **two content slides**, followed by a goal-map **transition** (not a third instructional slide).

### Slide 1 — What Is a Function?

**Projected math (compact):**

```tex
f:A\to B,\qquad x\mapsto f(x),\qquad f(A)\subseteq B.
```

Small labels on the drawing: `A = domain`, `B = codomain`, `f(A) = range`. One arrow **out of** every domain element; many inputs may share an output. The graph is `\{(x,f(x)):x\in A\}` (small callout or spoken, not another full slide).

**Demo:** a small domain/codomain ink mapping highlights the subset reached, then becomes a coordinate graph. No long set-theory explanation.

### Slide 2 — When Can We Reverse It?

**Projected math:**

```tex
f(x_1)=f(x_2)\Longrightarrow x_1=x_2\qquad\text{(one-to-one)},
```

```tex
x_1<x_2\Longrightarrow f(x_1)<f(x_2)\quad\text{(strictly increasing)},
```

```tex
x_1<x_2\Longrightarrow f(x_1)>f(x_2)\quad\text{(strictly decreasing)}.
```

**Conclude:** `Strictly increasing OR strictly decreasing` **on the whole domain (ordered subset of R)** `⇒ one-to-one ⇒ inverse on the range`. The converse "one-to-one ⇒ strictly monotone" is **false in general** (do not spend a new example). If `f:A→B` is one-to-one:

```tex
f^{-1}:f(A)\to A,\qquad f^{-1}(f(x))=x\quad(x\in A).
```

**Demo:** one horizontal level strikes two points on `y=x^2` with domain `R`; restrict domain to `[0,∞)` and show it now meets at most once. Briefly reverse the input/output arrows. Reserve the **full reflection-and-slope** demonstration for D6 and principal-branch restriction for D7. Small note: `f^{-1}` is **not** `1/f`; for `f^{-1}:B→A`, surjectivity onto `B` is also needed.

### Transition — How Can We Understand a Function?

Ask (spoken or single floating caption): **"How can we understand a function?"** Zoom from the graph into the Knowledge Graph; reveal **only** entrances G1–G5 together. No new instructional slide; detailed nodes and cross-links remain hidden. Save inverse-function differentiation for D6, inverse trig for D7, and derivative-based monotonicity for P6.

## 5. G1 — Evaluate Limits (L1–L7)

### L1. Limit Laws & Direct Substitution

**Essence:** a limit describes behavior **near** `a`; `f(a)` may be different or undefined.

**Projected math:** `\lim_{x\to a} f(x)=L`. Sum/product laws; quotient only when denominator limit is **nonzero**; powers, roots, logarithms, composition on their permitted domains. In particular,

```tex
f\text{ continuous at }a\quad\Longrightarrow\quad\lim_{x\to a}f(x)=f(a).
```

**Technique:** direct substitution for continuous expressions at the target; check domain first (logs positive, even roots nonnegative, endpoints use a one-sided approach). `0/0` is **indeterminate**, not a numerical result. **Demo:** function with a removable hole, and a filled point at a different height: same limiting value, different `f(a)`.

### L2. One-Sided Limits

**Essence:** approach the target from its available sides.

```tex
\lim_{x\to a}f(x)=L
\ \Longleftrightarrow\
\lim_{x\to a^-}f(x)=\lim_{x\to a^+}f(x)=L
```

for a **finite two-sided limit** when both sides of the domain accumulate at `a`. For a domain endpoint, discuss the appropriate one-sided limit instead. Both one-sided finite limits must **exist and agree**. For infinite limits, record the direction and sign separately; `+∞` is not a finite limit.

**Demo:** two dots approach from left and right; alternate equal/different heights, then briefly contrast signed infinite behavior near a vertical asymptote. No extra worked problem.

### L3. Algebraic Techniques

**Essence:** algebra can expose a limit hidden by the original expression.

**Three tools:** factor and cancel when `x≠a` (without assigning a value at the hole); rationalize; divide by the **highest relevant power** for `x→±∞`. Keep one **visible** division step—not the unsupported claim that lower-order terms "disappear":

```tex
\lim_{x\to\pm\infty}\frac{3x^2-2x+1}{2x^2+x-4}
=\lim_{x\to\pm\infty}\frac{3-2/x+1/x^2}{2+1/x-4/x^2}=\frac32.
```

**Nonnegotiable sign:** `\sqrt{x^2}=|x|`, not `x`. A compact warning illustration:

```tex
\frac{\sqrt{x^2+2x}}x
=\frac{|x|}{x}\sqrt{1+\frac2x}
\quad\text{for sufficiently large }|x|.
```

Therefore limits as `x→+∞` and `x→−∞` can differ. **Demo:** divide visible numerator and denominator terms by `x²` and contract the small terms; flip the sign factor `|x|/x` with direction. Do not introduce another large rational-limit exercise.

### L4. Special Limits

**Essence:** normalize an unfamiliar limit into a standard local pattern. Angles are in **radians**.

**Compact reference row (split into two small groups only if needed):**

```tex
\lim_{x\to0}\frac{\sin x}{x}=1,\qquad
\lim_{x\to0}\frac{1-\cos x}{x^2}=\frac12,
```

```tex
\lim_{x\to0}\frac{e^x-1}{x}=1,\qquad
\lim_{x\to0}\frac{\ln(1+x)}{x}=1.
```

Optionally note `(\cos x-1)/x→0` on the same formula panel, not a fifth reveal. **Technique:** substitute a **whole inner expression** into a recognizable special-limit quotient, respecting its approach and domain. One tiny plot of `sin(x)/x` zooming toward 1; no derivation or worksheet-sized example.

### L5. Squeeze Theorem

**Essence:** common upper and lower limiting values force the middle function toward that value.

```tex
g(x)\le f(x)\le h(x),\qquad
\lim_{x\to a}g(x)=\lim_{x\to a}h(x)=L
\Longrightarrow\lim_{x\to a}f(x)=L
```

on a suitable **punctured neighborhood** (or a corresponding one-sided/infinite domain).

**One conceptual animation:** for `x≠0`, show `-|x| ≤ x sin(1/x) ≤ |x|`; two V-shaped bounds contract toward 0 while the middle graph **continues oscillating**. **Technique:** bound a difficult term by simpler terms; for floor functions use `u-1 < floor(u) ≤ u` and mind sign when multiplying. Full exam-style floor/squeeze practice is on the separate worksheet E3.

### L6. L’Hôpital’s Rule — Conditions Before Calculation

**Essence:** a quotient's limiting behavior can be controlled by the quotient of its **derivatives**, but only when all assumptions are met. **Reserve the short interactive diagnosis for this node**; do not solve a long limit.

#### Page A — The rule (mathematics must be exact)

Let `a` be a finite accumulation point approached from an appropriate side or both sides. Suppose, on a **deleted interval near `a`**, `f,g` are differentiable, `g'(x)≠0`, and the quotient `f/g` is defined. Assume **either** `f(x)→0` and `g(x)→0`, **or** `|f(x)|→∞` and `|g(x)|→∞` with the appropriate signed infinite limits; i.e. a `0/0` or `∞/∞` form. If the derivative quotient has a finite or extended limit `L`, then

```tex
\lim_{x\to a}\frac{f'(x)}{g'(x)}=L
\quad\Longrightarrow\quad
\lim_{x\to a}\frac{f(x)}{g(x)}=L.
```

**Projected short version:** `0/0 or ∞/∞` → `f,g differentiable near (not necessarily at) a` → `g'≠0` → `limit of f'/g'` → result. In presenter notes preserve full hypotheses above. The result also holds for `x→a⁺`, `x→a⁻`, `x→+∞`, and `x→−∞` with their respective neighborhood/tail hypotheses.

#### Page B — Can we apply it? (three **brief** verdict reveals)

**Micro-check 1 — Valid even without differentiability at the target.**

```tex
\lim_{x\to0}\frac{|x|}{|x|}
```

Reveal: `0/0`; both functions are differentiable for `x≠0`; denominator derivative is `±1` there; derivative quotient = 1. **Applicable.** Do not require differentiation **at** `0`.

**Micro-check 2 — Insufficient information from differentiability at a alone.**

```tex
f(0)=0,\quad f'(0)=2.\qquad
\lim_{x\to0}\frac{f(x)}x\ ?
```

Reveal: **Cannot justify L’Hôpital from these facts alone**—`f` need not be differentiable throughout a punctured interval. Yet the original limit **equals 2 by the derivative definition**. State "conditions not established", not "L’Hôpital is always invalid for this f". (A mathematical witness if asked: `f(x)=2x+x²|sin(1/x)|` for `x≠0`, `f(0)=0`.)

**Micro-check 3 — Inconclusive is not DNE.**

Instructor-only compact witness **from the course lecture (L’Hôpital Example 1.2)**:

```tex
f(x)=\begin{cases}x^2\sin(1/x),&x\ne0,\\0,&x=0,\end{cases}
\qquad g(x)=\sin x.
```

Here `lim_(x→0) f(x)/g(x)=0` by a bound, while `lim_(x→0) f'(x)/g'(x)` **does not exist** (oscillation). Display **only** `Derivative-quotient limit fails → L’Hôpital is inconclusive`; keep the actual function visible only on a quick optional reveal, not a full solved exercise. The original limit can still exist.

#### Final quick strategy line

`Identify form → simplify/rewrite → check hypotheses → differentiate numerator and denominator separately → evaluate.` Rewrite `0·∞`, `∞−∞` as quotients; use logarithms for `0⁰`, `1^∞`, `∞⁰` when the positive-base assumptions hold. **A non-indeterminate form cannot be sent through L’Hôpital.** Also do not repeatedly apply the rule if its hypotheses fail at a later step; algebra or squeeze may be better.

**Interaction:** one crisp ink checklist, three tap-to-reveal verdicts (valid / not justified / inconclusive), **not** multiple lengthy computations or a quiz mode. Cross-link D2/D3 for differentiation and P5 for Cauchy's MVT as a deeper theoretical foundation (not a claim that the ordinary MVT alone proves the rule).

### L7. Precise Definition of Limits

**Essence:** "arbitrarily close" is a logical guarantee, not simply a numerical pattern.

For `a` an **accumulation point of the domain** and finite `L`:

```tex
\lim_{x\to a}f(x)=L\quad\Longleftrightarrow\quad
\forall\varepsilon>0\ \exists\delta>0:\ 
\forall x\in\operatorname{Dom}f,\quad
0<|x-a|<\delta\Rightarrow |f(x)-L|<\varepsilon.
```

**Technique:** work backward from `|f(x)-L|<ε` to discover a `δ`, then **write the forward implication**; impose `|x-a|<1` when a local bound is needed. For right/left-hand limits, replace the distance restriction by `0<x-a<δ` / `0<a-x<δ`; for `f→+∞`, replace the ε-target by `f(x)>M` for each `M>0`. One interactive ε-band/δ-band demo; **do not** put a full ε–δ exam proof on slides. The point `x=a` is excluded.

## 6. G2 — Properties of Functions (P1–P6, split teaching route)

### P1. Continuity (first G2 visit)

**Essence:** the value of the function agrees with its nearby behavior.

```tex
f\text{ continuous at }a\quad\Longleftrightarrow\quad
f(a)\text{ exists and }\lim_{x\to a}f(x)=f(a).
```

For interior two-sided points, equivalently check: defined value, **finite** two-sided limit, equality. At a domain endpoint, use continuity relative to the domain (one-sided limit). **Demo:** contrast smooth filled point, removable hole, jump and unbounded behavior by changing one graph layer rather than running four long animations. **Connection:** continuity justifies direct substitution (L1) and, **on all of `[a,b]`**, enables IVT (P2).

### P2. Intermediate Value Theorem (first local → global bridge)

**Essence:** a continuous curve on an interval **cannot skip an intermediate height**.

```tex
f\text{ continuous on }[a,b],\quad
N\text{ between }f(a),f(b)
\Longrightarrow\exists c\in[a,b]: f(c)=N.
```

In particular, `f(a)f(b)<0` guarantees a zero **inside** `(a,b)`. **Existence, not uniqueness.** To prove *exactly one* zero: IVT for existence + strict monotonicity (P6) or Rolle/MVT reasoning for at most one.

**Major demo:** continuous curve; a moving horizontal `y=N` band necessarily intersects as N sweeps between endpoint values, possibly at **multiple** points. Do **not** animate a unique intersection when none is guaranteed. Brief bridge: "What does continuity at every point tell us about an interval?"

### P3. Differentiability and Continuity (visit immediately after D1)

**Essence:** a finite derivative forces continuity, but continuity does **not** force a derivative.

```tex
f'(a)\text{ exists (finite)}\quad\Longrightarrow\quad
\lim_{x\to a}f(x)=f(a).
```

**Not conversely:** `f(x)=|x|` is continuous at `0` but has incompatible one-sided difference quotients. **Piecewise joins:** first check continuity, then compute **one-sided difference quotients from the definition**; merely matching the derivative formulas for `x<a` and `x>a` does not establish differentiability.

**Preserved short extension (one reveal only):** If `f(x)/(x-a)` is defined on a deleted neighborhood and has **finite** limit `L`, then

```tex
f(x)=(x-a)\frac{f(x)}{x-a}\ \longrightarrow\ 0.
```

Thus `lim_(x→a) f(x)=0`, **but not necessarily continuity at a** unless `f(a)=0` is known. The general derivative proof uses `f(x)-f(a)=(x-a)[(f(x)-f(a))/(x-a)]→0`.

**Demo:** show secant slope approaching a finite value on a smooth curve vs disagreeing left/right slopes at a corner; use one shared D1/P3 scene. Keep the proof line compact, no extra solved exam question.

### P4. Rolle’s Theorem (second G2 visit)

**Essence:** equal endpoint heights guarantee at least one horizontal tangent between them—provided the curve has no breaks/corners inside.

```tex
f\text{ continuous on }[a,b],\quad
f\text{ differentiable on }(a,b),\quad f(a)=f(b)
\Longrightarrow\exists c\in(a,b): f'(c)=0.
```

**Technique:** if two distinct roots existed, Rolle forces a point with `f'=0` between them; under `f'≠0` on the interval, this is a contradiction. **Demo:** horizontal secant and one interior parallel tangent; transform the **same graph/geometry** into P5's tilted secant instead of starting a fresh animation.

### P5. Mean Value Theorem (second local → global bridge)

**Essence:** somewhere the **instantaneous rate** equals the **average rate** over the interval.

```tex
f\text{ continuous on }[a,b],\quad
f\text{ differentiable on }(a,b)
\Longrightarrow\exists c\in(a,b):\quad
f'(c)=\frac{f(b)-f(a)}{b-a}.
```

**Major demo:** P4's horizontal secant tilts to a general secant while an interior tangent becomes parallel. An equal-endpoint case recovers Rolle, with the **same hypotheses**. **Applications:** sign of `f'` ⇒ monotonicity (P6); if `|f'|≤M` on an interval and hypotheses hold on every segment, `|f(x)-f(y)|≤M|x-y|`. May briefly point to Cauchy's MVT as background for L6 **without adding its proof**.

### P6. Monotonicity (derivative-based, not a repeat of F0)

**Essence:** MVT turns information about local slopes into statements about **all pairs of values** in an interval.

For a continuous `f` on an interval and differentiable in its interior:

```tex
f'>0\Rightarrow\text{strictly increasing},\qquad
f'<0\Rightarrow\text{strictly decreasing},
```

```tex
f'\ge0\Rightarrow\text{nondecreasing},\qquad
f'=0\Rightarrow\text{constant}
```

with inequalities on the relevant interior interval. **One-line explanation:** `f(b)-f(a)=f'(c)(b-a)` for `a<b`. Strict monotonicity ⇒ **one-to-one** (F0); IVT + strict monotonicity ⇒ **exactly one root** when a sign change is known. **Caution:** the converses `strictly increasing ⇒ f'>0 everywhere` and `f'≥0 ⇒ strictly increasing` are not generally valid (`x³` has zero derivative at `0`). **Demo:** one horizontal level intersects the strictly monotone graph at most once; no repeated definition page.

## 7. G3 — Find Derivatives & Rates (D1–D8)

### D1. Definition of Derivative

**Essence:** a derivative is the **limit of average slopes** over shrinking intervals: instantaneous rate / finite tangent slope.

```tex
f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}h
=\lim_{x\to a}\frac{f(x)-f(a)}{x-a}.
```

The two-sided limit must exist **and be finite** at an interior point. **Demo:** Q approaches P on a curve; secant slope approaches the tangent slope while `Δx→0`. Visit **P3 immediately after D1**, using the same graph: differentiability ⇒ continuity, but a corner is only continuous.

### D2. Differentiation Rules

**Essence:** reusable rules calculate change without repeating limit proofs. Show two **compact static groups**, not line-by-line animated derivations.

**Algebra / exponential / logarithmic:**

```tex
(cf\pm g)'=cf'\pm g',\qquad
(fg)'=f'g+fg',\qquad
\left(\frac fg\right)'=\frac{f'g-fg'}{g^2}\ (g\ne0),
```

```tex
(x^\alpha)'=\alpha x^{\alpha-1}\ (x>0),\quad
(e^x)'=e^x,\quad (\ln x)'=\frac1x\ (x>0),
```

and for `a>0, a≠1`, `(a^x)'=a^x ln a`, `(log_a x)'=1/(x ln a)` for `x>0`.

**Trig:**

```tex
(\sin x)'=\cos x,\ (\cos x)'=-\sin x,\quad
(\tan x)'=\sec^2x,\ (\cot x)'=-\csc^2x,
```

```tex
(\sec x)'=\sec x\tan x,\qquad
(\csc x)'=-\csc x\cot x.
```

All rules are applied where each expression is defined and differentiable. Inverse trig derivatives appear only at D7. Use the formula sheet as **fast recognition**, reserving dynamic differentiation for D3.

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

**Essence:** the logarithm transforms **products into sums** and variable exponents into products.

For `y=u(x)^{v(x)}`, with `u(x)>0`:

```tex
\ln y=v\ln u,\qquad
\frac{y'}y=v'\ln u+v\frac{u'}u.
```

**One-line micro-example:** `y=x^x` for `x>0`: `y'=x^x(\ln x+1)`. This is **not** a long exercise; it shows why an ordinary power rule cannot handle variable exponents. **Demo:** single transformation `power → logarithm → product → differentiate`, one short reveal. `ln|y|` can be used locally for nonzero differentiable products; the general real-valued `u^v` formula as stated needs `u>0`. D3's five-layer example does **not** introduce `u_i` substitutions.

### D5. Implicit Differentiation

**Essence:** an equation linking quantities also links their rates, even without an explicit global `y=f(x)` formula.

For a smooth `F(x,y)=0` with a local differentiable branch `y=y(x)`, and `F_y≠0` under usual implicit-function conditions:

```tex
F_x+F_y y'=0\quad\Longrightarrow\quad y'=-\frac{F_x}{F_y}.
```

**Technique:** differentiate **every** `y` term by Chain Rule (`(y³)'=3y²y'`, `(xy)'=y+xy'`), collect `y'`, then substitute the point. To compute `y''`, differentiate the **entire first derivative relation again** before inserting point values; retain `(y')²` and `y''` terms.

**Demo:** move a tangent on `x²+y²=1`; show `2x+2yy'=0`, `y'=-x/y` only where `y≠0`. The circle is **not** a single global graph `y(x)`; near `y=0` do **not** pretend a finite `dy/dx` tangent slope exists. No exam-sized implicit derivative solution (E7/E8 later).

### D6. Derivative of an Inverse Function

**Essence:** reversing a locally one-to-one relation swaps the roles of its input and output; tangent slopes become reciprocals **where nonzero**.

Let `b=f(a)`. If `f` has a **continuous local inverse** near `b`, is differentiable at `a`, and `f'(a)≠0`, then

```tex
(f^{-1})'(b)=\frac1{f'(a)}.
```

For an easy-to-state **sufficient** condition, `f` may be continuously differentiable near `a` with `f'(a)≠0` (inverse function theorem, in one variable). Keep the actual inverse's **domain = range of f**, already introduced in F0. **Demo:** reflect just a **marked point/tangent pair** through `y=x` and show reciprocal slopes. No second lecture on horizontal-line test, range/codomain, or `f^{-1}≠1/f`; those are F0 reminders only.

### D7. Inverse Trigonometric Functions

**Essence:** periodic trig functions become invertible after selecting a **principal one-to-one branch**.

**Projected compact table (matches the supplementary midterm-review formula sheet):**

| Inverse | Domain | Principal range | Derivative on interior |
|---|---|---|---|
| `arcsin x` | `[-1,1]` | `[-π/2,π/2]` | `1/√(1-x²)` (`|x|<1`) |
| `arccos x` | `[-1,1]` | `[0,π]` | `-1/√(1-x²)` (`|x|<1`) |
| `arctan x` | `R` | `(-π/2,π/2)` | `1/(1+x²)` |

**Precision:** `arcsin(sin θ)=θ` only for `θ∈[-π/2,π/2]` (other angles first reduce to the principal branch). A principal **range** belongs to the inverse function; don't confuse it with the original trig function's restricted domain.

**Demo:** show only sine's principal interval being retained and reflected; cosine and tangent are **static mini-references**, not three more reflection animations. The original full course notes/TA worksheet cover `arcsec`, `arccsc`, `arccot` as well, but the provided 14-page midterm-review formula sheet prioritizes these three. **Teacher-only optional**: make the other three available as a small supplementary formula reveal if the actual exam scope demands it; do not consume core slide time or silently impose incompatible branch conventions.

### D8. Related Rates

**Essence:** quantities that are related by an equation change at **related instantaneous rates**.

```tex
\frac{dy}{dt}=\frac{dy}{dx}\frac{dx}{dt},\qquad
F_x\frac{dx}{dt}+F_y\frac{dy}{dt}=0.
```

**Technique (compact visual steps):** name changing quantities with units → draw/write the relation → differentiate **with respect to `t`** → substitute values for the requested instant **after** differentiating → interpret sign and units.

**Demo:** ladder `x(t)^2+y(t)^2=ℓ²`; `2x\dot x+2y\dot y=0`, with geometry and arrows updating together. Keep `x,y>0` during this finite-rate illustration; do not animate through singular/invalid positions. The cone and robot multi-part applications belong to worksheet E12/E13, **not** new deck problems.

## 8. G4 — Analyze & Optimize Functions (A1–A9)

**Shared organizing idea:** `f` gives values, `f'` gives rates, `f''` describes how the slope changes. Limits supply boundary and far-away behavior. Build the whole shape from these constraints.

### A1. Domain & Boundary Behavior

**Essence:** a graph must first respect **where** a function exists and its behavior at boundary/infinite directions.

One rapid annotated checklist: `domain → intercepts/symmetry → finite-boundary one-sided limits → x→±∞`. Show one small graph where an undefined point/interval boundary prevents drawing a connection. This is **function analysis**, not a repetition of F0's mapping definition. **Connection:** boundary limits lead to A7 asymptotes.

### A2. Critical Numbers

**Essence:** critical numbers are **candidates**, not automatic maxima/minima.

```tex
c\in\operatorname{Dom}f,\quad
f'(c)=0\quad\text{or}\quad f'(c)\text{ does not exist}.
```

**Short contrast on a single visual:** `x²` has a minimum at 0; `x³` has a horizontal tangent but **no** extremum there; `|x|` has a corner minimum. Do **not** count holes or vertical asymptotes as critical numbers unless `f(c)` exists. Reuse this same panel in A4 instead of new graphs.

### A3. Extreme Value Theorem (EVT)

**Essence:** continuity on a **closed bounded interval** guarantees that largest and smallest values are attained.

```tex
f\text{ continuous on }[a,b]\quad\Longrightarrow\quad
\exists c,d\in[a,b]:\ 
f(c)\le f(x)\le f(d)\quad(\forall x\in[a,b]).
```

**Interpretation:** existence guarantee, **not a location method**. Closed/open endpoints and continuity hypotheses matter; EVT conditions are **sufficient, not necessary**. **Demo:** high/low points of a continuous graph on a closed segment; then open an endpoint or make a hole to show that attainment can fail. For computation, use A2 critical values **and endpoints** (A9).

### A4. Fermat’s Theorem

**Essence:** an **interior differentiable local extremum** forces a horizontal tangent.

```tex
\text{local extremum at interior }c,\quad f'(c)\text{ exists}
\quad\Longrightarrow\quad f'(c)=0.
```

**Necessary, not sufficient:** `x³` at 0 is a stationary point without an extremum. At a corner the theorem's differentiability assumption fails; at endpoints the interior condition fails. **Reuse A2's single contrast scene**, highlighting the correct condition instead of playing a second full animation. Cross-link A2 candidates and A5 sign test.

### A5. First Derivative Test

**Essence:** a **sign change of the slope** diagnoses how the curve turns, not just where it is flat.

At an **interior** critical number `c` where `f` is **continuous**, assume `f'` has the indicated sign throughout the neighboring left/right intervals:

```tex
f':\quad +\ \big|_c\ -\quad\Longrightarrow\quad\text{local maximum},
```

```tex
f':\quad -\ \big|_c\ +\quad\Longrightarrow\quad\text{local minimum}.
```

If signs do not change (`+/+` or `−/−`), **no local extremum** by this test. **Demo:** moving tangent drives a sign chart of a continuous curve; a distinct emphasis on *signs across c*, not solely `f'(c)`. Strict monotonicity was explained using P5/P6.

### A6. Second Derivative, Concavity & Inflection

**Essence:** `f''` records how the **slope itself** changes.

On an interval where `f''` exists:

```tex
f''>0\Rightarrow\text{concave upward},\qquad
f''<0\Rightarrow\text{concave downward}.
```

**Inflection point:** under the **course lecture's definition**, `f` must be **continuous at c** and concavity must change across `c` (in its domain). `f''(c)=0` is neither sufficient nor necessary. **One tiny contrast:** `x³` changes concavity at 0, `x⁴` does not; at `x=0` the two disconnected branches of `1/x` change concavity **but do not create a point on its graph**.

**Second Derivative Test:** for a stationary point `f'(c)=0`, `f''(c)>0` yields strict local min, `f''(c)<0` yields strict local max, under appropriate second differentiability near `c`; `f''(c)=0` is **inconclusive**. The course states a slightly stronger convenient hypothesis of continuous `f''` near `c`. **Demo:** tangent slopes increase/decrease as point moves, with concavity highlighted; later use same curvature in X3 for tangent over/underestimation. Do not spend time computing three example derivatives.

### A7. Asymptotes

**Essence:** simple lines describe a curve near a singularity or far away; they are **not barriers** the curve cannot cross.

- **Vertical** `x=a`: at least one of `lim_(x→a⁺) f(x)` or `lim_(x→a⁻) f(x)` is `+∞` or `−∞` (where that side is available).
- **Horizontal** `y=L`: `lim_(x→+∞) f(x)=L` **or** `lim_(x→−∞) f(x)=L`; different ends may have different asymptotes.
- **Slant** `y=mx+b`, `m≠0`: `f(x)-(mx+b)→0` in one chosen infinite direction; then `m=lim f(x)/x`, `b=lim(f(x)-mx)` **in that same direction**, when the limits exist finitely.

**Technique:** inspect `+∞` and `−∞` separately, and test each potential vertical asymptote from its available sides. **Demo:** vertical/oblique ink guidelines; show curve approaching (or crossing) a guideline without misrepresenting the definition.

### A8. Curve Sketching — Assemble, Don't Redo a Full Exam Question

**Essence:** **domain + boundary limits + derivative signs + curvature** constrain a coherent global graph.

**One integrated construction demo:** an initially empty page acquires domain exclusions / intercepts → asymptotes → critical numbers and sign intervals of `f'` → concavity and genuine inflection points → resulting graph. All markings remain legible in the final state. Avoid a full worked derivative table—separate exam-review question **E10** is reserved for after the PPT.

**Truth anchor for renderer (instructor/implementation data, not a projected exercise):** if a specific illustrative graph is required, use `f(x)=x+1/x` on `R\{0}`. Verified geometry: `f'=1-1/x²`; critical numbers `x=±1`; local max `(-1,-2)` on left branch, local min `(1,2)` on right branch; `f''=2/x³` gives concave down for `x<0`, concave up for `x>0`; **no inflection at 0** because `f(0)` does not exist; vertical asymptote `x=0`, slant asymptote `y=x` in both infinite directions. Do **not** connect across `x=0`, invent a finite zero, or assign a global maximum/minimum. The scene should remain a brief **assembly demo**, not a new exam problem to solve.

### A9. Optimization

**Essence:** optimize a real quantity **subject to its constraints**, then justify a **global** result.

**Method strip:** define objective and variables → constraint → feasible domain → candidate critical/nondifferentiable points → boundary/endpoints → compare or give a global sign/concavity proof. On `[a,b]`, use the closed-interval method if continuous. **A stationary point alone proves no absolute optimum.**

**Simple demo (no long numbers):** rectangle with fixed positive perimeter `P`; varying width `x` and height `P/2−x` gives

```tex
A(x)=x\left(\frac P2-x\right),\qquad 0<x<\frac P2.
```

Area peaks at the square. **Do not** mark degenerate endpoints as allowed rectangles when the feasible domain is open; their limiting zero area need not be attained. Keep the proof as a brief verbal/visual indication, since detailed optimization belongs to exam practice.

## 9. G5 — Approximate a Value (X1–X3)

**Bridge from G4:** seeing the shape of a curve still doesn't give an easy numeric value. Can we estimate a value using information nearby? G5 closes the conceptual loop by zooming back into one point.

### X1. Linear Approximation

**Essence:** differentiability means a function behaves **linearly to first order nearby**. The tangent is a predictive model, not just a drawn line.

```tex
L(x)=f(a)+f'(a)(x-a),\qquad f(x)\approx L(x)\quad(x\approx a).
```

**Precise local statement:**

```tex
\lim_{x\to a}\frac{f(x)-L(x)}{x-a}=0
\quad\text{(with }x\ne a\text{ in the domain).}
```

**Demo:** zoom in on a smooth curve and its tangent until they visually merge; zoom out slightly to expose the gap. **One tiny numerical anchor only:** `√4.1≈2.025` from linearizing `√x` at `a=4`. Do not solve E7 here; it uses the same idea after the deck.

### X2. Differentials — Predicted vs Actual Change

**Essence:** a derivative is a **rate**; a differential is the **tangent-predicted change**; the true increment belongs to the actual curve.

```tex
f'(x)=\lim_{\Delta x\to0}\frac{\Delta y}{\Delta x},\qquad
\Delta y=f(x+\Delta x)-f(x),\qquad dy=f'(x)\,dx.
```

Choose `dx=Δx`, then `Δy≈dy` for small increments. **`dy=f'(x)dx` is exact by definition**, whereas **`Δy≈dy` is only approximate**. Do not confuse this with `Δy=dy` or use `dy` as decorative Leibniz notation.

**Demo:** carry over X1's same curve/tangent: one horizontal move `dx`, blue/ink tangent rise `dy`, actual curve rise `Δy`; show their gap. Use **the same numerical anchor as X1**, `f(x)=√x` at `x=4`, `dx=0.1`: tangent rise `dy=0.025`, actual rise `Δy=√4.1−2≈0.0248457`. Do not turn this into a separate exercise. Keep absolute/relative measurement errors in oral discussion if time.

### X3. Approximation Error

**Essence:** curvature helps predict **which side** of the tangent the graph lies on and **how large** the error can be.

```tex
E(x)=f(x)-L(x).
```

If `f''≥0` along the **whole interval between `a` and `x`** under appropriate smoothness, the tangent is a lower bound (`E(x)≥0`); if `f''≤0` there, it is an upper bound (`E(x)≤0`). For positive `x`, `√x` is concave downward, so `√4.1<2.025`.

**Quantitative optional one-line reveal (covered by the course's Linear Approximation chapter):** if `f` is twice differentiable with the usual hypotheses on the segment between `a` and `x`, then for some `c` between them,

```tex
E(x)=\frac{f''(c)}2(x-a)^2,
\qquad |f''(t)|\le M\Longrightarrow
|E(x)|\le\frac M2|x-a|^2.
```

This is **not** a Taylor-theorem lecture or a new extended proof. **Demo:** on the **same X1/X2 graph**, reveal the signed vertical error gap, compare concave up/down, then diminish the gap by moving `x` toward `a`.

## 10. Cross-branch connections and graph semantics

Edges are content data with stable IDs. Label them as **prerequisite**, **implication/theorem** (with mathematical hypotheses), **application**, or **conceptual relation**. Hide untaught cross-edges until earned, and never present a conceptual arrow as a formally valid implication without stating its conditions.

**Priority links (with their mathematical meaning):**

| Connection | Type | Interpretation / caveat |
|---|---|---|
| `F0 → D6` | prerequisite | One-to-one maps possess inverse functions **on their range** |
| `F0 ↔ P6` | concept/application | Definition of strict monotonicity in F0; derivative-based proof and injectivity use in P6 |
| `P6 → D6/D7` | application | Monotonic restrictions enable local inverses / trig principal branches |
| `L1 ↔ P1` | application | Continuity licenses direct substitution, but a limit itself doesn't impose continuity |
| `L2 → P1/P3` | prerequisite | One-sided behavior at joining points; one-sided difference quotients |
| `P1 → P2` | prerequisite/theorem use | **Continuity on the whole closed interval**, not just one point, supports IVT |
| `D1 → P3` | implication | Differentiable at `a` ⇒ continuous there; not conversely |
| `P4 ↔ P5` | mathematical relation | Rolle is equal-endpoint MVT; MVT can be proved from Rolle |
| `P5 → P6 → A5` | implication/application | MVT controls changes on intervals; use signs of `f'` with needed hypotheses |
| `P2 + P6 → uniqueness strategy` | application | IVT provides **at least one** root; strict monotonicity provides **at most one** |
| `D2/D3 → L6` | application | Differentiation rules compute derivative quotients; rule applies only if L6 hypotheses hold |
| `P5 ⇢ L6` | conceptual/theoretical | **Cauchy's** MVT is the deeper bridge to L’Hôpital; **ordinary** MVT alone is not the L’Hôpital theorem |
| `D3 → D4/D5/D8` | application | Chain Rule underlies logarithmic/implicit/time differentiation |
| `D5 → X1` | application | Implicitly determined slope yields a linearization |
| `A2/A3/A4 → A9` | application | Critical candidates, EVT, and Fermat underlie extrema search; endpoints count |
| `A5/A6/A7 → A8` | application | Sign charts, concavity, asymptotes constrain graph shape |
| `D1 → X1 → X2 → X3` | conceptual/application | Slope → local linearization → predicted change → signed error |
| `A6 → X3` | application | Concavity over the relevant interval controls tangent bounds |
| `P5 → X3` | conceptual/application | Mean-value ideas can yield error bounds (under added smoothness) |

**Two highlighted local → global bridges:** continuity on `[a,b]` ⇒ intermediate values (P1/P2); differentiability plus MVT ⇒ interval change/monotonicity (P4/P5/P6). **Closing global → local bridge:** complete graph analysis → tangent and approximation (A8/X1). Use the same magical connection style, but don't falsely assert IVT requires differentiability, or strict monotonicity requires `f'>0` everywhere.

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

Describe **mathematical state and teaching action**, not new CSS implementations; all graphs must be accurate and use the existing parchment/ink/gold primitives. Prefer **one scene reused across adjacent nodes** over redundant demos. Control every important reveal by instructor click.

| Node(s) | Required / preferred content demo | Priority |
|---|---|---|
| F0 | Domain/codomain/range mapping; `x²` domain restriction makes horizontal-line test pass; **no full inverse-slope reflection yet** | Short |
| L1/L2 | Hole vs assigned value; left/right dots with correct signs and limits | Short |
| L3 | One explicit divide-by-leading-power rewrite; `|x|/x` switches sign at ±∞ | Short |
| L4 | Tiny `sin(x)/x` zoom only if it adds clarity; formula table stays mostly static | Optional |
| L5 | `±|x|` enclosing **still oscillating** `x sin(1/x)` | Medium |
| **L6** | Rule-condition checklist + 3 quick **valid / not justified / inconclusive** verdicts; hide long witness until optionally clicked | **High** |
| L7 | Movable ε strip and δ strip, exclusion of `x=a` | Medium |
| **P2** | Continuity and a sliding horizontal target level; **multiple intersections allowed** | **High** |
| D1/P3 | Same secant → tangent graph, then a continuous corner with mismatched difference quotients | Medium |
| **P4/P5** | Same picture: equal-height endpoints / Rolle tangent transforms to tilted MVT secant / parallel tangent | **High** |
| P6 | MVT difference in value + horizontal level intersects strict monotone curve at most once | Short |
| D2 | Compact largely static differentiation rule tables | Low |
| **D3** | Existing **five-layer `x`-expression**, peel outer→inner, show factors accumulating **without any `u` substitution or ellipses** | **High** |
| D4 | `x^x` power → log product → differentiation | Short |
| D5 | Circle with branch-aware tangent; no finite `dy/dx` at `y=0` | Medium |
| D6/D7 | Marked inverse tangent with reciprocal slopes; **only sine** branch is fully reflected | Short |
| D8 | Sliding ladder `x²+y²=ℓ²` with time-rates and fixed positive length | Medium |
| A2/A4 | **Shared** `x²/x³/|x|` panel; re-highlight conditions, no second animation | Short |
| A3 | Highlight attained extrema on closed interval; show lost guarantee when hypotheses dropped | Short |
| A5/A6 | Sign-chart-driven tangent; increasing/decreasing tangent slopes and genuine inflection distinction | **High** |
| A7/A8 | Boundary/asymptotes → staged full curve **on one verified underlying function**; don't bridge disconnected components | **High** |
| A9 | Fixed-perimeter rectangle / changing area and valid open domain | Short |
| **X1/X2/X3** | **One shared curve and tangent:** zoom-to-local-linearity → predicted `dy` vs actual `Δy` → signed error and curvature | **High** |

The *interaction* should make a mathematical point. Decorative ember animations can run concurrently and be skipped; do not wait through elaborate ignition between every formula and line. Maintain the original grimoire look rather than modern interactive chart controls.

## 13. Content QA checklist for Codex

- [ ] **Inventory:** F0 + 33 knowledge nodes still reachable by stable IDs; **G2 first visit P1–P2, P3 after D1, G2 return P4–P6**. Root uses **two content pages plus branch transition**.
- [ ] **Timing / exam split:** deck is roughly 30 minutes, instructor-driven; **E1–E13 stay in the separate LaTeX/tablet practice**, not duplicated as 13 new on-screen worked examples. Only a few fast mathematical micro-examples remain.
- [ ] **Slide design:** concise English and formulas; hypotheses visible or in small notes; no article-length prose, no new "Problem Mode", no shrinking all content into one illegible page.
- [ ] **F0/P6/D6:** strictly increasing/decreasing ⇒ one-to-one ⇒ inverse on **range**; converse injective ⇒ strictly monotone **not** generally valid; P6 derives derivative tests from MVT rather than repeating F0; D6 focuses on local inverse slopes.
- [ ] **L1–L3:** direct substitution needs continuity; L2 two-sided equality needs both sides; explicit dominant-power division; `√(x²)=|x|` and signs at ±∞.
- [ ] **L4/L5/L7:** angles in radians; Squeeze animation remains oscillatory; epsilon–delta definition includes points of the domain, excludes `x=a`, and assumes accumulation.
- [ ] **L6:** show **0/0 or ∞/∞**, deleted-neighborhood differentiability, `g'≠0`, derivative-quotient-limit requirement, and one-sided/infinite variants. Distinguish **applicable**, **insufficient facts to invoke**, and **inconclusive despite an existing original limit**; never conclude original limit DNE merely because derivative-quotient limit fails.
- [ ] **P2/P3:** IVT gives existence, not uniqueness; differentiability implies continuity, not conversely; at a join check difference quotients; **preserve** requested finite-quotient `f(x)/(x-a)` corollary without claiming continuity if `f(a)` unknown.
- [ ] **D3:** keep complete original **five-layer** formula with factor-by-factor reveal and **no `u_i` substitution**. D4 variable powers need positive real base.
- [ ] **D5/D6/D7:** local-branch and denominator conditions stated; inverse-derivative statement has local inverse/continuity conditions; principal inverse-trig domain/range and derivative intervals correct, supplementary trig branches not confused.
- [ ] **A2/A3/A4/A5:** critical numbers require defined `f(c)`; EVT on closed bounded interval; Fermat necessary not sufficient; First Derivative Test requires continuity at candidate and appropriate neighboring signs.
- [ ] **A6/A7/A8:** **course-defined inflection is continuous** with actual concavity change; `f''(c)=0` alone inconclusive; same-direction slant tests; renderer's example has no fake global extrema or inflection at a domain hole.
- [ ] **A9:** constraints and **feasible domain** explicit; open/closed endpoint treatment honest; stationary point alone not proof of global maximum.
- [ ] **X1/X2/X3:** first-order approximation from differentiability; `dy=f'(x)dx` **exact**, `Δy≈dy` **approximate**; curvature/tangent bounds require behavior **throughout the interval**, and optional quadratic error requires proper twice-differentiability.
- [ ] **Animations:** every moving geometric state remains mathematically valid; main demonstrations get time; reused scenes minimize repetitions; click controls await the teacher.
- [ ] **Finale (this deck only):** completed graph → Point → Interval → Change → Across an Interval → Graph → Approximation, **same parchment-drop** for all six recap leaves → **parchment-drop transition** to the **saved complete graph** (not rebuilt) → original cover. Overlapping fire-writing begins during fall; complete after landing. The feature remains **optional in the generic engine**.

## 14. Reference alignment (instructor / authoring notes only)

**Source-derived priorities:** The full course lecture (`Calculus_Lec_1_01_04_`) covers limits, epsilon–delta, derivative rules, IVT/EVT, Rolle/MVT, the course-defined continuous inflection point, L’Hôpital with the oscillating Example 1.2, implicit/related rates, and linear approximation with second-order remainder. `TA Lecture Week 1` covers function/domain/range/injectivity/inverse, strict monotonicity ⇒ one-to-one, and inverse trig branches. The separate **14-page** `115_1_Cal_05_Midterm_Review__Copy_` summarizes methods and contains **E1–E13 past-exam tasks**. These establish what should be *recalled* in the PPT versus *practiced* afterwards.

**Teacher-only worksheet map (do not place these exercises inside PPT):** `E1–E3` limits/squeeze; `E4` continuity, differentiability, uniqueness; `E5–E6` logarithmic and inverse-trig derivatives; `E7–E8` implicit differentiation and linearization; `E9` Rolle/strict concavity; `E10` curve sketching; `E11` inverse trig limit; `E12–E13` related rates and applications. Select **1–2** for the separate tablet segment according to remaining time and class needs.

**Supplementary (not a claim that every exam requires it):** tiny `x^x` derivative in D4, a verified `x+1/x` construction model for A8, and the extra `ln(1+x)/x` special-limit reference are short authoring aids; optional supplementary `arcsec/arccsc/arccot` formulas come from the full lecture/TA worksheets but are de-emphasized because the provided compact exam-review handout highlights `arcsin/arccos/arctan` instead. **Do not** introduce antiderivatives or Taylor polynomial nodes without confirmed midterm scope.
