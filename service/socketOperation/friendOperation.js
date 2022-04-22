const roomOperation = require("../../model/module/index").roomModule;
const userOperation = require("../../model/module/index").userModule;
const getModifiedObj = require("../index").getModifiedObj;

module.exports = (socket, io) => {
	socket.on("addFriend", async (fromUser, toUser) => {
		try {
			fromUser = JSON.parse(JSON.stringify(fromUser));
			toUser = JSON.parse(JSON.stringify(toUser));
			const USER_DATA = await userOperation.getUser({ Email: toUser.Email });
			if (!USER_DATA) return socket.emit("errorResponse", "User not found!");
			const USER_ROOM_DATA = await roomOperation.getRoom(
				fromUser._id,
				toUser._id
			);
			if (USER_ROOM_DATA)
				return io
					.to(JSON.parse(JSON.stringify(fromUser._id)))
					.emit("errorResponse", "Request already sent!");

			const ROOM_DATA = {
				From_User: fromUser._id,
				To_User: toUser._id,
				Sender_Id: fromUser._id,
			};
			const UPDATED_ROOM = await roomOperation.addFriend(ROOM_DATA);
			if (UPDATED_ROOM) {
				io.to(JSON.parse(JSON.stringify(UPDATED_ROOM.From_User))).emit(
					"successResponse",
					"Friend request send."
				);

				io.to(JSON.parse(JSON.stringify(UPDATED_ROOM.From_User))).emit(
					"friendRequestSent",
					UPDATED_ROOM
				);

				io.to(UPDATED_ROOM.To_User).emit("friendRequestSent", UPDATED_ROOM);
			} else socket.emit("errorResponse", "Somthing went wrong.");
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});

	socket.on("deniedFriendRequest", async (toUser, fromUser) => {
		try {
			let isDeletedRoom = await roomOperation.deleteRoom(
				fromUser._id,
				toUser._id
			);
			if (isDeletedRoom.deletedCount) {
				io.to(toUser._id).emit("roomDeleteSuccess", fromUser);
				io.to(fromUser._id).emit("roomDeleteSuccess", toUser);
			} else socket.emit("errorResponse", "Somthing went wrong");
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});

	socket.on("acceptFriendRequest", async (toUser, fromUser) => {
		try {
			var ROOM_DATA = await roomOperation.getRoom(toUser._id, fromUser._id);
			if (ROOM_DATA) {
				ROOM_DATA.Status = "Friend";
				const UPDATED_ROOM = await roomOperation.updateRoomDetails(
					fromUser._id,
					toUser._id,
					ROOM_DATA
				);

				if (UPDATED_ROOM.modifiedCount) {
					ROOM_DATA = await roomOperation.getRoom(toUser._id, fromUser._id);
					fromUser = getModifiedObj.getModifiedRoomAndUserObj(
						fromUser,
						ROOM_DATA
					);
					toUser = getModifiedObj.getModifiedRoomAndUserObj(toUser, ROOM_DATA);

					io.to(toUser._id).emit("acceptedFriendRequest", fromUser, ROOM_DATA);
					io.to(fromUser._id).emit("acceptedFriendRequest", toUser, ROOM_DATA);
				}
			} else {
				socket.emit("errorResponse", "Please refresh your browser.");
			}
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});

	socket.on("unfriendUser", async (actionUser, effectedUser) => {
		try {
			const EFFECTED_USER = await userOperation.getUser({
				Email: effectedUser.Email,
			});
			if (!EFFECTED_USER) return socket.emit("errorResponse", "User not found");
			const ROOM_DATA = await roomOperation.getRoom(
				actionUser._id,
				effectedUser._id
			);
			if (!ROOM_DATA)
				return socket.emit("errorResponse", "Refresh your browser1.");

			let isRoomDeleted = await roomOperation.deleteRoom(
				actionUser._id,
				effectedUser._id
			);
			if (isRoomDeleted.deletedCount) {
				io.to(actionUser._id).emit(
					"unfriendUserSuccess",
					effectedUser,
					ROOM_DATA
				);
				io.to(effectedUser._id).emit(
					"unfriendUserSuccess",
					actionUser,
					ROOM_DATA
				);
			} else {
				socket.emit("errorResponse", "Refresh your browser");
			}
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});

	socket.on("blockUser", async (actionUser, effectedUser) => {
		try {
			let ROOM_DATA = await roomOperation.getRoom(
				actionUser._id,
				effectedUser._id
			);
			if (ROOM_DATA) {
				ROOM_DATA.Status = "Blocked";
				ROOM_DATA.Blocked_By.push(actionUser._id);
				let isRoomUpdate = await roomOperation.updateRoomDetails(
					actionUser._id,
					effectedUser._id,
					ROOM_DATA
				);

				if (isRoomUpdate.modifiedCount) {
					ROOM_DATA = await roomOperation.getRoom(
						actionUser._id,
						effectedUser._id
					);
					actionUser = getModifiedObj.getModifiedRoomAndUserObj(
						actionUser,
						ROOM_DATA
					);
					effectedUser = getModifiedObj.getModifiedRoomAndUserObj(
						effectedUser,
						ROOM_DATA
					);

					io.to(actionUser._id).emit("blockedUser", effectedUser, ROOM_DATA);
					io.to(effectedUser._id).emit("blockedUser", actionUser, ROOM_DATA);
				}
			} else {
				socket.emit("errorResponse", "Please refreash you browser");
			}
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});

	socket.on("unblockUser", async (actionUser, effectedUser) => {
		try {
			let roomData = await roomOperation.getRoom(
				actionUser._id,
				effectedUser._id
			);
			if (roomData) {
				const BLOCKED_BY_USERS = roomData.Blocked_By.filter(
					(id) => id !== JSON.parse(JSON.stringify(actionUser._id))
				);
				if (BLOCKED_BY_USERS.length === 0) roomData.Status = "Friend";
				roomData.Blocked_By = BLOCKED_BY_USERS;
				const IS_ROOM_UPDATED = await roomOperation.updateRoomDetails(
					actionUser._id,
					effectedUser._id,
					roomData
				);
				if (IS_ROOM_UPDATED.modifiedCount) {
					roomData = await roomOperation.getRoom(
						actionUser._id,
						effectedUser._id
					);
					effectedUser = getModifiedObj.getModifiedRoomAndUserObj(
						effectedUser,
						roomData
					);
					io.to(actionUser._id).emit("unblockedUser", effectedUser);
				}
			} else {
				socket.emit("errorResponse", "Please refresh you browser.");
			}
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});
};
