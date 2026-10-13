import React, {
  useState,
} from "react";

import {
  Meteor,
} from "meteor/meteor";

import {
  HudModal,
} from "../HudModal";
import { FantasyButton } from "../fantasy/FantasyUI";

import {
  useHudStore,
} from "../../stores/useHudStore";

export const SettingsModal = () => {
  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  const closeModal =
    useHudStore(
      (state) =>
        state.closeModal
    );

  const goToCharacterScreen =
    async () => {
      if (loading) {
        return;
      }

      setLoading(
        true
      );

      try {
        /*
         * Close modal immediately.
         */
        closeModal();

        await Meteor.callAsync(
          "characters.goToCharacterScreen"
        );
      } catch (
        error
      ) {
        console.error(
          "[Settings] Could not go to character screen:",
          error
        );

        setLoading(
          false
        );
      }
    };

  const SETTINGS = [
    {
      id:
        "character-screen",

      label:
        "Go To Character Screen",

      onClick:
        goToCharacterScreen,

      disabled:
        loading,

      loadingLabel:
        "Loading...",
    },
  ];

  return (
    <HudModal
      id="settings"
      title="Settings"
      backdrop
    >
      <div className="flex flex-col gap-2">
        {SETTINGS.map(
          (
            setting
          ) => (
            <FantasyButton
              key={
                setting.id
              }
              onClick={
                setting.onClick
              }
              disabled={
                setting.disabled
              }
              className="w-full cursor-pointer disabled:cursor-not-allowed"
            >
              {setting.disabled
                ? setting.loadingLabel
                : setting.label}
            </FantasyButton>
          )
        )}
      </div>
    </HudModal>
  );
};
