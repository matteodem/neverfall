import { useMobileControlsStore } from "../ui/stores/useMobileControlsStore";

export const createInput = (
  canvas
) => {
  const state = {
    keys: {},
    get joystick() { return useMobileControlsStore.getState().direction; },
    leftMouseDown: false,
    rightMouseDown: false,
  };

  const listeners = [];

  const on = (
    target,
    type,
    handler,
    options
  ) => {
    target.addEventListener(
      type,
      handler,
      options
    );

    listeners.push(() => {
      target.removeEventListener(
        type,
        handler,
        options
      );
    });
  };

  const handleKeyDown = (
    event
  ) => {
    if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    state.keys[
      event.key.toLowerCase()
    ] = true;
  };

  const handleKeyUp = (
    event
  ) => {
    state.keys[
      event.key.toLowerCase()
    ] = false;
  };

  const handlePointerDown = (
    event
  ) => {
    if (event.button === 0) {
      state.leftMouseDown = true;
    }

    if (event.button === 2) {
      state.rightMouseDown = true;
    }

    try {
      canvas.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Ignore unsupported pointer capture.
    }
  };

  const handlePointerUp = (
    event
  ) => {
    if (event.button === 0) {
      state.leftMouseDown = false;
    }

    if (event.button === 2) {
      state.rightMouseDown = false;
    }

    try {
      canvas.releasePointerCapture(
        event.pointerId
      );
    } catch {
      // Ignore unsupported pointer capture.
    }
  };

  const handleContextMenu = (
    event
  ) => {
    event.preventDefault();
  };

  on(window, "focusin", (event) => {
    if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) state.keys = {};
  });

  on(
    window,
    "keydown",
    handleKeyDown
  );

  on(
    window,
    "keyup",
    handleKeyUp
  );

  on(
    canvas,
    "pointerdown",
    handlePointerDown
  );

  on(
    canvas,
    "pointerup",
    handlePointerUp
  );

  on(
    canvas,
    "pointercancel",
    handlePointerUp
  );

  on(
    canvas,
    "contextmenu",
    handleContextMenu
  );

  return {
    state,

    on,

    destroy() {
      listeners.forEach(
        (removeListener) => {
          removeListener();
        }
      );
    },
  };
};