require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "*";

const DATA_DIR = path.join(__dirname, "data");
const STATIONS_FILE = path.join(DATA_DIR, "stations.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const DATABASE_FILE = path.join(DATA_DIR, "database.json");

// --------------------------------------------------
// Create data folder/files if they don't exist
// --------------------------------------------------

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(STATIONS_FILE)) {
    fs.writeFileSync(STATIONS_FILE, "[]");
}

if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, "[]");
}

if (!fs.existsSync(DATABASE_FILE)) {
    fs.writeFileSync(
        DATABASE_FILE,
        JSON.stringify(
            {
                users: [],
                stationRatings: [],
                savedPlaces: [],
                orders: []
            },
            null,
            2
        )
    );
}

// --------------------------------------------------
// Socket.IO
// --------------------------------------------------

const io = new Server(server, {
    cors: {
        origin: CLIENT_URL === "*" ? true : CLIENT_URL,
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
    helmet({
        crossOriginResourcePolicy: false,
        // The existing frontend uses inline event handlers for its dynamic
        // booking and payment controls. Keep Helmet's other protections, but
        // disable CSP until those handlers are migrated to addEventListener.
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        origin: CLIENT_URL === "*" ? true : CLIENT_URL,
        // FIX: "PUT" was missing from this list. The frontend's saved-places
        // feature calls PUT /api/users/:email/saved-places, so the CORS
        // preflight for that request was being rejected by the browser.
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(morgan("dev"));

// Serve the frontend from the same local server so the UI and API work together.
app.use(express.static(path.join(__dirname, "..")));

// --------------------------------------------------
// Helper functions
// --------------------------------------------------

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        console.error(`Error reading ${file}:`, error);
        return [];
    }
}

function writeJson(file, data) {
    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

function readDatabase() {

    const database = readJson(DATABASE_FILE);

    return {
        users: Array.isArray(database.users) ? database.users : [],
        stationRatings: Array.isArray(database.stationRatings)
            ? database.stationRatings
            : [],
        savedPlaces: Array.isArray(database.savedPlaces)
            ? database.savedPlaces
            : [],
        orders: Array.isArray(database.orders)
            ? database.orders
            : []
    };

}

// --------------------------------------------------
// Station status
// --------------------------------------------------

function getStationStatus(station) {

    if (station.availableSlots <= 0) {
        return "full";
    }

    if (
        station.availableSlots <=
        Math.max(1, Math.ceil(station.totalSlots * 0.3))
    ) {
        return "low";
    }

    return "available";
}

// Add calculated status to station
function enrichStation(station) {

    return {
        ...station,
        status: getStationStatus(station)
    };
}

// --------------------------------------------------
// Dashboard statistics
// --------------------------------------------------

function getStats(stations) {

    const totalStations = stations.length;

    const totalSlots = stations.reduce(
        (sum, station) =>
            sum + station.totalSlots,
        0
    );

    const availableSlots = stations.reduce(
        (sum, station) =>
            sum + station.availableSlots,
        0
    );

    const busySlots =
        totalSlots - availableSlots;

    const averagePrice =
        stations.length > 0
            ? Number(
                (
                    stations.reduce(
                        (sum, station) =>
                            sum + station.pricePerKwh,
                        0
                    ) / stations.length
                ).toFixed(2)
            )
            : 0;

    return {
        totalStations,
        totalSlots,
        availableSlots,
        busySlots,
        averagePrice
    };
}

// --------------------------------------------------
// Broadcast real-time station updates
// --------------------------------------------------

function broadcastStations() {

    const stations = readJson(STATIONS_FILE);

    const enrichedStations =
        stations.map(enrichStation);

    io.emit(
        "stations:update",
        enrichedStations
    );

    io.emit(
        "stats:update",
        getStats(stations)
    );
}

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        service: "VoltMap API",
        status: "online",
        time: new Date().toISOString()
    });

});

// ==================================================
// AUTHENTICATION
// ==================================================

