# ⚔️ Heroes of Neverfall

**Heroes of Neverfall** is the working title for a browser-based 3D MMORPG currently in active development.

The goal is to create a lightweight online RPG that runs directly in the browser, featuring real-time multiplayer, action combat, character progression, classes, equipment, group content, exploration, and an expanding game world.

> 🚧 Heroes of Neverfall is still in active development. Features, visuals, balancing, assets, systems, and the project name may change over time.

## ✨ Current Features

- 🌍 3D browser-based game world
- 👥 Real-time multiplayer
- ⚔️ Action combat
- 🧙 Three playable classes:
  - Warrior
  - Ranger
  - Mage
- 🏹 Class-specific combat abilities
- 🔥 Projectile combat for Ranger and Mage
- ❤️ Health, healing, death, and respawn
- 🐗 Multiple enemy types with AI
- 👹 Mini-boss encounters
- ⭐ XP and level progression
- 📈 Level-based health, damage, and healing scaling
- 📜 Quest / hunt system
- 🎒 Loot and inventory
- 💍 Lightweight equipment system
- 💪 Equipment-based stat bonuses
- 🐎 Mount system
- 🧑‍🤝‍🧑 Party system
- 🗺️ Minimap
- 🧙 Character creation and character selection
- 🎨 Basic character appearance customization
- 🕹️ Action bar with cooldowns
- 🔊 Basic sound effects
- 🌲 Procedurally assembled world environments
- 🧗 Jumping puzzle
- 💾 Persistent character progression
- ⚡ Multiplayer entity and performance optimizations

## 🛠️ Tech Stack

Heroes of Neverfall is built with:

- **Meteor.js** — application backend and authentication
- **MongoDB** — persistent character and game data
- **React** — UI and HUD
- **Babylon.js** — 3D rendering and game world
- **Colyseus** — real-time multiplayer game server
- **Zustand** — client-side state management
- **Tailwind CSS** — UI styling
- **DaisyUI** — reusable UI components

The project currently uses JavaScript rather than TypeScript.

## 🎮 Gameplay

The current gameplay loop includes:

1. Create or select a character
2. Choose a class
3. Enter the multiplayer world
4. Explore the environment
5. Fight enemies using action combat
6. Complete hunts and objectives
7. Collect loot and equipment
8. Improve character stats
9. Earn XP and level up
10. Group with other players
11. Fight stronger enemies and mini-bosses
12. Explore using mounts

The game is being developed iteratively, with new systems being added while existing gameplay is continuously refined.

## 🧙 Classes

Heroes of Neverfall currently supports three classes.

### ⚔️ Warrior

A melee-focused class using close-range attacks.

Current abilities include basic melee combat and additional Warrior skills.

### 🏹 Ranger

A ranged physical class using projectile attacks.

Current Ranger abilities include:

- Arrow Shot
- Strong Arrow
- Multi Shot

The Ranger currently does not require a visible bow model.

### 🔥 Mage

A ranged magic class using fire-based abilities.

Current Mage abilities include:

- Fireball
- Fireball Burst
- Fire Nova

The Mage currently does not require a staff or wand model.

The class system is intentionally lightweight for now and will continue expanding over time.

## 💍 Equipment

A lightweight equipment system is currently implemented.

Current equipment slots include:

- Ring
- Accessory

Equipment can modify character stats without changing the character's visual appearance.

Examples include:

- Rings that increase maximum health
- Rings that increase attack damage

More equipment types may be added later.

## 🐎 Mounts

Players can mount and dismount a horse to travel through the world faster.

The current mount system supports:

- Mounted movement
- Increased movement speed
- Idle and running animations
- Multiplayer synchronization
- Automatic dismounting where required
- Combat restrictions while mounted

Additional mounts may be added later.

## 🧑‍🤝‍🧑 Parties

Players can form parties for group gameplay.

The party system is intended to support future group-focused content such as:

- Boss encounters
- Group events
- Shared objectives

## 🌎 World & Enemies

The current world contains multiple enemy types and gameplay areas.

Current content includes:

- Boars
- Wolves
- Mini-boss encounters
- Forest environments
- Camps
- Exploration areas
- Jumping puzzle content
- Loot drops
- Hunt objectives

The world will continue expanding with additional enemies, locations, and activities.

## ⚡ Performance

As the world grows, Neverfall is also receiving dedicated performance optimization work.

Current and planned optimizations include:

- Distance-based entity rendering
- Pausing distant animations
- Reduced distant entity updates
- Nameplate and health-bar culling
- Throttled minimap updates
- Optimized static environment meshes
- Reuse / instancing of repeated world props

Gameplay state and minimap information remain independent from 3D rendering distance.

## 🚀 How to Run

First, install Meteor:

[Install Meteor](https://docs.meteor.com/about/install.html)

Then run:

```sh
cd game

meteor npm install

meteor run
```

The application should then be available at:

```text
http://localhost:3000
```

## 🧪 Development Status

Heroes of Neverfall is currently in active development.

The project has moved beyond the initial prototype and now includes several interconnected MMORPG systems including multiplayer combat, classes, progression, equipment, loot, mounts, parties, and world content.

Development currently focuses on expanding gameplay while keeping systems small, maintainable, and performant.

Some assets and visuals are temporary and are expected to change as development continues.

## 🗺️ Planned Features

Future development may include:

- 👹 More bosses and encounter mechanics
- 💍 More equipment and accessories
- 🗺️ Larger and more varied world areas
- 🌎 Dynamic world events
- 📜 More quests and progression systems
- 🧑‍🤝‍🧑 More group-oriented gameplay
- 🐎 Additional mounts
- 🎨 Improved visual effects and animations
- 🔊 Expanded audio and ambience
- 🎒 More loot and rewards

Larger systems such as crafting, trading, guilds, and advanced equipment progression may be explored later.

## ❤️ Support the Project

If you enjoy the project and want to support its development, you can support me on [Patreon](https://patreon.com/MatteoDeMicheli).

Support is completely optional and helps me continue working on Neverfall and future projects.

## 🤝 Contributing

The project is under active development, so architecture and gameplay systems may still change frequently.

Feel free to explore the codebase, report issues, or suggest ideas.

## ⚠️ Disclaimer

**Heroes of Neverfall** is currently a working title.

The project is experimental and under active development. Features, visuals, gameplay systems, balancing, assets, and the project name may change over time.
