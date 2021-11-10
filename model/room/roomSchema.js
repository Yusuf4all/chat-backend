const mongoose = require("mongoose");

const ROOM_SCHEMA = new mongoose.Schema({
  Sender_Id: { type: String },
  From_User: { type: String },
  To_User: { type: String },
  Status: { type: String, default: "Accept" },
  Blocked_By: { type: String, default: "" },
  Create_At: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("room", ROOM_SCHEMA);
