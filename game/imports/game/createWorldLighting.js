import { Color3, DirectionalLight, HemisphericLight, ShadowGenerator, Vector3 } from "@babylonjs/core";

const UPDATE_INTERVAL = 250;

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
  const distance = Math.min(quality.shadowDistance, touch ? 60 : 80);
  sun.shadowFrustumSize = distance * 2;
  sun.shadowMinZ = 1;
  sun.shadowMaxZ = 360;
  sun.autoUpdateExtends = false;

  const shadows = new ShadowGenerator(mapSize, sun);
  shadows.usePercentageCloserFiltering = true;
  shadows.filteringQuality = touch || mapSize <= 1024
    ? ShadowGenerator.QUALITY_LOW : ShadowGenerator.QUALITY_MEDIUM;
  shadows.bias = 0.0005;
  shadows.normalBias = 0.03;
  shadows.frustumEdgeFalloff = 0.15;
  shadows.customAllowRendering = (subMesh) => isSolidMaterial(subMesh.getMaterial(), subMesh.getMesh());

  const shadowMap = shadows.getShadowMap();
  const right = Vector3.Cross(Vector3.Up(), direction).normalize();
  const up = Vector3.Cross(direction, right).normalize();
  const texelSize = sun.shadowFrustumSize / mapSize;
  const lastPosition = new Vector3(Infinity, Infinity, Infinity);
  let elapsed = UPDATE_INTERVAL;
  let dirty = true;

  const refreshMeshes = () => {
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
      const range = distance * 1.5 + bounds.radiusWorld;
      if (Math.hypot(bounds.centerWorld.x - player.position.x,
        bounds.centerWorld.z - player.position.z) <= range) casters.add(mesh);
    }
    shadowMap.renderList = [...casters];
    lastPosition.copyFrom(player.position);
    elapsed = 0;
    dirty = false;
  };

  const added = scene.onNewMeshAddedObservable.add(() => { dirty = true; });
  const removed = scene.onMeshRemovedObservable.add(() => { dirty = true; });
  const update = () => {
    // Snap the light-space projection to shadow texels to reduce shimmering.
    const x = Math.round(Vector3.Dot(player.position, right) / texelSize) * texelSize;
    const y = Math.round(Vector3.Dot(player.position, up) / texelSize) * texelSize;
    const z = Vector3.Dot(player.position, direction) - 180;
    sun.position.copyFrom(right).scaleInPlace(x).addInPlace(up.scale(y)).addInPlace(direction.scale(z));

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
