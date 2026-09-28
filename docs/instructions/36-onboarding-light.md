# Onboarding Light

## Goal

Add a short first-time onboarding flow for new users before the public alpha.

Use **NextStep.js** for the guided UI walkthrough.

Keep it lightweight: around **6–8 short steps** and less than a minute.

## Behavior

- Start automatically the first time a user joins the world.
- Store completion **per user**, not per character.
- Highlight existing HUD elements using NextStep.js.
- Dim the rest of the UI slightly.
- Provide:
  - `Next`
  - `Back`
  - `Skip`
  - `Done`
- Save completion on the Meteor user profile:

```js
profile: {
  onboardingCompleted: true
}
```

Once completed or skipped, the onboarding should not start automatically again for that user.

## Replay From HelpModal

Add a button to the existing `HelpModal`:

```text
Replay Onboarding
```

Clicking this button should start the onboarding again manually.

Important:

- manual replay must work even if `onboardingCompleted === true`
- replaying the onboarding should not reset the stored completion state
- reuse the same onboarding flow and step definitions

## Suggested Steps

### 1. Movement

```text
Move with WASD.
Hold RMB to rotate the camera.
```

### 2. Combat

Highlight the action bar.

```text
Use keys 1–4 to activate your abilities.
```

### 3. Health

Highlight the player HP UI.

```text
Keep an eye on your health.
You respawn at the camp when defeated.
```

### 4. Inventory

Highlight the inventory button.

```text
Loot, equipment and consumables are stored here.
```

### 5. Quests

Highlight the quest / objective UI.

```text
Complete quests, hunts and world events to earn rewards.
```

### 6. Map

Highlight the minimap / world map control.

```text
Use the map to explore regions, dungeons and objectives.
```

### 7. Multiplayer

Highlight chat or party UI.

```text
Group with other players for dungeons and world events.
```

### 8. Finish

```text
You're ready.
Explore Neverfall and have fun!
```

## NextStep.js

Use NextStep.js to anchor each onboarding step to existing DOM elements.

Example concept:

```js
{
  selector: "#action-bar",
  title: "Combat",
  content: "Use keys 1–4 to activate your abilities.",
}
```

Reuse existing HUD elements instead of creating duplicate tutorial UI.

## Out of Scope

Do not explain:

- every class ability
- equipment stats
- species bonuses
- boss mechanics
- rare enemies
- achievements
- shop details

Players can discover these systems naturally.

Do not add a complex tutorial quest or tutorial map.

## Acceptance Criteria

- First-time users see the onboarding automatically.
- Onboarding completion is stored per Meteor user.
- Creating another character does not trigger the tutorial again.
- Existing HUD elements are highlighted through NextStep.js.
- Flow has 6–8 short steps.
- `Skip` is always available.
- `HelpModal` includes a `Replay Onboarding` button.
- Manual replay works regardless of completion state.
- Manual replay does not reset or remove `onboardingCompleted`.
- Existing gameplay and HUD behavior remain unchanged.

## Codex Instructions

1. Read `AGENTS.md`.
2. Inspect the existing HUD, Meteor user profile, and `HelpModal` first.
3. Install / integrate **NextStep.js** using the project’s existing React setup.
4. Reuse existing DOM elements and IDs where possible.
5. Keep onboarding content short.
6. Store automatic completion on the Meteor user profile.
7. Add `Replay Onboarding` to `HelpModal`.
8. Reuse the same onboarding state / steps for automatic start and manual replay.
9. Use JavaScript only.
10. Avoid unrelated refactors.
11. Run relevant checks after implementation.
12. In the final response, list every changed file with its exact path.
