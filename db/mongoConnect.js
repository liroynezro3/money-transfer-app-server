const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://liroynezro3:Liroy123@cluster0.hkdyg.mongodb.net/moneytransfer?retryWrites=true&w=majority");
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = connectDB;
