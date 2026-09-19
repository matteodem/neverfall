import React from "react";
import { FaGear } from "react-icons/fa6";
import { FaQuestion, FaShoppingBag  } from "react-icons/fa";
import { BsBackpack4Fill } from "react-icons/bs";

const ICON_MAP = {
  gear: FaGear,
  question: FaQuestion,
  backpack: BsBackpack4Fill,
};

export const Icon = ({ icon, ...props }) => {
  const IconComponent = ICON_MAP[icon];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent {...props} />;
};