import React, { useState } from "react";
import { AccountModal } from "./AccountModal";

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
      <div role="tablist" className="tabs tabs-box mt-4">
        {["login", "register"].map((value) => (
          <button key={value} type="button" role="tab" aria-selected={mode === value}
            disabled={busy} className={`tab ${mode === value ? "tab-active" : ""}`}
            onClick={() => { setMode(value); setValidation(""); clearError(); }}>
            {value === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>
      <form key={mode} onSubmit={submit} className="mt-4 space-y-3">
        <fieldset disabled={busy} className="space-y-3">
          {register ? <>
            <label className="block">Username
              <input name="username" required autoComplete="username" className="input mt-1 w-full" />
            </label>
            <label className="block">Email
              <input name="email" type="email" required autoComplete="email" className="input mt-1 w-full" />
            </label>
          </> : <label className="block">Username or email
            <input name="identity" required autoComplete="username" className="input mt-1 w-full" />
          </label>}
          <label className="block">Password
            <input name="password" type="password" required autoComplete={register ? "new-password" : "current-password"}
              className="input mt-1 w-full" />
          </label>
          {register && <label className="block">Confirm password
            <input name="confirmPassword" type="password" required autoComplete="new-password" className="input mt-1 w-full" />
          </label>}
        </fieldset>
        {message && <p role="alert" className="text-sm text-error">{message}</p>}
        <div className="modal-action">
          <button type="button" className="btn" disabled={busy} onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Please wait…" : register ? "Register" : "Login"}
          </button>
        </div>
      </form>
    </AccountModal>
  );
};
