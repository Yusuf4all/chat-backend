const bcrypt = require("bcryptjs");
module.exports = {
  /** function for encrypt password */
  bcryptHash(value, salt) {
    const HASH_VALUE = bcrypt.hashSync(value, salt);
    return HASH_VALUE;
  },

  /** function for verify password */
  bcryptVerify(value, hash_value) {
    const RESULT = bcrypt.compareSync(value, hash_value);
    return RESULT;
  },
};
