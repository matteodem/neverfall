# Quest Defaults Cleanup

## Goal

Standardize quest completion behavior after the Hunt-to-Quest migration.

Normal quests should require returning to the relevant NPC for turn-in, and former Hunt quests should no longer be repeatable.

## Default Quest Behavior

Update the quest configuration defaults to:

```js
turnInRequired: true,
repeatable: false,
```

These should be the default values when a quest does not explicitly define them.

Only override them for exceptional quests.

## `turnInRequired`

`turnInRequired` should default to `true`.

Expected flow:

```text
Accept quest from NPC
    ↓
Complete objectives
    ↓
Quest becomes ready to turn in
    ↓
Return to relevant NPC
    ↓
Receive XP / gold rewards
    ↓
Quest becomes rewarded/completed
```

This keeps NPCs relevant throughout the quest flow and gives the existing `?` quest marker a clear purpose.

### Exceptions

Allow:

```js
turnInRequired: false
```

only for quests that intentionally auto-complete, such as certain system, exploration, or tutorial-style quests.

Do not require every quest definition to manually specify `turnInRequired: true`; use the default.

## Repeatability

`repeatable` should default to `false`.

Normal quests should only be completed and rewarded once.

Do not require every quest definition to manually specify `repeatable: false`; use the default.

If repeatable quests are added again in the future, they should explicitly opt in:

```js
repeatable: true
```

## Former Hunt Quests

Audit all quests that were migrated from the old Hunt system.

They must NOT remain repeatable.

Examples include any migrated quests such as:

- Boar Hunt
- Wolf Hunt
- Forest Giant Hunt
- Other former Hunt content

Ensure they behave as normal one-time regional quests:

```text
Available
→ Accepted
→ Objectives completed
→ Turn in to NPC
→ Rewarded
→ Never offered again
```

Remove any legacy Hunt-specific logic that resets these quests or makes them available again after completion.

## Quest Availability

A non-repeatable rewarded/completed quest must not be offered again by its NPC.

The existing quest availability logic should account for the new default:

```text
repeatable === false
+
quest already rewarded/completed
=
not available
```

Do not duplicate this check across NPC UI and quest marker logic.

Use the existing centralized quest availability helper/service.

## Quest Markers

Quest marker behavior should follow the standardized lifecycle:

```text
Available quest
= !

Active quest
= ?

Ready to turn in
= ?

Rewarded non-repeatable quest
= no marker
```

Former Hunt quests must not regain a `!` after being rewarded.

## Backward Compatibility

Preserve existing active quest progress.

Do not reset quests that players already accepted.

For existing completed/rewarded Hunt-derived quests:

- keep them completed,
- do not make them available again,
- do not allow rewards to be claimed again.

If persisted data contains an older explicit `repeatable: true` behavior for migrated Hunt quests, update the relevant quest definitions/configuration so they are treated as non-repeatable going forward.

## Architecture Requirements

- Define default quest behavior in one central place.
- Avoid manually adding `turnInRequired: true` and `repeatable: false` to every quest unless needed for clarity.
- Keep explicit overrides possible.
- Reuse existing quest-state and availability helpers.
- Do not introduce Hunt-specific special cases if normal quest logic can handle the behavior.
- Avoid unrelated refactors.

## Acceptance Criteria

The task is complete when:

- `turnInRequired` defaults to `true`.
- `repeatable` defaults to `false`.
- Normal quests require NPC turn-in unless explicitly configured otherwise.
- Former Hunt quests are all non-repeatable.
- Completed former Hunt quests are not offered again.
- Former Hunt quests cannot grant rewards more than once.
- `!` and `?` quest markers reflect the standardized lifecycle.
- Existing active quest progress remains intact.
- Explicit `turnInRequired: false` still works.
- Explicit `repeatable: true` still remains possible for future special quests.
- Existing quest tests/checks continue to pass.

## Implementation Process

Before implementation:

- Read `AGENTS.md`.
- Inspect the central quest-definition/default handling.
- Inspect quest availability logic.
- Inspect quest completion/turn-in logic.
- Inspect all migrated Hunt quest definitions.
- Search for legacy repeatable Hunt behavior.
- Inspect quest marker state derivation.
- Mention the exact file path for every created or modified file.

After implementation:

- Test a normal quest without explicitly setting either flag.
- Verify it requires turn-in.
- Verify it cannot be repeated.
- Test a former Hunt quest from accept through reward.
- Verify it never becomes available again afterward.
- Test an explicit `turnInRequired: false` quest if one exists.
- Test an explicit `repeatable: true` override in isolation if practical.
- Run relevant syntax, server-side, persistence, and focused browser checks.
- Report which former Hunt quests were updated or verified as non-repeatable.
