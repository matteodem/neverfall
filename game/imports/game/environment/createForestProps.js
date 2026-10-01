import { SceneLoader, TransformNode } from "@babylonjs/core";
import { BASIC_TOWER_CLEARING_RADIUS, BASIC_TOWER_POSITION } from "../basicTowerConfig";
import { createFrameBudget } from "./createFrameBudget";
import { DUNGEONS } from "../dungeonConfig";
import { ENEMY_SPAWNS } from "../enemyConfig";
import { QUESTS } from "../quests";
import { DEFAULT_SPAWN_POINT, NORTHERN_SPAWN_POINT, SPAWN_POINTS } from "../spawnPoints";
import { WAYPOINTS } from "../waypoints";
import { WORLD_EVENTS } from "../worldEvents";
import { FOREST_GIANT_HILL, HIGHLANDS_SCENERY, SNOWY_MOUNTAINS, SOUTHWEST_LAKE, WORLD_CHUNKS, getHighlandMix, getSnowMix, getWorldHeight } from "../worldConfig";

const MODELS = {
  broadleaf: ["birch_1", "oak_2"],
  conifers: ["pine_1", "pine_2"],
  undergrowth: ["bush_1", "bush_2", "fern", "grass_1"],
  scrub: ["bush_3", "grass_2"],
  rocks: ["rock_1", "rock_2"],
  boulders: ["rock_3", "rock_4"],
  deadTrees: ["dry_tree_1", "dry_tree_2"],
  accents: ["log_1", "stump_1", "dry_tree_1"],
  snowyRocks: ["rock_1", "rock_2"],
  snowyBoulders: ["rock_3", "rock_4"],
  snowyGrass: ["grass_1", "grass_2"],
  snowyBushes: ["bush_1", "bush_2", "bush_3"],
  snowyDryTrees: ["dry_tree_1", "dry_tree_2"],
  snowyAccents: ["log_1", "log_2", "stump_1", "stump_2"],
};

const SNOWY_CLUSTER_CHOICES = {
  lower: ["snowyRocks", "snowyRocks", "snowyBoulders", "snowyDryTrees", "snowyAccents", "snowyGrass", "snowyBushes"],
  middle: ["snowyRocks", "snowyRocks", "snowyBoulders", "snowyBoulders", "snowyDryTrees", "snowyAccents"],
  upper: ["snowyRocks", "snowyRocks", "snowyBoulders", "snowyBoulders", "snowyBoulders", "snowyDryTrees", "snowyAccents"],
};

const CIRCLES = [
  { ...BASIC_TOWER_POSITION, radius: BASIC_TOWER_CLEARING_RADIUS },
  ...SPAWN_POINTS.map((point) => ({ ...point.position, radius: point.id === "central-camp" ? 10 : 22 })),
  ...WAYPOINTS.filter((point) => ["lake-waypoint", "snowy-mountains-waypoint"].includes(point.id))
    .map((point) => ({ ...point.position, radius: 9 })),
  ...DUNGEONS.map((dungeon) => ({ ...dungeon.entrance, radius: 18 })),
  ...ENEMY_SPAWNS.map((spawn) => ({ ...spawn, radius: spawn.type === "frostOgre" ? 24 : 8 })),
  ...["goat", "rat", "bee", "snowWolf", "mountainGoat"].map((type) => {
    const spawns = ENEMY_SPAWNS.filter((spawn) => spawn.type === type);
    return {
      x: spawns.reduce((sum, spawn) => sum + spawn.x, 0) / spawns.length,
      z: spawns.reduce((sum, spawn) => sum + spawn.z, 0) / spawns.length,
      radius: 28,
    };
  }),
  ...QUESTS.filter((quest) => quest.objective.type === "ReachLocation")
    .map((quest) => ({ ...quest.objective, radius: (quest.objective.radius || 10) + 5 })),
  ...WORLD_EVENTS.map((event) => ({ ...event.center, radius: Math.max(30, event.spawnRadius + 8) })),
  { ...FOREST_GIANT_HILL.center, radius: 20 },
  { ...SOUTHWEST_LAKE.center, radius: SOUTHWEST_LAKE.radius + 8 },
  ...WORLD_CHUNKS.filter((chunk) => chunk.region === "highlands").flatMap((chunk) => [
    ...HIGHLANDS_SCENERY.spires.map(({ x, z }) => ({ x: chunk.x + x, z: chunk.z + z, radius: 5 })),
    ...HIGHLANDS_SCENERY.ruinedWalls.map(({ x, z }) => ({ x: chunk.x + x, z: chunk.z + z, radius: 7 })),
    ...(HIGHLANDS_SCENERY.landmarks[chunk.x] ? [{
      x: chunk.x + HIGHLANDS_SCENERY.landmarks[chunk.x].x,
      z: chunk.z + HIGHLANDS_SCENERY.landmarks[chunk.x].z,
      radius: 13,
    }] : []),
  ]),
];

