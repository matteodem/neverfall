import { Color3, DirectionalLight, HemisphericLight, ShadowGenerator, Vector3 } from "@babylonjs/core";

const UPDATE_INTERVAL = 250;
const LIGHT_DISTANCE = 120;
const CASTER_RETENTION_MARGIN = 8;

// Alpha-tested foliage is solid geometry; blended water, labels and effects are not.
const isSolidMaterial = (material, mesh) => material && !material.disableLighting &&
  (!material.needAlphaBlendingForMesh(mesh) || material.needAlphaTestingForMesh(mesh));

export const createWorldLighting = (scene, { player, ground, quality }) => {
  const ambient = new HemisphericLight("ambient", Vector3.Up(), scene);
  ambient.intensity = 0.55;
  ambient.diffuse = Color3.FromHexString("#FFF4DE");
  ambient.groundColor = Color3.FromHexString("#8D9473");
  ambient.specular = Color3.Black();

  const direction = new Vector3(-1, -2, 1).normalize();
  const sun = new DirectionalLight("sun", direction, scene);
  sun.intensity = 1.05;
  sun.diffuse = Color3.FromHexString("#FFE6B5");
  sun.specular = Color3.FromHexString("#FFEED0");

  const touch = scene.getEngine().getRenderingCanvas()?.ownerDocument.defaultView
    ?.matchMedia("(pointer: coarse)").matches;
  const mapSize = Math.min(quality.shadowMapSize, touch ? 1024 : 2048);
  const distance = Math.min(quality.shadowDistance, touch ? 36 : 48);
  sun.shadowFrustumSize = distance * 2;
  sun.shadowMinZ = 1;
  sun.shadowMaxZ = LIGHT_DISTANCE * 2;
  sun.autoUpdateExtends = false;
  sun.autoCalcShadowZBounds = false;

  const shadows = new ShadowGenerator(mapSize, sun);
  shadows.usePercentageCloserFiltering = true;
  // Spend existing map resolution on nearby contact detail; PCF softens the
  // edges without adding a blur pass or another shadow map.
  shadows.filteringQuality = touch || mapSize <= 1024
    ? ShadowGenerator.QUALITY_MEDIUM : ShadowGenerator.QUALITY_HIGH;
  // Depth bias is normalized over the light's depth interval. A large value
  // separates feet/bench legs from their shadows; retain a small normal offset
  // to suppress self-shadow acne on sloped and double-sided imported geometry.
  shadows.bias = 0.0001;
  shadows.normalBias = 0.02;
  shadows.setDarkness(0.12);
  shadows.frustumEdgeFalloff = 0.15;
  shadows.customAllowRendering = (subMesh) => isSolidMaterial(subMesh.getMaterial(), subMesh.getMesh());

  const shadowMap = shadows.getShadowMap();
  const right = Vector3.Cross(Vector3.Up(), direction).normalize();
  const up = Vector3.Cross(direction, right).normalize();
  const texelSize = sun.shadowFrustumSize / mapSize;
  const nextLightPosition = Vector3.Zero();
  const lastPosition = new Vector3(Infinity, Infinity, Infinity);
  let elapsed = UPDATE_INTERVAL;
  let dirty = true;

  const refreshMeshes = () => {
    const previous = shadowMap.renderList || [];
    const previousCasters = new Set(previous);
    const casters = new Set();
    for (const mesh of scene.meshes) {
      if (!mesh.getTotalVertices() || !mesh.isVisible || mesh.visibility <= 0 || !mesh.isEnabled()) continue;
      const material = mesh.material || scene.defaultMaterial;
      const materials = material.subMaterials || [material];
      const source = mesh.sourceMesh || mesh;
      if (!materials.some((material) => isSolidMaterial(material, mesh))) {
        source.receiveShadows = false;
        continue;
      }

      // Instances inherit receiveShadows from their source, but each placement
      // must enter the render list for Babylon's instance batching to include it.
      const role = mesh.metadata?.worldShadows || source.metadata?.worldShadows;
      source.receiveShadows = role?.receive !== false;
      if (role?.cast === false || mesh === ground || mesh.name === "forestPathGround") continue;

      mesh.computeWorldMatrix();
      const bounds = mesh.getBoundingInfo().boundingSphere;
      // Keep existing boundary casters a little longer to avoid repeatedly
      // adding/removing their shadows when movement crosses the cutoff.
      const range = distance * 1.5 + bounds.radiusWorld +
        (previousCasters.has(mesh) ? CASTER_RETENTION_MARGIN : 0);
      if (Math.hypot(bounds.centerWorld.x - player.position.x,
        bounds.centerWorld.z - player.position.z) <= range) casters.add(mesh);
    }
    const next = [...casters];
    if (previous.length !== next.length || next.some((mesh, index) => mesh !== previous[index])) {
      shadowMap.renderList = next;
    }
    lastPosition.copyFrom(player.position);
    elapsed = 0;
    dirty = false;
  };

  const added = scene.onNewMeshAddedObservable.add(() => { dirty = true; });
  const removed = scene.onMeshRemovedObservable.add(() => { dirty = true; });
  const update = () => {
    // Keep the projection fixed between texel crossings on all three axes.
    // Camera orbit does not affect it, and depth no longer drifts every frame.
    const x = Math.round(Vector3.Dot(player.position, right) / texelSize) * texelSize;
    const y = Math.round(Vector3.Dot(player.position, up) / texelSize) * texelSize;
    const z = Math.round(Vector3.Dot(player.position, direction) / texelSize) * texelSize - LIGHT_DISTANCE;
    nextLightPosition.set(
      right.x * x + up.x * y + direction.x * z,
      right.y * x + up.y * y + direction.y * z,
      right.z * x + up.z * y + direction.z * z,
    );
    if (!sun.position.equals(nextLightPosition)) sun.position.copyFrom(nextLightPosition);

    elapsed += scene.getEngine().getDeltaTime();
    if (dirty || elapsed >= UPDATE_INTERVAL || Vector3.DistanceSquared(lastPosition, player.position) > 64) {
      refreshMeshes();
    }
  };
  update();
  const beforeRender = scene.onBeforeRenderObservable.add(update);
  scene.onDisposeObservable.addOnce(() => {
    scene.onBeforeRenderObservable.remove(beforeRender);
    scene.onNewMeshAddedObservable.remove(added);
    scene.onMeshRemovedObservable.remove(removed);
    shadows.dispose();
  });
};
