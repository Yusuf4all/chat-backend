const { errorResponse } = require("../../response");
const attributes = require("./validatAttributes");
const { requireFields } = require("./validateMethods");
module.exports = {
  // =========== Sign up validation
  signUpValidate(req, res, next) {
    const {
      body: { Data: Data },
    } = req;

    let isRequired;
    switch (Data.Authentication_Type) {
      case "MANUAL":
        isRequired = requireFields(Data, attributes.signUpManualAttributes());
        if (isRequired) return errorResponse(res, 422, isRequired);
        next();
        break;
      case "GOOGLE":
        isRequired = requireFields(Data, attributes.googleAuthAttributes());
        if (isRequired) return errorResponse(res, 422, isRequired);
        next();
        break;
      case "FACE_BOOK":
        isRequired = requireFields(Data, attributes.faceBookAuthAttributes());
        if (isRequired) return errorResponse(res, 422, isRequired);
        next();
        break;
      default:
        return errorResponse(res, 422, "Authentication type required.");
    }
  },

  // =========== Sign in validation
  signInValidate(req, res, next) {
    const {
      body: { Data: Data },
    } = req;
    let isRequired;
    switch (Data.Authentication_Type) {
      case "MANUAL":
        isRequired = requireFields(Data, attributes.signInManualAttributes());
        if (isRequired) return errorResponse(res, 422, isRequired);
        next();
        break;
      case "GOOGLE":
        isRequired = requireFields(Data, attributes.googleAuthAttributes());
        if (isRequired) return errorResponse(res, 422, isRequired);
        next();
        break;
      case "FACE_BOOK":
        isRequired = requireFields(Data, attributes.faceBookAuthAttributes());
        if (isRequired) return errorResponse(res, 422, isRequired);
        next();
        break;
      default:
        return errorResponse(res, 422, "Authentication type required.");
    }

    // const isRequired = requireFields(Data, attributes.signInAttributes());
    // if (isRequired) return errorResponse(res, 422, isRequired);
    // next();
  },

  // =========== forgot validation
  forgotPasswordValidate(req, res, next) {
    const {
      body: { Data: Data },
    } = req;

    const isRequired = requireFields(
      Data,
      attributes.forgotPasswordAttributes()
    );
    if (isRequired) return errorResponse(res, 422, isRequired);
    next();
  },

  // ================ Reset password
  resetPassword(req, res, next) {
    const {
      body: { Data: Data },
    } = req;
    const {
      headers: { accesstoken: accesstoken },
    } = req;
    const isFieldRequired = requireFields(
      Data,
      attributes.resetPasswordAttributes()
    );
    if (isFieldRequired) return errorResponse(res, 422, isFieldRequired);
    next();
  },

  // ============ Verify email ======
  verifyEmailValidate(req, res, next) {
    const {
      body: { Data: Data },
    } = req;
    const isFieldRequired = requireFields(
      Data,
      attributes.verifyEmailAttributes()
    );
    if (isFieldRequired) return errorResponse(res, 422, isFieldRequired);
    next();
  },
};
