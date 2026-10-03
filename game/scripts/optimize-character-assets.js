// Run with npm run optimize-character-assets. Requires gltf-transform 4.x on PATH.
// Keep the source pack untouched; each modular part stays independently loadable.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const pack = path.resolve(__dirname, "../public/models/characters/quaternius-fantasy");
const sourceDir = path.join(pack, "Modular Character Outfits - Fantasy[Standard]", "Exports", "glTF (Godot-Unreal)", "Modular Parts");
const outputDir = path.join(pack, "optimized", "modular-parts");
const componentBytes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const componentCounts = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

const readAsset = (file) => {
  const bytes = fs.readFileSync(file);
  if (file.endsWith(".gltf")) {
    const json = JSON.parse(bytes.toString("utf8"));
    return { json, buffers: (json.buffers || []).map((buffer) => fs.readFileSync(path.join(path.dirname(file), decodeURIComponent(buffer.uri)))) };
  }
  let offset = 12;
  let json;
  let binary;
  while (offset < bytes.length) {
    const length = bytes.readUInt32LE(offset);
    const type = bytes.readUInt32LE(offset + 4);
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8"));
    if (type === 0x004e4942) binary = chunk;
    offset += length + 8;
  }
  if (!json || !binary) throw new Error(`Invalid GLB: ${file}`);
  return { json, buffers: [binary] };
};

const accessorHash = (asset, index) => {
  if (index === undefined) return null;
  const { json, buffers } = asset;
  const accessor = json.accessors[index];
  if (accessor.sparse) throw new Error("Sparse rig/geometry accessor is unsupported by this safety check");
  const view = json.bufferViews[accessor.bufferView];
  const size = componentBytes[accessor.componentType] * componentCounts[accessor.type];
  const stride = view.byteStride || size;
  const start = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const hash = crypto.createHash("sha256");
  hash.update(`${accessor.componentType}:${accessor.type}:${accessor.count}:${Boolean(accessor.normalized)}:`);
  for (let i = 0; i < accessor.count; i++)
    hash.update(buffers[view.buffer].subarray(start + i * stride, start + i * stride + size));
  return hash.digest("hex");
};

const signature = (asset) => {
  const g = asset.json;
  const nodes = g.nodes || [];
  const nodeName = (index) => nodes[index]?.name || `#${index}`;
  return JSON.stringify({
    nodes: nodes.map((node) => ({
      name: node.name, translation: node.translation, rotation: node.rotation, scale: node.scale,
      children: (node.children || []).map(nodeName).sort(), mesh: node.mesh === undefined ? null : g.meshes[node.mesh].name,
      skin: node.skin ?? null,
    })).sort((a, b) => a.name.localeCompare(b.name)),
    scenes: (g.scenes || []).map((scene) => (scene.nodes || []).map(nodeName).sort()),
    skins: (g.skins || []).map((skin) => ({
      name: skin.name, skeleton: nodeName(skin.skeleton), joints: skin.joints.map(nodeName),
      inverseBindMatrices: accessorHash(asset, skin.inverseBindMatrices),
    })),
    meshes: (g.meshes || []).map((mesh) => ({
      name: mesh.name,
      primitives: mesh.primitives.map((primitive) => ({
        material: primitive.material === undefined ? null : g.materials[primitive.material].name,
        indices: accessorHash(asset, primitive.indices),
        attributes: Object.fromEntries(Object.entries(primitive.attributes).sort().map(([name, index]) => [name, accessorHash(asset, index)])),
      })),
    })),
    materials: (g.materials || []).map((material) => material.name),
    animations: (g.animations || []).map((animation) => ({
      name: animation.name,
      samplers: animation.samplers.map((sampler) => ({
        input: accessorHash(asset, sampler.input), output: accessorHash(asset, sampler.output), interpolation: sampler.interpolation || "LINEAR",
      })),
      channels: animation.channels.map((channel) => ({ sampler: channel.sampler, node: nodeName(channel.target.node), path: channel.target.path })),
    })),
  });
};

const imageBytes = (asset, image, baseDir) => image.uri
  ? fs.readFileSync(path.join(baseDir, decodeURIComponent(image.uri)))
  : asset.buffers[asset.json.bufferViews[image.bufferView].buffer].subarray(
    asset.json.bufferViews[image.bufferView].byteOffset || 0,
    (asset.json.bufferViews[image.bufferView].byteOffset || 0) + asset.json.bufferViews[image.bufferView].byteLength
  );

const dimensions = (bytes) => {
  if (bytes.subarray(1, 4).toString() !== "PNG") throw new Error("Expected PNG character textures");
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
};

