const roomOperation = require("../../model/module/index").roomModule;
const userOperation = require("../../model/module/index").userModule;

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
			const ROOM_DATA = await roomOperation.getRoom(toUser._id, fromUser._id);
			if (ROOM_DATA) {
				ROOM_DATA.Status = "Friend";
				const UPDATED_ROOM = await roomOperation.updateRoomDetails(
					fromUser._id,
					toUser._id,
					ROOM_DATA
				);
				if (UPDATED_ROOM.modifiedCount) {
					io.to(toUser._id).emit("acceptedFriendRequest", fromUser);
					io.to(fromUser._id).emit("acceptedFriendRequest", toUser);
				}
			} else {
				socket.emit("errorResponse", "User not found.");
			}
		} catch (error) {
			socket.emit("errorResponse", error.message);
		}
	});
};
