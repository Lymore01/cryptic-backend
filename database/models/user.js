const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: false,
      default: "Tester",
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    assetsBalance: {
      type: Number,
      default: 0,
    },
    apy: {
      type: Number,
      default: 0,
    },
    privateKey: {
      type: String,
      unique: false,
      default: "none",
    },
    publicAddress: {
      type: String,
      unique: false,
      default: "none",
    },
    totalDepositAmount: {
      type: Number,
      default: 0,
    },
    totalWithdrawAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
