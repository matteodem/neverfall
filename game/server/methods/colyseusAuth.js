import {
  Meteor,
} from "meteor/meteor";

import jwt from "jsonwebtoken";

const getSecret = () => {
  /*
   * Fine for local development.
   *
   * Production:
   * always use COLYSEUS_AUTH_SECRET.
   */
  return (
    process.env
      .COLYSEUS_AUTH_SECRET ||
    "neverfall-development-secret"
  );
};

Meteor.methods({
  async "colyseus.authToken"() {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized"
      );
    }

    return jwt.sign(
      {
        userId:
          this.userId,
      },

      getSecret(),

      {
        expiresIn: "5m",
        issuer:
          "neverfall-meteor",
      }
    );
  },
});