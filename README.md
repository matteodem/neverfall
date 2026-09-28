# ⚔️ Heroes of Neverfall

**Heroes of Neverfall** is the working title for a browser-based 3D MMORPG currently in active development.

The goal is to create a lightweight online RPG that runs directly in the browser, featuring real-time multiplayer, action combat, character progression, classes, equipment, group content, exploration, dynamic events, and an expanding game world.

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
- 🛡️ Camp safe zone and respawn protection
- 🐗 Multiple enemy types with AI
- ✨ Rare enemy variants
- 👹 Mini-boss and boss encounters
- 💥 Boss mechanics including telegraphed attacks and enrage
- 🌐 Dynamic world events
- ⭐ XP and level progression
- 📈 Class-specific level progression bonuses
- 📜 Quest / hunt system
- 🎒 Loot and inventory
- 💍 Lightweight equipment system
- 💪 Equipment-based stat bonuses
- 🧿 Accessories with gameplay bonuses
- 🐎 Mount system
- 🧑‍🤝‍🧑 Party system
- 🏰 Instanced dungeon
- 🏆 Achievement system
- 🗺️ Minimap
- 🌎 World Map
- 🧙 Character creation and character selection
- 🎨 Basic character appearance customization
- 🕹️ Action bar with cooldowns
- 🔊 Basic sound effects
- 📱 Mobile controls and mobile support
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
7. Participate in dynamic world events
8. Collect loot and equipment
9. Improve character stats
10. Earn XP and level up
11. Unlock class progression bonuses
12. Group with other players
13. Fight bosses and rare enemies
14. Enter instanced dungeon content
15. Complete achievements
16. Explore using mounts

The game is being developed iteratively, with new systems being added while existing gameplay is continuously refined.

## 🧙 Classes

Heroes of Neverfall currently supports three classes.

### ⚔️ Warrior

A melee-focused class built around close-range combat.

Current abilities include:

- Basic Attack
- Heavy Strike
- Cleave
- Heal / utility ability

The Warrior gains additional health and melee damage through class progression.

### 🏹 Ranger

A ranged physical class using projectile attacks.

Current Ranger abilities include:

- Arrow Shot
- Strong Arrow
- Multi Shot

The Ranger gains projectile damage and movement speed through class progression.

The Ranger currently does not require a visible bow model.

### 🔥 Mage

A ranged magic class using fire-based abilities.

Current Mage abilities include:

- Fireball
- Fireball Burst
- Fire Nova

The Mage gains spell damage, AoE damage, and additional health through class progression.

The Mage currently does not require a staff or wand model.

## 📈 Character Progression

Characters can currently progress up to **Level 20**.

In addition to normal stat scaling, each class receives milestone bonuses at:

- Level 5
- Level 10
- Level 15
- Level 20

These bonuses are class-specific and stack with equipment bonuses.

Progression is persisted per character.

## 💍 Equipment

A lightweight equipment system is currently implemented.

Current equipment slots include:

- Ring
- Accessory

Equipment modifies character stats without changing the character's visual appearance.

Examples include:

- Maximum health bonuses
- Attack damage bonuses
- XP gain bonuses
- Movement speed bonuses

Current accessories include examples such as:

- Lucky Charm
- Guardian Talisman
- Swift Feather

## 🐎 Mounts

Players can mount and dismount a horse to travel through the world faster.

The current mount system supports:

- Mounted movement
- Increased movement speed
- Idle and running animations
- Multiplayer synchronization
- Automatic dismounting where required
- Combat restrictions while mounted

## 🧑‍🤝‍🧑 Parties

Players can form parties for group gameplay.

Party gameplay currently integrates with systems such as:

- Dungeon content
- Boss encounters
- Dynamic world events
- Shared group objectives

## 🏰 Dungeons

Heroes of Neverfall includes instanced dungeon gameplay.

The current dungeon system supports:

- Solo or party entry
- Separate dungeon instances
- Enemy groups
- Mini-boss encounters
- Final boss encounter
- Dungeon rewards
- Death and respawn handling
- Returning to the open world

Dungeon content will continue expanding over time.

## 🌐 Dynamic World Events

The world can contain server-driven events that players nearby can participate in together.

Current event work includes:

### 🟣 Forest Giant Awakening

A stronger event version of the Forest Giant.

