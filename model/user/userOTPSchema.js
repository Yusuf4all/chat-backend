const mongoose = require("mongoose");

const USER_OTP_SCHEMA = new mongoose.Schema({
  Email: { type: String },
  OTP: { type: String },
});

module.exports = mongoose.model("user_otp", USER_OTP_SCHEMA);
