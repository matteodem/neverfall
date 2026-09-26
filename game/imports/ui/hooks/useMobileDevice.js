import { useEffect, useState } from "react";

export const getDevice = () => {
  const touch = navigator.maxTouchPoints > 0;
  const mobile = navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && touch)
    || (touch && window.matchMedia("(pointer: coarse)").matches);
  return { mobile: Boolean(mobile), portrait: window.innerHeight > window.innerWidth };
};

export const useMobileDevice = () => {
  const [device, setDevice] = useState(getDevice);
  useEffect(() => {
    const update = () => setDevice(getDevice());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return device;
};
