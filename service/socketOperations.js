module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("addFriend", (data) => {
      console.log("add friend", data);
    });

    socket.on("joinRoom", (id) => {
      socket.join(id);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
