import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User.js";
import { env } from "./env.js";

const handleOAuthLogin = async (accessToken, refreshToken, profile, done, provider) => {
  try {
    // Check if user exists by provider ID
    let user = await User.findOne({ providerId: profile.id, provider });

    if (user) {
      return done(null, user);
    }

    // Check if user exists by email (to link accounts or prevent duplicates)
    const email = profile.emails?.[0]?.value;
    if (email) {
      user = await User.findOne({ email });
      if (user) {
        // If user exists but has different provider, we could link them here.
        // For now, we'll just return the user, effectively logging them in.
        // Ideally, you'd update the user to add this provider ID.
        if (!user.providerId) {
            user.provider = provider;
            user.providerId = profile.id;
            await user.save({ validateBeforeSave: false });
        }
        return done(null, user);
      }
    }

    // Create new user
    const newUser = await User.create({
      username: profile.username || `user_${profile.id}`,
      email: email || `${profile.id}@no-email.com`, // Fallback if no email
      fullName: profile.displayName || profile.username || "User",
      avatar: profile.photos?.[0]?.value || "",
      provider,
      providerId: profile.id,
      password: `oauth_${provider}_${profile.id}_${Date.now()}`, // Dummy password
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
};

// Google Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        handleOAuthLogin(accessToken, refreshToken, profile, done, "google");
      }
    )
  );
}

// GitHub Strategy
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL || "/api/v1/auth/github/callback",
        scope: ["user:email"],
      },
      (accessToken, refreshToken, profile, done) => {
        handleOAuthLogin(accessToken, refreshToken, profile, done, "github");
      }
    )
  );
}

// Serialization (not strictly needed for stateless JWT but good for passport completeness)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
