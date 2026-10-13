import React from "react";
import { useNextStep } from "nextstepjs";
import { ONBOARDING_TOUR } from "../../OnboardingTour";
import { useHudStore } from "../../stores/useHudStore";
import { FantasyBadge, FantasyButton, FantasyHudCard, FantasyPanel, FantasySectionHeader } from "../fantasy/FantasyUI";

import {
  HudModal,
} from "../HudModal";

const KEYBOARD_CONTROLS = [
  ["WASD", "Move"],
  ["1–4", "Use skills"],
  ["V", "Mount / Dismount"],
  ["F", "Loot"],
  ["I", "Toggle Inventory"],
  ["C", "Toggle Crafting"],
  ["G", "Toggle Gear"],
  ["Q", "Toggle Quests"],
  ["Z", "Toggle Achievements"],
  ["T", "Toggle Talents"],
  ["O", "Toggle Skills"],
  ["E", "Toggle Guild"],
  ["M", "Toggle Map"],
  ["U", "Toggle Help"],
  ["P", "Toggle UI"],
];

export const HelpModal = () => {
  const { startNextStep } = useNextStep();
  const closeModal = useHudStore((state) => state.closeModal);
  const openModal = useHudStore((state) => state.openModal);

  return (
    <HudModal
      id="help"
      title="Help"
    >
      <FantasyButton
        type="button"
        className="btn-sm"
        onClick={() => {
          closeModal("help");
          startNextStep(ONBOARDING_TOUR);
        }}
      >
        Replay Onboarding
      </FantasyButton>

      <FantasySectionHeader>
        Keyboard Controls
      </FantasySectionHeader>

      <FantasyPanel className="mt-2 overflow-x-auto max-h-[300px] overflow-y-auto">
        <table className="help-controls table table-zebra table-sm">
          <thead>
            <tr><th scope="col">Key</th><th scope="col">Action</th></tr>
          </thead>
          <tbody>
            {KEYBOARD_CONTROLS.map(([key, action]) => (
              <tr key={key}>
                <th scope="row"><kbd className="kbd kbd-sm">{key}</kbd></th>
                <td>{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </FantasyPanel>

      <FantasySectionHeader>
        Current Version
      </FantasySectionHeader>

      <FantasyHudCard className="mt-2">
        <FantasyBadge tone="magic">v0.16.0-alpha</FantasyBadge>
      </FantasyHudCard>

      <FantasySectionHeader>
        How To Support This Project
      </FantasySectionHeader>

      <div className="mt-2">
        Like Neverfall? Feel free to support me: <br />

        <div className="flex gap-4">
          <a target="_blank" className="btn mt-2 btn-soft btn-primary" href="https://patreon.com/MatteoDeMicheli">Patreon</a>
          {/* <a target="_blank" className="btn mt-2 btn-soft btn-secondary" href="">Buy Me a Coffee</a>*/}
        </div>
      </div>

      <FantasySectionHeader>
        Recommend features or report a bug
      </FantasySectionHeader>

      <div className="mt-2">
        <FantasyButton className="mb-3" onClick={() => {
          closeModal("help");
          openModal("feedback");
        }}>
          Give Feedback
        </FantasyButton>
        <br />
        Check out the github repository: <br />

        <div className="flex gap-4">
          <a target="_blank" className="btn mt-2 btn-soft btn-secondary" href="https://github.com/matteodem/neverfall">Github Repository</a>
        </div>       
      </div>
    </HudModal>
  );
};
