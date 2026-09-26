import React from "react";
import { FaGear } from "react-icons/fa6";
import { FaQuestion, FaHorse, FaLocationArrow } from "react-icons/fa";
import { BsBackpack4Fill } from "react-icons/bs";
import { GiBoarTusks, GiBroadsword, GiHealthCapsule, GiWolfHead, GiSwordWound, GiSpinningBlades, GiArrowhead, GiFireball } from "react-icons/gi";

const ICON_MAP = {
  gear: FaGear,
  question: FaQuestion,
  backpack: BsBackpack4Fill,
  locationArrow: FaLocationArrow,

  sword: GiBroadsword,
  arrow: GiArrowhead,
  fireball: GiFireball,
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
