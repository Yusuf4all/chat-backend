const axios = require("axios").default;
const { bcryptHash, bcryptVerify } = require("../../service/crypto");
const { OAuth2Client } = require("google-auth-library");
const {
  getUser,
  saveUser,
  getOTPData,
  deletOtpUser,
} = require("../../model/user");
const { successResponse, errorResponse } = require("../../service/response");
const { jwtSign } = require("../../service/token");

module.exports = {
  // ==============================  GoogleAuthentication ====================
  async handleGoogleAuthentication(req, res) {
    const {
      body: { Data: Data },
    } = req;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const token = Data.Token;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    let googleResponse = ticket.getPayload();
    Data.Email = googleResponse.email;
    Data.First_Name = googleResponse.given_name;
    Data.Last_Name = googleResponse.family_name;
    delete Data["Token"];

    try {
      const USER_DATA = await getUser({ Email: Data.Email });
      if (USER_DATA && USER_DATA.Authentication_Type !== "GOOGLE")
        return errorResponse(res, 422, "User authenticated with another type.");
      if (!USER_DATA) {
        saveUser(Data);
        const PAYLOAD = {
          Email: Data.Email,
        };
        const TOKEN = await jwtSign(PAYLOAD);
        successResponse(res, 200, {
          Message: "You have sign up successfully.",
          token: TOKEN,
          AuthenticationType: "GOOGLE",
        });
      } else {
        const PAYLOAD = {
          Email: Data.Email,
        };
        const TOKEN = await jwtSign(PAYLOAD);
        successResponse(res, 200, {
          Message: "You have sign up successfully.",
          Token: TOKEN,
          AuthenticationType: "GOOGLE",
        });
      }
    } catch (error) {
      errorResponse(res, 422, error.message);
    }
  },
  // ==============================  Face book Authentication ====================
  async handleFacebookAuthentication(req, res) {
    const {
      body: { Data: Data },
    } = req;

    const OTP_DATA = await getOTPData({ Email: Data.Email });
    if (!OTP_DATA) return errorResponse(res, 422, "User not found");
    if (OTP_DATA.OTP !== Data.OTP)
      return errorResponse(res, 422, "Given OTP does not match.");

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${Data.Facebook_ID}/?fields=id,name,email&access_token=${Data.Token}`;
    let facebookData = await axios.get(urlGraphFacebook);

    const NAMES = facebookData?.data?.name.split(" ");
    const First_Name = NAMES[0];
    const Last_Name = NAMES[1] ? NAMES[1] : "";

    const USER_DATA = {
      First_Name: First_Name,
      Last_Name: Last_Name,
      Email: Data.Email,
      Authentication_Type: Data.Authentication_Type,
    };
    deletOtpUser(USER_DATA.Email);
    const USER = await getUser({ Email: USER_DATA.Email });
    if (!USER) saveUser(USER_DATA);
    const PAYLOAD = {
      Email: USER_DATA.Email,
    };
    const TOKEN = await jwtSign(PAYLOAD);
    successResponse(res, 200, {
      Message: "You have sign up successfully.",
      Token: TOKEN,
      AuthenticationType: "FACE_BOOK",
    });
  },

  // ==============================  Manual sign up ====================
  async handleManualSignUpAuthentication(req, res) {
    const {
      body: { Data: Data },
    } = req;
    try {
      const USER_DATA = await getUser({ Email: Data.Email });
      if (!USER_DATA) {
        if (Data.Password) Data.Password = await bcryptHash(Data.Password, 10);
        saveUser(Data);
        successResponse(res, 200, "You have sign up successfully.");
      } else {
        errorResponse(res, 422, "User already register.");
      }
    } catch (err) {
      errorResponse(res, 422, err.message);
    }
  },

  // ==============================  Manual sign in ====================
  async handleManualSignInAuthentication(req, res) {
    const {
      body: { Data: Data },
    } = req;

    try {
      const USER_DATA = await getUser({ Email: Data.Email });
      if (USER_DATA && USER_DATA.Authentication_Type !== "MANUAL")
        return errorResponse(res, 422, "User authenticated with another type.");

      if (!USER_DATA) return errorResponse(res, 422, "User not found");

      const userPassword = bcryptVerify(Data.Password, USER_DATA.Password);
      if (!userPassword)
        return errorResponse(res, 422, "Email or Password not match.");

      const payload = {
        Email: USER_DATA.Email,
        _id: USER_DATA._id,
      };
      const token = await jwtSign(payload);
      return successResponse(res, 200, token);
    } catch (error) {
      return errorResponse(res, 422, error.message);
    }
  },
};