app.post("/api/auth/signup", async (req, res, next) => {

    try {

        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const role = req.body.role === "admin" ? "admin" : "user";

        if (!name || !email.includes("@") || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Name, a valid email, and a password of at least 6 characters are required"
            });
        }

        const database = readDatabase();

        if (database.users.some(user => user.email === email && user.role === role)) {
            return res.status(409).json({
                success: false,
                message: "An account with this email and role already exists"
            });
        }

        const user = {
            id: `USR-${uuid().slice(0, 8).toUpperCase()}`,
            name,
            email,
            role,
            passwordHash: await bcrypt.hash(password, 12),
            createdAt: new Date().toISOString()
        };

        database.users.push(user);
        writeJson(DATABASE_FILE, database);

        res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }

});


app.post("/api/auth/login", async (req, res, next) => {

    try {

        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const role = req.body.role === "admin" ? "admin" : "user";
        const database = readDatabase();
        const user = database.users.find(item => item.email === email && item.role === role);

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email, password, or account type"
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }

});


app.post("/api/auth/forgot-password", (req, res) => {

    const email = String(req.body.email || "").trim().toLowerCase();
    const database = readDatabase();
    const accountExists = database.users.some(user => user.email === email);

    res.json({
        success: true,
        message: accountExists
            ? "Password reset request recorded. Connect an email provider to send the reset link."
            : "If an account exists, reset instructions will be sent."
    });

});


// ==================================================
// SAVED PLACES AND STATION RATINGS
// ==================================================

app.put("/api/users/:email/saved-places", (req, res) => {

    const email = String(req.params.email).toLowerCase();
    const place = String(req.body.place || "").toLowerCase();
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);

    if (!["home", "office", "college"].includes(place) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ success: false, message: "Valid place, lat and lng are required" });
    }

    const database = readDatabase();
    const index = database.savedPlaces.findIndex(item => item.email === email && item.place === place);
    const record = { email, place, lat, lng, updatedAt: new Date().toISOString() };

    if (index === -1) database.savedPlaces.push(record);
    else database.savedPlaces[index] = record;

    writeJson(DATABASE_FILE, database);
    res.json({ success: true, data: record });

});


app.get("/api/users/:email/saved-places", (req, res) => {

    const email = String(req.params.email).toLowerCase();
    const database = readDatabase();
    const places = database.savedPlaces.filter(item => item.email === email);

    res.json({ success: true, data: places });

});


app.post("/api/stations/:id/ratings", (req, res) => {

    const email = String(req.body.email || "").trim().toLowerCase();
    const rating = Number(req.body.rating);

    if (!email || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Email and a rating from 1 to 5 are required" });
    }

    const database = readDatabase();
    const index = database.stationRatings.findIndex(item => item.stationId === req.params.id && item.email === email);
    const record = { stationId: req.params.id, email, rating, updatedAt: new Date().toISOString() };

    if (index === -1) database.stationRatings.push(record);
    else database.stationRatings[index] = record;

    writeJson(DATABASE_FILE, database);
    res.json({ success: true, data: record });

});


// ==================================================
// FRONTEND PAYMENT ORDERS
// ==================================================

