import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Characters } from "../../api/characters/characters";
import { ITEM_NAMES, stackItems } from "../../game/inventory";

export const ItemReceivedToast = () => {
  const character = useTracker(() => {
    const id = Meteor.user()?.profile?.currentCharacterId;
    return id ? Characters.findOne(id) : null;
  });
  const previous = useRef(null);
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    const before = previous.current;
    previous.current = character;
    if (!character || before?._id !== character._id) {
      setNotice(null);
      return;
    }
    // Include equipped copies so Equip / Unequip does not look like receiving loot.
    const counts = (value) => new Map(stackItems([
      ...(value.inventory?.items || []),
      ...Object.values(value.equipment || {}).filter(Boolean).map((id) => ({ id })),
    ], true).map(({ id, count }) => [id, count]));
    const old = counts(before);
    const received = [...counts(character)].filter(([id, count]) => count > (old.get(id) || 0))
      .map(([id, count]) => `${ITEM_NAMES[id] || id} ×${count - (old.get(id) || 0)}`);
    if (received.length) setNotice({ characterId: character._id, text: received.join(" · ") });
  }, [character]);
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timeout);
  }, [notice]);
  if (!notice || notice.characterId !== character?._id) return null;
  return <div className="pointer-events-none fixed inset-x-0 bottom-[20dvh] z-[30050] flex justify-center px-4" role="status" aria-live="polite">
    <div className="max-w-sm rounded-box bg-black/80 px-4 py-2 text-center text-sm text-yellow-200">
      Received: {notice.text}
    </div>
  </div>;
};