const PATHS = [
  { from: DEFAULT_SPAWN_POINT.position, to: DUNGEONS[0].entrance, width: 8 },
  { from: DEFAULT_SPAWN_POINT.position, to: FOREST_GIANT_HILL.center, width: 8 },
  { from: DEFAULT_SPAWN_POINT.position, to: NORTHERN_SPAWN_POINT.position, width: 8 },
  { from: NORTHERN_SPAWN_POINT.position, to: DUNGEONS[1].entrance, width: 8 },
  { from: { x: 140, z: 0 }, to: SNOWY_MOUNTAINS.boss, width: 8 },
];

const randomForChunk = ({ x, z }) => {
  let seed = ((x + 400) * 73856093 ^ (z + 400) * 19349663) >>> 0;
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
};

const distanceToPath = (position, { from, to }) => {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const t = Math.max(0, Math.min(1,
    ((position.x - from.x) * dx + (position.z - from.z) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(position.x - from.x - t * dx, position.z - from.z - t * dz);
};

const isOpen = (position, clearance, areas) =>
  areas.every((area) =>
    Math.hypot(position.x - area.x, position.z - area.z) >= area.radius + clearance) &&
  PATHS.every((path) => distanceToPath(position, path) >= path.width + clearance);

const nearby = (center, radius, random) => {
  const angle = random() * Math.PI * 2;
  const distance = Math.sqrt(random()) * radius;
  return { x: center.x + Math.cos(angle) * distance, z: center.z + Math.sin(angle) * distance };
};

export const loadForestProps = async (scene) => {
  const models = new Map();
  const loading = new Map();
  let disposed = false;
  scene.onDisposeObservable.addOnce(() => {
    disposed = true;
    for (const container of models.values()) container.dispose();
  });
  const load = (name) => {
    if (models.has(name)) return Promise.resolve(models.get(name));
    if (!loading.has(name)) {
      loading.set(name, SceneLoader.LoadAssetContainerAsync("/models/environment/", `${name}.glb`, scene)
        .then((container) => {
          if (disposed) { container.dispose(); throw new Error("Scene disposed"); }
          models.set(name, container);
          return container;
        }));
    }
    return loading.get(name);
  };
  const preload = async (names) => {
    const results = await Promise.allSettled(names.map(load));
    results.forEach((result, index) => {
      if (result.status === "rejected") console.warn(`[Forest] Could not load ${names[index]}.glb`, result.reason);
    });
  };
  const initialKinds = ["broadleaf", "conifers", "undergrowth", "scrub", "rocks", "boulders", "deadTrees", "accents"];
  const initialNames = [...new Set(initialKinds.flatMap((kind) => MODELS[kind]))];
  const snowyNames = [...new Set(Object.entries(MODELS)
    .filter(([kind]) => kind.startsWith("snowy"))
    .flatMap(([, names]) => names))].filter((name) => !initialNames.includes(name));
  await preload(initialNames);

  const variants = (kind) => MODELS[kind]?.filter((id) => models.has(id)) || [];
  const baseHeights = new Map();
  const available = variants("broadleaf").length + variants("conifers").length > 0;

  const place = (root, kind, position, random, scale = 1) => {
    const choices = variants(kind).length ? variants(kind) :
      (kind === "broadleaf" ? variants("conifers") : kind === "conifers" ? variants("broadleaf") : []);
    if (!choices.length) return;
    const name = choices[Math.floor(random() * choices.length)];
    const entries = models.get(name).instantiateModelsToScene(undefined, false, { doNotInstantiate: false });
    const prop = new TransformNode(`forest-${name}`, scene);
    prop.parent = root;
    for (const node of entries.rootNodes) node.parent = prop;
    const meshes = prop.getChildMeshes();
    if (!baseHeights.has(name)) {
      let bottom = Infinity;
      for (const mesh of meshes) {
        if (!(mesh.getTotalVertices() || mesh.sourceMesh?.getTotalVertices())) continue;
        mesh.computeWorldMatrix(true);
        bottom = Math.min(bottom, mesh.getBoundingInfo().boundingBox.minimumWorld.y);
      }
      baseHeights.set(name, Number.isFinite(bottom) ? -bottom : 0);
    }
    prop.position.set(position.x, getWorldHeight(position.x, position.z) + baseHeights.get(name) * scale, position.z);
    prop.rotation.y = random() * Math.PI * 2;
    prop.scaling.setAll(scale);
    for (const mesh of meshes) {
      mesh.isPickable = false;
      mesh.checkCollisions = false;
      mesh.receiveShadows = true;
    }
  };

  const placeSnowyCluster = (root, position, random, density) => {
    const height = getWorldHeight(position.x, position.z);
    const tier = height < 8 ? "lower" : height < 15 ? "middle" : "upper";
    const chance = { lower: 0.30, middle: 0.23, upper: 0.17 }[tier] * density;
    if (random() >= chance || !isOpen(position, 5, CIRCLES)) return;

    const choices = SNOWY_CLUSTER_CHOICES[tier];
    const dominant = choices[Math.floor(random() * choices.length)];
    const count = tier === "upper" ? 2 + Math.floor(random() * 2) : 2 + Math.floor(random() * 3);
    for (let index = 0; index < count; index++) {
      const spot = index === 0 ? position : nearby(position, 3 + random() * 4, random);
      const kind = random() < 0.7 ? dominant : choices[Math.floor(random() * choices.length)];
      if (!isOpen(spot, kind.includes("Boulders") ? 4 : 2, CIRCLES)) continue;
      const scale = kind === "snowyGrass" || kind === "snowyBushes"
        ? 0.55 + random() * 0.3 : 0.75 + random() * 0.45;
      place(root, kind, spot, random, scale);
    }
  };

  const placeChunk = async ({ center, size, density, gradual = true }) => {
    if (!available) return null;
    const random = randomForChunk(center);
    const root = new TransformNode(`forest-props-${center.x}-${center.z}`, scene);
    root.setEnabled(false);
    const yieldIfNeeded = gradual ? createFrameBudget(scene) : null;
    const cells = Math.ceil(size / 14);
    const spacing = size / cells;

    for (let row = 0; row < cells; row++) {
      for (let column = 0; column < cells; column++) {
        if (yieldIfNeeded && column % 4 === 0) await yieldIfNeeded();
        const position = {
          x: center.x - size / 2 + (column + 0.5 + (random() - 0.5) * 0.8) * spacing,
          z: center.z - size / 2 + (row + 0.5 + (random() - 0.5) * 0.8) * spacing,
        };
        const mix = getHighlandMix(position.z);
        const snowy = center.region === "snowyMountains" || getSnowMix(position.x, position.z) > 0;
        if (snowy) {
          placeSnowyCluster(root, position, random, density);
          continue;
        }
        const treeChance = density * (0.84 - 0.76 * mix);
        const rockChance = density * (0.18 + 0.34 * mix);

        const treePlaced = random() < treeChance && isOpen(position, 2, CIRCLES);
        if (treePlaced) {
          const kind = random() < 0.4 + 0.55 * mix ? "conifers" : "broadleaf";
          place(root, kind, position, random, 0.75 + random() * 0.35);
          if (random() < 0.7) {
            const undergrowth = nearby(position, 5, random);
            if (isOpen(undergrowth, 1, CIRCLES))
              place(root, random() < mix ? "scrub" : "undergrowth", undergrowth, random, 0.7 + random() * 0.4);
          }
          if (random() < 0.025 * (1 - mix)) {
            const accent = nearby(position, 6, random);
            if (isOpen(accent, 3, CIRCLES))
              place(root, "accents", accent, random, 0.65 + random() * 0.3);
          }
        }

        const rockPlaced = !treePlaced && random() < rockChance && isOpen(position, 3, CIRCLES);
        if (rockPlaced) {
          const rockCenter = nearby(position, 5, random);
          if (random() < 0.22 * mix) {
            if (isOpen(rockCenter, 4, CIRCLES))
              place(root, "boulders", rockCenter, random, 0.7 + random() * 0.3);
          } else {
            for (let i = 0; i < 2; i++) {
              const rock = nearby(rockCenter, 3, random);
              if (isOpen(rock, 2, CIRCLES))
                place(root, "rocks", rock, random, 0.65 + random() * 0.45);
            }
          }
          if (random() < 0.45) {
            for (let i = 0; i < 2; i++) {
              const undergrowth = nearby(rockCenter, 5, random);
              if (isOpen(undergrowth, 1, CIRCLES))
                place(root, random() < mix ? "scrub" : "undergrowth", undergrowth, random, 0.7 + random() * 0.4);
            }
          }
        }

        if (!treePlaced && !rockPlaced && random() < 0.06 * mix && isOpen(position, 4, CIRCLES))
          place(root, "deadTrees", position, random, 0.7 + random() * 0.3);
      }
      if (yieldIfNeeded) await yieldIfNeeded();
    }

    const meshes = root.getChildMeshes();
    for (let index = 0; index < meshes.length; index++) {
      meshes[index].freezeWorldMatrix();
      if (yieldIfNeeded && index % 32 === 31) await yieldIfNeeded();
    }
    return root;
  };

  return { available, placeChunk, preloadSnowy: () => preload(snowyNames) };
};