app.post("/api/orders", (req, res) => {

    const order = req.body || {};
    const userEmail = String(order.userEmail || "").trim().toLowerCase();

    if (!userEmail || !order.stationName || !order.vehicleNumber || !Number.isFinite(Number(order.amount))) {
        return res.status(400).json({
            success: false,
            message: "userEmail, stationName, vehicleNumber and amount are required"
        });
    }

    const database = readDatabase();
    const record = {
        id: order.id || `VM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        userEmail,
        stationName: String(order.stationName),
        chargerName: String(order.chargerName || "Charger"),
        date: String(order.date || ""),
        time: String(order.time || ""),
        vehicleNumber: String(order.vehicleNumber).toUpperCase(),
        amount: Number(order.amount),
        paymentMethod: String(order.paymentMethod || ""),
        status: String(order.status || "Paid & confirmed"),
        rating: Number.isInteger(order.rating) ? order.rating : null,
        createdAt: order.createdAt || new Date().toISOString()
    };

    const index = database.orders.findIndex(item => item.id === record.id && item.userEmail === userEmail);

    if (index === -1) database.orders.push(record);
    else database.orders[index] = record;

    writeJson(DATABASE_FILE, database);
    res.status(index === -1 ? 201 : 200).json({ success: true, data: record });

});


app.get("/api/orders", (req, res) => {

    const email = String(req.query.userEmail || "").trim().toLowerCase();
    const database = readDatabase();
    const orders = database.orders
        .filter(order => !email || order.userEmail === email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: orders.length, data: orders });

});


app.patch("/api/orders/:id/rating", (req, res) => {

    const rating = Number(req.body.rating);
    const userEmail = String(req.body.userEmail || "").trim().toLowerCase();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !userEmail) {
        return res.status(400).json({ success: false, message: "userEmail and a rating from 1 to 5 are required" });
    }

    const database = readDatabase();
    const index = database.orders.findIndex(item => item.id === req.params.id && item.userEmail === userEmail);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    database.orders[index].rating = rating;
    database.orders[index].ratedAt = new Date().toISOString();
    writeJson(DATABASE_FILE, database);

    res.json({ success: true, data: database.orders[index] });

});

// ==================================================
// DASHBOARD STATS
// ==================================================

app.get("/api/stats", (req, res) => {

    const stations =
        readJson(STATIONS_FILE);

    res.json({
        success: true,
        data: getStats(stations)
    });

});

// ==================================================
// GET ALL STATIONS
// ==================================================

app.get("/api/stations", (req, res) => {

    let stations =
        readJson(STATIONS_FILE);

    const {
        chargerType,
        connector,
        maxPrice,
        availableOnly,
        sort,
        search
    } = req.query;

    // ----------------------------------------------
    // Charger type filter
    // ----------------------------------------------

    if (chargerType) {

        stations = stations.filter(
            station =>
                station.chargerType.toLowerCase() ===
                String(chargerType).toLowerCase()
        );

    }

    // ----------------------------------------------
    // Connector filter
    // ----------------------------------------------

    if (connector) {

        stations = stations.filter(
            station =>
                station.connectors.some(
                    item =>
                        item.toLowerCase() ===
                        String(connector).toLowerCase()
                )
        );

    }

    // ----------------------------------------------
    // Maximum price filter
    // ----------------------------------------------

    if (maxPrice) {

        stations = stations.filter(
            station =>
                station.pricePerKwh <=
                Number(maxPrice)
        );

    }

    // ----------------------------------------------
    // Available stations only
    // ----------------------------------------------

    if (availableOnly === "true") {

        stations = stations.filter(
            station =>
                station.availableSlots > 0
        );

    }

    // ----------------------------------------------
    // Search
    // ----------------------------------------------

    if (search) {

        const query =
            String(search).toLowerCase();

        stations = stations.filter(
            station => {

                return [
                    station.name,
                    station.address,
                    station.city,
                    station.operator
                ].some(value =>
                    String(value)
                        .toLowerCase()
                        .includes(query)
                );

            }
        );

    }

    // ----------------------------------------------
    // Sorting
    // ----------------------------------------------

    if (sort === "price_asc") {

        stations.sort(
            (a, b) =>
                a.pricePerKwh -
                b.pricePerKwh
        );

    }

    if (sort === "price_desc") {

        stations.sort(
            (a, b) =>
                b.pricePerKwh -
                a.pricePerKwh
        );

    }

    if (sort === "power_desc") {

        stations.sort(
            (a, b) =>
                b.powerKw -
                a.powerKw
        );

    }

    if (sort === "rating_desc") {

        stations.sort(
            (a, b) =>
                b.rating -
                a.rating
        );

    }

    res.json({
        success: true,
        count: stations.length,
        data: stations.map(enrichStation)
    });

});

// ==================================================
// GET SINGLE STATION
// ==================================================

app.get("/api/stations/:id", (req, res) => {

    const stations =
        readJson(STATIONS_FILE);

    const station =
        stations.find(
            item =>
                item.id === req.params.id
        );

    if (!station) {

        return res.status(404).json({
            success: false,
            message: "Station not found"
        });

    }

    res.json({
        success: true,
        data: enrichStation(station)
    });

});

// ==================================================
// NEARBY STATIONS
// ==================================================

app.get(
    "/api/stations/nearby/search",
    (req, res) => {

        const lat =
            Number(req.query.lat);

        const lng =
            Number(req.query.lng);

        const radiusKm =
            Number(req.query.radius || 10);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "lat and lng are required"
            });

        }

        const stations =
            readJson(STATIONS_FILE);

        // Degrees to radians
        const toRad = degrees =>
            degrees * Math.PI / 180;

        // Haversine distance
        function distanceKm(
            lat1,
            lng1,
            lat2,
            lng2
        ) {

            const earthRadius = 6371;

            const dLat =
                toRad(lat2 - lat1);

            const dLng =
                toRad(lng2 - lng1);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;

            return (
                earthRadius *
                2 *
                Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(1 - a)
                )
            );

        }

        const result =
            stations
                .map(station => {

                    const distance =
                        distanceKm(
                            lat,
                            lng,
                            station.lat,
                            station.lng
                        );

                    return {
                        ...enrichStation(station),
                        distanceKm:
                            Number(
                                distance.toFixed(2)
                            )
                    };

                })
                .filter(
                    station =>
                        station.distanceKm <=
                        radiusKm
                )
                .sort(
                    (a, b) =>
                        a.distanceKm -
                        b.distanceKm
                );

        res.json({
            success: true,
            count: result.length,
            data: result
        });

    }
);

// ==================================================
// CREATE BOOKING
// ==================================================

app.post("/api/bookings", (req, res) => {

    const {
        stationId,
        name,
        userEmail,
        vehicleNumber,
        date,
        time,
        durationMinutes = 30,
        paymentMethod = "",
        amount = 0
    } = req.body;

    // ----------------------------------------------
    // Validate input
    // ----------------------------------------------

    if (
        !stationId ||
        !name ||
        !vehicleNumber ||
        !date ||
        !time
    ) {

        return res.status(400).json({
            success: false,
            message:
                "stationId, name, vehicleNumber, date and time are required"
        });

    }

    const stations =
        readJson(STATIONS_FILE);

    const stationIndex =
        stations.findIndex(
            station =>
                station.id === stationId
        );

    if (stationIndex === -1) {

        return res.status(404).json({
            success: false,
            message: "Station not found"
        });

    }

    // ----------------------------------------------
    // Check availability
    // ----------------------------------------------

    if (
        stations[stationIndex]
            .availableSlots <= 0
    ) {

        return res.status(409).json({
            success: false,
            message:
                "No charging slots are currently available"
        });

    }

    const bookings =
        readJson(BOOKINGS_FILE);

    // ----------------------------------------------
    // Create booking
    // ----------------------------------------------

    const booking = {

        id:
            `BK-${uuid()
                .slice(0, 8)
                .toUpperCase()}`,

        stationId,

        stationName:
            stations[stationIndex].name,

        name:
            String(name).trim(),

        userEmail:
            String(userEmail || "").trim().toLowerCase(),

        vehicleNumber:
            String(vehicleNumber)
                .trim()
                .toUpperCase(),

        date,

        time,

        durationMinutes:
            Number(durationMinutes),

        status:
            paymentMethod
                ? "paid_confirmed"
                : "confirmed",

        paymentMethod:
            String(paymentMethod).trim(),

        amount:
            Number(amount) || 0,

        rating:
            null,

        createdAt:
            new Date().toISOString()

    };

    bookings.push(booking);

    // Decrease available slot
    stations[stationIndex]
        .availableSlots -= 1;

    writeJson(
        BOOKINGS_FILE,
        bookings
    );

    writeJson(
        STATIONS_FILE,
        stations
    );

    // ----------------------------------------------
    // Real-time notification
    // ----------------------------------------------

    io.emit(
        "booking:created",
        booking
    );

    broadcastStations();

    res.status(201).json({

        success: true,

        message:
            "Booking confirmed",

        data:
            booking

    });

});

// ==================================================
// GET BOOKINGS
// ==================================================

app.get("/api/bookings", (req, res) => {

    let bookings =
        readJson(BOOKINGS_FILE);

    // Search by vehicle number
    if (req.query.vehicleNumber) {

        bookings =
            bookings.filter(
                booking =>
                    booking.vehicleNumber ===
                    String(
                        req.query.vehicleNumber
                    ).toUpperCase()
            );

    }

    // Bookings for a signed-in user
    if (req.query.userEmail) {

        bookings = bookings.filter(
            booking => booking.userEmail ===
                String(req.query.userEmail).toLowerCase()
        );

    }

    // Filter by status
    if (req.query.status) {

        bookings =
            bookings.filter(
                booking =>
                    booking.status ===
                    req.query.status
            );

    }

    // Latest first
    bookings.sort(
        (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
    );

    res.json({

        success: true,

        count:
            bookings.length,

        data:
            bookings

    });

});

// ==================================================
// GET SINGLE BOOKING
// ==================================================

app.get(
    "/api/bookings/:id",
    (req, res) => {

        const bookings =
            readJson(BOOKINGS_FILE);

        const booking =
            bookings.find(
                item =>
                    item.id ===
                    req.params.id
            );

        if (!booking) {

            return res.status(404).json({
                success: false,
                message:
                    "Booking not found"
            });

        }

        res.json({
            success: true,
            data: booking
        });

    }
);

// ==================================================
// RATE A BOOKING
// ==================================================

app.patch("/api/bookings/:id/rating", (req, res) => {

    const rating = Number(req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "rating must be an integer from 1 to 5"
        });
    }

    const bookings = readJson(BOOKINGS_FILE);
    const index = bookings.findIndex(booking => booking.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }

    bookings[index].rating = rating;
    bookings[index].ratedAt = new Date().toISOString();
    writeJson(BOOKINGS_FILE, bookings);

    res.json({ success: true, data: bookings[index] });

});

// ==================================================
// CANCEL BOOKING
// ==================================================

app.patch(
    "/api/bookings/:id/cancel",
    (req, res) => {

        const bookings =
            readJson(BOOKINGS_FILE);

        const bookingIndex =
            bookings.findIndex(
                booking =>
                    booking.id ===
                    req.params.id
            );

        if (bookingIndex === -1) {

            return res.status(404).json({
                success: false,
                message:
                    "Booking not found"
            });

        }

        // Already cancelled
        if (
            bookings[bookingIndex]
                .status === "cancelled"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Booking is already cancelled"
            });

        }

        const stationId =
            bookings[bookingIndex]
                .stationId;

        const stations =
            readJson(STATIONS_FILE);

        const stationIndex =
            stations.findIndex(
                station =>
                    station.id ===
                    stationId
            );

        // Update booking
        bookings[bookingIndex]
            .status = "cancelled";

        bookings[bookingIndex]
            .cancelledAt =
            new Date().toISOString();

        // Return slot
        if (stationIndex !== -1) {

            stations[stationIndex]
                .availableSlots =
                Math.min(
                    stations[stationIndex]
                        .totalSlots,

                    stations[stationIndex]
                        .availableSlots + 1
                );

        }

        writeJson(
            BOOKINGS_FILE,
            bookings
        );

        writeJson(
            STATIONS_FILE,
            stations
        );

        // Real-time update
        io.emit(
            "booking:cancelled",
            bookings[bookingIndex]
        );

        broadcastStations();

        res.json({

            success: true,

            message:
                "Booking cancelled",

            data:
                bookings[bookingIndex]

        });

    }
);

// ==================================================
// UPDATE STATION AVAILABILITY
// ==================================================
//
// Useful for admin dashboard/demo.
// Example:
//
// PATCH /api/stations/stn-001/availability
//
// Body:
// {
//   "availableSlots": 3
// }
// ==================================================

app.patch(
    "/api/stations/:id/availability",
    (req, res) => {

        const availableSlots =
            Number(
                req.body.availableSlots
            );

        if (
            !Number.isInteger(
                availableSlots
            ) ||
            availableSlots < 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "availableSlots must be a non-negative integer"
            });

        }

        const stations =
            readJson(STATIONS_FILE);

        const stationIndex =
            stations.findIndex(
                station =>
                    station.id ===
                    req.params.id
            );

        if (stationIndex === -1) {

            return res.status(404).json({
                success: false,
                message:
                    "Station not found"
            });

        }

        if (
            availableSlots >
            stations[stationIndex].totalSlots
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "availableSlots cannot exceed totalSlots"
            });

        }

        stations[stationIndex]
            .availableSlots =
            availableSlots;

        stations[stationIndex]
            .updatedAt =
            new Date().toISOString();

        writeJson(
            STATIONS_FILE,
            stations
        );

        // Send live update
        broadcastStations();

        res.json({

            success: true,

            message:
                "Availability updated",

            data:
                enrichStation(
                    stations[stationIndex]
                )

        });

    }
);

// ==================================================
// SOCKET.IO CONNECTION
// ==================================================

io.on("connection", socket => {

    console.log(
        `⚡ Client connected: ${socket.id}`
    );

    // Send current stations immediately
    const stations =
        readJson(STATIONS_FILE);

    socket.emit(
        "stations:update",
        stations.map(enrichStation)
    );

    // Send current statistics
    socket.emit(
        "stats:update",
        getStats(stations)
    );

    // Client can request refresh
    socket.on(
        "request:refresh",
        () => {
            broadcastStations();
        }
    );

    socket.on(
        "disconnect",
        () => {

            console.log(
                `Client disconnected: ${socket.id}`
            );

        }
    );

});

// ==================================================
// DEMO REAL-TIME AVAILABILITY
// ==================================================
//
// Every 15 seconds, one station gets a small
// availability change.
//
// This is useful for demonstrating Socket.IO
// during your portfolio presentation.
//
// Remove this section for a real production system.
// ==================================================

setInterval(() => {

    const stations =
        readJson(STATIONS_FILE);

    if (!stations.length) {
        return;
    }

    const index =
        Math.floor(
            Math.random() *
            stations.length
        );

    const station =
        stations[index];

    // Randomly increase/decrease slots
    const change =
        Math.random() > 0.5
            ? 1
            : -1;

    const newAvailability =
        Math.max(
            0,
            Math.min(
                station.totalSlots,
                station.availableSlots +
                    change
            )
        );

    if (
        newAvailability !==
        station.availableSlots
    ) {

        station.availableSlots =
            newAvailability;

        station.updatedAt =
            new Date().toISOString();

        writeJson(
            STATIONS_FILE,
            stations
        );

        broadcastStations();

        console.log(
            `🔄 ${station.name}: ${station.availableSlots}/${station.totalSlots} slots available`
        );

    }

}, 15000);

// ==================================================
// 404 HANDLER
// ==================================================

app.use((req, res) => {

    if (req.method === "GET" && req.accepts("html")) {
        return res.sendFile(path.join(__dirname, "..", "index.html"));
    }

    res.status(404).json({

        success: false,

        message:
            "API route not found"

    });

});

// ==================================================
// ERROR HANDLER
// ==================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);

// ==================================================
// START SERVER
// ==================================================

server.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            "       ⚡ VOLTMAP BACKEND SERVER"
        );
        console.log(
            "========================================"
        );
        console.log(
            `🚀 Server: http://localhost:${PORT}`
        );
        console.log(
            `❤️  Health: http://localhost:${PORT}/api/health`
        );
        console.log(
            `📍 Stations: http://localhost:${PORT}/api/stations`
        );
        console.log(
            "🔌 Socket.IO: ENABLED"
        );
        console.log(
            "========================================"
        );
        console.log("");

    }
);