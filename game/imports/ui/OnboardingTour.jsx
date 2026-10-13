import React, { useEffect, useMemo, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { NextStepProvider, NextStepReact, useNextStep } from "nextstepjs";
import { useDungeonStore } from "./stores/useDungeonStore";
import { useLoadingStore } from "./stores/useLoadingStore";
import { useMobileDevice } from "./hooks/useMobileDevice";
import { useHudStore } from "./stores/useHudStore";
import { FantasyBadge, FantasyButton, FantasyPanel, FantasySectionHeader } from "./components/fantasy/FantasyUI";

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
      ? "Speak with the Forest Guard at Central Camp to accept quests. Use Hero → Quests to track one quest under Objectives. Discovery quests lead you to new regional NPCs."
      : "Speak with the Forest Guard at Central Camp to accept quests. Use Hero → Quests to track one quest in the HUD. Discovery quests lead you to new regional NPCs." },
  ],
}];

const OnboardingCard = ({ step, currentStep, totalSteps, nextStep, prevStep, skipTour }) => (
  <FantasyPanel className={`fantasy-onboarding-card fantasy-section ${step.selector === "#onboarding-inventory" ? "max-w-[calc(100vw-6rem)]" : ""}`}>
    <FantasyBadge>{currentStep + 1} / {totalSteps}</FantasyBadge>
    <FantasySectionHeader as="h2" className="fantasy-heading-inline mt-2">{step.title}</FantasySectionHeader>
    <p className="mt-2 text-sm">{step.content}</p>
    <div className="fantasy-onboarding-actions mt-4 flex items-center justify-between gap-2">
      <FantasyButton variant="ghost" className="btn-sm" onClick={skipTour}>Skip</FantasyButton>
      <div className="flex gap-2">
        <FantasyButton variant="secondary" className="btn-sm" onClick={prevStep} disabled={currentStep === 0}>Back</FantasyButton>
        <FantasyButton className="btn-sm" onClick={nextStep}>{currentStep === totalSteps - 1 ? "Done" : "Next"}</FantasyButton>
      </div>
    </div>
  </FantasyPanel>
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
