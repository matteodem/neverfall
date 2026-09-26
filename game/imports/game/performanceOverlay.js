// Kept outside React and updated once per second to avoid HUD render work.
export const createPerformanceOverlay = ({ scene, engine, multiplayer }) => {
  const display = document.createElement("pre");
  display.style.cssText = "position:fixed;bottom:20px;left:18px;z-index:100;pointer-events:none;background:#000b;color:white;padding:8px;font:12px monospace";
  document.body.appendChild(display);
  let elapsed = 1000;
  return {
    update(deltaTime) {
      elapsed += deltaTime;
      if (elapsed < 1000) return;
      elapsed %= 1000;
      const stats = multiplayer.getPerformanceStats();
      display.textContent = `FPS: ${engine.getFps().toFixed(0)}
Frame: ${engine.getDeltaTime().toFixed(1)} ms
Meshes: ${scene.getActiveMeshes().length} / ${scene.meshes.length}
Active enemies: ${stats.activeEnemies} / ${stats.enemies}
Active players: ${stats.activePlayers} / ${stats.players}
Visible nameplates: ${stats.nameplates}`;
    },
    destroy() { display.remove(); },
  };
};
