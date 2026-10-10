// Run from any directory: node tools/generate-amir-catalog.cjs [--check]
// Keep server validation and creator options in sync without loading Babylon on the server.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const modelFile = "Modular Character Plus.glb";
const data = fs.readFileSync(path.join(root, "game/public/models/characters/amir", modelFile));
if (data.readUInt32LE(0) !== 0x46546c67 || data.readUInt32LE(4) !== 2 || data.readUInt32LE(16) !== 0x4e4f534a) {
  throw new Error("Expected a glTF 2 GLB with a JSON chunk");
}
const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString("utf8"));
const parents = new Map();
gltf.nodes.forEach((node, index) => (node.children || []).forEach((child) => parents.set(child, index)));
const required = ["head", "torso", "arms", "hands", "legs", "feet"];
const options = Object.fromEntries([...required, "hair", "hat", "glasses", "mask", "leftHand", "rightHand", "back"]
  .map((slot) => [slot, required.includes(slot) ? [] : [null]]));
const rejected = [];
for (const [index, node] of gltf.nodes.entries()) {
  if (node.mesh === undefined) continue;
  const parent = gltf.nodes[parents.get(index)]?.name;
  const prefix = node.name?.split("-")[0];
  const primitives = gltf.meshes[node.mesh].primitives;
  let slot;
  if (required.includes(prefix) && node.skin === 0 && primitives.every((part) =>
    part.attributes.JOINTS_0 !== undefined && part.attributes.WEIGHTS_0 !== undefined)) slot = prefix;
  else if (["hair", "hat", "glasses", "mask"].includes(prefix) && parent === "Head") slot = prefix;
  else if (node.name?.endsWith(".col")) slot = { LeftHand: "leftHand", RightHand: "rightHand", Spine2: "back" }[parent];
  if (!slot || primitives.length !== 1 || options[slot].includes(node.name)) rejected.push(node.name);
  else options[slot].push(node.name);
}
if (rejected.length) throw new Error(`Review incompatible/unclassified meshes: ${rejected.join(", ")}`);
if (gltf.skins.length !== 1 || required.some((slot) => !options[slot].length)) throw new Error("Missing rig or body slots");
for (const values of Object.values(options)) values.sort((a, b) =>
  a === null ? -1 : b === null ? 1 : a.localeCompare(b, "en", { numeric: true }));
const output = `${JSON.stringify({ modelFile, options }, null, 2)}\n`;
const destination = path.join(root, "game/imports/game/character/amir/catalog.json");
if (process.argv.includes("--check")) {
  if (fs.readFileSync(destination, "utf8") !== output) throw new Error("Amir catalog is stale; regenerate it");
} else fs.writeFileSync(destination, output);
console.log(`Amir catalog: ${gltf.meshes.length} meshes; ${Object.entries(options).map(([slot, values]) =>
  `${slot}=${values.filter(Boolean).length}`).join(", ")}`);
