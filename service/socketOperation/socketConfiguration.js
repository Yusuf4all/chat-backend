const friendOperation = require("../socketOperation/friendOperation");

module.exports = (io) => {
	io.on("connection", (socket) => {
		console.log("User connected");
		friendOperation(socket, io);

		socket.on("joinRoom", (id) => {
			socket.join(JSON.parse(JSON.stringify(id)));
		});
		socket.on("disconnect", () => {
			console.log("user disconnected");
		});
	});
};
