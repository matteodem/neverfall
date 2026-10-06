import React, { createContext, useContext, useRef, useState } from "react";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { logoutToGuest } from "../auth/guest";
import { useCharacterStore } from "./stores/useCharacterStore";
import { AccountModal } from "./components/AccountModal";
import { AuthModal } from "./components/AuthModal";

const AccountContext = createContext(null);
export const useCharacterAccountFlow = () => useContext(AccountContext);

const authError = (error, mode) => {
  const reason = error?.reason || "";
  if (/username.*(exists|taken)/i.test(reason)) return "That username is already taken.";
  if (/email.*(exists|taken)/i.test(reason)) return "That email is already registered.";
  if (/password.*(short|least|invalid)/i.test(reason)) return "Please use a longer password.";
  if (error?.error === 403 && mode === "login") return "Incorrect username, email, or password.";
  return mode === "login" ? "Could not log in. Check your details and connection, then try again."
    : "Could not register. Check your details and connection, then try again.";
};

export const CharacterAccountFlow = ({ children }) => {
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [error, setError] = useState("");
  const transfer = useRef(null);
  const pending = useRef(false);
  const open = (value) => { setError(""); setModal(value); };
  const close = () => { if (!pending.current) { setModal(null); setError(""); } };
  const begin = () => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    return true;
  };
  const finish = () => { pending.current = false; setBusy(false); };

  const authenticate = async (mode, fields, clearForm) => {
    if (!begin()) return;
    setAuthBusy(true);
    try {
      // Capture source authority while this connection is still the guest.
      transfer.current = await Meteor.callAsync("characters.prepareGuestTransfer");
      await new Promise((resolve, reject) => {
        const callback = (failure) => failure ? reject(failure) : resolve();
        if (mode === "register") {
          Accounts.createUser({ username: fields.username.trim(), email: fields.email.trim(), password: fields.password }, callback);
        } else Meteor.loginWithPassword(fields.identity.trim(), fields.password, callback);
      });
      if (Meteor.user()?.profile?.guest === true) throw new Error("Guest accounts cannot receive transfers.");
      clearForm();
      await Meteor.callAsync("characters.goToCharacterScreen");
      useCharacterStore.getState().resetCreator();
      useCharacterStore.getState().setScreen("overview");
      setModal(transfer.current.count > 0 ? "transfer" : null);
      if (!transfer.current.count) {
        await Meteor.callAsync("characters.discardGuestTransfer", transfer.current.token);
        transfer.current = null;
      }
    } catch (failure) {
      // Authentication may have succeeded even if the following request lost its response.
      const user = Meteor.user();
      if (user && !user.profile?.guest) {
        clearForm();
        setModal(transfer.current?.count > 0 ? "transfer" : "accountError");
        setError("Signed in, but could not finish updating the character screen. Please try again.");
      } else setError(authError(failure, mode));
    } finally {
      setAuthBusy(false);
      finish();
    }
  };

  const resolveTransfer = async (keepSeparate) => {
    if (!transfer.current || !begin()) return;
    if (keepSeparate) {
      // Declining needs no data change; the server context also expires automatically.
      void Meteor.callAsync("characters.discardGuestTransfer", transfer.current.token).catch(() => {});
      transfer.current = null;
      setModal(null);
      finish();
      return;
    }
    try {
      await Meteor.callAsync("characters.goToCharacterScreen");
      await Meteor.callAsync("characters.transferGuestCharacters", transfer.current.token);
      transfer.current = null;
      setModal(null);
    } catch (failure) {
      setError(["character-limit-reached", "guest-transfer-expired", "guest-transfer-unavailable"].includes(failure?.error)
        ? failure.reason : "Could not finish the transfer. Check your connection and try again.");
    } finally { finish(); }
  };

  const logout = async () => {
    if (!begin()) return;
    setAuthBusy(true);
    try {
      if (Meteor.userId()) await Meteor.callAsync("characters.goToCharacterScreen");
      await logoutToGuest();
      transfer.current = null;
      useCharacterStore.getState().resetCreator();
      useCharacterStore.getState().setScreen("overview");
      setModal(null);
    } catch {
      setError("Could not finish logging out. Check your connection and try again.");
    } finally { setAuthBusy(false); finish(); }
  };

  const returnToCharacters = async () => {
    if (!begin()) return;
    try {
      await Meteor.callAsync("characters.goToCharacterScreen");
      setModal(null);
    } catch { setError("Could not update the character screen. Please try again."); }
    finally { finish(); }
  };

  return (
    <AccountContext.Provider value={{ authBusy, open }}>
      {children}
      {modal === "auth" && <AuthModal busy={busy} error={error} onSubmit={authenticate} onClose={close} clearError={() => setError("")} />}
      {modal === "transfer" && <AccountModal title="Guest characters" busy={busy} onClose={() => resolveTransfer(true)}>
        <p className="py-4">Do you want to transfer your guest characters to this account?</p>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <div className="modal-action">
          <button type="button" className="btn" disabled={busy} onClick={() => resolveTransfer(true)}>Keep Separate</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => resolveTransfer(false)}>Transfer Characters</button>
        </div>
      </AccountModal>}
      {modal === "logout" && <AccountModal title="Logout" busy={busy} onClose={close}>
        <p className="py-4">Do you really want to logout?</p>
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
        <div className="modal-action">
          <button type="button" className="btn" disabled={busy} onClick={close}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={logout}>Logout</button>
        </div>
      </AccountModal>}
      {modal === "accountError" && <AccountModal title="Account" busy={busy} onClose={close}>
        <p role="alert" className="py-4 text-sm text-error">{error}</p>
        <div className="modal-action"><button type="button" className="btn" disabled={busy} onClick={returnToCharacters}>Try again</button></div>
      </AccountModal>}
    </AccountContext.Provider>
  );
};

export const CharacterAuthButton = () => {
  const user = useTracker(() => Meteor.user(), []);
  const { open } = useCharacterAccountFlow();
  if (!user) return null;
  const guest = user.profile?.guest === true;
  return <button type="button" className="btn btn-outline text-white hover:text-black" onClick={() => open(guest ? "auth" : "logout")}>
    {guest ? "Login" : "Logout"}
  </button>;
};
