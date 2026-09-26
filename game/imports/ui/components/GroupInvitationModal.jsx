import React, { useEffect } from "react";
import { HudModal } from "./HudModal";
import { useGroupStore } from "../stores/useGroupStore";
import { useHudStore } from "../stores/useHudStore";

const MODAL_ID = "groupInvitation";

export const GroupInvitationModal = () => {
  const invitation = useGroupStore((state) => state.invitation);
  const requestAction = useGroupStore((state) => state.requestAction);

  useEffect(() => {
    const hud = useHudStore.getState();
    if (invitation) hud.openModal(MODAL_ID);
    else hud.closeModal(MODAL_ID);
    return () => useHudStore.getState().closeModal(MODAL_ID);
  }, [invitation]);

  if (!invitation) return null;
  const ignore = () => requestAction("ignore", invitation.id);

  return (
    <HudModal id={MODAL_ID} title="Group invitation" onClose={ignore}>
      <p><span className="font-semibold">{invitation.inviterName}</span> invited you to join a group.</p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={ignore}>Ignore</button>
        <button type="button" className="btn btn-primary" onClick={() => requestAction("accept", invitation.id)}>Join group</button>
      </div>
    </HudModal>
  );
};
