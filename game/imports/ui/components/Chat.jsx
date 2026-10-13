import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { ChatMessages } from "../../api/chat/messages";
import { Characters } from "../../api/characters/characters";
import { useDungeonStore } from "../stores/useDungeonStore";
import { useChatStore } from "../stores/useChatStore";
import { FantasyButton, FantasyHudCard, FantasySectionHeader } from "./fantasy/FantasyUI";

export const Chat = () => {
  const { visible, open, draft, focusRequest, roomId, error } = useChatStore();
  const location = useDungeonStore((state) => state.location);
  const roomLabel = location === "dungeon" ? "Dungeon" : "World";
  const input = useRef(null);
  const log = useRef(null);
  const content = useRef(null);
  const messages = useTracker(() => {
    const characterId = Meteor.user()?.profile?.currentCharacterId;
    const guildId = characterId && Characters.findOne(characterId)?.guildId;
    if (characterId) Meteor.subscribe("chat.mine", characterId, guildId || "");
    return ChatMessages.find({ $or: [{ channel: "room", roomId }, { channel: { $in: ["party", "whisper"] } },
      ...(guildId ? [{ channel: "guild", guildId }] : [])] },
      { sort: { createdAt: 1 } }).fetch();
  }, [roomId]);
  useEffect(() => { if (open) input.current?.focus(); }, [open, focusRequest]);
  useLayoutEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, error, visible, open, roomId]);
  useEffect(() => {
    if (!visible || !log.current || !content.current) return undefined;
    const scrollToBottom = () => {
      if (log.current) log.current.scrollTop = log.current.scrollHeight;
    };
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(log.current);
    observer.observe(content.current);
    return () => observer.disconnect();
  }, [visible]);
  useEffect(() => {
    const handleKey = (event) => {
      if (!useChatStore.getState().visible) return;
      if (event.key !== "Enter" || event.target.closest?.("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      useChatStore.getState().show();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  return (
    <FantasyHudCard as="section" id="onboarding-chat" className={`game-chat absolute bottom-2 left-2 z-[10002] w-80 text-xs ${visible ? "" : "pointer-events-none"}`} aria-label="Chat">
      <FantasyButton variant="secondary" className="pointer-events-auto btn-xs mb-1" aria-expanded={visible}
        onClick={(event) => { useChatStore.getState().toggleVisible(); event.currentTarget.blur(); }}
        onKeyDown={(event) => { if (!visible && event.key === "Enter") { event.preventDefault(); event.stopPropagation(); } }}>
        {visible ? "Hide Chat" : "Show Chat"}
      </FantasyButton>
      {visible && <>
      <FantasySectionHeader as="h3" className="my-1 hidden">{roomLabel} chat</FantasySectionHeader>
      <div ref={log} className="h-32 overflow-y-auto break-words" role="log" aria-live="polite">
        <div ref={content}>
        {messages.map((message) => <p key={message._id} className={message.channel === "whisper" ? "fantasy-accent" : message.channel === "party" ? "fantasy-chat-party" : message.channel === "guild" ? "fantasy-chat-guild" : ""}>
          <span className="font-semibold capitalize">[{message.channel === "room" ? roomLabel : message.channel}] {message.senderName}{message.recipientName ? ` → ${message.recipientName}` : ""}: </span>{message.text}
        </p>)}
        {error && <p className="fantasy-chat-error">{error}</p>}
        </div>
      </div>
      {open ? <form className="mt-1 flex gap-1" onSubmit={(event) => { event.preventDefault(); useChatStore.getState().send(); input.current?.focus(); }}>
        <input ref={input} className="input input-sm fantasy-input min-w-0 flex-1" aria-label="Chat message" placeholder="Message or /command" maxLength={500}
          value={draft} onChange={(event) => useChatStore.getState().setDraft(event.target.value)}
          onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Escape") { useChatStore.getState().close(); input.current?.blur(); } }} />
        <FantasyButton type="submit" variant="primary" className="btn-sm">Send</FantasyButton>
      </form> : <FantasyButton variant="ghost" className="btn-xs mt-1" onClick={() => useChatStore.getState().show()}>Chat · Enter</FantasyButton>}
      </>}
    </FantasyHudCard>
  );
};
