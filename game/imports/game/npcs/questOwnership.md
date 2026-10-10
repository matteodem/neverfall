# Regional NPC quest ownership

All 26 quests use centralized `QUESTS` definitions and NPC `offeredQuestIds`.
The 11 former Hunts are ordinary repeatable quests, retaining their IDs, objectives,
required levels, XP/gold amounts, and the Boar Hunt random-ring reward. They remain
active across reward cycles. The three original turn-in quests still require a
return to their NPC; other quests retain automatic rewards on objective completion.

## Regional hubs

- Central Forest: Forest Guard near Central Camp; Wandering Mage offers the local dungeon quests.
- Highlands: Highlands Scout near the Northern Camp waypoint.
- Snowy Mountains: Mountain Researcher near the Snowy Mountains waypoint.
- Southwest Lake: Lake Ranger near the Lake waypoint.
- Merchant remains at Central Camp with Shop/Sell; lake quests move to Lake Ranger.

The Adventure Guide shows only the highest-level hub available to the player.
Each hub's starting level is the minimum `requiredLevel`
of its offered quests: 1, 5, 10, and 14 respectively. The guide does not accept
quests, store progress, count kills, or award rewards. Hero → Quests shows progress.
NPC rendering, acceptance validation, and `!` / `?` markers use the existing shared
quest ownership and level-gating helpers.

## Player data and rewards

No progress-copy migration or quest reset is needed: the existing Hunt service
already saved counts in `questProgress[questId]` and acceptance in `questStates`.
These identifiers and values remain unchanged when ownership moves to a regional
NPC. No completion event, XP grant, gold grant, or item grant runs during migration.
Completed repeatable cycles stay at zero, so previously paid cycles are not replayed.

Explicit `questStates` wins. A legacy saved progress key without a state remains an
active quest, including zero for repeatable quests. Finished non-repeatable legacy
progress remains rewarded, preserving the existing compatibility rule. Untouched
quests require NPC acceptance. An old implicit zero-progress quest with no saved key
cannot be distinguished from an unaccepted quest and is not automatically accepted.

The old `adventureGuide.firstHunt` / `achievements.firstHunt` markers are read only
on character join to preserve the renamed First Quest achievement. They no longer
receive writes or drive gameplay. This backfill pays no quest rewards. New automatic
quest completions and NPC turn-ins use the shared `quest` achievement event.
Historical database markers are left inert rather than deleting character data.

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
| Central Forest / Forest Guard | boar-hunt | 1 |
| Central Forest / Forest Guard | wolf-hunt | 2 |
| Central Forest / Forest Guard | giant-hunt | 3 |
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
