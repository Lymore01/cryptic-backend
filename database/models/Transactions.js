const mongoose = require("mongoose");

const TransactionsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    depositAmt:{
        type:Number
    },
    withdrawsAmt:{
      type:Number
    },
  },
  {
    timestamps: true,
  }
);

const Transactions = mongoose.model("Transactions", TransactionsSchema);

module.exports = Transactions;
