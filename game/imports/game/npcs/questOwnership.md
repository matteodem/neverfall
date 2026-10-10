# Regional NPC quest ownership

All quests use centralized `QUESTS` definitions and NPC `offeredQuestIds`.
`QUEST_DEFAULTS` applies `turnInRequired: true` and `repeatable: false` before
individual quest overrides. Normal quests follow available → active → completed
(ready to turn in) → rewarded. Rewards are paid at the owning NPC, and rewarded
non-repeatable quests cannot be accepted again. Explicit automatic-completion or
repeatability overrides remain supported.

The eight enabled former Hunts (Goat, Rat, Bee, Seal, Snow Wolf, Mountain Goat,
Frost Ogre, and Hammer Guardian) inherit these one-time turn-in defaults. The
Boar, Wolf, and Forest Giant Hunt definitions remain commented out; their former
repeatability overrides were also removed. IDs, objectives, required levels,
reward amounts, and the disabled Boar Hunt random-ring reward are preserved.

## Regional hubs

- Central Forest: Forest Guard near Central Camp; Wandering Mage offers the local dungeon quests.
- Highlands: Highlands Scout near the Northern Camp waypoint.
- Snowy Mountains: Mountain Researcher near the Snowy Mountains waypoint.
- Southwest Lake: Lake Ranger near the Lake waypoint.
- Merchant remains at Central Camp with Shop/Sell; lake quests move to Lake Ranger.

Discovery quests replace the Adventure Guide. Forest Guard offers Discover the
Highlands at level 5; Highlands Scout offers Discover the Snowy Mountains at level
10; Mountain Researcher offers Discover Southwest Lake at level 14. Each uses an
ordinary `InteractNpc` objective for the destination NPC. Interaction quests default
to `turnInRequired: false`: talking to the target pays rewards, removes the quest
from the active log, and clears its tracking. Older ready-to-turn-in interaction
quests also finish when the player speaks to the target again. They do not unlock
regions or auto-grant quests.

`trackedQuestId` is persisted on each character. Accepting a quest selects it;
Hero → Quests can replace that selection with any active/ready quest. The HUD below
World Event displays only that quest using existing progress, retaining ready
quests until reward collection clears the selection. Invalid saved selections are
cleared on world join. No next quest is selected automatically. Adventure Guide
UI, recommendations, and writes are removed; old fields remain read-only for
spawn-point, waypoint, landmark, and achievement compatibility.
NPC rendering, acceptance validation, and `!` / `?` markers use the existing shared
quest ownership and level-gating helpers.

## Player data and rewards

No progress-copy migration or quest reset is needed: the existing Hunt service
already saved counts in `questProgress[questId]` and acceptance in `questStates`.
These identifiers and values remain unchanged when ownership moves to a regional
NPC. No completion event, XP grant, gold grant, or item grant runs during migration.
No rewards are paid simply by applying the new defaults. Explicit rewarded states
remain rewarded, and active counts remain unchanged. The old repeatable flow reset
paid cycles to zero without retaining per-quest reward history. Those records cannot
be distinguished from newly accepted zero-progress quests, or active progress after
an earlier paid cycle. They remain active; historical paid cycles cannot be recovered
reliably from this data. After the change, each normal quest can be turned in once.

Explicit `questStates` wins. A legacy saved progress key without a state remains an
active quest, including zero left by formerly repeatable quests. Finished legacy
progress remains rewarded, preserving the existing compatibility rule. Untouched
quests require NPC acceptance. An old implicit zero-progress quest with no saved key
cannot be distinguished from an unaccepted quest and is not automatically accepted.

The old `adventureGuide.firstHunt` / `achievements.firstHunt` markers are read only
on character join to preserve the renamed First Quest achievement. They no longer
receive writes or drive gameplay. This backfill pays no quest rewards. New automatic
quest completions and NPC turn-ins use the shared `quest` achievement event.
Historical database markers are left inert rather than deleting character data.

