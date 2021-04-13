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
			if (dataValue > 1 && dataValue < 0) {
				return { key: "cerror", value: 0 };
			}
			return { key: "cerror", value: dataValue };
		case 80:
			if (dataValue > 0 && dataValue < 255) {
				return { key: "pedal", value: dataValue };
			}
			break;
		case 82:
			if (dataValue > 0 && dataValue < 10000) {
				return { key: "rpm", value: dataValue };
			}
			break;
		case 83:
			if (dataValue > 0 && dataValue < 90) {
				return { key: "speed", value: dataValue };
			}
			break;
		case 84:
			if (dataValue > 0 && dataValue < 255) {
				return { key: "thorttle", value: dataValue };
			}
			break;
		case 86:
			if (dataValue > 0 && dataValue < 24) {
				return { key: "voltage", value: dataValue };
			}
			break;
		case 98:
			if (dataValue > 1 && dataValue < 0) {
				return { key: "brake", value: 0 };
			}
			return { key: "brake", value: dataValue };
		case 112:
			if (dataValue > 1 && dataValue < 0) {
				return { key: "perror", value: 0 };
			}
			return { key: "perror", value: dataValue };
		case 115:
			if (dataValue > 1 && dataValue < 0) {
				return { key: "bspd", value: 0 };
			}
			return { key: "bspd", value: dataValue };
		case 116:
			if (dataValue > 1 && dataValue < 0) {
				return { key: "terror", value: 0 };
			}
			return { key: "terror", value: dataValue };
		// default:
		// 	return { key: data[0], value: dataValue };
	}
}
