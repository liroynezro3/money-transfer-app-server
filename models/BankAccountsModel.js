const mongoose = require("mongoose");
const BankAccountsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  name: { type: String },
  account: { type: String, unique: true, required: true },
  balance: { type: Number, default: 0, required: true },
  date_created: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("BankAccounts", BankAccountsSchema);
