const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  account: {type: String ,unique: true, require: true },
  date_created: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Users", UsersSchema);
