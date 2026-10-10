import React, { useEffect, useMemo, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { NextStepProvider, NextStepReact, useNextStep } from "nextstepjs";
import { useDungeonStore } from "./stores/useDungeonStore";
import { useLoadingStore } from "./stores/useLoadingStore";
import { useMobileDevice } from "./hooks/useMobileDevice";
import { useHudStore } from "./stores/useHudStore";

export const ONBOARDING_TOUR = "neverfall-onboarding";

const getSteps = (mobile) => [{
  tour: ONBOARDING_TOUR,
  steps: [
    { title: "Start at Central Camp", content: mobile
      ? "Use the joystick to move. Your first goal is a boar just outside camp."
      : "Move with WASD; drag with a mouse button to turn the camera. Find a boar just outside camp." },
    { title: "Your first fight", content: mobile
      ? "Move close to a boar and tap a skill below. Watch your health; defeat returns you to camp."
      : "Move close to a boar and press 1–4 to use skills. Watch your health; defeat returns you to camp.",
      selector: "#onboarding-action-bar", side: "top-right", pointerPadding: 12, cardOffset: 12 },
    { title: "Your next goal", content: mobile
      ? "Follow the Adventure Guide under Objectives to regional NPCs. Accept quests from them and track progress in Hero → Quests."
      : "Follow the Adventure Guide to regional NPCs. Accept quests from them and track progress in Hero → Quests.",
      selector: mobile ? undefined : "#onboarding-adventure-guide", side: "left" },
  ],
}];

const OnboardingCard = ({ step, currentStep, totalSteps, nextStep, prevStep, skipTour }) => (
  <div className={`w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-white/20 bg-neutral-900 p-4 text-white shadow-2xl ${step.selector === "#onboarding-inventory" ? "max-w-[calc(100vw-6rem)]" : ""}`}>
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

export const OnboardingTour = ({ children }) => {
  const { mobile } = useMobileDevice();
  const steps = useMemo(() => getSteps(mobile), [mobile]);
  return (
    <NextStepProvider>
      <NextStepReact
        steps={steps}
        cardComponent={OnboardingCard}
        shadowOpacity="0.35"
        overlayZIndex={40000}
        scrollToTop={false}
        noInViewScroll
        onComplete={saveCompletion}
        onSkip={saveCompletion}
      >
        {children}
      </NextStepReact>
    </NextStepProvider>
  );
};

export const OnboardingAutoStart = ({ completed }) => {
  const { startNextStep } = useNextStep();
  const started = useRef(false);
  const ready = useLoadingStore((state) => state.progress === 100 && !state.visible);
  const location = useDungeonStore((state) => state.location);
  const hasOpenModal = useHudStore((state) => state.openModals.length > 0);

  useEffect(() => {
    if (!ready || location !== "world" || hasOpenModal || completed || started.current) return;
    started.current = true;
    startNextStep(ONBOARDING_TOUR);
  }, [ready, location, hasOpenModal, completed, startNextStep]);

  return null;
};
