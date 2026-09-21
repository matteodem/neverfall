import {
  Meteor,
} from "meteor/meteor";

import {
  Random,
} from "meteor/random";

import {
  Characters,
} from "../../imports/api/characters/characters";

const DEFAULT_ASSET =
  "/models/player.glb";

const normalizeName = (
  name
) =>
  name
    .trim()
    .toLowerCase();

const requireUser = (
  userId
) => {
  if (!userId) {
    throw new Meteor.Error(
      "not-authorized"
    );
  }
};

Meteor.methods({
  async "characters.isNameAvailable"(
    name
  ) {
    const normalized =
      normalizeName(
        name || ""
      );

    if (!normalized) {
      return false;
    }

    const existing =
      await Characters.findOneAsync({
        nameLower:
          normalized,
      });

    return !existing;
  },

  async "characters.create"({
    name,
    gender,
    species,
    gameClass,
  }) {
    requireUser(
      this.userId
    );

    const cleanName =
      name?.trim();

    if (!cleanName) {
      throw new Meteor.Error(
        "invalid-name"
      );
    }

    const nameLower =
      normalizeName(
        cleanName
      );

    const existing =
      await Characters.findOneAsync({
        nameLower,
      });

    if (existing) {
      throw new Meteor.Error(
        "name-taken"
      );
    }

    if (
      ![
        "male",
        "female",
      ].includes(
        gender
      )
    ) {
      throw new Meteor.Error(
        "invalid-gender"
      );
    }

    if (
      species !==
      "human"
    ) {
      throw new Meteor.Error(
        "invalid-species"
      );
    }

    if (
      gameClass !==
      "warrior"
    ) {
      throw new Meteor.Error(
        "invalid-class"
      );
    }

    const id =
      Random.id();

    const character = {
      _id: id,
      id,

      userId:
        this.userId,

      name:
        cleanName,

      nameLower,

      gender,

      species:
        "human",

      gameClass:
        "warrior",

      currentLevel:
        1,

      currentXp:
        0,

      assetFile:
        DEFAULT_ASSET,

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
            id,

          "profile.isPlaying":
            false,
        },
      }
    );

    return id;
  },

  async "characters.select"(
    characterId
  ) {
    requireUser(
      this.userId
    );

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

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.currentCharacterId":
            characterId,
        },
      }
    );
  },

  async "characters.remove"(
    characterId
  ) {
    requireUser(
      this.userId
    );

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

    await Characters.removeAsync(
      characterId
    );

    const nextCharacter =
      await Characters.findOneAsync(
        {
          userId:
            this.userId,
        },
        {
          sort: {
            lastPlayedAt:
              -1,
          },
        }
      );

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.currentCharacterId":
            nextCharacter?._id ||
            "",
        },
      }
    );
  },

  async "characters.joinCurrent"() {
    requireUser(
      this.userId
    );

    const user =
      await Meteor.users.findOneAsync(
        this.userId
      );

    const characterId =
      user?.profile
        ?.currentCharacterId;

    if (!characterId) {
      throw new Meteor.Error(
        "character-not-selected"
      );
    }

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

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.isPlaying":
            true,
        },
      }
    );
  },
});