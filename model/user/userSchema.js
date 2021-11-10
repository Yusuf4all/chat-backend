const mongoose = require("mongoose");
// Schema for user
const USER_SCHEMA = new mongoose.Schema({
  First_Name: { type: String },
  Last_Name: { type: String },
  Email: { type: String },
  Password: { type: String },
  Facebook_ID: { type: String },
  Phone_Number: { type: String },
  Authentication_Type: { type: String },
  OTP: { type: String },
  Created_At: { type: Date, default: Date.now },
});

// user is table name and USER_SCHEMA is attiributes of user table

module.exports = mongoose.model("user", USER_SCHEMA);
