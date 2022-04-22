const MODIFIED_OBJECT = {};
MODIFIED_OBJECT.getModifiedRoomAndUserObj = (userObj, roomObj) => {
	return {
		First_Name: userObj.First_Name,
		Last_Name: userObj.Last_Name,
		Email: userObj.Email,
		_id: JSON.parse(JSON.stringify(userObj._id)),
		Phone_Number: userObj.Phone_Number,
		Blocked_By: roomObj.Blocked_By,
		Status: roomObj.Status,
	};
};

module.exports = MODIFIED_OBJECT;