Turn-in commits reward state, XP, and any random-ring item in one character update.
Gold retains its separate atomic receipt guard. `questRewardCounts[questId]` records
successful turn-ins so future explicitly repeatable quests can use a separate gold
receipt per cycle. Availability is shared by NPC offers, server acceptance, and
quest markers; active/ready quests show `?`, available quests show `!`, and rewarded
non-repeatable quests contribute no marker.

The Hunt-only Colyseus counters, client store, network messages, popup, Hero tab,
H shortcut, area restrictions, and map overlays are removed. Enemy kill and boss
events now use standard accepted-quest tracking in world and dungeon rooms.
Deploy client and server together because the obsolete realtime schema fields were removed.

## Quest ownership and required levels

| Region / NPC | Quest ID | Required level |
| --- | --- | --- |
| Central Forest / Forest Guard | forest-boars | 1 |
| Central Forest / Forest Guard | forest-mini-boss | 3 |
| Central Forest / Forest Guard | speak-with-mage | 1 |
| Central Forest / Forest Guard | boar-hunt (disabled) | 1 |
| Central Forest / Forest Guard | wolf-hunt (disabled) | 2 |
| Central Forest / Forest Guard | giant-hunt (disabled) | 3 |
| Central Forest / Forest Guard | wolf-problem | 2 |
| Central Forest / Forest Guard | giant-threat | 3 |
| Central Forest / Forest Guard | awakened-threat | 8 |
| Central Forest / Wandering Mage | find-the-depths | 7 |
| Central Forest / Wandering Mage | into-the-depths | 7 |
| Highlands / Highlands Scout | goat-hunt | 5 |
| Highlands / Highlands Scout | rat-hunt | 7 |
| Highlands / Highlands Scout | bee-hunt | 9 |
| Highlands / Highlands Scout | explore-highlands | 5 |
| Highlands / Highlands Scout | defend-northern-camp | 7 |
| Highlands / Highlands Scout | highlands-relics | 9 |
| Highlands / Highlands Scout | northern-ruins-quest | 10 |
| Snowy Mountains / Mountain Researcher | snow-wolf-hunt | 10 |
| Snowy Mountains / Mountain Researcher | mountain-goat-hunt | 12 |
| Snowy Mountains / Mountain Researcher | frost-ogre-hunt | 14 |
| Snowy Mountains / Mountain Researcher | explore-snowy-mountains | 10 |
| Snowy Mountains / Mountain Researcher | frozen-disturbance | 11 |
| Southwest Lake / Lake Ranger | seal-hunt | 15 |
| Southwest Lake / Lake Ranger | hammer-guardian-hunt | 17 |
| Southwest Lake / Lake Ranger | trouble-at-southwest-lake | 14 |

## Files changed in this migration

Modified:

- `game/imports/game/achievements.js`
- `game/imports/game/adventureGuide.js`
- `game/imports/game/gameSession.js`
- `game/imports/game/multiplayer.js`
- `game/imports/game/npcs/npcDefinitions.js`
- `game/imports/game/npcs/npcQuests.js`
- `game/imports/game/npcs/questOwnership.md`
- `game/imports/game/quests.js`
- `game/imports/ui/Game.jsx`
- `game/imports/ui/Hud.jsx`
- `game/imports/ui/OnboardingTour.jsx`
- `game/imports/ui/components/AdventureGuide.jsx`
- `game/imports/ui/components/modals/GroupedHudModals.jsx`
- `game/imports/ui/components/modals/HelpModal.jsx`
- `game/imports/ui/components/modals/QuestsModal.jsx`
- `game/imports/ui/components/modals/WorldMapMarker.jsx`
- `game/imports/ui/components/modals/WorldMapModal.jsx`
- `game/server/colyseus/DungeonRoom.js`
- `game/server/colyseus/WorldRoom.js`
- `game/server/colyseus/WorldState.js`
- `game/server/npcQuests.js`
- `game/server/quests.js`

Removed:

- `game/imports/ui/components/HuntProgressPopup.jsx`
- `game/imports/ui/components/modals/HuntsModal.jsx`
- `game/imports/ui/stores/useQuestStore.js`
