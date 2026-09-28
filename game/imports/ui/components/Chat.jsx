import React, { useEffect, useLayoutEffect, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { ChatMessages } from "../../api/chat/messages";
import { useDungeonStore } from "../stores/useDungeonStore";
import { useChatStore } from "../stores/useChatStore";

export const Chat = () => {
  const { visible, open, draft, focusRequest, roomId, error } = useChatStore();
  const location = useDungeonStore((state) => state.location);
  const roomLabel = location === "dungeon" ? "Dungeon" : "World";
  const input = useRef(null);
  const log = useRef(null);
  const content = useRef(null);
  const messages = useTracker(() => {
    Meteor.subscribe("chat.mine");
    return ChatMessages.find({ $or: [{ channel: "room", roomId }, { channel: { $in: ["party", "whisper"] } }] },
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
    <section id="onboarding-chat" className={`game-chat absolute bottom-2 left-2 z-[10002] w-80 rounded-box p-2 text-xs text-white ${visible ? "bg-black/65" : "pointer-events-none"}`} aria-label="Chat">
      <button type="button" className="pointer-events-auto btn btn-xs mb-1" aria-expanded={visible}
        onClick={(event) => { useChatStore.getState().toggleVisible(); event.currentTarget.blur(); }}
        onKeyDown={(event) => { if (!visible && event.key === "Enter") { event.preventDefault(); event.stopPropagation(); } }}>
        {visible ? "Hide Chat" : "Show Chat"}
      </button>
      {visible && <>

      <div ref={log} className="h-32 overflow-y-auto break-words" role="log" aria-live="polite">
        <div ref={content}>
        {messages.map((message) => <p key={message._id} className={message.channel === "whisper" ? "text-violet-300" : message.channel === "party" ? "text-green-300" : "text-white"}>
          <span className="font-semibold capitalize">[{message.channel === "room" ? roomLabel : message.channel}] {message.senderName}{message.recipientName ? ` → ${message.recipientName}` : ""}: </span>{message.text}
        </p>)}
        {error && <p className="text-yellow-300">{error}</p>}
        </div>
      </div>
      {open ? <form className="mt-1 flex gap-1" onSubmit={(event) => { event.preventDefault(); useChatStore.getState().send(); input.current?.focus(); }}>
        <input ref={input} className="input input-sm min-w-0 flex-1 text-base-content" aria-label="Chat message" placeholder="Message or /command" maxLength={500}
          value={draft} onChange={(event) => useChatStore.getState().setDraft(event.target.value)}
          onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Escape") { useChatStore.getState().close(); input.current?.blur(); } }} />
        <button type="submit" className="btn btn-sm">Send</button>
      </form> : <button type="button" className="mt-1 text-white/70" onClick={() => useChatStore.getState().show()}>Chat · Enter</button>}
      </>}
    </section>
  );
};
