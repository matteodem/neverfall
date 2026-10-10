import {
  schema,
  t,
} from "@colyseus/schema";

export const StatusEffectState = schema({
  expiresAt: t.number().default(0),
  nextTickAt: t.number().default(0),
}, "StatusEffectState");

export const PlayerState =
  schema(
    {
      userId:
        t.string().default(""),

      characterId:
        t.string().default(""),

      name:
        t.string().default(""),

      guildTag:
        t.string().default(""),

      selectedTitle: t.string().default(""),

      statusEffects: t.map(StatusEffectState),

      chatAnimation: t.string().default(""),

      gameClass: t.string().default("warrior"),

      species: t.string().default("human"),

      x:
        t.number().default(0),

      y:
        t.number().default(0),

      z:
        t.number().default(0),

      rotationY:
        t.number().default(0),

      groupId: t.string().default(""),
      inDungeon: t.boolean().default(false),
      worldEventId: t.string().default(""),
      respawnProtectedUntil: t.number().default(0),
      worldSessionId: t.string().default(""),
      dungeonRewardClaimed: t.boolean().default(false),
      towerChestClaimed: t.boolean().default(false),

      movementSpeedMultiplier: t.number().default(1),
      speedPotionUntil: t.number().default(0),
      powerPotionUntil: t.number().default(0),

      mounted:
        t.boolean().default(false),

      inCombat:
        t.boolean().default(false),

      ring:
        t.string().default(""),

      accessory:
        t.string().default(""),

      health:
        t.number().default(100),

      maxHealth:
        t.number().default(100),

      currentLevel:
        t.number().default(
          1
        ),

      currentXp:
        t.number().default(
          0
        ),

      skill1: t.string().default(""),
      skill2: t.string().default(""),
      skill3: t.string().default(""),
      skill4: t.string().default(""),

      talent5: t.string().default(""),
      talent10: t.string().default(""),
      talent15: t.string().default(""),
      talent20: t.string().default(""),
      
      // Canonical cosmetic appearance JSON, sent once on join; never client-authored.
      appearance: t.string().default(""),

      giantQuestKills: t.number().default(0),
      wolfQuestKills: t.number().default(0),
      goatQuestKills: t.number().default(0),
      ratQuestKills: t.number().default(0),
      beeQuestKills: t.number().default(0),
      sealQuestKills: t.number().default(0),
      snowWolfQuestKills: t.number().default(0),
      mountainGoatQuestKills: t.number().default(0),
      frostOgreQuestKills: t.number().default(0),
      hammerBossQuestKills: t.number().default(0),

      boarQuestKills:
        t.number().default(0),
    },
    "PlayerState"
  );

export const EnemyState = schema(
  {
    statusEffects: t.map(StatusEffectState),
    type: t.string().default("boar"),
    rare: t.boolean().default(false),
    enraged: t.boolean().default(false),
    bossActive: t.boolean().default(false),
    bossAction: t.string().default(""),
    bossTargetX: t.number().default(0),
    bossTargetZ: t.number().default(0),
    bossRadius: t.number().default(0),
    level: t.number().default(1),
    x:
      t.number().default(0),

    y:
      t.number().default(0),

    z:
      t.number().default(0),

    rotationY:
      t.number().default(0),

    health:
      t.number().default(100),

    maxHealth:
      t.number().default(100),
  },
  "EnemyState"
);

export const LootState = schema(
  {
    ownerId: t.string().default(""),
    ownerCharacterId: t.string().default(""),
    enemyType: t.string().default("boar"),
    rare: t.boolean().default(false),
    xpReward: t.number().default(0),
    x: t.number().default(0),
    y: t.number().default(0),
    z: t.number().default(0),
  },
  "LootState"
);

export const WorldEventState = schema({
  id: t.string().default(""),
  name: t.string().default(""),
  status: t.string().default("cooldown"),
  phase: t.number().default(0),
  totalPhases: t.number().default(0),
  phaseName: t.string().default(""),
  objective: t.string().default(""),
  objectiveProgress: t.number().default(0),
  objectiveTarget: t.number().default(0),
  activatedSeals: t.number().default(0),
  objectiveX: t.number().default(0),
  objectiveZ: t.number().default(0),
  interaction: t.string().default(""),
  wave: t.number().default(0),
  totalWaves: t.number().default(0),
  enemiesRemaining: t.number().default(0),
  nextWaveIn: t.number().default(0),
  endsAt: t.number().default(0),
  nextStartAt: t.number().default(0),
}, "WorldEventState");

export const WorldState = schema(
  {
    players:
      t.map(PlayerState),

    enemies:
      t.map(EnemyState),

    loot: t.map(LootState),
    worldEvent: WorldEventState,
  },
  "WorldState"
);

export const DungeonState = schema({
  players: t.map(PlayerState),
  enemies: t.map(EnemyState),
  loot: t.map(LootState),
  stage: t.number().default(0),
  bossDefeated: t.boolean().default(false),
  completed: t.boolean().default(false),
  challengeModeEnabled: t.boolean().default(false),
  challengeModeLocked: t.boolean().default(false),
}, "DungeonState");
