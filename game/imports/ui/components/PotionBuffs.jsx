import React from "react";
import { CONSUMABLES } from "../../game/consumables";
import { Icon } from "./Icon";

const BUFFS = [
  { key: "speedPotionUntil", itemId: "speed_potion", icon: "locationArrow", color: "text-green-400" },
  { key: "powerPotionUntil", itemId: "power_potion", icon: "sword", color: "text-purple-400" },
];

export const PotionBuffs = ({ buffs, isDead }) => {
  if (isDead) return null;

  const active = BUFFS.filter(({ key }) => buffs?.[key] > Date.now());
  if (!active.length) return null;

  return (
    <div className="absolute left-full top-1/2 ml-2 flex -translate-y-1/2 items-center gap-1 top-[16px]" aria-label="Active potion effects">
      {active.map(({ key, itemId, icon, color }) => {
        const item = CONSUMABLES[itemId];
        const label = `${item.name}: ${item.description}`;
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
