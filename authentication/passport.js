const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("../database/models/user");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "invalid email or password" }); 
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "invalid email or password" });
        }
        return done(null, user); //default true
      } catch (error) {
        return done(error);
      }
    }
  )
);

// serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// deserialize user
passport.deserializeUser(async (_id, done) => {
  const user = await UserModel.findById(_id);
  done(null, user);
});

module.exports = passport;
