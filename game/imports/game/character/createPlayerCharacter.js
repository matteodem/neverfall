import { createKayKitCharacter } from "./createKayKitCharacter";
import { createQuaterniusCharacter } from "./createQuaterniusCharacter";

export const createPlayerCharacter = async (options) => {
  try {
    return await createQuaterniusCharacter(options);
  } catch (error) {
    console.warn("[Character] Quaternius load failed; using KayKit character", error);
    return createKayKitCharacter(options);
  }
};
