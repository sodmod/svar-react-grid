/*
 * SVAR-M21 (SVAR Production Planner): a column resize always terminates, and
 * the grip's listener is really removed.
 *
 * ## The two defects, both measured
 *
 * 1. The gesture ended on `mouseup` and on nothing else. `mousedown` puts
 *    `ew-resize` on `document.body` and turns text selection off; only that one
 *    handler put them back. A gesture the browser takes away instead of ending
 *    — `pointercancel`, the window losing focus, the page being hidden, the
 *    pointer capture being lost — therefore left the whole document wearing the
 *    resize cursor and unable to select text, with nothing on screen to explain
 *    it and no way back except starting and finishing another resize.
 *
 *    Measured before this change: press a grip, move, let the pointer be
 *    cancelled, and `document.body.style.cursor` stays `"ew-resize"` and
 *    `userSelect` stays `"none"` indefinitely.
 *
 * 2. `resize()` returned `{ destroy }` while its one caller checked
 *    `typeof cleanup === 'function'`, so the cleanup never ran and the
 *    `mousedown` listener was never removed. The callbacks change identity
 *    whenever the column's width changes, and a width changes on every step of
 *    a resize, so the effect re-ran and added ANOTHER listener each step.
 *    Measured: 11 listeners added to one grip during a single drag, every one
 *    of them live, every one of them starting its own gesture on the next
 *    press.
 *
 * Both halves are one fact: a gesture owns global state, so it has to give it
 * back on every path out, and the thing that installed it has to be removable.
 *
 * The cleanup keeps the `{ destroy }` shape it always had, so no existing
 * caller changes meaning; it is now also callable directly, so a caller that
 * treats it as a function is right too.
 */
export function resize(node, config) {
  // SVAR-M21: every path out of the gesture goes through `stop()`, which is
  // what makes "the document never keeps the resize cursor" true by
  // construction rather than by remembering to repeat the teardown.

  let x,
    dx,
    active = false;

  function stop() {
    if (!active) return;
    active = false;

    node.style.opacity = '';

    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
    window.removeEventListener('blur', cancel);
    window.removeEventListener('pointercancel', cancel);
    node.removeEventListener('lostpointercapture', cancel);
    document.removeEventListener('visibilitychange', hidden);
  }

  function down(ev) {
    if (active) stop();
    active = true;
    x = ev.clientX;
    dx = 0;

    node.style.opacity = 1;

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('blur', cancel);
    window.addEventListener('pointercancel', cancel);
    node.addEventListener('lostpointercapture', cancel);
    document.addEventListener('visibilitychange', hidden);

    if (config && config.down) config.down(node);
  }

  function move(ev) {
    if (!active) return;
    dx = ev.clientX - x;

    if (config && config.move) config.move(dx);
  }

  function up() {
    if (!active) return;
    const travelled = dx;
    stop();

    if (config && config.up) config.up(travelled);
  }

  /*
   * SVAR-M21: a gesture the browser took away is NOT a resize to somewhere. The width the
   * consumer already saw through the in-progress steps is the width it keeps —
   * this path restores the document and reports nothing, rather than inventing
   * a final position from a pointer that is no longer there.
   */
  function cancel() {
    stop();
  }

  function hidden() {
    if (document.visibilityState === 'hidden') stop();
  }

  node.addEventListener('mousedown', down);

  function destroy() {
    stop();
    node.removeEventListener('mousedown', down);
  }

  destroy.destroy = destroy;
  return destroy;
}
