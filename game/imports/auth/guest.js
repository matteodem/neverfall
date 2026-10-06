import {
  Accounts,
} from "meteor/accounts-base";

import {
  Meteor,
} from "meteor/meteor";

import {
  Tracker,
} from "meteor/tracker";

let guestPromise = null;

const createGuestAccount = () => {
  return new Promise(
    (resolve, reject) => {
      const id =
        crypto.randomUUID();

      const username =
        `guest_${id}`;

      const password =
        crypto.randomUUID() +
        crypto.randomUUID();

      Accounts.createUser(
        {
          username,
          password,

          profile: {
            guest: true,

            isPlaying: false,

            currentCharacterId:
              "",
          }
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            Meteor.userId()
          );
        }
      );
    }
  );
};

export const ensureGuestUser = () => {
  /*
   * Avoid creating multiple users when
   * ensureGuestUser() is called several times.
   */
  if (guestPromise) {
    return guestPromise;
  }

  guestPromise =
    new Promise(
      (resolve, reject) => {
        Tracker.autorun(
          (computation) => {
            /*
             * Wait until Meteor has a
             * DDP connection.
             */
            if (
              !Meteor.status()
                .connected
            ) {
              return;
            }

            /*
             * Meteor may still be restoring
             * an existing login token.
             */
            if (
              Accounts.loggingIn()
            ) {
              return;
            }

            /*
             * We have reached a stable
             * authentication state.
             */
            computation.stop();

            /*
             * Existing account restored.
             */
            if (
              Meteor.userId()
            ) {
              console.log(
                "[Auth] Existing user:",
                Meteor.userId()
              );

              resolve(
                Meteor.userId()
              );

              return;
            }

            /*
             * No account:
             * create anonymous guest.
             */

            createGuestAccount()
              .then(
                (userId) => {
                  console.log(
                    "[Auth] Guest created:",
                    userId
                  );

                  resolve(
                    userId
                  );
                }
              )
              .catch(
                (error) => {
                  /*
                   * Allow retry if guest
                   * creation failed.
                   */
                  guestPromise = null;

                  reject(
                    error
                  );
                }
              );
          }
        );
      }
    );

  return guestPromise;
};

export const logoutToGuest = async () => {
  await new Promise((resolve, reject) => {
    Meteor.logout((error) => error ? reject(error) : resolve());
  });
  guestPromise = null;
  return ensureGuestUser();
};
