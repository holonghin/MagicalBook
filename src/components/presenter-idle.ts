/** Quiet controls stay keyboard/touch discoverable; focused controls never fold. */
export function presenterIdle(details: HTMLDetailsElement) {
  let timer: ReturnType<typeof setTimeout>;
  const wake = () => {
    details.dataset.idle = 'false'; clearTimeout(timer);
    timer = setTimeout(() => {
      if (details.matches(':focus-within,:hover')) { wake(); return; }
      details.open = false; details.dataset.idle = 'true';
    }, 2800);
  };
  for (const name of ['pointerenter', 'pointermove', 'pointerleave', 'focusin', 'focusout', 'toggle']) details.addEventListener(name, wake);
  wake();
}
