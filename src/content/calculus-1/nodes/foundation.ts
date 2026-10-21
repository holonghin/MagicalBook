import type { ContentNode } from '../../../engine/content';
import { page, tex } from '../slides/builders';

export const foundation: ContentNode = { id: 'F0', slides: [
  page('F0-function', 'What Is a Function?', tex`f:A\to B,\qquad x\mapsto f(x),\qquad f(A)\subseteq B`,
    'Exactly one output for every input. Different inputs may share an output.', 'calc-mapping',
    'TA Week 1, pp. 1–2. The graph is the set {(x,f(x)):x∈A}. Codomain is specified; range is reached. Right morphs the mapping into graph coordinates; Left reverses it.'),
  page('F0-inverse', 'When Can We Reverse It?', tex`\begin{gathered}f(x_1)=f(x_2)\Rightarrow x_1=x_2\quad\text{(one-to-one)}\\ f^{-1}:f(A)\to A,\qquad f^{-1}(f(x))=x\end{gathered}`,
    'Strictly increasing OR decreasing on the whole domain ⇒ one-to-one. The converse need not hold.', 'calc-injectivity',
    'TA Week 1, pp. 3–7. Increasing means x₁<x₂⇒f(x₁)<f(x₂); decreasing reverses the output inequality. The ordered domain may be a subset of R. Inverse on B additionally needs surjectivity onto B. Inverse notation is not reciprocal.'),
] };
