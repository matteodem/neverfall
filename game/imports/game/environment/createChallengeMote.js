import { Color3, GlowLayer, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import { QUALITY_PRESETS } from "../performanceConfig";
import { createNameplate } from "../nameplate";

export const createChallengeMote = (scene, { position }) => {
  const orb = MeshBuilder.CreateSphere("challengeMote", { diameter: 0.8, segments: 8 }, scene);
  orb.position.set(position.x, position.y, position.z);
  orb.isPickable = false;
  const material = new StandardMaterial("challengeMoteMaterial", scene);
  material.disableLighting = true;
  const orange = Color3.FromHexString("#ff8a24");
  material.emissiveColor = orange;
  orb.material = material;
  const quality = scene.metadata?.quality || QUALITY_PRESETS.standard;
  const glow = new GlowLayer("challengeMoteGlow", scene, { mainTextureFixedSize: quality.glowTextureSize });
  glow.addIncludedOnlyMesh(orb);
  const nameplate = createNameplate({ scene, player: orb, name: "Challenge Mote", color: "#ffb366", y: 0.9 });
  let enabled;
  let locked;
  const setState = (nextEnabled, nextLocked) => {
    if (enabled === nextEnabled && locked === nextLocked) return;
    enabled = nextEnabled;
    locked = nextLocked;
    glow.intensity = enabled ? 1.4 : 0.45;
    material.emissiveColor = orange.scale(enabled ? 1 : 0.55);
    nameplate.setName(`Challenge Mode ${enabled ? "ON" : "OFF"}${locked ? " · Locked" : ""}`);
  };
  setState(false, false);
  scene.onDisposeObservable.addOnce(() => {
    nameplate.destroy();
    glow.dispose();
    orb.dispose();
    material.dispose();
  });
  return { setState };
};
