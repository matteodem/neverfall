# Feedback Modal (MVP)

## Goal
Let players voluntarily submit feedback without interrupting gameplay. Add a **Give Feedback** button inside the existing **Help** modal. Clicking it opens a separate feedback modal with a backdrop.

## Scope
- Reuse the existing React, Tailwind CSS, DaisyUI, Meteor.js, and MongoDB patterns in this project.
- Keep changes small and consistent with the current architecture.
- Do **not** add a permanent HUD button, toast invitation, automatic popup, survey, or notification prompting players to leave feedback.

## User flow
1. Player opens the existing Help modal.
2. Player clicks **Give Feedback**.
3. Close the Help modal, then open the **Give Feedback** modal with a backdrop (avoid overlapping modal backdrops).
4. Player enters feedback and optionally selects a rating.
5. Player clicks **Submit Feedback**.
6. Save the feedback via a Meteor method into MongoDB.
7. Show **Thanks for your feedback!** after a successful save, then allow closing the modal.
8. Player can dismiss the modal without sending feedback via the close button, Escape, or clicking the backdrop.

## Feedback modal UI
- Title: **Give Feedback**
- Short helper text: **Have an idea, found a bug, or want to share your experience?**
- Optional rating: **Good**, **Okay**, **Needs improvement** (single choice, initially unselected).
- Multiline textarea: **Your feedback**; required, trimmed; maximum 2,000 characters.
- Buttons: **Cancel** and **Submit Feedback**.
- Disable submit while saving and prevent duplicate submissions.
- Show an inline, understandable error if submission fails. Do not clear feedback on failure.
- Make the modal responsive and accessible (focus handling, labelled fields, keyboard dismissal); follow existing DaisyUI modal conventions.

## Backend and storage
- Create a `Feedback` MongoDB collection or reuse an appropriate existing feedback collection if one exists.
- Add a Meteor method such as `feedback.submit`.
- Validate all data server-side: required nonempty trimmed feedback text <= 2,000 characters; optional rating must be one of `good`, `okay`, `needs_improvement`.
- Store `message`, `rating` (or `null`), `createdAt`, and `userId` (or `null` for guests who are not logged in). Do not collect extra personal information.
- Allow guest players to submit feedback under the project's existing guest authentication model.
- Apply basic server-side rate limiting to limit spam (e.g. a few submissions per user/connection per hour), using existing app conventions where possible.
- Do not publish feedback entries to clients and do not add a public feedback list or admin UI in this task.

## Acceptance criteria
- [ ] Help modal contains a **Give Feedback** button.
- [ ] Clicking the button opens the feedback modal and backdrop without leaving the game.
- [ ] Modal can be dismissed using X/Cancel, Escape, or backdrop.
- [ ] A blank or whitespace-only message cannot be submitted.
- [ ] Rating is optional.
- [ ] Successful submissions appear in MongoDB and show a thank-you message.
- [ ] Errors are surfaced without losing the entered feedback.
- [ ] No feedback prompt appears automatically during gameplay.
- [ ] Existing Help modal and gameplay controls continue to work.

## Instructions for Codex
1. Read `AGENTS.md` and inspect the existing Help modal, Meteor methods, collections, and validation/rate-limit patterns before coding.
2. Implement this feature using existing component structure and conventions. Avoid unrelated refactors and unnecessary dependencies.
3. Report the exact files modified or added and what changed in each.
4. Run relevant available checks/tests and report results; if a check cannot run, explain why.
