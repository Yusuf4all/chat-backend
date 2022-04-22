const ROOM_MODEL = require("./roomSchema");
const ROOM_MODULE = {};

ROOM_MODULE.addFriend = async function (data) {
	return await ROOM_MODEL(data).save();
};

ROOM_MODULE.getRoom = async function (userId, roomUserId) {
	return await ROOM_MODEL.findOne({
		$or: [
			{
				$and: [{ To_User: userId }, { From_User: roomUserId }],
			},
			{
				$and: [{ To_User: roomUserId }, { From_User: userId }],
			},
		],
	});
};

ROOM_MODULE.getFilteredRoom = async function (userId, status) {
	return await ROOM_MODEL.find({
		$and: [{ To_User: userId }, { Status: status }],
	});
};

ROOM_MODULE.deleteRoom = async function (fromUserId, toUserId) {
	return await ROOM_MODEL.deleteOne({
		$or: [
			{
				$and: [{ From_User: fromUserId }, { To_User: toUserId }],
			},
			{
				$and: [{ From_User: toUserId }, { To_User: fromUserId }],
			},
		],
	});
};

ROOM_MODULE.updateRoomDetails = async function (
	fromUserId,
	toUserId,
	roomData
) {
	return await ROOM_MODEL.updateOne(
		{
			$or: [
				{ $and: [{ To_User: toUserId }, { From_User: fromUserId }] },
				{ $and: [{ To_User: fromUserId }, { From_User: toUserId }] },
			],
		},
		roomData
	);
};

ROOM_MODULE.getBlockedRoom = async function (userId) {
	return await ROOM_MODEL.find({
		Blocked_By: { $in: [userId] },
	});
};

module.exports = ROOM_MODULE;
