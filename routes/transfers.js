const express = require("express");
const router = express.Router();
const Transfers = require("../models/TransfersModel");
const BankAccounts = require("../models/BankAccountsModel");
const verify = require("../verifyToken");
const mongoose = require("mongoose");

router.post("/newTransfer", verify, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userAccount = req.user.account.account; //account number
    const fromAccount = await BankAccounts.findOne({
      account: userAccount,
    }).session(session);;
    if (!fromAccount) {
      await session.abortTransaction(); 
      return res.status(404).json({ ok: false, message: "Your number, please try again" });
    }
    const toAccount = await BankAccounts.findOne({
      account: req.body.toAccountNumber,
    }).session(session);;
    if (!toAccount || toAccount.account == userAccount) {
     await session.abortTransaction();
      return res.status(400).json({ok: false,message:"Invalid account number, please try again to send to the correct account",});
    }
    if (req.body.transferAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ ok: false, message: "Check that you are making a transfer that is greater than $0",});
    }
    if (fromAccount.balance < req.body.transferAmount) {
      await session.abortTransaction();
      return res.status(400).json({ ok: false, message: "You don't have enough money" });
    }

    //UpdateBalance
    await BankAccounts.findOneAndUpdate(
      {
        account: userAccount,
      },
      { $inc: { balance: -req.body.transferAmount } },
      { session }
    );
    await BankAccounts.findOneAndUpdate(
      {
        account: req.body.toAccountNumber,
      },
      { $inc: { balance: req.body.transferAmount } },
      { session }
    );

    //History
    const newTransferHistory = new Transfers({
      fromAccountNumber: userAccount,
      toAccountNumber: req.body.toAccountNumber,
      transferAmount: req.body.transferAmount,
    });
    await newTransferHistory.save({ session });
    await session.commitTransaction();
    return res.status(200).json({ ok: true, newTransferHistory });
  } 
  catch (err) {
    await session.abortTransaction();
    return res.status(500).json(err.message);
  } finally {
    session.endSession(); // תמיד לסיים את הסשן
  }
});

//History Transfers
router.get("/", async (req, res) => {
  const AllTransfers = await Transfers.find({});
  res.json(AllTransfers);
});

//Single account history Transfers by account number
router.get("/AccountHistoryTransfers", verify, async (req, res) => {
  try {
    const userAccount = req.user.account.account; //account number
    const accountTransfersHistory = await Transfers.find({$or:[{
      fromAccountNumber: userAccount,
    },{
      toAccountNumber: userAccount
    }]});

    if (accountTransfersHistory.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No transfers found for this account number",
      });
    }
    const checkSenderDetails = await BankAccounts.findOne({
      account: userAccount,
    }).populate("user");

    res.json({
      ok: true,
      senderName: checkSenderDetails.name,
      currentBalance: checkSenderDetails.balance,
      accountTransfersHistory,
    });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

module.exports = router;
