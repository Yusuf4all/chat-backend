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

module.exports = ROOM_MODULE;
