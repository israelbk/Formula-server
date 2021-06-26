const app = require("express")();
const SerialPort = require("serialport");
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origins: ["http://localhost:4200"],
    },
});

const port = new SerialPort("COM9", {
    baudRate: 115200,
});

// Represents the Data initials that we want to extract out of each package received.
const relevantData = [
    "P",
    "T",
    "S",
    "B",
    "R",
    "M",
    "I",
    "E",
    "L",
    "V",
    "S",
    "b",
    "t",
    "C",
];

io.on("connection", (socket) => {
    // Switches the port into "flowing mode"
    port.on("data", (data) =>
        socket.emit("message", Object.fromEntries(parseData(data)))
    );

    console.log("a user connected");

    socket.on("disconnect", () => console.log("user disconnected"));
});

http.listen(3000, () => console.log("listening on *:3000"));

const parseData = (data) => {
    return extractLastData(decodeURIComponent(data));
};

const extractLastData = (rawData) => {
    const dataFoundSet = new Map();
    const rawDataArray = rawData.split("\n");
    let foundLettersCount = 0;

    // Iterates over the data from the end to get most updated value.
    for (i = rawDataArray.length - 1; i >= 0; i--) {
        const currentChar = rawDataArray[i][0];

        // A data need to add to the Map.
        if (
            relevantData.includes(currentChar) &&
            !dataFoundSet.has(getDisplayString(currentChar))
        ) {
            // Add the data to the Map.
            dataFoundSet.set(
                getDisplayString(currentChar), +rawDataArray[i].substring(1)
            );

            // Exit loop if we have all the data needed
            if (++foundLettersCount === relevantData.length) return dataFoundSet;
        }
    }
    return dataFoundSet;
};

const getDisplayString = (firstChar) => {
    switch (firstChar) {
        case "b":
            return "brake";
        case "B":
            return "bspd";
        case "C":
            return "cerror";
        case "E":
            return "coolent";
        case "I":
            return "inlet";
        case "L":
            return "lambda";
        case "M":
            return "map";
        case "p":
            return "perror";
        case "P":
            return "pedal";
        case "R":
            return "rpm";
        case "S":
            return "speed";
        case "T":
            return "thorttle";
        case "t":
            return "terror";
        case "V":
            return "voltage";
        default:
            return undefined;
    }
};