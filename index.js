const app = require("express")();
const SerialPort = require("serialport");
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
	cors: {
		origins: ["http://localhost:4200"],
	},
});

const port = new SerialPort("COM6", {
	baudRate: 115200,
});

io.on("connection", (socket) => {
	// Switches the port into "flowing mode"
	port.on("data", function (data) {
		let parsedData = parseData(data);
		if (parsedData) {
			// console.log(parsedData);
			socket.emit("message", parsedData);
		}
	});

	console.log("a user connected");

	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

http.listen(3000, () => {
	console.log("listening on *:3000");
});

function parseData(data) {
	let dataValue = +decodeURIComponent(data.slice(1, 4));
	switch (data[0]) {
		case 67:
			return getBoolValue("cerror", dataValue);
		case 80:
			return getNumberValue("pedal", dataValue, 0, 255);
		case 82:
			return getNumberValue("rpm", dataValue, 0, 10000);
		case 83:
			return getNumberValue("speed", dataValue, 0, 90);
		case 84:
			return getNumberValue("thorttle", dataValue, 0, 255);
		case 86:
			return getNumberValue("voltage", dataValue, 0, 24);
		case 98:
			return getBoolValue("brake", dataValue);
		case 112:
			return getBoolValue("perror", dataValue);
		case 115:
			return getBoolValue("bspd", dataValue);
		case 116:
			return getBoolValue("terror", dataValue);
		default:
			return undefined;
	}
}

function getBoolValue(keyString, dataValue) {
	return { key: keyString, value: dataValue == 1 };
}

function getNumberValue(keyString, dataValue, minBound, maxBound) {
	return dataValue > minBound && dataValue < maxBound
		? { key: keyString, value: dataValue }
		: undefined;
}
