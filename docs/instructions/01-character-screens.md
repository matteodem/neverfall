# Character Screens

The game should have two screens that are visible when `profile.isPlaying` is false:

* Character Overview (List all characters for the user and display remove button for each charater + create button to create a new character + "Join World" button that loads the game)
* Character Creator (Display a flow of multiple pages to create a new character)

## TODO
* Create CharacterOverview Component that:
  * Displays the characters for the user
    * Sort the list by `lastPlayedAt`
    * Display the `name`, `species`, `gameClass` and `currentLevel` for each character
    * Each character entry is a button that can be clicked 
  * Displays a remove button for the selected character
  * Highlight the character button that matches `profile.currentCharacterId` with the id of the character
  * When clicking on the character button it should change the `profile.currentCharacterId`
  * The player character should load the `assetFile` and display the character in the center 
  * Set `profile.isPlaying` to true if the "Join World" Button is pressed (centered + at the bottom of the screen, prominent so that people don't overlook it)
  * If the user has no characters, display a "Create" button at the center of the screen
* Create CharacterCreator Component that:
  * Loads a flow of multiple screens that make it possible to create a character. For now the screens are:
    * Male or female 
    * Customize appearance (for now disabled, display "Work In Progress")
    * Species (`species` field on character): Only "Human" for now.
    * Classes (`gameClass` field on character): Warrior, Ranger and Elementalist
      * Warrior is selectable, the other classes are disabled
    * Name: Display text field where the user can enter the name for their character.
      * Display a "Create" button at the bottom center that finishes the creation and opens the CharacterOverview with the newly created character at the top of the list and make it selected.
      * Only enable "Create" button when the name is available. Make it visible in the screen that it's taken or given (green verified or red unverified icon)
  * Remove `characters.ensureCurrent` logic as it's not needed anymore
  * Set `profile.isPlaying` false for new guest users
  * Add logic that if `profile.isPlaying` is true it loads the game instantly and if it's false it display the ChracterOverview

### Additional considerations

* Use "zustand" library for state management
* Find a library that makes the character creation flow easy (each step is a separate screen)
  * Be sure that it has more than 1k downloads per week
* Use `useTracker` and `useSubscribe` from the `meteor/react-meteor-data` package
* Keep the code as DRY as possible