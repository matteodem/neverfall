import React from "react";

const ACTION_SLOTS = [
  { key: "1", label: "Attack" },
  { key: "2", label: "" },
  { key: "3", label: "" },
  { key: "4", label: "" },
];

const EnemyHealthBar = ({ hp, maxHp = 100 }) => {
  if (hp <= 0) {
    return null;
  }

  const percentage = Math.max(
    0,
    Math.min(100, (hp / maxHp) * 100)
  );

  return (
    <div className="absolute left-1/2 top-4 -translate-x-1/2">
      <div className="w-64 rounded bg-black/70 p-3 text-white">
        <div className="mb-1 text-center text-sm">
          Training Dummy
        </div>

        <div className="h-4 overflow-hidden rounded bg-gray-700">
          <div
            className="h-full bg-red-500 transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <div className="mt-1 text-center text-xs">
          {hp} / {maxHp} HP
        </div>
      </div>
    </div>
  );
};

const ActionBar = () => {
  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
      {ACTION_SLOTS.map((slot) => (
        <div
          key={slot.key}
          className="flex h-14 w-14 flex-col items-center justify-center rounded border border-white/20 bg-black/70 text-white"
        >
          <span className="text-sm font-bold">
            {slot.key}
          </span>

          {slot.label && (
            <span className="text-[10px] text-gray-300">
              {slot.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const ControlsHelp = () => {
  return (
    <div className="absolute left-4 top-4 rounded-lg bg-black/70 px-4 py-3 text-white">
      <h1 className="text-xl font-bold">
        Neverfall
      </h1>

      <div className="mt-2 text-sm text-gray-300">
        <div>WASD - Move</div>
        <div>1 - Attack</div>
      </div>
    </div>
  );
};

export const Hud = ({ enemyHp }) => {
  return (
    <>
      <ControlsHelp />
      <EnemyHealthBar hp={enemyHp} />
      <ActionBar />
    </>
  );
};