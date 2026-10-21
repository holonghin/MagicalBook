import type { ContentNode } from '../../../engine/content';
import { foundation } from './foundation';
import { limits } from './limits';
import { properties } from './properties';
import { derivatives } from './derivatives';
import { analysis } from './analysis';
import { approximation } from './approximation';

export const knowledgeNodes: ContentNode[] = [foundation, ...limits, ...properties, ...derivatives, ...analysis, ...approximation];
