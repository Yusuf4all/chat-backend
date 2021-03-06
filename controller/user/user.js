const { errorResponse, successResponse } = require("../../service/response");
const userOperation = require("../../model/module/index").userModule;
const roomOperation = require("../../model/module/index").roomModule;

const { bcryptHash } = require("../../service/crypto");
const { jwtSign, jwtVerify } = require("../../service/token");
const sendMail = require("../../service/sendGrid");
const typesAuthentication = require("./userHelper");
const { getVerificationCode } = require("../../service/randomatic");
const getModifiedObj = require("../../service/index").getModifiedObj;

module.exports = {
	//====================== User sign up ====================
	async signup(req, res) {
		let {
			body: { Data: Data },
		} = req;
		switch (Data.Authentication_Type) {
			case "GOOGLE":
				return typesAuthentication.handleGoogleAuthentication(req, res);
			case "FACE_BOOK":
				return typesAuthentication.handleFacebookAuthentication(req, res);
			case "MANUAL":
				return typesAuthentication.handleManualSignUpAuthentication(req, res);
			default:
				return errorResponse(res, 422, "Somthing went wrong.");
		}
	},

	//=================== User sign in ==================
	async signin(req, res) {
		const {
			body: { Data: Data },
		} = req;

		switch (Data.Authentication_Type) {
			case "GOOGLE":
				return typesAuthentication.handleGoogleAuthentication(req, res);
			case "FACE_BOOK":
				return typesAuthentication.handleFacebookAuthentication(req, res);
			case "MANUAL":
				return typesAuthentication.handleManualSignInAuthentication(req, res);
			default:
				return errorResponse(res, 422, "Somthing went wrong.");
		}
	},

	// ========= Forgot password ==============
	async forgotPassword(req, res) {
		const {
			body: { Data: Data },
		} = req;

		try {
			const USER_DATA = await userOperation.getUser({ Email: Data.Email });
			if (!USER_DATA)
				return errorResponse(res, 422, "User with given email doesn't exist.");

			const payload = {
				Email: USER_DATA.Email,
				_id: USER_DATA._id,
			};

			const forgetPassworToken = await jwtSign(payload);
			const RESET_URL = `http://localhost:3000/auth/reset-password/${forgetPassworToken}`;
			const USER_MAIL_DATA = {
				Email: USER_DATA.Email,
				Subject: "Reset password",
				Message: `Click here for reset password ${`<a href="">test</a>`}  ${RESET_URL}`,
			};
			sendMail(USER_MAIL_DATA);
			return successResponse(
				res,
				200,
				"Password reset link sent to your email account"
			);
		} catch (error) {
			errorResponse(res, 422, error.message);
		}
	},

	// ======= Reset password ==============
	async resetPassword(req, res) {
		const {
			body: { Data: Data },
		} = req;
		const {
			headers: { accesstoken: accesstoken },
		} = req;

		let decodedToken;
		try {
			decodedToken = await jwtVerify(accesstoken);
		} catch (error) {
			errorResponse(res, 422, "Token expired");
		}

		const USER_DATA = await userOperation.getUser({
			Email: decodedToken.Email,
		});
		if (!USER_DATA) return errorResponse(res, 422, "User doesn't exist.");
		const encrypedPassword = bcryptHash(Data.Password, 10);

		const NEWPassword = {
			Password: encrypedPassword,
		};
		await userOperation.updateUserDetails(USER_DATA.Email, NEWPassword);
		return successResponse(res, 200, "Password updated successfully.");
	},

	// ============= Verify email ============
	async verifyEmail(req, res) {
		const {
			body: { Data: Data },
		} = req;
		try {
			const USER_DATA = await userOperation.getUser({ Email: Data.Email });
			if (USER_DATA && USER_DATA.Authentication_Type !== "FACE_BOOK")
				return errorResponse(res, 422, "User authenticated with another type.");
			if (
				USER_DATA &&
				Data.Email.toLowerCase() !== USER_DATA.Email.toLowerCase()
			) {
				return errorResponse(res, 422, "Given email address does not match.");
			} else {
				const OTP = await getVerificationCode();
				const USER_OTP_DETAILS = {
					OTP: OTP,
					Email: Data.Email,
				};

				const existUser = await userOperation.getOTPData({ Email: Data.Email });

				if (existUser) {
					userOperation.updateUserOtp(USER_OTP_DETAILS.Email, {
						OTP: USER_OTP_DETAILS.OTP,
					});
				} else {
					userOperation.saveOtp(USER_OTP_DETAILS);
				}

				const USER_MAIL_DATA = {
					Email: Data.Email,
					Subject: "Reset password",
					Message: `Verification code ${OTP}`,
				};

				sendMail(USER_MAIL_DATA);
				return successResponse(
					res,
					200,
					"Verification code has been send to your given email address."
				);
			}
		} catch (error) {
			return errorResponse(res, 422, error.message);
		}
	},

	// ===================== Get user self details =======
	async getUserSelfDetails(req, res) {
		const { user } = req;
		try {
			let USER_DETAILS = await userOperation.getUser({ Email: user.Email });
			if (!USER_DETAILS) return errorResponse(res, 422, "User not found");
			USER_DETAILS = JSON.parse(JSON.stringify(USER_DETAILS));
			delete USER_DETAILS["Password"];
			return successResponse(res, 200, { User: USER_DETAILS });
		} catch (error) {
			return errorResponse(res, 422, error.message);
		}
	},

	// ===================== Get all users ===============
	async getAllUser(req, res) {
		const { user } = req;
		try {
			const ALL_USERS = await userOperation.getAllUsers(user._id);
			const UPDATED_USERS = [];
			for (let ele = 0; ele < ALL_USERS.length; ele++) {
				const UPDATED_USER = {
					First_Name: ALL_USERS[ele].First_Name,
					Last_Name: ALL_USERS[ele].Last_Name,
					Email: ALL_USERS[ele].Email,
					_id: ALL_USERS[ele]._id,
					Phone_Number: ALL_USERS[ele].Phone_Number,
					Blocked_By: "",
				};

				let Room_Data = await roomOperation.getRoom(
					user._id,
					ALL_USERS[ele]._id
				);
				if (Room_Data) {
					UPDATED_USER.Blocked_By = Room_Data.Blocked_By;
					if (
						JSON.parse(JSON.stringify(user._id)) === Room_Data.Sender_Id &&
						Room_Data.Status === "Accept"
					) {
						UPDATED_USER.Status = "Pendding";
					} else if (
						Room_Data.Blocked_By.find(
							(id) => id === JSON.parse(JSON.stringify(user._id))
						) &&
						Room_Data.Status === "Blocked"
					) {
						continue;
					} else if (
						Room_Data.Blocked_By.find(
							(id) => id !== JSON.parse(JSON.stringify(user._id))
						) &&
						Room_Data.Status === "Blocked"
					) {
						UPDATED_USER.Status = "Friend";
					} else {
						UPDATED_USER.Status = Room_Data.Status;
					}
				} else {
					UPDATED_USER.Status = "Add";
				}
				UPDATED_USERS.push(UPDATED_USER);
			}

			return successResponse(res, 200, { ALL_USERS: UPDATED_USERS });
		} catch (error) {
			return errorResponse(res, 422, error.message);
		}
	},
	async getUsersByStatus(req, res) {
		const { user, query } = req;
		const { Status } = query;
		try {
			const FilteredRoom = await roomOperation.getFilteredRoom(
				user._id,
				Status
			);
			return successResponse(res, 200, { filteredUser: FilteredRoom });
		} catch (error) {
			return errorResponse(res, 422, error.message);
		}
	},

	// Get blocked user list =======================
	async getBlockedUsers(req, res) {
		const { user } = req;
		try {
			const BLOECKED_ROOMS = await roomOperation.getBlockedRoom(
				JSON.parse(JSON.stringify(user._id))
			);
			let blockedUser = {};
			const UPDATED_USERS = await Promise.all(
				BLOECKED_ROOMS.map(async (room) => {
					if (JSON.parse(JSON.stringify(user._id)) === room.From_User) {
						blockedUser = await userOperation.getUserById({
							_id: room.To_User,
						});
					} else {
						blockedUser = await userOperation.getUserById({
							_id: room.From_User,
						});
					}
					const UPDATED_USER = getModifiedObj.getModifiedRoomAndUserObj(
						blockedUser,
						room
					);
					return UPDATED_USER;
				})
			);

			return successResponse(res, 200, { BLOCKED_USERES: UPDATED_USERS });
		} catch (error) {
			return errorResponse(res, 422, error.message);
		}
	},
};
