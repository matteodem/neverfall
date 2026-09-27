import React from "react";
import { useMobileDevice } from "../hooks/useMobileDevice";

export const PortraitOverlay = () => {
  const { mobile } = useMobileDevice();
  return (
    <div className={`portrait-overlay ${mobile ? "is-mobile" : ""}`} role="status">
      <p className="text-2xl font-bold">Please turn phone sideways</p>
    </div>
  );
};
