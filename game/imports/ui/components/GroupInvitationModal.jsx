import React, { useEffect } from "react";
import { HudModal } from "./HudModal";
import { useGroupStore } from "../stores/useGroupStore";
import { useHudStore } from "../stores/useHudStore";
import { FantasyButton, FantasySectionHeader } from "./fantasy/FantasyUI";

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
      <FantasySectionHeader as="p" className="mt-0">Invitation</FantasySectionHeader>
      <p><span className="font-semibold break-all">{invitation.inviterName}</span> invited you to join a group.</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <FantasyButton variant="ghost" onClick={ignore}>Ignore</FantasyButton>
        <FantasyButton onClick={() => requestAction("accept", invitation.id)}>Join group</FantasyButton>
      </div>
    </HudModal>
  );
};
