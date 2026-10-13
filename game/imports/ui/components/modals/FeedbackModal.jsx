import React, { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useHudStore } from "../../stores/useHudStore";
import { FantasyButton, FantasyModalFrame, FantasySectionHeader } from "../fantasy/FantasyUI";

const RATINGS = [["good", "Good"], ["okay", "Okay"], ["needs_improvement", "Needs improvement"]];

const FeedbackDialog = () => {
  const dialogRef = useRef(null);
  const successCloseRef = useRef(null);
  const pendingRef = useRef(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const closeModal = useHudStore((state) => state.closeModal);
  const dismiss = () => closeModal("feedback");

  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    dialog.querySelector("textarea").focus();
    return () => {
      dialog.close();
      const target = previousFocus?.isConnected ? previousFocus : document.querySelector('[aria-label="Help (Press U)"]');
      target?.focus();
    };
  }, []);

  useEffect(() => {
    if (submitted) successCloseRef.current?.focus();
  }, [submitted]);

  const submit = async (event) => {
    event.preventDefault();
    if (pendingRef.current || submitted) return;
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 2000) {
      setError("Enter feedback between 1 and 2,000 characters.");
      return;
    }
    pendingRef.current = true;
    setSaving(true);
    setError("");
    try {
      await Meteor.callAsync("feedback.submit", trimmed, rating);
      setSubmitted(true);
    } catch (failure) {
      setError(failure.reason || "Could not save your feedback. Please try again.");
    } finally {
      pendingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="modal fantasy-dialog" aria-label="Give Feedback" aria-describedby="feedback-helper"
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
      onCancel={(event) => { event.preventDefault(); dismiss(); }}>
      <FantasyModalFrame title="Give Feedback" onClose={dismiss} className="modal-box" bodyClassName="overflow-y-auto">
        <p id="feedback-helper" className="mt-2">Have an idea, found a bug, or want to share your experience?</p>
        {submitted ? <>
          <p role="status" className="mt-4">Thanks for your feedback!</p>
          <div className="modal-action"><FantasyButton ref={successCloseRef} onClick={dismiss}>Close</FantasyButton></div>
        </> : <form onSubmit={submit} className="mt-4 space-y-4" aria-busy={saving}>
          <fieldset disabled={saving}>
            <FantasySectionHeader as="legend" className="mb-2">Rating (optional)</FantasySectionHeader>
            <div className="flex flex-wrap gap-3">
              {RATINGS.map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="feedback-rating" value={value} className="radio radio-sm"
                    checked={rating === value} onChange={() => setRating(value)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block font-medium" htmlFor="feedback-message">Your feedback</label>
          <textarea id="feedback-message" className="textarea fantasy-input w-full" rows={5} required maxLength={2000}
            disabled={saving} value={message} onChange={(event) => setMessage(event.target.value)}
            aria-invalid={Boolean(error)} aria-describedby={error ? "feedback-error" : undefined} />
          {error && <p id="feedback-error" role="alert" className="text-sm fantasy-danger">{error}</p>}
          <div className="modal-action flex-wrap">
            <FantasyButton variant="secondary" onClick={dismiss}>Cancel</FantasyButton>
            <FantasyButton type="submit" disabled={saving || !message.trim()}>
              {saving ? "Saving…" : "Submit Feedback"}
            </FantasyButton>
          </div>
        </form>}
      </FantasyModalFrame>
      <div className="modal-backdrop">
        <button type="button" aria-label="Dismiss feedback" onClick={dismiss}>close</button>
      </div>
    </dialog>
  );
};

export const FeedbackModal = () => {
  const open = useHudStore((state) => state.openModals.includes("feedback"));
  return open ? <FeedbackDialog /> : null;
};
