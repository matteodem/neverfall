import { useGroupStore } from "../ui/stores/useGroupStore";

export const connectGroups = (room) => {
  const sync = (state) => useGroupStore.getState().sync(state, room.sessionId);
  const reset = () => useGroupStore.getState().reset();
  room.onStateChange(sync);
  room.onLeave(reset);
  const removeErrorHandler = room.onMessage("groupError", (message) => {
    useGroupStore.getState().setError(message);
  });
  const removeInvitationHandler = room.onMessage("groupInvitation", (invitation) => {
    useGroupStore.getState().setInvitation(invitation);
  });
  const removeCancellationHandler = room.onMessage("groupInvitationCancelled", () => {
    useGroupStore.getState().setInvitation(null);
  });
  useGroupStore.getState().setActionHandler((action, sessionId) => {
    if (action === "invite") room.send("groupInvite", sessionId);
    if (action === "accept") room.send("groupAccept", sessionId);
    if (action === "ignore") room.send("groupIgnore", sessionId);
    if (action === "leave") room.send("groupLeave");
  });
  sync(room.state);

  return () => {
    room.onStateChange.remove(sync);
    room.onLeave.remove(reset);
    removeErrorHandler();
    removeInvitationHandler();
    removeCancellationHandler();
    reset();
  };
};
