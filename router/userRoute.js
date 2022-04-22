// Use predefined liabrary
const { Router } = require("express");

// Use controller user defined functions
const userController = require("../controller/user/user");
const validator = require("../service/validation/authenticationValidation/validator");
const authenticationMiddleware = require("../service/authenticationMiddleware");

// Create instance of predefined liabrary
const ROUTE = Router();

// Create route for user routes
ROUTE.post("/sign-up", validator.signUpValidate, userController.signup);
ROUTE.post("/sign-in", validator.signInValidate, userController.signin);
ROUTE.put(
	"/forgot-password",
	validator.forgotPasswordValidate,
	userController.forgotPassword
);
ROUTE.put(
	"/reset-password",
	validator.resetPassword,
	userController.resetPassword
);
ROUTE.post(
	"/verify-email",
	validator.verifyEmailValidate,
	userController.verifyEmail
);

ROUTE.post("/verify-otp", validator.signUpValidate, userController.signup);

ROUTE.get(
	"/get-user-self-details",
	authenticationMiddleware(),
	userController.getUserSelfDetails
);

ROUTE.get(
	"/get-all-users",
	authenticationMiddleware(),
	userController.getAllUser
);

ROUTE.get(
	"/get-users-by-status",
	authenticationMiddleware(),
	userController.getUsersByStatus
);
ROUTE.get(
	"/get-blocked-user",
	authenticationMiddleware(),
	userController.getBlockedUsers
);

module.exports = ROUTE;
