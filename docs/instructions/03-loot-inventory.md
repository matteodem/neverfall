Add a simple loot system with inventory (items + money)

## TODO

- [ ] Add `profile.inventory.money` and `profile.inventory.items` to the user
- [ ] Money is an integer which is then split up into gold, silver and bronze (e.g. 10425 equals 1 gold, 4 silver and 25 bronze). Add a util function that converts the money number into it's parts
- [ ] Items are a list of item, with example data structure: { id: 'item_id' }. Then in the frontend, have a helper function that groups together the items with the same id into a stack with a number
- [ ] Display those new fields inside the InventoryModal
- [ ] When the user kills an enemy it should spawn a small white glowing orb which is the loot
- [ ] Add a small overlay in the center when close to the orb with the content "Press F to loot"
- [ ] After F is pressed the user always gets money (for now 50 bronze)
- [ ] Make randomized 70% chance that the character gets "Boar Skin" Item, which is then added to the inventory