const SOUND_VOLUME = {
  attack:
    0.45,

  loot:
    0.5,
};


const SOUND_FILES = {
  attack: [
    "/sounds/knifeSlice.ogg",
  ],

  loot: [
    "/sounds/handleCoins.ogg",
  ],
};


/*
 * =====================================================
 * AUDIO CACHE
 * =====================================================
 *
 * Keep one preloaded template for every file.
 * A clone is used when playing so sounds can
 * overlap without cutting each other off.
 */

const audioCache =
  new Map();


const getAudio =
  (
    path
  ) => {
    if (
      audioCache.has(
        path
      )
    ) {
      return audioCache.get(
        path
      );
    }


    const audio =
      new Audio(
        path
      );


    audio.preload =
      "auto";


    audioCache.set(
      path,
      audio
    );


    return audio;
  };


const getRandomFile =
  (
    sound
  ) => {
    const files =
      SOUND_FILES[
        sound
      ];


    if (
      !files?.length
    ) {
      return null;
    }


    const index =
      Math.floor(
        Math.random() *
          files.length
      );


    return files[
      index
    ];
  };


/*
 * =====================================================
 * PRELOAD
 * =====================================================
 */

export const preloadSounds =
  () => {
    Object
      .values(
        SOUND_FILES
      )
      .flat()
      .forEach(
        (
          path
        ) => {
          getAudio(
            path
          );
        }
      );
  };


/*
 * =====================================================
 * PLAY
 * =====================================================
 */

export const playGameSound =
  (
    sound
  ) => {
    const path =
      getRandomFile(
        sound
      );


    if (
      !path
    ) {
      return;
    }


    const template =
      getAudio(
        path
      );


    const audio =
      template.cloneNode(
        true
      );


    audio.volume =
      SOUND_VOLUME[
        sound
      ] ??
      1;


    audio
      .play()
      .catch(
        () => {
          /*
           * Browsers may block sound
           * before the first user
           * interaction.
           */
        }
      );
  };
