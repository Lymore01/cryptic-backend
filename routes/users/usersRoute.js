const express = require("express");
const usersRoute = express.Router();
const passport = require("../../authentication/passport");
const {
  userLogin,
  userRegister,
  getCurrentUser, 
  getUserDetailsByID,
  generatePrivateKeysAndAddress,
  depositMoney,
  withdrawMoney,
  sendMoney
} = require("../../controllers/users/usersController");

// register user
usersRoute.post("/user/register-user", userRegister);

// login user
usersRoute.post(
  "/user/login-user",
  passport.authenticate("local"),
  userLogin
);

// get current user

usersRoute.get("/user/current-user", getCurrentUser)

// get user details
usersRoute.get("/user/:id", getUserDetailsByID)

// generate private keys and public address
usersRoute.post("/user/generate-assign-keys", generatePrivateKeysAndAddress)

// deposit
usersRoute.post("/user/deposit", depositMoney)

// withdraw
usersRoute.post("/user/withdraw", withdrawMoney)

// send
usersRoute.post("/user/send", sendMoney)



module.exports = usersRoute;
