import React from "react";
import { FaGear } from "react-icons/fa6";
import { FaQuestion, FaHorse } from "react-icons/fa";
import { BsBackpack4Fill } from "react-icons/bs";
import { GiBroadsword, GiHealthCapsule } from "react-icons/gi";

const ICON_MAP = {
  gear: FaGear,
  question: FaQuestion,
  backpack: BsBackpack4Fill,

  sword: GiBroadsword,
  healthCapsule: GiHealthCapsule,
  horse: FaHorse,
};

export const Icon = ({ icon, ...props }) => {
  const IconComponent = ICON_MAP[icon];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};