const mongoose = require("mongoose");

const TransfersSchema = new mongoose.Schema({
  fromAccountNumber: { type: String, required: true },
  toAccountNumber: { type: String, required: true },
  transferAmount: { type: Number, required: true },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Transfers", TransfersSchema);
