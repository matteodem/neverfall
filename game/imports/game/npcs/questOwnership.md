# NPC quest acquisition

All normal quests now require acceptance through the NPC's `offeredQuestIds`.
The catalog owns `requiredLevel`; omitted/null requirements allow any level.
NPC dialogue, markers, and server acceptance share the availability helper in
`npcQuests.js`. Existing quests keep their previous completion/reward behavior:
the three original NPC quests require turn-in, other quests reward on objective
completion, and accepted repeatable hunts remain active across cycles.

## Backward compatibility

No bulk migration or progress reset is performed. Explicit `questStates` wins.
For old records without a state, a persisted `questProgress` key is treated as an
active quest (including zero after a repeatable hunt). Finished non-repeatable
progress is treated as already rewarded because the previous service paid rewards
automatically. Untouched quests without saved progress remain available and must
be accepted. This cannot recover an old implicit zero-progress quest that never
wrote any player-specific data; it is indistinguishable from an unaccepted quest.
The next progress event persists an explicit state without changing existing counts.

## Ownership and levels

| NPC | Quest ID | Required level |
| --- | --- | --- |
| Forest Guard | forest-boars | 1 |
| Forest Guard | forest-mini-boss | 3 |
| Forest Guard | speak-with-mage | 1 |
| Forest Guard | boar-hunt | 1 |
| Forest Guard | wolf-hunt | 2 |
| Forest Guard | giant-hunt | 3 |
| Forest Guard | wolf-problem | 2 |
| Forest Guard | giant-threat | 3 |
| Forest Guard | goat-hunt | 5 |
| Forest Guard | rat-hunt | 7 |
| Forest Guard | bee-hunt | 9 |
| Forest Guard | snow-wolf-hunt | 10 |
| Forest Guard | mountain-goat-hunt | 12 |
| Forest Guard | frost-ogre-hunt | 14 |
| Forest Guard | defend-northern-camp | 7 |
| Forest Guard | awakened-threat | 8 |
| Wandering Mage | explore-highlands | 5 |
| Wandering Mage | find-the-depths | 7 |
| Wandering Mage | into-the-depths | 7 |
| Wandering Mage | northern-ruins-quest | 10 |
| Wandering Mage | explore-snowy-mountains | 10 |
| Wandering Mage | highlands-relics | 9 |
| Wandering Mage | frozen-disturbance | 11 |
| Merchant | seal-hunt | 15 |
| Merchant | hammer-guardian-hunt | 17 |
| Merchant | trouble-at-southwest-lake | 14 |
