// Secondary touches must work while the joystick holds the first pointer.
export const actionButtonHandlers = (trigger, mobile) => mobile ? {
  onPointerDown(event) {
    if (event.currentTarget.disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    trigger();
  },
  onClick(event) {
    // Preserve keyboard activation; pointer presses already triggered the action.
    if (event.detail === 0) trigger();
  },
} : { onClick: trigger };