The **Awakened Forest Giant**:

- Is separate from the normal `Kill The Giant` quest boss
- Reuses the existing Giant model
- Has increased health and damage
- Gives improved rewards
- Has a subtle purple glow to distinguish it visually

Dynamic events are designed to reuse a shared event system so additional world events can be added later.

## 👹 Bosses & Rare Enemies

Boss encounters can include additional mechanics beyond normal enemy combat.

Current mechanics include:

- Telegraphed area attacks
- Charge attacks
- Enrage behavior
- Dedicated boss health bars
- Increased rewards

Rare enemy variants provide stronger versions of normal enemies and additional reward opportunities.

## 🏆 Achievements

Achievements are tracked per character.

Current achievements include examples such as:

- First Blood
- Boar Slayer
- Wolf Hunter
- Getting Stronger
- Treasure Hunter
- Equipped
- Mounted
- Boss Killer
- Legend of Neverfall

Achievements currently focus on progression milestones rather than achievement points or currencies.

## 🌎 World & Enemies

The current world contains multiple enemy types, bosses, and gameplay areas.

Current content includes:

- Boars
- Wolves
- Additional wildlife enemies
- Rare enemies
- Mini-boss encounters
- Forest Giant encounters
- Forest environments
- Camps
- Exploration areas
- Dungeon entrance
- Jumping puzzle content
- Loot drops
- Hunt objectives
- Dynamic events

The world will continue expanding with additional regions, enemies, encounters, and activities.

## 🗺️ Maps & Exploration

Players currently have access to:

### Minimap

Provides nearby gameplay information while exploring.

### World Map

A larger world overview using a lightweight static map with live player and location markers.

The map system is intentionally independent from 3D world rendering to keep performance costs low.

## 📱 Mobile Support

Heroes of Neverfall includes initial mobile support.

Mobile gameplay includes support for:

- Character movement
- Camera control
- Combat abilities
- HUD interaction
- Game modals
- Map UI

Mobile support is still being refined as the game grows.

## ⚡ Performance

As the world grows, Neverfall is receiving dedicated performance optimization work.

Current and planned optimizations include:

- Distance-based entity rendering
- Pausing distant animations
- Reduced distant entity updates
- Nameplate and health-bar culling
- Throttled minimap updates
- Optimized static environment meshes
- Reuse / instancing of repeated world props
- Projectile and VFX pooling
- Reduced network update frequency
- Client-side interpolation
- Server-side AI throttling
- Mobile quality adjustments
- Shadow optimization
- Distance-based world activation

Gameplay state and map information remain independent from 3D rendering distance where possible.

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

The project has moved well beyond the initial prototype and now contains several interconnected MMORPG systems including:

- Multiplayer combat
- Classes
- Character progression
- Loot and equipment
- Mounts
- Parties
- Dungeons
- Achievements
- Dynamic world events
- Boss mechanics
- Exploration
- Mobile support
- Persistent character progression

Development currently focuses on expanding world content, improving performance, and making existing systems work together cleanly without overcomplicating the architecture.

Some assets and visuals are temporary and are expected to change as development continues.

## 🗺️ Planned Features

Future development may include:

- 🐺 More enemy types
- 👹 More bosses and encounter mechanics
- 🌐 More dynamic world events
- 🏰 More dungeon content
- 💍 More equipment and accessories
- 🗺️ Larger and more varied world regions
- 📜 More quests and progression content
- 🧑‍🤝‍🧑 More group-oriented gameplay
- 🎨 Improved visual effects and animations
- 🔊 Expanded audio and ambience
- 🎒 More loot and rewards
- 💬 Player chat
- 🧬 Additional playable species

Larger systems such as crafting, trading, guilds, advanced equipment progression, and larger-scale group content may be explored later.

## ❤️ Support the Project

If you enjoy the project and want to support its development, you can support me on [Patreon](https://patreon.com/MatteoDeMicheli).

Support is completely optional and helps me continue working on Neverfall and future projects.

## 🤝 Contributing

The project is under active development, so architecture and gameplay systems may still change frequently.

Feel free to explore the codebase, report issues, or suggest ideas.

## ⚠️ Disclaimer

**Heroes of Neverfall** is currently a working title.

The project is experimental and under active development. Features, visuals, gameplay systems, balancing, assets, and the project name may change over time.
