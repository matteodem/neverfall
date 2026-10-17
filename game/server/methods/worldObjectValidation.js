import { Meteor } from "meteor/meteor";

const invalid = () => { throw new Meteor.Error("invalid-world-object", "Invalid world object data."); };
const hasKeys = (value, keys) => value && typeof value === "object" && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

const vector = (value, min, max) => {
  if (!hasKeys(value, ["x", "y", "z"]) || !Object.values(value).every((number) =>
    typeof number === "number" && Number.isFinite(number) && number >= min && number <= max)) invalid();
  return { x: value.x, y: value.y, z: value.z };
};

export const validateWorldObjectId = (id) => {
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) invalid();
  return id;
};

export const validateWorldObject = (data) => {
  if (!hasKeys(data, ["assetId", "position", "rotation", "scaling"]) || data.assetId !== "fence") invalid();
  return {
    assetId: data.assetId,
    position: vector(data.position, -1000, 1000),
    rotation: vector(data.rotation, -Math.PI * 2, Math.PI * 2),
    scaling: vector(data.scaling, 0.05, 20),
  };
};
