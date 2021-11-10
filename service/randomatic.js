const randomize = require("randomatic");
module.exports = {
  async getVerificationCode() {
    return randomize("0", 6);
  },
};
