import {
  Meteor,
} from "meteor/meteor";

import {
  Random,
} from "meteor/random";

import {
  Characters,
} from "../../imports/api/characters/characters";

Meteor.methods({
  async "characters.ensureCurrent"() {

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized"
      );
    }

    const user =
      await Meteor.users.findOneAsync(
        this.userId
      );

    if (!user) {
      throw new Meteor.Error(
        "user-not-found"
      );
    }

    console.log('ensure current')

    console.log({ user, characters: await Characters.find().fetch() })

    /*
     * ===================================================
     * 1. TRY CURRENT CHARACTER
     * ===================================================
     */

    const currentCharacterId =
      user.profile
        ?.currentCharacterId;

    if (
      currentCharacterId
    ) {
      const character =
        await Characters.findOneAsync({
          _id:
            currentCharacterId,

          userId:
            this.userId,
        });

      if (character) {
        await Characters.updateAsync(
          character._id,
          {
            $set: {
              lastPlayedAt:
                new Date(),
            },
          }
        );

        /*
         * Make sure older accounts
         * also have the new fields.
         */
        await Meteor.users.updateAsync(
          this.userId,
          {
            $set: {
              "profile.currentCharacterId":
                character.id,

              "profile.isPlaying":
                true,
            },
          }
        );

        return {
          ...character,

          lastPlayedAt:
            new Date(),
        };
      }
    }

    /*
     * ===================================================
     * 2. MAYBE USER ALREADY HAS A CHARACTER
     * ===================================================
     */

    const existingCharacter =
      await Characters.findOneAsync({
        userId:
          this.userId,
      });

    if (
      existingCharacter
    ) {
      await Characters.updateAsync(
        existingCharacter._id,
        {
          $set: {
            lastPlayedAt:
              new Date(),
          },
        }
      );

      await Meteor.users.updateAsync(
        this.userId,
        {
          $set: {
            "profile.currentCharacterId":
              existingCharacter.id,

            "profile.isPlaying":
              true,
          },
        }
      );

      return existingCharacter;
    }

    /*
     * ===================================================
     * 3. CREATE FIRST CHARACTER
     * ===================================================
     */

    const characterId =
      Random.id();

    const shortId =
      Random.id(6);

    const character = {
      _id:
        characterId,

      id:
        characterId,

      userId:
        this.userId,

      name:
        `guest-${shortId}`,

      species:
        "human",

      gameClass: 
        "warrior",

      currentLevel:
        1,

      currentXp:
        0,

      assetFile:
        "/models/player.glb",

      lastPlayedAt:
        new Date(),
    };

    await Characters.insertAsync(
      character
    );

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.currentCharacterId":
            characterId,

          "profile.isPlaying":
            true,
        },
      }
    );

    return character;
  },
});