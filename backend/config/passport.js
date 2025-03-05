const passport = require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/authModel.js');
const jwt = require('jsonwebtoken');
// passport.use(
//   new MicrosoftStrategy(
//     {
//       clientID: process.env.MICROSOFT_CLIENT_ID,
//       clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
//       callbackURL: 'http://localhost:5000/api/auth/microsoft/callback',
//       scope: ['user.read'], // Ensure scope includes Graph permissions
//       tenantId: process.env.MICROSOFT_TENANT_ID,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         console.log('Microsoft Access Token:', accessToken); // Debug token
//         return done(null, { id: profile.id, accessToken });
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: '/api/auth/microsoft/callback',
        scope: ['user.read'],
        tenantId: process.env.MICROSOFT_TENANT_ID,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await User.findOne({ email });
          if (!user) {
            user = new User({
              email,
              name: profile.displayName,
              microsoftId: profile.id,
              username: email.split('@')[0], // e.g., 23BTIT101 from 23BTIT101@gcu.edu.in
            });
            await user.save();
          } else if (!user.microsoftId) {
            user.microsoftId = profile.id;
            await user.save();
          }
            // Generate JWT token for session management
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            user.token = token; // Attach token to user object for later use
          return done(null, { id: user._id, accessToken });
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // From Google Cloud Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // From Google Cloud Console
    callbackURL: "/api/auth/google/callback" // Must match your registered redirect URI
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find user by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Check if email already exists with a password account
            const existingEmailUser = await User.findOne({ email: profile.emails[0].value });
            if (existingEmailUser) {
                return done(null, false, { message: "Email already registered with a password account." });
            }

            // Create new Google user
            user = new User({
                username: profile.displayName || profile.emails[0].value.split('@')[0],
                email: profile.emails[0].value,
                googleId: profile.id
            });
            await user.save();
            console.log('New Google User Created:', user);
        }

        // Generate JWT token for session management
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        user.token = token; // Attach token to user object for later use

        return done(null, user);
    } catch (err) {
        console.error('Google Auth Error:', err);
        return done(err, null);
    }
}));

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
