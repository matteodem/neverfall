import {
  Meteor,
} from "meteor/meteor";

import {
  Random,
} from "meteor/random";

import {
  Characters,
} from "../../imports/api/characters/characters";

const MAX_CHARACTERS =
  5;

const VALID_APPEARANCE = {
  gender: [
    "female",
    "male",
  ],

  skinTone: [
    "light",
    "fair",
    "medium",
    "tan",
    "brown",
    "dark",
  ],

  bodyType: [
    "slim",
    "medium",
    "large",
  ],

  head: [
    "head1",
    "head2",
    "head3",
    "head4",
    "head5",
  ],
};


const DEFAULT_APPEARANCE = {
  gender:
    "female",

  skinTone:
    "medium",

  bodyType:
    "medium",

  head:
    "head1",
};


const normalizeName = (
  name
) => {
  return (
    name
      ?.trim()
      .toLowerCase() ||
    ""
  );
};


const requireUser = (
  userId
) => {
  if (!userId) {
    throw new Meteor.Error(
      "not-authorized"
    );
  }
};


const normalizeAppearance = (
  appearance
) => {
  return {
    gender:
      appearance?.gender ||
      DEFAULT_APPEARANCE.gender,

    skinTone:
      appearance?.skinTone ||
      DEFAULT_APPEARANCE.skinTone,

    bodyType:
      appearance?.bodyType ||
      DEFAULT_APPEARANCE.bodyType,

    head:
      appearance?.head ||
      DEFAULT_APPEARANCE.head,
  };
};


const validateAppearance = (
  appearance
) => {
  for (
    const [
      key,
      values,
    ]
    of Object.entries(
      VALID_APPEARANCE
    )
  ) {
    if (
      values.includes(
        appearance[
          key
        ]
      )
    ) {
      continue;
    }

    throw new Meteor.Error(
      `invalid-${key}`
    );
  }
};


Meteor.methods({
  async "characters.isNameAvailable"(
    name
  ) {
    const normalized =
      normalizeName(
        name
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
    species,
    gameClass,
    appearance,
  }) {
    requireUser(
      this.userId
    );

    const characterCount =
      await Characters.find({
        userId:
          this.userId,
      }).countAsync();

    if (
      characterCount >=
      MAX_CHARACTERS
    ) {
      throw new Meteor.Error(
        "character-limit-reached",
        `You can only create ${MAX_CHARACTERS} characters.`
      );
    }

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

    const normalizedAppearance =
      normalizeAppearance(
        appearance
      );

    validateAppearance(
      normalizedAppearance
    );

    const id =
      Random.id();

    await Characters.insertAsync({
      _id:
        id,

      id,

      userId:
        this.userId,

      name:
        cleanName,

      nameLower,

      species:
        "human",

      gameClass:
        "warrior",

      appearance:
        normalizedAppearance,

      currentLevel:
        1,

      currentXp:
        0,

      lastPlayedAt:
        new Date(),
    });

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.currentCharacterId":
            id,

          "profile.isPlaying":
            false,
        },

        /*
         * Removes the old architecture
         * if it exists on this user.
         */
        $unset: {
          "profile.appearance":
            "",
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


  async "characters.goToCharacterScreen"() {
    requireUser(
      this.userId
    );

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.isPlaying":
            false,
        },
      }
    );
  },
});

/* 

Characters.removeAsync({})
Meteor.users.removeAsync({})

*/