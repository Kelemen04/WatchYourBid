import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import "dotenv/config"
console.log("A beolvasott REDIRECT URL:", process.env.REDIRECT);
passport.use(new GoogleStrategy({
    clientID: `${process.env.CLIENT_ID}`,
    clientSecret: `${process.env.CLIENT_SECRET}`,
    callbackURL: `${process.env.REDIRECT}`,
    proxy: true
  }, (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
  }
));