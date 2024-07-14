const mongoose = require("mongoose");
const Transactions = require("../models/Transactions");

async function getTotalTransactionsByUser(userId) {
  try {
    const result = await Transactions.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$user",
          totalDeposits: { $sum: "$depositAmt" },
          totalWithdraws: { $sum: "$withdrawsAmt" },
        },
      },
    ]);

    return result.length > 0
      ? {
          totalDeposits: result[0].totalDeposits,
          totalWithdraws: result[0].totalWithdraws,
        }
      : 0;
  } catch (error) {
    console.error("Error aggregating deposits:", error);
    throw error;
  }
}

module.exports = getTotalTransactionsByUser;
