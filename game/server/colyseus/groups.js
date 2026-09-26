const MAX_GROUP_MEMBERS = 5;

// Groups and invitations live only in this room.
export const createGroups = (players) => {
  let nextId = 1;
  let nextInvitationId = 1;
  const invitations = new Map();

  const validateInvite = (inviterId, targetId) => {
    const inviter = players.get(inviterId);
    const target = typeof targetId === "string" ? players.get(targetId) : null;
    if (!inviter || !target || inviterId === targetId) return "Choose another connected player.";
    if (target.groupId) return "That player is already in a group.";
    if (inviter.groupId) {
      let count = 0;
      for (const player of players.values()) {
        if (player.groupId === inviter.groupId) count++;
      }
      if (count >= MAX_GROUP_MEMBERS) return "Groups can have at most 5 players.";
    }
    return null;
  };

  return {
    invite(inviterId, targetId) {
      const error = validateInvite(inviterId, targetId);
      if (error) return { error };
      const invitation = {
        id: `invite-${nextInvitationId++}`,
        inviterId,
        inviterName: players.get(inviterId).name,
      };
      invitations.set(targetId, invitation);
      return { invitation };
    },

    accept(sessionId, invitationId) {
      const invitation = invitations.get(sessionId);
      if (!invitation || invitation.id !== invitationId) return "This invitation is no longer available.";
      invitations.delete(sessionId);
      const error = validateInvite(invitation.inviterId, sessionId);
      if (error) return error;
      const inviter = players.get(invitation.inviterId);
      if (!inviter.groupId) inviter.groupId = `group-${nextId++}`;
      players.get(sessionId).groupId = inviter.groupId;
      return null;
    },

    ignore(sessionId, invitationId) {
      if (invitations.get(sessionId)?.id === invitationId) invitations.delete(sessionId);
    },

    leave(sessionId) {
      const cancelled = [];
      invitations.delete(sessionId);
      for (const [targetId, invitation] of invitations) {
        if (invitation.inviterId !== sessionId) continue;
        invitations.delete(targetId);
        cancelled.push(targetId);
      }
      const player = players.get(sessionId);
      if (!player?.groupId) return cancelled;
      const groupId = player.groupId;
      player.groupId = "";
      let remaining = null;
      let count = 0;
      for (const member of players.values()) {
        if (member.groupId !== groupId) continue;
        remaining = member;
        count++;
      }
      if (count === 1) remaining.groupId = "";
      return cancelled;
    },
  };
};
