import { definePresentation } from '../../engine/content';
import { chapters } from './chapters';
export default definePresentation({
  config: { id: 'plain', coverTitle: 'The Quiet Archive', language: 'en', seed: 48 },
  chapters, sequence: chapters.map(s => s.id), secondActEnding: { enabled: false },
});
