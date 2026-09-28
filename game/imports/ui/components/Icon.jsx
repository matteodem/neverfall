import React from "react";
import { FaGear } from "react-icons/fa6";
import { FaQuestion, FaHorse, FaLocationArrow, FaTrophy, FaMap, FaStore } from "react-icons/fa";
import { BsBackpack4Fill } from "react-icons/bs";
import { GiBoarTusks, GiBroadsword, GiHealthCapsule, GiWolfHead, GiSwordWound, GiSpinningBlades, GiArrowhead, GiFireball, GiHeavyArrow, GiArrowCluster, GiFireBomb, GiFireRing } from "react-icons/gi";

const ICON_MAP = {
  map: FaMap,
  trophy: FaTrophy,
  gear: FaGear,
  question: FaQuestion,
  backpack: BsBackpack4Fill,
  shop: FaStore,
  locationArrow: FaLocationArrow,

  sword: GiBroadsword,
  arrow: GiArrowhead,
  fireball: GiFireball,
  strongArrow: GiHeavyArrow,
  multiShot: GiArrowCluster,
  fireballBurst: GiFireBomb,
  fireNova: GiFireRing,
  heavyStrike: GiSwordWound,
  cleave: GiSpinningBlades,
  healthCapsule: GiHealthCapsule,
  horse: FaHorse,
  boarSkin: GiBoarTusks,
  wolfSkin: GiWolfHead,
};

export const Icon = ({ icon, ...props }) => {
  const IconComponent = ICON_MAP[icon];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};
