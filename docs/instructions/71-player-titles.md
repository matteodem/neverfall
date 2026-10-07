# Player Titles

## Goal

Add **Player Titles** based on existing achievements.

Players can choose an unlocked title from **Hero → Achievements**. The selected title is displayed beneath the player's nameplate. The default option is **None**.

Use JavaScript only. Keep the implementation DRY, server-validated, multiplayer-safe, and MVP-sized.

## 1. Inspect Existing Systems

Before changing anything:

1. Read `AGENTS.md`.
2. Inspect the Character schema / document structure.
3. Inspect the achievement system and real achievement IDs.
4. Inspect `Hero → Achievements`.
5. Inspect local and remote player nameplates.
6. Inspect Meteor methods used for Character updates.
7. Inspect Colyseus player state / synchronization.
8. Inspect existing select / dropdown UI patterns.

Do not create duplicate systems.

## 2. Title Mapping

Create one centralized title configuration:

```js
[
  {
    id: "treasure-hunter",
    label: "Treasure Hunter",
    achievementId: "REAL_EXISTING_ACHIEVEMENT_ID",
  },
]
```

Use **real achievement IDs from the repository**. Do not invent achievement IDs.

Start with a small MVP set of roughly **3–5 titles** based on suitable existing achievements.

Do not create a separate title progression system.

## 3. Unlock Logic

Titles are unlocked automatically from existing achievements:

```text
achievement unlocked
→ mapped title becomes selectable
```

Prefer deriving available titles from:

```text
Character achievements
+
central title config
```

Do not persist a duplicate `unlockedTitles` array unless the existing architecture clearly requires it.

## 4. Selected Title Persistence

Persist only the selected stable title ID on the Character.

Conceptually:

```js
selectedTitle: "treasure-hunter"
```

Default:

```js
selectedTitle: null
```

Existing Characters with no field must continue to work without migration if possible.

## 5. Hero → Achievements UI

Add a select to the existing Achievements tab.

Label:

```text
Player Title
```

Options:

```text
None
<unlocked title 1>
<unlocked title 2>
...
```

Requirements:

- `None` is always available
- `None` is the default
- only unlocked titles are selectable
- reuse existing DaisyUI / Tailwind / select patterns
- do not add a new UI library

## 6. Server Validation

When a title is selected, validate server-side:

- current user owns the Character
- title ID exists in the centralized title config
- required achievement is unlocked
- `null` / None is always allowed

Reject:

```text
unknown title IDs
locked titles
arbitrary title strings
changes to another user's Character
```

Do not trust client-provided title labels.

## 7. Nameplate Rendering

Extend the existing player nameplate.

Desired layout:

```text
PlayerName
Selected Title
```

Example:

```text
Matteo
Treasure Hunter
```

Requirements:

- title appears **beneath the name**
- title text is smaller than the player name
- preserve current nameplate colors / styling
- preserve local-vs-remote nameplate behavior
- if title is `None`, render no second line
- only adjust spacing enough to avoid overlap

Do not replace the existing nameplate system.

## 8. Multiplayer Synchronization

Remote players must see selected titles.

Use the existing Colyseus player-state pattern.

Prefer syncing:

```text
selectedTitle ID
```

and resolving the label from shared config.

Do not synchronize the full achievement object just for title rendering.

Requirements:

- remote players see the title
- late joiners receive it
- changing the title in-world updates other clients
- selecting None removes it for everyone
- no reconnect should be required

## 9. Existing Achievement Behavior

Do not change:

```text
achievement unlock conditions
achievement progress
achievement rewards
achievement persistence
```

Titles are only a customization / display reward built on top of achievements.

## 10. Initial Title Style

Use concise fantasy/MMORPG-style titles based on actual achievements.

Possible examples only:

```text
Treasure Hunter
Wolf Hunter
Tower Climber
Dungeon Delver
Riftbreaker
Explorer
```

Only use a title if it maps cleanly to a real existing achievement.

## 11. Acceptance Criteria

The feature is complete when:

- title mappings are centralized
- titles are based on real existing achievements
- Hero → Achievements has a `Player Title` select
- `None` is the default option
- only unlocked titles are shown/selectable
- selected title persists on the Character
- title selection is validated server-side
- selected title appears beneath the player nameplate
- None removes the title line
- local nameplate updates
- remote players see titles
- late joiners see titles
- title changes synchronize without reconnecting
- existing achievement behavior remains unchanged
- unrelated systems are untouched

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect Character schema, achievements, Hero Achievements UI, nameplates, Meteor Character updates, and Colyseus player state.
3. Find real achievement IDs; do not invent them.
4. Add a centralized player-title config with stable IDs, labels, and achievement IDs.
5. Start with roughly 3–5 suitable titles.
6. Add `Player Title` select to `Hero → Achievements`.
7. Add `None` as default.
8. Show only titles unlocked by the current Character's achievements.
9. Persist only the stable selected title ID / null.
10. Validate ownership, title existence, and achievement unlock server-side.
11. Extend existing nameplates to display the title beneath the name in smaller text.
12. Preserve existing nameplate styling / colors.
13. Sync selected title through existing Colyseus player state for remote players and late joiners.
14. Do not sync full achievement data for this.
15. Make in-world title changes update without reconnecting.
16. Do not add title selection to Character Overview.
17. Do not modify achievement unlock/reward logic.
18. Use JavaScript only.
19. Keep the implementation DRY and MVP-sized.
20. Run relevant checks.
21. Test:
    - no unlocked title → only None
    - achievement unlocked → title available
    - selecting title → local + remote nameplates update
    - late joiner sees selected title
    - selecting None removes title
    - locked/unknown title selection is rejected
22. In the final response, list every changed file with its exact path.
23. Also report:
    - title config path
    - title IDs / labels
    - mapped achievement IDs
    - persistence field
    - server validation path
    - Colyseus synchronization field
