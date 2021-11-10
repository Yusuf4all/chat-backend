const userModule = require("../model/module").userModule;
const { errorResponse } = require("../service/response");

var expressJwt = require("express-jwt");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = authenticationMiddleware;
function authenticationMiddleware() {
  return [
    expressJwt({ secret: JWT_SECRET, algorithms: ["HS256"] }),
    async function (req, res, next) {
      const { Email } = req.user;
      const USER_DATA = await userModule.getUser({ Email: Email });
      if (!USER_DATA) return errorResponse(res, 422, "Invalid User");
      req.user = USER_DATA;
      next();
    },
  ];
}
