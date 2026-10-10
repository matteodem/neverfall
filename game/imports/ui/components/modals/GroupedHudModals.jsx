import React from "react";
import { useHudStore } from "../../stores/useHudStore";
import { useMobileDevice } from "../../hooks/useMobileDevice";
import { HudModal } from "../HudModal";
import { InventoryModal } from "./InventoryModal";
import { CraftingModal } from "./CraftingModal";
import { CraftingIngredientsModal } from "./CraftingIngredientsModal";
import { GearModal } from "./GearModal";
import { QuestsModal } from "./QuestsModal";
import { AchievementModal } from "./AchievementModal";
import { SkillsModal } from "./SkillsModal";
import { TalentsModal } from "./TalentsModal";

const SECTIONS = {
  items: {
    inventory: { label: "Inventory", Content: InventoryModal },
    crafting: { label: "Crafting", Content: CraftingModal },
  },
  hero: {
    gear: { label: "Gear", Content: GearModal },
    quests: { label: "Quests", Content: QuestsModal },
    achievements: { label: "Achievements", Content: AchievementModal },
    skills: { label: "Skills", Content: SkillsModal },
    talents: { label: "Talents", Content: TalentsModal },
  },
};

const GroupedHudModal = ({ id, title }) => {
  const { mobile } = useMobileDevice();
  const open = useHudStore((state) => state.openModals.includes(id));
  const tab = useHudStore((state) => state.tabs[id]);
  const setTab = useHudStore((state) => state.setTab);
  const sections = SECTIONS[id];
  const Content = sections[tab].Content;

  return (
    <>
    <HudModal id={id} title={title} width={600} maxHeight={750} scrollable={mobile || (tab !== "inventory" && tab !== "gear")}>
      <div role="tablist" aria-label={`${title} sections`} className="tabs tabs-border mb-4 flex-nowrap overflow-x-auto">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`tab whitespace-nowrap ${mobile ? "text-sm" : ""} ${tab === key ? "tab-active font-semibold" : ""}`}
            onClick={() => setTab(id, key)}
          >
            {section.label}
          </button>
        ))}
      </div>
      {open && <Content embedded />}
    </HudModal>
    {id === "items" && open && tab === "crafting" && <CraftingIngredientsModal />}
    </>
  );
};

export const ItemsModal = () => <GroupedHudModal id="items" title="Items" />;
export const HeroModal = () => <GroupedHudModal id="hero" title="Hero" />;
