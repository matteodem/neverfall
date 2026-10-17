import React, { useEffect, useRef, useState } from "react";
import { createWorldEditorAssetPreview } from "../../game/editor/createWorldEditorAssetPreview";
import { getWorldEditorAsset } from "../../game/editor/worldEditorAssets";

export const WorldEditorAssetPreview = ({ assetId }) => {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    try {
      previewRef.current = createWorldEditorAssetPreview(canvasRef.current, { onLoading: setLoading, onError: setError });
    } catch {
      setLoading(false);
      setError("3D preview is unavailable.");
    }
    return () => { previewRef.current?.dispose(); previewRef.current = null; };
  }, []);
  useEffect(() => { void previewRef.current?.setAsset(assetId); }, [assetId]);
  return (
    <div className="relative overflow-hidden rounded-lg bg-base-200">
      <canvas ref={canvasRef} className="pointer-events-none block h-32 w-full" role="img"
        aria-label={`${getWorldEditorAsset(assetId)?.name || "Asset"} 3D preview`} />
      {loading && <div className="pointer-events-none absolute inset-0 flex items-center justify-center" role="status">
        <span className="loading loading-spinner loading-sm" aria-label="Loading preview" />
      </div>}
      {error && <p role="alert" className="absolute inset-0 flex items-center justify-center p-3 text-xs text-error">{error}</p>}
    </div>
  );
};
