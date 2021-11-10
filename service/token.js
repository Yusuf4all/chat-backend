const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
module.exports = {
  async jwtSign(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: 60 * 60 * 24 });
  },
  async jwtVerify(token) {
    return jwt.verify(token, JWT_SECRET);
  },
};
