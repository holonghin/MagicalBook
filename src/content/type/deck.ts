import type { Deck } from '../../engine/types';
import type { MathNode } from '../../components/mathml';

const token = (tag: MathNode['tag'], text: string): MathNode => ({ tag, text });
const group = (tag: MathNode['tag'], ...children: MathNode[]): MathNode => ({ tag, children });
const expression = group('mtable',
  group('mtr', group('mtd', group('mfrac', group('mrow', token('mi', 'a'), token('mo', '+'), token('mi', 'b')), token('mi', 'c')), token('mo', '='), token('mi', 'r'))),
  group('mtr', group('mtd', group('msup', token('mi', 'x'), token('mn', '2')), token('mo', '+'), group('msup', token('mi', 'y'), token('mn', '2')), token('mo', '='), group('msup', token('mi', 'z'), token('mn', '2')))),
  group('mtr', group('mtd', group('msub', token('mi', 's'), token('mi', 'n')), token('mo', '='), group('msqrt', group('mrow', group('msub', token('mi', 'a'), token('mi', 'n')), token('mo', '+'), group('msub', token('mi', 'b'), token('mi', 'n')))))),
);
export const typographyDeck: Deck = {
  config: { id: 'type', coverTitle: 'A Study in Ink', subtitle: 'Typesetting & layout specimen', language: 'en', seed: 427 },
  sections: [{ id: 'specimen', title: 'Specimen', slides: [
    { id: 'symbols', eyebrow: 'TYPE SPECIMEN / NATIVE MATHML', layout: 'centered', blocks: [
      { id: 'title', type: 'title', text: 'Precision, preserved.' },
      { id: 'formula', type: 'math', renderer: 'mathml', alt: 'Three sample equations with fractions, powers, subscripts and a radical.', data: { expression } },
      { id: 'caption', type: 'caption', text: 'Native glyphs. Concurrent inscription. No remote fonts.' },
    ] },
  ] }],
};
export default typographyDeck;
