/** Shared frame for all plug-ins: the host owns theme, inscription and sizing. */
export function bookDiagram(label: string) {
  const figure = document.createElement('figure');
  figure.className = 'book-diagram';
  figure.setAttribute('aria-label', label);
  return figure;
}
