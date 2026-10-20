import { bookDiagram } from '../../components/book-diagram';
import { seal } from '../../components/ornaments';
import type { BlockRenderer } from '../../engine/types';

export const compass: BlockRenderer = (block) => {
  const figure = bookDiagram('An engraved compass rose');
  figure.innerHTML = `<div class="compass-illustration">${seal}<span class="cardinal north">N</span><span class="cardinal east">E</span><span class="cardinal south">S</span><span class="cardinal west">W</span><div class="compass-needle"><span></span></div></div><figcaption>THE ART OF FINDING A WAY</figcaption>`;
  if (block.type === 'interactive') {
    const label = document.createElement('label'); label.className = 'diagram-control';
    const text = document.createElement('span'); text.textContent = 'Change your bearing';
    const slider = document.createElement('input'); slider.type = 'range'; slider.min = '-180'; slider.max = '180'; slider.value = '30'; slider.setAttribute('aria-label', 'Compass bearing');
    const output = document.createElement('output');
    const update = () => {
      figure.querySelector<HTMLElement>('.compass-needle')!.style.transform = `rotate(${slider.value}deg)`;
      output.textContent = `${(Number(slider.value) + 360) % 360}°`;
    };
    slider.addEventListener('input', update); update();
    label.append(text, slider, output); figure.append(label);
  }
  return figure;
};
import './style.css';