// glTF Transform omits near-identity bone scales on write. Restore source TRS
// verbatim in the GLB JSON chunk so modular bind poses stay exactly unchanged.
const restoreNodeTransforms = (source, file) => {
  const glb = fs.readFileSync(file);
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString("utf8"));
  if (json.nodes.length !== source.json.nodes.length) throw new Error("Node count changed");
  json.nodes.forEach((node, index) => {
    const original = source.json.nodes[index];
    if (node.name !== original.name) throw new Error(`Node order changed: ${original.name}`);
    for (const key of ["translation", "rotation", "scale", "matrix"]) {
      if (key in original) node[key] = original[key];
      else delete node[key];
    }
  });
  const encoded = Buffer.from(JSON.stringify(json));
  const paddedLength = Math.ceil(encoded.length / 4) * 4;
  const remainder = glb.subarray(20 + jsonLength);
  const rebuilt = Buffer.alloc(20 + paddedLength + remainder.length, 0x20);
  glb.copy(rebuilt, 0, 0, 12);
  rebuilt.writeUInt32LE(rebuilt.length, 8);
  rebuilt.writeUInt32LE(paddedLength, 12);
  rebuilt.writeUInt32LE(0x4e4f534a, 16);
  encoded.copy(rebuilt, 20);
  remainder.copy(rebuilt, 20 + paddedLength);
  fs.writeFileSync(file, rebuilt);
};

const run = () => {
  try { execFileSync("gltf-transform", ["--version"], { stdio: "ignore" }); }
  catch { throw new Error("Install gltf-transform 4.x on PATH before running this command"); }

  const selected = new Set(process.argv.slice(2));
  const files = fs.readdirSync(sourceDir).filter((name) => name.endsWith(".gltf") && (!selected.size || selected.has(name))).sort();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "neverfall-characters-"));
  const textures = new Map();
  const sourceFiles = new Set();
  let outputBytes = 0;
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    for (const name of files) {
      const input = path.join(sourceDir, name);
      const source = readAsset(input);
      sourceFiles.add(input);
      for (const buffer of source.json.buffers || []) sourceFiles.add(path.join(sourceDir, decodeURIComponent(buffer.uri)));
      const resized = path.join(tempDir, `${name}.glb`);
      const optimized = path.join(tempDir, `${name}.dedup.glb`);
      execFileSync("gltf-transform", ["resize", input, resized, "--width", "512", "--height", "512"], { stdio: "pipe" });
      // Lossless accessor deduplication only. Do not simplify, quantize, merge meshes, or alter skins.
      execFileSync("gltf-transform", ["dedup", resized, optimized, "--meshes", "false", "--skins", "false", "--materials", "false", "--textures", "false"], { stdio: "pipe" });
      restoreNodeTransforms(source, optimized);
      const result = readAsset(optimized);
      const before = JSON.parse(signature(source));
      const after = JSON.parse(signature(result));
      for (const section of Object.keys(before)) {
        if (JSON.stringify(before[section]) === JSON.stringify(after[section])) continue;
        const index = before[section].findIndex((entry, i) => JSON.stringify(entry) !== JSON.stringify(after[section][i]));
        throw new Error(`${section}[${index}] changed during conversion: ${name}\n${JSON.stringify(before[section][index])}\n${JSON.stringify(after[section][index])}`);
      }
      const sourceImages = source.json.images || [];
      const resultImages = result.json.images || [];
      if (sourceImages.length !== resultImages.length) throw new Error(`Texture count changed: ${name}`);
      sourceImages.forEach((image, index) => {
        const original = imageBytes(source, image, sourceDir);
        const converted = imageBytes(result, resultImages[index], outputDir);
        const originalSize = dimensions(original);
        const convertedSize = dimensions(converted);
        if (converted.readUInt32BE(16) > 512 || converted.readUInt32BE(20) > 512)
          throw new Error(`Oversized texture in ${name}: ${image.uri}`);
        sourceFiles.add(path.join(sourceDir, decodeURIComponent(image.uri)));
        textures.set(image.uri, { originalSize, originalBytes: original.length, convertedSize, convertedBytes: converted.length });
      });
      const destination = path.join(outputDir, name.replace(/\.gltf$/, ".glb"));
      fs.copyFileSync(optimized, destination);
      const bytes = fs.statSync(destination).size;
      outputBytes += bytes;
      console.log(`${name}: ${bytes.toLocaleString()} bytes`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  const sourceBytes = [...sourceFiles].reduce((total, file) => total + fs.statSync(file).size, 0);
  console.log(`\n${files.length} separate modular GLBs: ${sourceBytes.toLocaleString()} source bytes -> ${outputBytes.toLocaleString()} output bytes`);
  for (const [name, info] of [...textures].sort(([a], [b]) => a.localeCompare(b)))
    console.log(`${name}: ${info.originalSize} ${info.originalBytes.toLocaleString()} bytes -> ${info.convertedSize} ${info.convertedBytes.toLocaleString()} bytes`);
  console.log("Maps removed: none; geometry: lossless accessor deduplication; rigs and animations: preserved.");
};

try { run(); }
catch (error) { console.error(error.message); process.exitCode = 1; }
