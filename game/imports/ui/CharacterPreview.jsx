import React, { useEffect, useRef, useState } from "react";
import { normalizeAmirAppearance } from "../game/character/amir/appearance";
import { createAmirCharacterPreview } from "../game/character/amir/createAmirCharacterPreview";

export const CharacterPreview = ({ appearance }) => {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appearanceKey = JSON.stringify(normalizeAmirAppearance(appearance));

  useEffect(() => {
    const preview = createAmirCharacterPreview(canvasRef.current, { onLoading: setLoading, onError: setError });
    previewRef.current = preview;
    return () => {
      previewRef.current = null;
      preview.dispose();
    };
  }, []);

  useEffect(() => {
    // Coalesce rapid selector changes without rebuilding the engine or losing drag rotation.
    setLoading(true);
    const timeout = setTimeout(() => previewRef.current?.setAppearance(JSON.parse(appearanceKey)), 120);
    return () => clearTimeout(timeout);
  }, [appearanceKey]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} aria-label="Character appearance preview"
        className="block h-full w-full touch-none cursor-grab outline-none active:cursor-grabbing" />
      {(loading || error) && <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 text-center">
        <span className="text-sm font-medium text-white/70" role={error ? "alert" : "status"}>
          {error || "Loading character..."}
        </span>
      </div>}
    </div>
  );
};
