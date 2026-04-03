import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
import User from "../models/userModel.js";
import { ENV } from "./env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check existing user
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            isVerified: true,
          });
        }

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);


// ================= SESSION HANDLING =================

// store user id in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// get user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;