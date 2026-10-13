import React, { useState } from "react";
import { AccountModal } from "./AccountModal";
import { FantasyButton } from "./fantasy/FantasyUI";

export const AuthModal = ({ busy, error, onSubmit, onClose, clearError }) => {
  const [mode, setMode] = useState("login");
  const register = mode === "register";
  const [validation, setValidation] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    if (!(register ? fields.username?.trim() && fields.email?.trim() : fields.identity?.trim()) || !fields.password) {
      setValidation("Fill in all required fields.");
      return;
    }
    if (register && fields.password !== fields.confirmPassword) {
      setValidation("Passwords do not match.");
      return;
    }
    setValidation("");
    onSubmit(mode, fields, () => form.reset());
  };
  const message = validation || error;
  return (
    <AccountModal title={register ? "Register" : "Login"} busy={busy} onClose={onClose}>
      <div role="tablist" className="fantasy-tabs mt-4" aria-label="Authentication mode">
        {["login", "register"].map((value) => (
          <FantasyButton key={value} variant="secondary" role="tab" aria-selected={mode === value}
            disabled={busy} className="fantasy-tab"
            onClick={() => { setMode(value); setValidation(""); clearError(); }}>
            {value === "login" ? "Login" : "Register"}
          </FantasyButton>
        ))}
      </div>
      <form key={mode} onSubmit={submit} className="mt-4 space-y-3">
        <fieldset disabled={busy} className="space-y-3">
          {register ? <>
            <label className="block">Username
              <input name="username" required autoComplete="username" className="input fantasy-input mt-1 w-full" />
            </label>
            <label className="block">Email
              <input name="email" type="email" required autoComplete="email" className="input fantasy-input mt-1 w-full" />
            </label>
          </> : <label className="block">Username or email
            <input name="identity" required autoComplete="username" className="input fantasy-input mt-1 w-full" />
          </label>}
          <label className="block">Password
            <input name="password" type="password" required autoComplete={register ? "new-password" : "current-password"}
              className="input fantasy-input mt-1 w-full" />
          </label>
          {register && <label className="block">Confirm password
            <input name="confirmPassword" type="password" required autoComplete="new-password" className="input fantasy-input mt-1 w-full" />
          </label>}
        </fieldset>
        {message && <p role="alert" className="fantasy-danger text-sm">{message}</p>}
        <div className="modal-action flex-wrap gap-2">
          <FantasyButton variant="secondary" disabled={busy} onClick={onClose}>Cancel</FantasyButton>
          <FantasyButton type="submit" disabled={busy}>
            {busy ? "Please wait…" : register ? "Register" : "Login"}
          </FantasyButton>
        </div>
      </form>
    </AccountModal>
  );
};
