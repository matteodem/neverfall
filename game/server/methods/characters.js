import {
  Meteor,
} from "meteor/meteor";

import {
  Random,
} from "meteor/random";

import {
  Characters,
} from "../../imports/api/characters/characters";


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
  if (
    !VALID_APPEARANCE.gender.includes(
      appearance.gender
    )
  ) {
    throw new Meteor.Error(
      "invalid-gender"
    );
  }

  if (
    !VALID_APPEARANCE.skinTone.includes(
      appearance.skinTone
    )
  ) {
    throw new Meteor.Error(
      "invalid-skin-tone"
    );
  }

  if (
    !VALID_APPEARANCE.bodyType.includes(
      appearance.bodyType
    )
  ) {
    throw new Meteor.Error(
      "invalid-body-type"
    );
  }

  if (
    !VALID_APPEARANCE.head.includes(
      appearance.head
    )
  ) {
    throw new Meteor.Error(
      "invalid-head"
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


    /*
     * NAME
     */

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


    /*
     * SPECIES
     */

    if (
      species !==
      "human"
    ) {
      throw new Meteor.Error(
        "invalid-species"
      );
    }


    /*
     * CLASS
     */

    if (
      gameClass !==
      "warrior"
    ) {
      throw new Meteor.Error(
        "invalid-class"
      );
    }


    /*
     * APPEARANCE
     */

    const normalizedAppearance =
      normalizeAppearance(
        appearance
      );

    validateAppearance(
      normalizedAppearance
    );


    /*
     * CHARACTER
     */

    const id =
      Random.id();

    const character = {
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

      currentLevel:
        1,

      currentXp:
        0,

      lastPlayedAt:
        new Date(),
    };


    await Characters.insertAsync(
      character
    );


    /*
     * USER PROFILE
     */

    await Meteor.users.updateAsync(
      this.userId,
      {
        $set: {
          "profile.appearance":
            normalizedAppearance,

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