import { Color3, PointLight, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import { getWorldHeight } from "../worldConfig";

const ASSETS = ["tent", "campfire", "logBench", "campingPot", "flashlight"];
const CAMP_SCALE = 1.8;

const CENTRAL_PROPS = [
  ["campfire", 1.5, 0.5, 0, 4],
  ["tent", -8.5, -2, 0.35, 1.45],
  ["tent", 10.9, -2.3, -0.45, 1.4],
  ["logBench", -2.7, 2.1, 0.4, 1.7],
  ["logBench", 3.5, 2.4, -0.5, 1.7],
  ["campingPot", 4.2, -0.5, 0, 1.2],
  ["flashlight", 5.2, -0.2, 0.2, 1.8],
];

const NORTHERN_PROPS = [
  ["campfire", -9, -5, 0, 3.5],
  ["tent", -12, 5, 0.7, 1.3],
  ["tent", 12, 6, -0.8, 1.3],
  ["logBench", -11, -1, 0.5, 1.6],
  ["campingPot", -6, -3.5, 0, 1.1],
  ["flashlight", -12, 2.5, 0, 1.8],
];

export const loadCampAssets = async (scene) => {
  const loaded = await Promise.allSettled(ASSETS.map((name) =>
    SceneLoader.LoadAssetContainerAsync("/models/camp/", `${name}.glb`, scene)));
  const containers = new Map();
  loaded.forEach((result, index) => {
    if (result.status === "fulfilled") containers.set(ASSETS[index], result.value);
    else console.warn(`[Camp] Could not load ${ASSETS[index]}.glb`, result.reason);
  });
  scene.onDisposeObservable.addOnce(() => {
    for (const container of containers.values()) container.dispose();
  });

  const place = (root, name, x, z, rotation, scale) => {
    const container = containers.get(name);
    if (!container) return;
    const entries = container.instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
    const prop = new TransformNode(`camp-${name}`, scene);
    const model = new TransformNode(`camp-${name}-model`, scene);
    model.parent = prop;
    for (const node of entries.rootNodes) node.parent = model;

    let minX = Infinity; let maxX = -Infinity;
    let minY = Infinity; let minZ = Infinity; let maxZ = -Infinity;
    for (const mesh of prop.getChildMeshes()) {
      if (name === "tent" && (mesh.material?.name || mesh.sourceMesh?.material?.name) === "tent_tarp") {
        mesh.dispose();
        continue;
      }
      if (!(mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices())) continue;
      mesh.computeWorldMatrix(true);
      const bounds = mesh.getBoundingInfo().boundingBox;
      minX = Math.min(minX, bounds.minimumWorld.x);
      maxX = Math.max(maxX, bounds.maximumWorld.x);
      minY = Math.min(minY, bounds.minimumWorld.y);
      minZ = Math.min(minZ, bounds.minimumWorld.z);
      maxZ = Math.max(maxZ, bounds.maximumWorld.z);
      mesh.isPickable = false;
      mesh.checkCollisions = false;
      mesh.receiveShadows = true;
    }
    if (Number.isFinite(minY))
      model.position.set(-(minX + maxX) / 2, -minY, -(minZ + maxZ) / 2);
    prop.parent = root;
    prop.position.set(x, getWorldHeight(root.position.x + x, root.position.z + z) + 0.035, z);
    prop.rotation.y = rotation;
    prop.scaling.setAll(scale * CAMP_SCALE);
  };

  const createCamp = ({ center, rugged = false }) => {
    const root = new TransformNode(rugged ? "northernCamp" : "clearingCamp", scene);
    root.position.copyFrom(center);
    const props = rugged ? NORTHERN_PROPS : CENTRAL_PROPS;
    const offsetScale = rugged ? 0.85 : 1;
    for (const [name, x, z, rotation, scale] of props)
      place(root, name, x * offsetScale, z * offsetScale, rotation, scale);

    const fire = props[0];
    const fireX = fire[1] * offsetScale;
    const fireZ = fire[2] * offsetScale;
    const fireHeight = getWorldHeight(center.x + fireX, center.z + fireZ);
    const light = new PointLight("campfireLight", new Vector3(fireX, fireHeight + 1.2 * CAMP_SCALE, fireZ), scene);
    light.parent = root;
    light.diffuse = Color3.FromHexString("#FFB347");
    light.range = 14;
    let elapsed = 0;
    const observer = scene.onBeforeRenderObservable.add(() => {
      light.setEnabled(root.isEnabled());
      if (!root.isEnabled()) return;
      elapsed += scene.getEngine().getDeltaTime();
      light.intensity = 0.8 + Math.sin(elapsed * 0.008) * 0.12 + Math.sin(elapsed * 0.021) * 0.06;
    });
    scene.onDisposeObservable.addOnce(() => scene.onBeforeRenderObservable.remove(observer));
    for (const mesh of root.getChildMeshes()) mesh.freezeWorldMatrix();
    return root;
  };

  return { available: containers.has("tent") && containers.has("campfire"), createCamp };
};
