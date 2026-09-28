import React from "react";

import {
  HudModal,
} from "../HudModal";

export const HelpModal = () => {
  return (
    <HudModal
      id="help"
      title="Help"
    >
      <p className="mt-2 text-lg font-bold">
        Keyboard Controls
      </p>

      <div className="mt-2">
        <ul>
          <li>WASD to move.</li>
          <li>1 to 4 to use skills.</li>
          <li>V to Mount / Dismount.</li>
          <li>F to Loot.</li>
        </ul>
      </div>

      <p className="mt-2 text-lg font-bold">
        Current Version
      </p>

      <div className="mt-2">
        v0.6
      </div>

      <p className="mt-5 text-lg font-bold">
        How To Support This Project
      </p>

      <div className="mt-2">
        Like Neverfall? Feel free to support me or report an issue / bug: <br />

        <div className="flex gap-4">
          <a target="_blank" className="btn mt-2 btn-soft btn-primary" href="https://patreon.com/MatteoDeMicheli">Patreon</a>
          {/* <a target="_blank" className="btn mt-2 btn-soft btn-secondary" href="">Buy Me a Coffee</a>*/}
          <a target="_blank" className="btn mt-2 btn-soft btn-secondary" href="https://github.com/matteodem/neverfall">Github Repository</a>
        </div>       
      </div>
    </HudModal>
  );
};