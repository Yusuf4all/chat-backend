const USER_MODEL = require("./userSchema");
const USER_OTP_MODEL = require("./userOTPSchema");
const USER_MODULE = {};

// Save user in database
USER_MODULE.saveUser = async function (data) {
	return await USER_MODEL(data).save();
};

// Get single user from database with email
USER_MODULE.getUser = async function (email) {
	return await USER_MODEL.findOne(email);
};

// Update user model
USER_MODULE.updateUserDetails = async function (Email, userData) {
	return await USER_MODEL.updateOne({ Email: Email }, userData);
};

//  Get all user from database
USER_MODULE.getAllUsers = async function (userId) {
	return await USER_MODEL.find({ _id: { $ne: userId } });
};

// =================================== OTP module operations
// Save user otp
USER_MODULE.saveOtp = async function (data) {
	return await USER_OTP_MODEL(data).save();
};

// Update user otp when user does not submit exist opt
USER_MODULE.updateUserOtp = async function (Email, userData) {
	return await USER_OTP_MODEL.updateOne({ Email: Email }, userData);
};

// Get otp data to check otp exist or not
USER_MODULE.getOTPData = async function (Email) {
	return await USER_OTP_MODEL.findOne(Email);
};

// After sign up/in user otp row will be delete
USER_MODULE.deletOtpUser = async function (Email) {
	return await USER_OTP_MODEL.deleteOne({ Email: Email });
};

module.exports = USER_MODULE;
