// Shared by the editor UI, loaders and server validation. Saved objects store IDs only.
export const WORLD_EDITOR_ASSETS = {
  fence: {
    name: "Wooden Fence", path: "/models/environment/fence.glb", category: "Structures", scale: 1.98,
  },
  rock_1: {
    name: "Forest Rock", path: "/models/environment/rock_1.glb", category: "Nature", scale: 0.65,
  },
  bush_1: {
    name: "Leafy Bush", path: "/models/environment/bush_1.glb", category: "Nature", scale: 0.8,
  },
};

export const getWorldEditorAsset = (assetId) => typeof assetId === "string" &&
  Object.hasOwn(WORLD_EDITOR_ASSETS, assetId) ? WORLD_EDITOR_ASSETS[assetId] : null;
