import {
  Meteor,
} from "meteor/meteor";

import jwt from "jsonwebtoken";

import {
  Characters,
} from "../../imports/api/characters/characters";

const getSecret = () =>
  process.env
    .COLYSEUS_AUTH_SECRET ||
  "neverfall-development-secret";

Meteor.methods({
  async "colyseus.authToken"() {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized"
      );
    }

    const user =
      await Meteor.users.findOneAsync(
        this.userId,
        {
          fields: {
            "profile.currentCharacterId":
              1,
          },
        }
      );

    const characterId =
      user?.profile
        ?.currentCharacterId;

    if (!characterId) {
      throw new Meteor.Error(
        "character-not-selected"
      );
    }

    /*
     * Never trust a character ID
     * coming directly from client.
     */

    const character =
      await Characters.findOneAsync({
        _id:
          characterId,

        userId:
          this.userId,
      });

    if (!character) {
      throw new Meteor.Error(
        "character-not-found"
      );
    }

    await Characters.updateAsync(
      characterId,
      {
        $set: {
          lastPlayedAt:
            new Date(),
        },
      }
    );

    return jwt.sign(
      {
        userId:
          this.userId,

        characterId,

        characterName:
          character.name,
      },
      getSecret(),
      {
        expiresIn:
          "5m",

        issuer:
          "neverfall-meteor",
      }
    );
  },
});