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
          <li>1 to 4 to do actions.</li>
        </ul>
      </div>

      <p className="mt-5 text-lg font-bold">
        How To Support This Project
      </p>

      <div className="mt-2">
        Feel free to support me: <br />

        <div className="flex gap-4">
          <a className="btn mt-2 btn-soft btn-primary" href="">Patreon</a>
          <a className="btn mt-2 btn-soft btn-secondary" href="">Buy Me a Coffee</a>
          <a className="btn mt-2 btn-soft btn-secondary" href="">Github Repository</a>
        </div>       
      </div>
    </HudModal>
  );
};