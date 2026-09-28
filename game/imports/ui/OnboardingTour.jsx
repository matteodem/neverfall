import React, { useEffect, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { NextStepProvider, NextStepReact, useNextStep } from "nextstepjs";
import { useDungeonStore } from "./stores/useDungeonStore";
import { useLoadingStore } from "./stores/useLoadingStore";

export const ONBOARDING_TOUR = "neverfall-onboarding";

const steps = [{
  tour: ONBOARDING_TOUR,
  steps: [
    { title: "Movement", content: "Move with WASD. Hold RMB to rotate the camera." },
    { title: "Combat", content: "Use keys 1–4 to activate your abilities.", selector: "#onboarding-action-bar", side: "top" },
    { title: "Health", content: "Watch your health. You respawn at camp when defeated.", selector: "#onboarding-health", side: "top" },
    { title: "Inventory", content: "Loot, equipment and consumables are stored here.", selector: "#onboarding-inventory", side: "bottom" },
    { title: "Quests", content: "Complete quests, hunts and world events for rewards.", selector: "#onboarding-quests", side: "left" },
    { title: "Map", content: "Explore regions, dungeons and objectives with the map.", selector: "#onboarding-map", side: "left" },
    { title: "Multiplayer", content: "Group with other players for dungeons and world events.", selector: "#onboarding-chat", side: "top" },
    { title: "You're ready", content: "Explore Neverfall and have fun!" },
  ],
}];

const OnboardingCard = ({ step, currentStep, totalSteps, nextStep, prevStep, skipTour }) => (
  <div className="w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-white/20 bg-neutral-900 p-4 text-white shadow-2xl">
    <div className="mb-1 text-xs text-white/60">{currentStep + 1} / {totalSteps}</div>
    <h2 className="text-lg font-bold">{step.title}</h2>
    <p className="mt-2 text-sm">{step.content}</p>
    <div className="mt-4 flex items-center justify-between gap-2">
      <button type="button" className="btn btn-sm" onClick={skipTour}>Skip</button>
      <div className="flex gap-2">
        <button type="button" className="btn btn-sm btn-outline text-white hover:text-black disabled:text-black" onClick={prevStep} disabled={currentStep === 0}>Back</button>
        <button type="button" className="btn btn-sm btn-primary" onClick={nextStep}>{currentStep === totalSteps - 1 ? "Done" : "Next"}</button>
      </div>
    </div>
  </div>
);

const saveCompletion = () => {
  Meteor.callAsync("onboarding.complete").catch((error) => {
    console.error("[Onboarding] Could not save completion", error);
  });
};

export const OnboardingTour = ({ children }) => (
  <NextStepProvider>
    <NextStepReact
      steps={steps}
      cardComponent={OnboardingCard}
      shadowOpacity="0.35"
      overlayZIndex={40000}
      scrollToTop={false}
      onComplete={saveCompletion}
      onSkip={saveCompletion}
    >
      {children}
    </NextStepReact>
  </NextStepProvider>
);

export const OnboardingAutoStart = ({ completed }) => {
  const { startNextStep } = useNextStep();
  const started = useRef(false);
  const ready = useLoadingStore((state) => state.progress === 100 && !state.visible);
  const location = useDungeonStore((state) => state.location);

  useEffect(() => {
    if (!ready || location !== "world" || completed || started.current) return;
    started.current = true;
    startNextStep(ONBOARDING_TOUR);
  }, [ready, location, completed, startNextStep]);

  return null;
};
