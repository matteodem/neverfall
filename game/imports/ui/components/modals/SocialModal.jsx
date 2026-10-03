import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../../api/characters/characters";
import { Guilds } from "../../../api/guilds/guilds";
import { useChatStore } from "../../stores/useChatStore";
import { HudModal } from "../HudModal";

export const SocialModal = () => {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
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
      <div className="space-y-4 text-sm">
        <h4 className="font-bold">Guild</h4>
        {!guild && character?.guildId && <p>Loading guild…</p>}
        {!guild && !character?.guildId && <>
          {character?.guildInvite ? <div className="rounded-box border border-primary p-3">
            <h5 className="font-semibold">Join via Invite</h5>
            <p><strong>{character.guildInvite.inviterName}</strong> invited you to join <strong>{character.guildInvite.guildName} [{character.guildInvite.tag}]</strong>.</p>
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={() => act("guilds.accept", null, "Joined guild.")}>Join Guild</button>
              <button type="button" className="btn btn-sm" disabled={busy} onClick={() => act("guilds.decline", null, "Invitation declined.")}>Decline</button>
            </div>
          </div> : <p>Ask a guild leader to invite your character to join a guild.</p>}
          <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); act("guilds.create", { name, tag }, "Guild created."); }}>
            <h5 className="font-semibold">Create Guild</h5>
            <input className="input input-bordered w-full" aria-label="Guild name" placeholder="Guild name (3–24 characters)"
              maxLength={24} value={name} onChange={(event) => setName(event.target.value)} required />
            <input className="input input-bordered w-full" aria-label="Guild tag" placeholder="Guild tag (2–5 letters or numbers)"
              maxLength={5} value={tag} onChange={(event) => setTag(event.target.value)} required />
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>Create Guild</button>
          </form>
        </>}
        {guild && <>
          <div><h5 className="text-lg font-bold">{guild.name} [{guild.tag}]</h5>
            <p>Leader: {guild.members.find((member) => member.role === "leader")?.name}</p></div>
          <div><h5 className="mb-1 font-semibold">Members ({guild.members.length})</h5>
            <ul className="space-y-1">{guild.members.map((member) => <li key={member.characterId} className="flex items-center justify-between gap-2">
              <span>{member.name} · {member.role === "leader" ? "Leader" : "Member"}</span>
              {leader && member.role === "member" && <button type="button" className="btn btn-xs btn-error"
                disabled={busy} onClick={() => act("guilds.kick", { characterId: member.characterId }, `${member.name} removed.`)}>Kick</button>}
            </li>)}</ul>
          </div>
          {leader && <form className="flex flex-wrap items-end gap-2" onSubmit={async (event) => {
            event.preventDefault();
            if (await act("guilds.invite", { name: inviteName }, "Invitation sent.")) setInviteName("");
          }}>
            <label className="flex-1">Invite character
              <input className="input input-bordered mt-1 w-full" placeholder="Character name" value={inviteName}
                onChange={(event) => setInviteName(event.target.value)} required />
            </label>
            <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>Invite</button>
          </form>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm" onClick={() => useChatStore.getState().show("/guild ")}>Guild Chat</button>
            {leader ? <button type="button" className="btn btn-sm btn-error" disabled={busy} onClick={() => {
              if (window.confirm(`Disband ${guild.name}? This removes all members.`)) act("guilds.disband", null, "Guild disbanded.");
            }}>Disband Guild</button> : <button type="button" className="btn btn-sm btn-error" disabled={busy}
              onClick={() => act("guilds.leave", null, "Left guild.")}>Leave Guild</button>}
          </div>
        </>}
        {message && <p role="status" className="text-info">{message}</p>}
      </div>
    </HudModal>
  );
};
