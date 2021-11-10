// User defined funtion to handle error and success response

module.exports = {
  errorResponse(res, status, message) {
    return res
      .status(status)
      .send({ code: status, status: "Failure", Message: message });
  },

  successResponse(res, status, data) {
    return res
      .status(status)
      .send({ code: status, status: "Success", Data: data });
  },
};
