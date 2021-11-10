const mongoose = require("mongoose");
const MONGO_CONNECTION = process.env.Mongo_Connection;
module.exports = {
  initializeDatabase() {
    mongoose
      .connect(MONGO_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Successfully connected to the database");
      })
      .catch((err) => {
        console.log("Could not connect to the database. Exiting now...", err);
        process.exit();
      });
  },
};
