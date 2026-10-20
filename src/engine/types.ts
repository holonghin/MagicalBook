import type { GraphState } from './graph-state';

export interface Timings {
  opening: number;
  turn: number;
  reveal: number;
  drop: number;
  closing: number;
  erase: number;
}
export type Action = 'next' | 'back' | 'skip' | 'replay' | 'home' | 'fullscreen' | 'effects' | 'pause' | 'escape' | 'minimap';
export interface DeckConfig {
  id: string;
  coverTitle: string;
  subtitle?: string;
  author?: string;
  coverNote?: { enabled: boolean; text: string };
  camera?: { closedScale?: number; contentScale?: number };
  language: string;
  seed: number;
  timings?: Partial<Timings>;
  keys?: Partial<Record<Action, string[]>>;
}
export interface ContentBlock {
  id: string;
  type: 'title' | 'paragraph' | 'bullets' | 'quotation' | 'math' | 'code' | 'table' | 'image' | 'diagram' | 'interactive' | 'comparison' | 'caption';
  text?: string;
  tex?: string;
  lines?: string[];
  rows?: string[][];
  columns?: { title: string; text: string }[];
  src?: string;
  alt?: string;
  renderer?: string;
  data?: Record<string, unknown>;
  beat?: number;
  reveal?: boolean;
}
export interface DropOptions {
  mode: 'content' | 'transition';
  duration?: number;
  revealStartDropProgress?: number;
  targetRevealAtLanding?: number;
  exitDuration?: number;
}
export type SceneTransition = 'burn' | 'paperBurn' | 'page';
export interface PaperBurnOptions {
  duration?: number;
  ignitions?: number;
  charWidth?: number;
}
export interface Slide {
  id: string;
  eyebrow: string;
  layout: 'editorial' | 'centered' | 'split' | 'diagram';
  blocks: ContentBlock[];
  effect?: 'burn' | 'pageTurn' | 'parchmentDrop' | 'parchmentExit' | 'paperBurn';
  paperBurn?: PaperBurnOptions;
  exit?: { duration?: number; style?: 'dissolve' | 'drift' };
  drop?: DropOptions;
  restoreSceneId?: string;
  focus?: { blockId: string; scale: number };
  routeStep?: number;
  notes?: string;
  kind?: 'ordinary' | 'chapter' | 'graph' | 'node' | 'recap' | 'finalGraph';
  graphLayout?: 'horizontal' | 'vertical';
}
export interface RouteGraph {
  id?: string;
  title?: string;
  layout?: 'horizontal' | 'vertical';
  orientation?: GraphOrientationPolicy;
  /** Selected by content; the engine never forces this on graph decks. */
  transitions?: { enterNode?: SceneTransition; returnToGraph?: SceneTransition };
  nodes: { id: string; label: string; shortLabel?: string; note?: string; role?: 'branch'; x?: number; y?: number; slideIds: string[]; unlockStep: number }[];
  edges: { id: string; from: string; to: string; unlockStep: number }[];
}
export type GraphOrientationPolicy =
  | { mode: 'fixed-horizontal' | 'fixed-vertical' }
  | { mode: 'timeline'; initial: 'horizontal' | 'vertical'; changes: { atStep: string; to: 'horizontal' | 'vertical' }[] };
export interface Deck {
  config: DeckConfig;
  sections: { id: string; title: string; slides: Slide[] }[];
  routeGraph?: RouteGraph;
  ending?: { enabled: boolean; slides: Slide[]; closeBook?: boolean };
  /** Compiled lecture sequence excludes selectable node pages. */
  flow?: string[];
  finalGraphId?: string;
  renderers?: Record<string, BlockRenderer>;
  contentVersion?: 2;
}
export interface PresenterState {
  phase: 'closed' | 'opening' | 'ready' | 'turning' | 'erasing' | 'revealing' | 'dropping' | 'handoff' | 'closing' | 'graphing';
  index: number;
  beat: number;
  effects: boolean;
  visited: Set<string>;
  routeReturn: { index: number; beat: number } | null;
}
export interface RenderContext {
  deck: Deck;
  slide: Slide;
  visited: Set<string>;
  visitNode: (id: string) => void;
  graphViews?: Map<string, HTMLElement>;
  graphState?: GraphState;
}
export type BlockRenderer = (block: ContentBlock, context: RenderContext) => HTMLElement;
