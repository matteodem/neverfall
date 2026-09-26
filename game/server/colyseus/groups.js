const MAX_GROUP_MEMBERS = 5;

// Groups live only in this room; membership is synchronized on PlayerState.
export const createGroups = (players) => {
  let nextId = 1;

  return {
    invite(inviterId, targetId) {
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
      } else {
        inviter.groupId = `group-${nextId++}`;
      }
      target.groupId = inviter.groupId;
      return null;
    },

    leave(sessionId) {
      const player = players.get(sessionId);
      if (!player?.groupId) return;
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
    },
  };
};
