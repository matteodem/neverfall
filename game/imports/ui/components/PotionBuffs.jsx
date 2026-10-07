import React from "react";
import { CONSUMABLES } from "../../game/consumables";
import { STATUS_EFFECTS } from "../../game/statusEffects";
import { Icon } from "./Icon";

const BUFFS = [
  { key: "speedPotionUntil", itemId: "speed_potion", icon: "locationArrow", color: "text-green-400" },
  { key: "powerPotionUntil", itemId: "power_potion", icon: "sword", color: "text-purple-400" },
];

export const PotionBuffs = ({ buffs, isDead, mobile = false }) => {
  if (isDead) return null;

  const now = Date.now();
  const active = BUFFS.filter(({ key }) => buffs?.[key] > now)
    .map(({ key, itemId, icon, color }) => ({ key, icon, color, ...CONSUMABLES[itemId] }));
  for (const { id, expiresAt } of buffs?.statusEffects || []) {
    if (expiresAt > now && Object.hasOwn(STATUS_EFFECTS, id)) {
      active.push({ key: id, ...STATUS_EFFECTS[id] });
    }
  }
  if (!active.length) return null;

  return (
    <div className={mobile
      ? "absolute bottom-full left-0 mb-1 flex max-w-full flex-wrap items-center gap-1"
      : "absolute left-full top-[16px] ml-2 flex -translate-y-1/2 items-center gap-1"} aria-label="Active effects">
      {active.map(({ key, name, description, icon, color }) => {
        const label = `${name}: ${description}`;
        return (
          <span
            key={key}
            tabIndex={0}
            role="img"
            aria-label={label}
            className={`tooltip tooltip-top flex h-8 w-8 items-center justify-center rounded border border-white/20 bg-black/70 ${color}`}
            data-tip={label}
          >
            <Icon icon={icon} className="h-4 w-4" />
          </span>
        );
      })}
    </div>
  );
};
