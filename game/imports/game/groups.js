import { useGroupStore } from "../ui/stores/useGroupStore";

export const connectGroups = (room) => {
  const sync = (state) => useGroupStore.getState().sync(state, room.sessionId);
  const reset = () => useGroupStore.getState().reset();
  room.onStateChange(sync);
  room.onLeave(reset);
  const removeErrorHandler = room.onMessage("groupError", (message) => {
    useGroupStore.getState().setError(message);
  });
  useGroupStore.getState().setActionHandler((action, sessionId) => {
    if (action === "invite") room.send("groupInvite", sessionId);
    if (action === "leave") room.send("groupLeave");
  });
  sync(room.state);

  return () => {
    room.onStateChange.remove(sync);
    room.onLeave.remove(reset);
    removeErrorHandler();
    reset();
  };
};
