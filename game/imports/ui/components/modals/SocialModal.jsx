import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { Guilds } from "../../../api/guilds/guilds";
import { useChatStore } from "../../stores/useChatStore";
import { useHudStore } from "../../stores/useHudStore";
import { HudModal } from "../HudModal";
import { FantasyBadge, FantasyButton, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

export const SocialModal = () => {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDisband, setConfirmDisband] = useState(false);
  const open = useHudStore((state) => state.openModals.includes("social"));
  useEffect(() => { if (!open) setConfirmDisband(false); }, [open]);
  const { character, guild } = useTracker(() => {
    const characterId = Meteor.user()?.profile?.currentCharacterId;
    if (characterId) Meteor.subscribe("guilds.mine", characterId);
    return { character: characterId && Characters.findOne(characterId),
      guild: characterId && Guilds.findOne({ "members.characterId": characterId }) };
  }, []);

  const act = async (method, args, success) => {
    setBusy(true);
    setMessage("");
    try {
      await Meteor.callAsync(method, ...(args ? [args] : []));
      setMessage(success || "Done.");
      return true;
    } catch (error) {
      setMessage(error.reason || error.message || "Could not update the guild.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const leader = guild?.leaderCharacterId === character?._id;
  return (
    <HudModal id="social" title="Social" width={520} maxHeight={700}>
      <div className="fantasy-ui fantasy-stack text-sm">
        <FantasySectionHeader as="h4" className="mt-0">Guild</FantasySectionHeader>
        {!guild && character?.guildId && <p>Loading guild…</p>}
        {!guild && !character?.guildId && <>
          {character?.guildInvite ? <FantasyPanel className="fantasy-section">
            <FantasySectionHeader as="h5">Join via Invite</FantasySectionHeader>
            <p><strong>{character.guildInvite.inviterName}</strong> invited you to join <strong>{character.guildInvite.guildName} [{character.guildInvite.tag}]</strong>.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FantasyButton className="btn-sm" disabled={busy} onClick={() => act("guilds.accept", null, "Joined guild.")}>Join Guild</FantasyButton>
              <FantasyButton variant="secondary" className="btn-sm" disabled={busy} onClick={() => act("guilds.decline", null, "Invitation declined.")}>Decline</FantasyButton>
            </div>
          </FantasyPanel> : <p>Ask a guild leader to invite your character to join a guild.</p>}
          <form className="fantasy-stack" onSubmit={(event) => { event.preventDefault(); act("guilds.create", { name, tag }, "Guild created."); }}>
            <FantasySectionHeader as="h5">Create Guild</FantasySectionHeader>
            <input className="input fantasy-input w-full" aria-label="Guild name" placeholder="Guild name (3–24 characters)"
              maxLength={24} value={name} onChange={(event) => setName(event.target.value)} required />
            <input className="input fantasy-input w-full" aria-label="Guild tag" placeholder="Guild tag (2–5 letters or numbers)"
              maxLength={5} value={tag} onChange={(event) => setTag(event.target.value)} required />
            <FantasyButton type="submit" className="btn-sm self-start" disabled={busy}>Create Guild</FantasyButton>
          </form>
        </>}
        {guild && <>
          <div><FantasySectionHeader as="h5" className="mt-0 text-lg">{guild.name} <FantasyBadge>{guild.tag}</FantasyBadge></FantasySectionHeader>
            <p>Leader: {guild.members.find((member) => member.role === "leader")?.name}</p></div>
          <div><FantasySectionHeader as="h5" className="mb-1">Members ({guild.members.length})</FantasySectionHeader>
            <ul className="space-y-1">{guild.members.map((member) => <li key={member.characterId} className="flex min-w-0 items-center justify-between gap-2">
              <span className="min-w-0 break-all">{member.name} · {member.role === "leader" ? "Leader" : "Member"}</span>
              {leader && member.role === "member" && <FantasyButton variant="danger" className="btn-xs"
                disabled={busy} onClick={() => act("guilds.kick", { characterId: member.characterId }, `${member.name} removed.`)}>Kick</FantasyButton>}
            </li>)}</ul>
          </div>
          {leader && <form className="flex flex-wrap items-end gap-2" onSubmit={async (event) => {
            event.preventDefault();
            if (await act("guilds.invite", { name: inviteName }, "Invitation sent.")) setInviteName("");
          }}>
            <label className="min-w-0 flex-1">Invite character
              <input className="input fantasy-input mt-1 w-full" placeholder="Character name" value={inviteName}
                onChange={(event) => setInviteName(event.target.value)} required />
            </label>
            <FantasyButton type="submit" className="btn-sm" disabled={busy}>Invite</FantasyButton>
          </form>}
          <div className="flex flex-wrap gap-2">
            <FantasyButton variant="secondary" className="btn-sm" onClick={() => useChatStore.getState().show("/guild ")}>Guild Chat</FantasyButton>
            {leader ? <FantasyButton variant="danger" className="btn-sm" disabled={busy} onClick={() => setConfirmDisband(true)}>Disband Guild</FantasyButton> : <FantasyButton variant="danger" className="btn-sm" disabled={busy}
              onClick={() => act("guilds.leave", null, "Left guild.")}>Leave Guild</FantasyButton>}
          </div>
          {confirmDisband && leader && <FantasyPanel className="fantasy-section fantasy-confirm-danger" role="group" aria-label="Confirm disband guild">
            <p>Disband <strong>{guild.name}</strong>? This removes all members.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <FantasyButton variant="secondary" disabled={busy} onClick={() => setConfirmDisband(false)}>Cancel</FantasyButton>
              <FantasyButton variant="danger" disabled={busy} onClick={async () => {
                if (await act("guilds.disband", null, "Guild disbanded.")) setConfirmDisband(false);
              }}>Confirm Disband</FantasyButton>
            </div>
          </FantasyPanel>}
        </>}
        {message && <p role="status" className="text-info">{message}</p>}
      </div>
    </HudModal>
  );
};
