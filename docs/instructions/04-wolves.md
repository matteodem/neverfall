# Wolves Enemy

Add 5 wolves to the map, spawn them in the north west of the forest.

## TODO

* Refactor enemy logic to configurable values inside the enemy code.
  * Add level configuration which makes the damage and hp of the enemies increase with each level
* Spawn 5 wolves as described above
  * The wolves are Level 3 (they have more HP and damage than the level 1 boards)
  * The wolf asset is in: \game\public\models\wolf.glb
  * Spawn them in the north west of the forest
* Add a "wolf hunt" quest
  * Make the area where boars are keep the "boar hunt" in HUD
  * As soon as the player enters the area where the wolves are, it should update the HUD and display "Wolf Hunt". 
    * The goal is to kill 5 wolves
    * Reward is 250 XP
    * It's repeatable
* Make the forest bigger so that the wolves spawn inside the forest
