import React from "react";
import { useNextStep } from "nextstepjs";
import { ONBOARDING_TOUR } from "../../OnboardingTour";
import { useHudStore } from "../../stores/useHudStore";

import {
  HudModal,
} from "../HudModal";

const KEYBOARD_CONTROLS = [
  ["WASD", "Move"],
  ["1–4", "Use skills"],
  ["V", "Mount / Dismount"],
  ["F", "Loot"],
  ["I", "Toggle Inventory"],
  ["B", "Toggle Shop"],
  ["G", "Toggle Gear"],
  ["Q", "Toggle Quests"],
  ["H", "Toggle Hunts"],
  ["Z", "Toggle Achievements"],
  ["T", "Toggle Talents"],
  ["M", "Toggle Map"],
  ["P", "Toggle UI"],
];

export const HelpModal = () => {
  const { startNextStep } = useNextStep();
  const closeModal = useHudStore((state) => state.closeModal);

  return (
    <HudModal
      id="help"
      title="Help"
    >
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => {
          closeModal("help");
          startNextStep(ONBOARDING_TOUR);
        }}
      >
        Replay Onboarding
      </button>

      <p className="mt-2 text-lg font-bold">
        Keyboard Controls
      </p>

      <div className="mt-2 overflow-x-auto">
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
      </div>

      <p className="mt-2 text-lg font-bold">
        Current Version
      </p>

      <div className="mt-2">
        v0.8.0-alpha
      </div>

      <p className="mt-5 text-lg font-bold">
        How To Support This Project
      </p>

      <div className="mt-2">
        Like Neverfall? Feel free to support me: <br />

        <div className="flex gap-4">
          <a target="_blank" className="btn mt-2 btn-soft btn-primary" href="https://patreon.com/MatteoDeMicheli">Patreon</a>
          {/* <a target="_blank" className="btn mt-2 btn-soft btn-secondary" href="">Buy Me a Coffee</a>*/}
        </div>
      </div>

      <p className="mt-5 text-lg font-bold">
        Recommend features or report a bug
      </p>

      <div className="mt-2">
        Check out the github repository: <br />

        <div className="flex gap-4">
          <a target="_blank" className="btn mt-2 btn-soft btn-secondary" href="https://github.com/matteodem/neverfall">Github Repository</a>
        </div>       
      </div>
    </HudModal>
  );
};
