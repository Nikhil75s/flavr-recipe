/**
 * config/passport.js — Passport.js configuration for Google OAuth 2.0.
 */

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Register the Google OAuth 2.0 strategy with Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // From Google Cloud Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // From Google Cloud Console
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Must match the registered redirect URI
    },
    /**
     * Verify callback — called after Google authenticates the user.
     * @param {string} accessToken  - Google access token (not stored)
     * @param {string} refreshToken - Google refresh token (not stored)
     * @param {Object} profile      - User's Google profile (id, displayName, emails, photos)
     * @param {Function} done       - Passport callback to signal completion
     */
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with this Google ID already exists in our database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Returning user — update their name and avatar in case it changed on Google
          user.name = profile.displayName;
          user.avatar = profile.photos[0]?.value || user.avatar;
          await user.save();
          return done(null, user);
        }

        // New user — create a User document with their Google profile data
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || "",
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

// Serialize/deserialize — required by Passport even though we use JWT (not sessions)
// These convert between user object ↔ session ID
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
