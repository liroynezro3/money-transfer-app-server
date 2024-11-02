const express = require("express");
const router = express.Router();
const Users = require("../models/UsersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BankAccounts = require("../models/BankAccountsModel");
const { validateEmail } = require("../middleweres/validateEmail");
const { generateUniqueBankAccount } = require("../utils/bankAccountGenerator");
const verify = require("../verifyToken");
router.post("/register", validateEmail, async (req, res) => {
  try {
    let userEmailCheck = await Users.findOne({ email: req.body.email });
    if (userEmailCheck) {
      return res
        .status(400)
        .json({ ok: false, message: "Email Already in System" });
    }
    const uniqueNumber = await generateUniqueBankAccount(); // קריאה לפונקציה הרקורסיבית שיוצרת  מספר חשבון בנק יחודי,לאחר בדיקה בדאטה
    //Create user
    const newUser = new Users({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      account: uniqueNumber,
    });

    newUser.password = await bcrypt.hash(req.body.password, 10);
    await newUser.save();
    newUser.password = undefined;

    //Create BankAccountNumber
    const accountData = new BankAccounts({
      user: newUser._id,
      name: newUser.name,
      account: uniqueNumber,
    });
    await accountData.save();

    //generate token
    let token = jwt.sign(
      { id: newUser._id, account: newUser.account },
      process.env.SECRET_KEY,
      {
        expiresIn: "60m",
      }
    );
    res.status(200).json({
      ok: true,
      responeUserDetails: {
        token,
        newUser,
        account: accountData,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});
router.post("/login", async (req, res) => {
  try {
    const userCheck = await Users.findOne({ email: req.body.email })
      .populate({
        path: "account",
        model: "BankAccounts",
        foreignField: "account",
        select: "account balance -_id",
      })
      .lean();

    if (!userCheck) {
      return res.status(404).json({ ok: false, message: "User not found" });
    }

    const passValid = await bcrypt.compare(
      req.body.password,
      userCheck.password
    );

    if (!passValid) {
      return res.status(401).json({ ok: false, message: "Password wrong" });
    }

    const token = jwt.sign(
      { id: userCheck._id, account: userCheck.account },
      process.env.SECRET_KEY,
      {
        expiresIn: "60mins",
      }
    );

    userCheck.password = undefined;

    const responeUserDetails = {
      token,
      ...userCheck,
    };
    res.cookie("myCookie", "someValue", { maxAge: 3600000 });

    res.status(200).json({ ok: true, responeUserDetails });
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

router.get("/userValid", verify, async (req, res) => {
  //const userInfo= await BankAccounts.findOne({account:req.user.account.account}).populate({path:"user", select: "email" })
  try {
    const responeUserDetails = await Users.findOne({
      account: req.user.account.account,
    })
      .populate({
        path: "account",
        model: "BankAccounts",
        foreignField: "account",
        select: "account balance -_id",
      })
      .lean();
    if (!responeUserDetails) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }
    responeUserDetails.password = undefined;
    return res.status(200).json({ ok: true, responeUserDetails });
  } catch (err) {
    return res.status(404).json(err.message);
  }
});

module.exports = router;
