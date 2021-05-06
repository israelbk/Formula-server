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
    port.on("data", function(data) {
        const parsedData = parseData(data);
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

const parseData = (data) => {
    const dataValue = +decodeURIComponent(data.slice(1, 4));
    switch (data[0]) {
        case 67:
            return { key: "cerror", value: dataValue };
        case 80:
            return getValidatedValue("pedal", dataValue, 0, 255);
        case 82:
            return getValidatedValue("rpm", dataValue, 0, 10000);
        case 83:
            return getValidatedValue("speed", dataValue, 0, 90);
        case 84:
            return getValidatedValue("thorttle", dataValue, 0, 255);
        case 86:
            return getValidatedValue("voltage", dataValue, 0, 24);
        case 98:
            return { key: "brake", value: dataValue };
        case 112:
            return { key: "perror", value: dataValue };
        case 115:
            return { key: "bspd", value: dataValue };
        case 116:
            return { key: "terror", value: dataValue };
        default:
            return undefined;
    }
};

const getValidatedValue = (keyString, dataValue, minBound, maxBound) => {
    return dataValue >= minBound && dataValue <= maxBound ?
        { key: keyString, value: dataValue } :
        undefined;
};