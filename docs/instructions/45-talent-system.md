# Talent System MVP

## Goal

Add a lightweight talent system that gives each class small build choices at key level milestones.

Keep it simple: no large talent tree, only clear A/B choices.

## Talent Milestones

Characters unlock one talent choice at:

- Level 5
- Level 10
- Level 15
- Level 20

At each milestone, the player chooses **1 of 2 talents**.

## Example Talents

### Warrior

**Level 5**

- Berserker: +10% Heavy Strike Damage
- Guardian: +15 Max HP

### Ranger

**Level 10**

- Sharpshooter: +10% Projectile Damage
- Pathfinder: +5% Movement Speed

### Mage

**Level 15**

- Pyromancer: +10% Fire Damage
- Arcanist: -10% Ability Cooldowns

## Behavior

- Talents are stored per character.
- Talents should modify existing stats / abilities.
- Do not add new active skills for the MVP.
- Only one talent can be selected per milestone.
- Locked milestones should not be selectable.

## Reset Talents

Allow players to reset all selected talents.

For now:

- resetting talents is **free**
- no Gold cost
- no cooldown
- all selected talents are cleared
- the player can immediately choose new talents again

Add a clear confirmation before resetting.

Example:

```text
Reset all talents?

[Cancel] [Reset]
```

## UI

Add a simple Talents UI / modal.

Show:

- Level 5 choice
- Level 10 choice
- Level 15 choice
- Level 20 choice
- selected talent
- locked state for unavailable levels
- `Reset Talents` button

Keep the UI lightweight and consistent with existing DaisyUI modals.

## Architecture

Keep talent definitions config-driven.

Example:

```js
{
  warrior: {
    5: [
      {
        id: "berserker",
        label: "Berserker",
        effect: "heavy-strike-damage",
        value: 0.10,
      },
      {
        id: "guardian",
        label: "Guardian",
        effect: "max-health",
        value: 15,
      },
    ],
  },
}
```

Reuse existing class progression / stat calculation logic where possible.

## Out of Scope

Do not add:

- talent points
- branching talent trees
- prerequisite chains
- new active abilities
- paid respec
- talent loadouts
- PvP-specific talent rules

## Acceptance Criteria

- Characters unlock talent choices at Levels 5, 10, 15, and 20.
- Each milestone offers 2 choices.
- Only 1 talent can be selected per milestone.
- Selected talents persist per character.
- Talent effects correctly modify existing stats / abilities.
- Locked milestones cannot be selected.
- `Reset Talents` clears all talent choices.
- Resetting is free.
- Players can immediately choose new talents after resetting.
- Existing class progression continues to work.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the current class progression and stat calculation systems first.
3. Reuse existing class / stat helpers where possible.
4. Keep talent definitions config-driven.
5. Store selections per character.
6. Implement free full talent reset with confirmation.
7. Use JavaScript only.
8. Keep the implementation small and DRY.
9. Avoid unrelated refactors.
10. Run relevant checks after implementation.
11. In the final response, list every changed file with its exact path.
