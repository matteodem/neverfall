import React from "react";
import { useMobileDevice } from "../hooks/useMobileDevice";
import { FantasyPanel } from "./fantasy/FantasyUI";

export const PortraitOverlay = () => {
  const { mobile } = useMobileDevice();
  return (
    <div className={`portrait-overlay fantasy-ui ${mobile ? "is-mobile" : ""}`} role="status">
      <FantasyPanel className="fantasy-portrait-message">
        <p className="text-lg font-bold">Please turn phone sideways</p>
      </FantasyPanel>
    </div>
  );
};
