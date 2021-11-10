module.exports = {
  signUpManualAttributes() {
    return [
      "First_Name",
      "Last_Name",
      "Email",
      "Password",
      "Phone_Number",
      "Authentication_Type",
    ];
  },
  signInManualAttributes() {
    return ["Email", "Password", "Authentication_Type"];
  },

  googleAuthAttributes() {
    return ["Authentication_Type", "Token"];
  },

  faceBookAuthAttributes() {
    return ["Authentication_Type", "Token", "Facebook_ID", "Email", "OTP"];
  },

  forgotPasswordAttributes() {
    return ["Email"];
  },

  resetPasswordAttributes() {
    return ["Password"];
  },
  verifyEmailAttributes() {
    return ["Email", "Facebook_ID"];
  },
};
