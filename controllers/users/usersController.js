const userModel = require("../../database/models/user");
const depositsModel = require("../../database/models/Transactions");
const bcrypt = require("bcryptjs");
const generateKeys = require("../../utils/createPrivateKeys");
const getTotalTransactionsByUser = require("../../database/pipelines/pipeline");


// get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated!" });
    }

    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching current user!" });
  }
};

// register user
exports.userRegister = async (req, res) => {
  const user = new userModel({
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
  });
  try {
    const users = await user.save();
    res.status(201).json({ users, message: "User registered successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Server error" });
    console.error(error);
  }
};



// login user
exports.userLogin = async (req, res) => {
  req.session.userId = req.session.passport.user;
  try {
    res.status(201).json({
      message: "User logged in successfully!",
      user: req.user,
      session: req.session.id,
    });
  } catch (error) {
    res.json({ message: "You must login!" });
  }
};

// get users details
exports.getUserDetailsByID = async (req, res) => {
  // const userId = req.user
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    res.json({ message: "Error fetching user details!" });
  }
};

// generate keys
exports.generatePrivateKeysAndAddress = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
  const { phrase } = req.body;
  const keysGenerated = generateKeys(phrase);
  const privateKey = keysGenerated.privateKey;
  const address = keysGenerated.address;

  try {
    const result = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { privateKey: privateKey, publicAddress: address } },
      { returnOriginal: false } // To return the updated document
    );

    // Send a success response with the updated user information
    res.status(200).json({
      message: "Keys and public address assigned and updated successfully!",
      user: result.value,
    });
  } catch (error) {
    res.json({ message: "Error generating and assigning keys!" });
  }
};

// deposit
exports.depositMoney = async (req, res) => {
  const { depositAmt } = req.body;
  const { userId } = req.body;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (depositAmt < 0) {
      return res.status(404).json({ message: "Error depositing 0 KSH" });
    }

    const deposit = new depositsModel({
      user: userId,
      depositAmt,
    });

    await deposit.save();

    let depositTotal = 0;

    try {
      const data = await getTotalTransactionsByUser(userId);
      depositTotal = data["totalDeposits"];
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ message: "Error calculating total deposits" });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          accountBalance: user.accountBalance + JSON.parse(depositAmt) - 5,
          totalDepositAmount: depositTotal,
        },
      },
      { returnDocument: "after" }
    );

    console.log(depositTotal);

    return res.status(200).json({
      message: "Deposit successful!",
      user: updatedUser,
    });
  } catch (error) {
    res.json({ message: "Error depositing!" });
  }
};

// withdraw money
exports.withdrawMoney = async (req, res) => {
  const { withdrawAmt } = req.body;
  const { userId } = req.body;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.accountBalance < withdrawAmt) {
      return res.status(400).json({ message: "Insufficient funds!" });
    }

    const deposit = new depositsModel({
      user: userId,
      withdrawsAmt: withdrawAmt,
    });

    await deposit.save();

    let withdrawTotal = 0;

    try {
      const data = await getTotalTransactionsByUser(userId);

      withdrawTotal = data["totalWithdraws"];
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ message: "Error calculating total deposits" });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          accountBalance: user.accountBalance - withdrawAmt,
          totalWithdrawAmount: withdrawTotal - 5,
        },
      },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      message: "Withdrawal successful!",
      user: updatedUser,
    });
  } catch (error) {
    res.json({ message: "Error withdrawing!" });
  }
};

// send money
exports.sendMoney = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated!" });
  }
  const { sendAmt } = req.body;
  const { receiverAddress } = req.body;

  if (!receiverAddress) {
    return res.status(401).json({ message: "Invalid receiver address!" });
  }

  try {
    const receiver = await userModel.findOne({
      publicAddress: receiverAddress,
    });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found!" });
    }

    await userModel.findOneAndUpdate(
      { publicAddress: receiverAddress },
      { $set: { accountBalance: receiver.accountBalance + sendAmt } },
      { returnDocument: "after" }
    );

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.publicAddress === receiverAddress) {
      return res
        .status(400)
        .json({ message: "You cannot send money to you own account :(" });
    }

    if (user.accountBalance < sendAmt) {
      return res.status(400).json({ message: "Insufficient funds to send!" });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { accountBalance: user.accountBalance - sendAmt } },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      message: `sent successful to ${receiver.email}`,
      user: updatedUser,
    });
  } catch (error) {
    res.json({ message: "Error sending money!" });
  }
};

// profile
