// Use predifined liabrary dependencies
require("dotenv").config();
const express = require("express");
const socket = require("socket.io");
const { initializeDatabase } = require("./database/database");
const socketOperations = require("./service/socketOperation/socketConfiguration");

// Create instanse of predefined liabrary
const app = express();

// .env variables
const PORT = process.env.PORT;
const FRONT_END_URL = process.env.FRONT_END_UR;

// Handling cors errors if comes
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", FRONT_END_URL); // update to match the domain you will make the request from
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

// Use router
const USER_ROUTE = require("./router/userRoute");

// Helps to parse request body json
app.use(express.json());

app.use(require("cors")());

// Entrance for user route
app.use("/user", USER_ROUTE);

// Database connectivity
initializeDatabase();
// Server configuration
const server = app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});

//  Configuration of socket.io
const io = socket(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
	},
});
socketOperations(io);
