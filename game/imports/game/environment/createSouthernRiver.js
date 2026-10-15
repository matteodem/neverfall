import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import { SOUTHERN_RIVER as RIVER } from "./terrainConfig";
import { getRiverCenterZ } from "./terrainHeight";
import { WORLD_PALETTE as PALETTE } from "./worldPalette";

export const createSouthernRiver = (scene) => {
  const start = RIVER.path[0].x, end = RIVER.path[RIVER.path.length - 1].x;
  const segments = Math.ceil((end - start) / RIVER.sampleSpacing);
  const edges = [[], []];
  for (let index = 0; index <= segments; index++) {
    const x = start + (end - start) * index / segments;
    const z = getRiverCenterZ(x);
    // Extend beneath the banks; the carved ground clips the shoreline naturally.
    const extent = RIVER.width / 2 + RIVER.bankWidth;
    edges[0].push(new Vector3(x, RIVER.waterLevel, z + extent));
    edges[1].push(new Vector3(x, RIVER.waterLevel, z - extent));
  }
  const water = MeshBuilder.CreateRibbon("southern-river", { pathArray: edges }, scene);
  const material = new StandardMaterial("southern-river-water", scene);
  material.diffuseColor = Color3.FromHexString(PALETTE.water);
  material.specularColor = Color3.FromHexString(PALETTE.waterHighlight);
  material.specularPower = 32;
  material.backFaceCulling = false;
  water.material = material;
  water.isPickable = false;
  water.checkCollisions = false;
  water.receiveShadows = true;
  water.metadata = { worldShadows: { cast: false, receive: true } };
  water.freezeWorldMatrix();
  return water;
};
