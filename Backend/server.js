require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");
let Razorpay = null;
try {
    Razorpay = require("razorpay");
}
catch (error) {
    console.warn("Razorpay package not installed. Demo payments will still work.");
}
// FIX: added for Google Sign-In (verifies the ID token from the frontend)
// and for emailing password-reset codes. Both are optional — if either
// package isn't installed, those two features fall back gracefully
// (Google Sign-In responds with a clear error; reset codes get logged to
// the server console instead of emailed) rather than crashing the server.
let OAuth2Client = null;
try {
    ({ OAuth2Client } = require("google-auth-library"));
}
catch (error) {
    console.warn("google-auth-library not installed. Run: npm install google-auth-library");
}
let nodemailer = null;
try {
    nodemailer = require("nodemailer");
}
catch (error) {
    console.warn("nodemailer not installed. Run: npm install nodemailer");
}

// ==================================================
// EXPRESS SERVER

// ==================================================
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "*";

// ==================================================
// FILE PATHS

// ==================================================
const DATA_DIR = path.join(__dirname, "data");
const STATIONS_FILE = path.join(DATA_DIR, "stations.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const DATABASE_FILE = path.join(DATA_DIR, "database.json");
if (!fs.existsSync(DATA_DIR))
    fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(STATIONS_FILE))
    fs.writeFileSync(STATIONS_FILE, "[]");
if (!fs.existsSync(BOOKINGS_FILE))
    fs.writeFileSync(BOOKINGS_FILE, "[]");
if (!fs.existsSync(DATABASE_FILE)) {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify({ users: [], stationRatings: [], savedPlaces: [], orders: [], resetCodes: [] }, null, 2));
}

// ==================================================
// SEED DEMO STATIONS
// (previously stations.json stayed empty forever, so every
//  booking/payment call 404'd against a "station not found")

// ==================================================
const DEMO_STATIONS = [
    { id: 1, name: "VoltMap Energy Hub", operator: "VoltMap Energy", address: "Whitefield Main Road, Bengaluru", lat: 12.9698, lng: 77.7500, chargerType: "DC", connector: "CCS2", power: 120, price: 18, available: 6, total: 8, rating: 4.8, reviews: 126, open: true, amenities: ["cafe", "parking", "wifi", "restroom"] },
    { id: 2, name: "ChargeZone Whitefield", operator: "ChargeZone", address: "ITPL Main Road, Whitefield", lat: 12.9850, lng: 77.7350, chargerType: "DC", connector: "CCS2", power: 150, price: 20, available: 2, total: 6, rating: 4.7, reviews: 98, open: true, amenities: ["parking", "wifi"] },
    { id: 3, name: "Tata Power Charging Hub", operator: "Tata Power", address: "Brookefield, Bengaluru", lat: 12.9692, lng: 77.7160, chargerType: "DC", connector: "CCS2", power: 60, price: 18, available: 4, total: 6, rating: 4.6, reviews: 87, open: true, amenities: ["cafe", "parking", "restroom"] },
    { id: 4, name: "Ather Grid Station", operator: "Ather", address: "Marathahalli, Bengaluru", lat: 12.9590, lng: 77.6970, chargerType: "AC", connector: "Type2", power: 7.4, price: 12, available: 5, total: 6, rating: 4.5, reviews: 63, open: true, amenities: ["parking", "wifi"] },
    { id: 5, name: "EVRE Fast Charge", operator: "EVRE", address: "Bellandur, Bengaluru", lat: 12.9300, lng: 77.6780, chargerType: "DC", connector: "CCS2", power: 180, price: 22, available: 1, total: 4, rating: 4.4, reviews: 45, open: true, amenities: ["parking", "cafe"] },
    { id: 6, name: "Shell Recharge Point", operator: "Shell", address: "Outer Ring Road, Bengaluru", lat: 12.9400, lng: 77.6900, chargerType: "DC", connector: "CHAdeMO", power: 100, price: 21, available: 0, total: 4, rating: 4.2, reviews: 38, open: true, amenities: ["cafe", "parking", "restroom"] },
    { id: 7, name: "GreenCharge Koramangala", operator: "GreenCharge", address: "Koramangala 5th Block", lat: 12.9352, lng: 77.6245, chargerType: "DC", connector: "CCS2", power: 100, price: 16, available: 3, total: 5, rating: 4.9, reviews: 211, open: true, amenities: ["cafe", "wifi", "parking"] },
    { id: 8, name: "BESCOM EV Station", operator: "BESCOM", address: "Indiranagar, Bengaluru", lat: 12.9719, lng: 77.6412, chargerType: "AC", connector: "Type2", power: 22, price: 10, available: 4, total: 4, rating: 4.1, reviews: 32, open: true, amenities: ["parking"] },
    { id: 9, name: "Jio-bp Pulse", operator: "Jio-bp", address: "Old Airport Road", lat: 12.9600, lng: 77.6500, chargerType: "DC", connector: "CCS2", power: 120, price: 19, available: 5, total: 6, rating: 4.7, reviews: 119, open: true, amenities: ["cafe", "parking", "restroom", "wifi"] },
    { id: 10, name: "Mahadevapura Charge Point", operator: "Statiq", address: "Phoenix Marketcity Road, Mahadevapura", lat: 12.9948, lng: 77.6964, chargerType: "DC", connector: "CCS2", power: 80, price: 17, available: 4, total: 6, rating: 4.6, reviews: 74, open: true, amenities: ["cafe", "parking", "restroom"] },
    { id: 11, name: "HSR Layout EV Hub", operator: "Bolt.Earth", address: "27th Main Road, HSR Layout", lat: 12.9116, lng: 77.6389, chargerType: "DC", connector: "CCS2", power: 120, price: 18, available: 3, total: 8, rating: 4.5, reviews: 91, open: true, amenities: ["cafe", "wifi", "parking"] },
    { id: 12, name: "Jayanagar Green Charge", operator: "GreenCharge", address: "4th Block, Jayanagar", lat: 12.9250, lng: 77.5938, chargerType: "AC", connector: "Type2", power: 22, price: 11, available: 6, total: 8, rating: 4.4, reviews: 58, open: true, amenities: ["parking", "wifi", "restroom"] },
    { id: 13, name: "Yelahanka Fast Charge", operator: "Tata Power", address: "New Town, Yelahanka", lat: 13.1007, lng: 77.5963, chargerType: "DC", connector: "CCS2", power: 150, price: 20, available: 2, total: 6, rating: 4.7, reviews: 104, open: true, amenities: ["cafe", "parking", "restroom"] },
    { id: 14, name: "Sarjapur Road EV Lounge", operator: "ChargeZone", address: "Sarjapur Main Road, Bengaluru", lat: 12.9103, lng: 77.6880, chargerType: "DC", connector: "CHAdeMO", power: 100, price: 19, available: 5, total: 8, rating: 4.6, reviews: 83, open: true, amenities: ["cafe", "parking", "wifi", "restroom"] },
    { id: 15, name: "MG Road City Charger", operator: "BESCOM", address: "MG Road, Bengaluru", lat: 12.9756, lng: 77.6065, chargerType: "DC", connector: "CCS2", power: 60, price: 16, available: 1, total: 4, rating: 4.3, reviews: 67, open: true, amenities: ["cafe", "parking", "wifi"] }
];
try {
    const existingStations = JSON.parse(fs.readFileSync(STATIONS_FILE, "utf8"));
    if (!Array.isArray(existingStations) || existingStations.length === 0) {
        fs.writeFileSync(STATIONS_FILE, JSON.stringify(DEMO_STATIONS, null, 2));
        console.log(`Seeded ${DEMO_STATIONS.length} demo stations into stations.json`);
    }
}
catch (error) {
    fs.writeFileSync(STATIONS_FILE, JSON.stringify(DEMO_STATIONS, null, 2));
    console.log("stations.json was unreadable, re-seeded with demo stations");
}

// ==================================================
// RAZORPAY INSTANCE

// ==================================================
const razorpay = Razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    : null;

// ==================================================
// GOOGLE SIGN-IN CLIENT

// ==================================================
const googleClient = OAuth2Client && process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

// ==================================================
// EMAIL TRANSPORTER (password-reset codes)

// ==================================================
const mailTransporter = nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
    : null;
async function sendResetCodeEmail(email, code) {
    if (!mailTransporter) {
        // No SMTP configured — demo fallback so the flow still works end to end locally.
        console.log(`✉️  (DEMO — no SMTP configured) Password reset code for ${email}: ${code}`);
        return false;
    }
    await mailTransporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Your VoltMap password reset code",
        text: `Your VoltMap password reset code is ${code}. It expires in 10 minutes.`,
        html: `<p>Your VoltMap password reset code is:</p><h2 style="letter-spacing:4px;">${code}</h2><p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`
    });
    return true;
}

// ==================================================
// SOCKET.IO

// ==================================================
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL === "*" ? true : CLIENT_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
});

// ==================================================
// MIDDLEWARE

// ==================================================

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));

app.use(cors({ origin: CLIENT_URL === "*" ? true : CLIENT_URL, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] }));

app.use(express.json({ limit: "1mb" }));

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "..")));
// FIX: script.js calls apiRequest("/auth/..."), but every route below is
// registered under "/api/auth/...". Without this, every login/signup/
// google/reset-password call 404'd. This rewrites just the /auth/* prefix
// so both the frontend's existing calls and these routes agree.

app.use((req, res, next) => {
    if (req.path.startsWith("/auth/")) {
        req.url = "/api" + req.url;
    }
    next();
});

// ==================================================
// HELPER FUNCTIONS

// ==================================================

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    }
    catch (error) {
        console.error(`Error reading ${file}:`, error);
        return [];
    }
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function readDatabase() {
    const database = readJson(DATABASE_FILE);
    return {
        users: Array.isArray(database.users) ? database.users : [],
        stationRatings: Array.isArray(database.stationRatings) ? database.stationRatings : [],
        savedPlaces: Array.isArray(database.savedPlaces) ? database.savedPlaces : [],
        orders: Array.isArray(database.orders) ? database.orders : [],
        resetCodes: Array.isArray(database.resetCodes) ? database.resetCodes : []
    };
}

function normalizeStationId(value) {
    return String(value);
}

function getStationAvailable(station) {
    if (station.availableSlots !== undefined)
        return Number(station.availableSlots);
    if (station.available !== undefined)
        return Number(station.available);
    return 0;
}

function getStationTotal(station) {
    if (station.totalSlots !== undefined)
        return Number(station.totalSlots);
    if (station.total !== undefined)
        return Number(station.total);
    return 0;
}

function setStationAvailable(station, value) {
    if (station.availableSlots !== undefined) {
        station.availableSlots = value;
        return;
    }
    if (station.available !== undefined) {
        station.available = value;
        return;
    }
    station.availableSlots = value;
}

function generateBookingId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `VM-${date}-${random}`;
}

function getStationStatus(station) {
    const available = getStationAvailable(station);
    const total = getStationTotal(station);
    if (available <= 0)
        return "full";
    if (available <= Math.max(1, Math.ceil(total * 0.3)))
        return "low";
    return "available";
}

function enrichStation(station) {
    const available = getStationAvailable(station);
    const total = getStationTotal(station);
    return {
        ...station,
        availableSlots: available,
        totalSlots: total,
        available: station.available !== undefined ? station.available : available,
        total: station.total !== undefined ? station.total : total,
        status: getStationStatus(station)
    };
}

function getStats(stations) {
    const totalStations = stations.length;
    const totalSlots = stations.reduce((sum, s) => sum + getStationTotal(s), 0);
    const availableSlots = stations.reduce((sum, s) => sum + getStationAvailable(s), 0);
    const busySlots = Math.max(0, totalSlots - availableSlots);
    const prices = stations
        .map(s => Number(s.pricePerKwh ?? s.price ?? 0))
        .filter(v => Number.isFinite(v));
    const averagePrice = prices.length
        ? Number((prices.reduce((sum, v) => sum + v, 0) / prices.length).toFixed(2))
        : 0;
    return { totalStations, totalSlots, availableSlots, busySlots, averagePrice };
}
// FIX: this used to call the undefined function `enrichedStation`, which
// threw a ReferenceError every time this ran (every 15s, plus on every
// booking/payment). An uncaught exception inside setInterval crashes the
// whole Node process — this was silently killing the backend on Render.

function broadcastStations() {
    const stations = readJson(STATIONS_FILE);
    io.emit("stations:update", stations.map(enrichStation));
    io.emit("stats:update", getStats(stations));
}

// ==================================================
// ADMIN AUTH GUARD

// ==================================================

function requireAdmin(req, res, next) {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey)
        return next();
    if (req.header("x-admin-key") !== adminKey) {
        return res.status(401).json({ success: false, message: "Admin key required" });
    }
    next();
}

// ==================================================
// HEALTH CHECK

// ==================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "VoltMap API",
        status: "online",
        razorpay: Boolean(razorpay),
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
        // FIX: single fixed admin account — no new admin accounts may ever
        // be created through sign-up. Admin sign-in is handled separately
        // below against ADMIN_EMAIL / ADMIN_PASSWORD in .env.
        if (role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin sign-up is disabled. VoltMap has a single fixed admin account — please sign in instead."
            });
        }
        if (!name || !email.includes("@") || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Name, a valid email, and a password of at least 6 characters are required"
            });
        }
        const database = readDatabase();
        if (database.users.some(u => u.email === email && u.role === role)) {
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
            data: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        next(error);
    }
});

app.post("/api/auth/login", async (req, res, next) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const role = req.body.role === "admin" ? "admin" : "user";
        // FIX: single fixed admin account — admin sign-in never touches the
        // regular user database, it only ever matches these two env vars.
        // Set ADMIN_EMAIL / ADMIN_PASSWORD in your .env (see .env.example).
        if (role === "admin") {
            const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
            const adminPassword = String(process.env.ADMIN_PASSWORD || "");
            if (!adminEmail || !adminPassword) {
                return res.status(503).json({
                    success: false,
                    message: "Admin sign-in is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in the server .env."
                });
            }
            if (email !== adminEmail || password !== adminPassword) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid admin credentials"
                });
            }
            return res.json({
                success: true,
                data: {
                    id: "ADMIN",
                    name: "VoltMap Admin",
                    email: adminEmail,
                    role: "admin"
                }
            });
        }
        const database = readDatabase();
        const user = database.users.find(u => u.email === email && u.role === role);
        if (!user ||
            !user.passwordHash ||
            !(await bcrypt.compare(password, user.passwordHash))) {
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
    }
    catch (error) {
        next(error);
    }
});

// ==================================================
// FORGOT PASSWORD

// ==================================================

app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email || !email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "A valid email is required"
            });
        }
        const database = readDatabase();
        const accountExists = database.users.some(u => u.email === email);
        // Always respond success either way so this can't be used to probe
        // which emails have accounts — but only actually generate/send a
        // code when the account exists.
        if (accountExists) {
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const expiresAt = Date.now() + 10 * 60 * 1000;
            const filtered = database.resetCodes.filter(entry => entry.email !== email);
            filtered.push({
                email,
                code,
                verified: false,
                expiresAt,
                createdAt: new Date().toISOString()
            });
            database.resetCodes = filtered;
            writeJson(DATABASE_FILE, database);
            try {
                await sendResetCodeEmail(email, code);
            }
            catch (mailError) {
                console.error("Failed to send reset code email:", mailError.message);
            }
        }
        res.json({
            success: true,
            message: "If an account exists for this email, a verification code has been sent."
        });
    }
    catch (error) {
        next(error);
    }
});

// ==================================================
// VERIFY RESET CODE

// ==================================================

app.post("/api/auth/verify-reset-code", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();
    if (!email || !code) {
        return res.status(400).json({
            success: false,
            message: "Email and code are required"
        });
    }
    const database = readDatabase();
    const index = database.resetCodes.findIndex(entry => entry.email === email);
    if (index === -1 ||
        database.resetCodes[index].code !== code) {
        return res.status(400).json({
            success: false,
            message: "The code is incorrect or has expired"
        });
    }
    if (Date.now() > database.resetCodes[index].expiresAt) {
        database.resetCodes.splice(index, 1);
        writeJson(DATABASE_FILE, database);
        return res.status(400).json({
            success: false,
            message: "The code has expired. Request a new one."
        });
    }
    database.resetCodes[index].verified = true;
    writeJson(DATABASE_FILE, database);
    res.json({
        success: true,
        message: "Code verified"
    });
});

// ==================================================
// RESET PASSWORD

// ==================================================

app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const newPassword = String(req.body.newPassword || "");
        if (!email || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Email and a new password of at least 6 characters are required"
            });
        }
        const database = readDatabase();
        const codeIndex = database.resetCodes.findIndex(entry => entry.email === email);
        if (codeIndex === -1 ||
            !database.resetCodes[codeIndex].verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your reset code before setting a new password"
            });
        }
        if (Date.now() > database.resetCodes[codeIndex].expiresAt) {
            database.resetCodes.splice(codeIndex, 1);
            writeJson(DATABASE_FILE, database);
            return res.status(400).json({
                success: false,
                message: "The code has expired. Request a new one."
            });
        }
        const userIndex = database.users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "No account found for this email"
            });
        }
        database.users[userIndex].passwordHash =
            await bcrypt.hash(newPassword, 12);
        database.resetCodes.splice(codeIndex, 1);
        writeJson(DATABASE_FILE, database);
        res.json({
            success: true,
            message: "Password updated. You can now sign in with your new password."
        });
    }
    catch (error) {
        next(error);
    }
});

// ==================================================
// GOOGLE SIGN-IN
// Verifies the ID token the frontend got from Google Identity
// Services, then finds or creates a matching driver ("user")
// account. Requires GOOGLE_CLIENT_ID in .env and the
// google-auth-library package installed.

// ==================================================

app.post("/api/auth/google", async (req, res, next) => {
    try {
        if (!googleClient) {
            return res.status(503).json({
                success: false,
                message: "Google Sign-In is not configured. Install google-auth-library and set GOOGLE_CLIENT_ID in .env."
            });
        }
        const credential = String(req.body.credential || "");
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "A Google credential is required"
            });
        }
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const email = String(payload.email || "")
            .trim()
            .toLowerCase();
        const name = payload.name ||
            email.split("@")[0];
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account has no email"
            });
        }
        const database = readDatabase();
        let user = database.users.find(u => u.email === email && u.role === "user");
        if (!user) {
            user = {
                id: `USR-${uuid().slice(0, 8).toUpperCase()}`,
                name,
                email,
                role: "user",
                provider: "google",
                passwordHash: null,
                createdAt: new Date().toISOString()
            };
            database.users.push(user);
            writeJson(DATABASE_FILE, database);
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
    }
    catch (error) {
        console.error("Google sign-in verification failed:", error.message);
        res.status(401).json({
            success: false,
            message: "Google sign-in verification failed"
        });
    }
});

// ==================================================
// SAVED PLACES

// ==================================================

app.put("/api/users/:email/saved-places", (req, res) => {
    const email = String(req.params.email)
        .trim()
        .toLowerCase();
    const place = String(req.body.place || "")
        .trim()
        .toLowerCase();
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);
    if (!["home", "office", "college"].includes(place) ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)) {
        return res.status(400).json({
            success: false,
            message: "Valid place, lat and lng are required"
        });
    }
    const database = readDatabase();
    const index = database.savedPlaces.findIndex(p => p.email === email && p.place === place);
    const record = {
        email,
        place,
        lat,
        lng,
        updatedAt: new Date().toISOString()
    };
    if (index === -1) {
        database.savedPlaces.push(record);
    }
    else {
        database.savedPlaces[index] = record;
    }
    writeJson(DATABASE_FILE, database);
    res.json({
        success: true,
        data: record
    });
});

app.get("/api/users/:email/saved-places", (req, res) => {
    const email = String(req.params.email)
        .trim()
        .toLowerCase();
    const database = readDatabase();
    const places = database.savedPlaces.filter(p => p.email === email);
    res.json({
        success: true,
        data: places
    });
});

// ==================================================
// STATION RATINGS

// ==================================================

app.post("/api/stations/:id/ratings", (req, res) => {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();
    const rating = Number(req.body.rating);
    if (!email ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Email and a rating from 1 to 5 are required"
        });
    }
    const database = readDatabase();
    const index = database.stationRatings.findIndex(r => normalizeStationId(r.stationId) ===
        normalizeStationId(req.params.id) &&
        r.email === email);
    const record = {
        stationId: req.params.id,
        email,
        rating,
        updatedAt: new Date().toISOString()
    };
    if (index === -1) {
        database.stationRatings.push(record);
    }
    else {
        database.stationRatings[index] = record;
    }
    writeJson(DATABASE_FILE, database);
    res.json({
        success: true,
        data: record
    });
});

// ==================================================
// FRONTEND ORDERS

// ==================================================

app.post("/api/orders", (req, res) => {
    const order = req.body || {};
    const userEmail = String(order.userEmail || "")
        .trim()
        .toLowerCase();
    if (!userEmail ||
        !order.stationName ||
        !order.vehicleNumber ||
        !Number.isFinite(Number(order.amount))) {
        return res.status(400).json({
            success: false,
            message: "userEmail, stationName, vehicleNumber and amount are required"
        });
    }
    const database = readDatabase();
    const record = {
        id: order.id ||
            order.bookingId ||
            generateBookingId(),
        bookingId: order.bookingId ||
            order.id ||
            generateBookingId(),
        userEmail,
        customerName: String(order.customerName ||
            order.name ||
            ""),
        stationId: order.stationId || null,
        stationName: String(order.stationName),
        address: String(order.address || ""),
        chargerName: String(order.chargerName ||
            "Charger"),
        date: String(order.date || ""),
        time: String(order.time || ""),
        vehicle: String(order.vehicle ||
            order.vehicleModel ||
            ""),
        vehicleNumber: String(order.vehicleNumber)
            .toUpperCase(),
        amount: Number(order.amount),
        paymentMethod: String(order.paymentMethod || ""),
        paymentStatus: String(order.paymentStatus || "Paid"),
        status: String(order.status ||
            "Paid & confirmed"),
        razorpayOrderId: order.razorpayOrderId ||
            null,
        razorpayPaymentId: order.razorpayPaymentId ||
            null,
        rating: Number.isInteger(order.rating)
            ? order.rating
            : null,
        createdAt: order.createdAt ||
            new Date().toISOString()
    };
    const index = database.orders.findIndex(o => o.id === record.id &&
        o.userEmail === userEmail);
    if (index === -1) {
        database.orders.push(record);
    }
    else {
        database.orders[index] = {
            ...database.orders[index],
            ...record
        };
    }
    writeJson(DATABASE_FILE, database);
    res.status(index === -1 ? 201 : 200).json({
        success: true,
        data: record
    });
});

app.get("/api/orders", (req, res) => {
    const email = String(req.query.userEmail || "")
        .trim()
        .toLowerCase();
    const database = readDatabase();
    const orders = database.orders
        .filter(o => !email || o.userEmail === email)
        .sort((a, b) => new Date(b.createdAt) -
        new Date(a.createdAt));
    res.json({
        success: true,
        count: orders.length,
        data: orders
    });
});

app.patch("/api/orders/:id/rating", (req, res) => {
    const rating = Number(req.body.rating);
    const userEmail = String(req.body.userEmail || "").trim().toLowerCase();
    if (!Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5 ||
        !userEmail) {
        return res.status(400).json({
            success: false,
            message: "userEmail and a rating from 1 to 5 are required"
        });
    }
    const database = readDatabase();
    const index = database.orders.findIndex(o => (o.id === req.params.id ||
        o.bookingId === req.params.id) &&
        o.userEmail === userEmail);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }
    database.orders[index].rating = rating;
    database.orders[index].ratedAt =
        new Date().toISOString();
    writeJson(DATABASE_FILE, database);
    res.json({
        success: true,
        data: database.orders[index]
    });
});

// ==================================================
// ADMIN: ALL ORDERS

// ==================================================

app.get("/api/admin/orders", requireAdmin, (req, res) => {
    const database = readDatabase();
    let orders = [...database.orders];
    if (req.query.date) {
        orders = orders.filter(o => o.date === req.query.date);
    }
    if (req.query.stationId) {
        orders = orders.filter(o => String(o.stationId) ===
            String(req.query.stationId));
    }
    if (req.query.status) {
        orders = orders.filter(o => o.status === req.query.status);
    }
    orders.sort((a, b) => new Date(b.createdAt) -
        new Date(a.createdAt));
    res.json({
        success: true,
        count: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + Number(o.amount || 0), 0),
        data: orders
    });
});

// ==================================================
// DASHBOARD STATS

// ==================================================

app.get("/api/stats", (req, res) => {
    const stations = readJson(STATIONS_FILE);
    res.json({
        success: true,
        data: getStats(stations)
    });
});

// ==================================================
// GET ALL STATIONS

// ==================================================

app.get("/api/stations", (req, res) => {
    let stations = readJson(STATIONS_FILE);
    const { chargerType, connector, maxPrice, availableOnly, sort, search } = req.query;
    if (chargerType) {
        stations = stations.filter(s => String(s.chargerType ||
            s.type ||
            "").toLowerCase() ===
            String(chargerType).toLowerCase());
    }
    if (connector) {
        stations = stations.filter(s => {
            const connectors = Array.isArray(s.connectors)
                ? s.connectors
                : [s.connector];
            return connectors.some(c => String(c || "")
                .toLowerCase() ===
                String(connector).toLowerCase());
        });
    }
    if (maxPrice) {
        stations = stations.filter(s => Number(s.pricePerKwh ??
            s.price ??
            0) <= Number(maxPrice));
    }
    if (availableOnly === "true") {
        stations = stations.filter(s => getStationAvailable(s) > 0);
    }
    if (search) {
        const query = String(search).toLowerCase();
        stations = stations.filter(s => [
            s.name,
            s.address,
            s.city,
            s.operator
        ].some(v => String(v || "")
            .toLowerCase()
            .includes(query)));
    }
    if (sort === "price_asc") {
        stations.sort((a, b) => Number(a.pricePerKwh ??
            a.price ??
            0) -
            Number(b.pricePerKwh ??
                b.price ??
                0));
    }
    if (sort === "price_desc") {
        stations.sort((a, b) => Number(b.pricePerKwh ??
            b.price ??
            0) -
            Number(a.pricePerKwh ??
                a.price ??
                0));
    }
    if (sort === "power_desc") {
        stations.sort((a, b) => Number(b.powerKw ??
            b.power ??
            0) -
            Number(a.powerKw ??
                a.power ??
                0));
    }
    if (sort === "rating_desc") {
        stations.sort((a, b) => Number(b.rating || 0) -
            Number(a.rating || 0));
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
    const stations = readJson(STATIONS_FILE);
    const station = stations.find(s => normalizeStationId(s.id) ===
        normalizeStationId(req.params.id));
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

app.get("/api/stations/nearby/search", (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radius || 10);
    if (!Number.isFinite(lat) ||
        !Number.isFinite(lng)) {
        return res.status(400).json({
            success: false,
            message: "lat and lng are required"
        });
    }
    const stations = readJson(STATIONS_FILE);
    const toRad = deg => (deg * Math.PI) / 180;

    function distanceKm(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) ** 2;
        return (R *
            2 *
            Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    const result = stations
        .map(s => {
        const stationLat = Number(s.lat ??
            s.latitude);
        const stationLng = Number(s.lng ??
            s.longitude);
        const distance = distanceKm(lat, lng, stationLat, stationLng);
        return {
            ...enrichStation(s),
            distanceKm: Number(distance.toFixed(2))
        };
    })
        .filter(s => s.distanceKm <=
        radiusKm)
        .sort((a, b) => a.distanceKm -
        b.distanceKm);
    res.json({
        success: true,
        count: result.length,
        data: result
    });
});

// ==================================================
// CREATE BOOKING

// ==================================================

app.post("/api/bookings", (req, res, next) => {
    try {
        const { stationId, name, userEmail, vehicleNumber, vehicleModel, date, time, durationMinutes = 30, paymentMethod = "", amount = 0, bookingId, paymentStatus, razorpayOrderId, razorpayPaymentId } = req.body;
        if (!stationId ||
            !name ||
            !vehicleNumber ||
            !date ||
            !time) {
            return res.status(400).json({
                success: false,
                message: "stationId, name, vehicleNumber, date and time are required"
            });
        }
        const stations = readJson(STATIONS_FILE);
        const stationIndex = stations.findIndex(s => normalizeStationId(s.id) ===
            normalizeStationId(stationId));
        if (stationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }
        const station = stations[stationIndex];
        const available = getStationAvailable(station);
        if (available <= 0) {
            return res.status(409).json({
                success: false,
                message: "No charging slots are currently available"
            });
        }
        const bookings = readJson(BOOKINGS_FILE);
        if (bookingId) {
            const existing = bookings.find(b => String(b.bookingId ||
                b.id) ===
                String(bookingId));
            if (existing) {
                return res.status(200).json({
                    success: true,
                    message: "Booking already exists",
                    data: existing
                });
            }
        }
        const finalBookingId = bookingId ||
            generateBookingId();
        const cleanEmail = String(userEmail || "")
            .trim()
            .toLowerCase();
        const numericAmount = Number(amount) || 0;
        const booking = {
            id: finalBookingId,
            bookingId: finalBookingId,
            stationId: station.id,
            stationName: String(station.name ||
                "EV Charging Station"),
            address: String(station.address ||
                ""),
            name: String(name).trim(),
            customerName: String(name).trim(),
            userEmail: cleanEmail,
            vehicleNumber: String(vehicleNumber)
                .trim()
                .toUpperCase(),
            vehicleModel: String(vehicleModel ||
                "").trim(),
            date: String(date),
            time: String(time),
            durationMinutes: Number(durationMinutes) || 30,
            chargerName: String(req.body.chargerName ||
                "Charger"),
            amount: numericAmount,
            paymentMethod: String(paymentMethod ||
                "").trim(),
            paymentStatus: String(paymentStatus ||
                (paymentMethod
                    ? "Paid"
                    : "Pending")),
            status: paymentMethod
                ? "Paid & confirmed"
                : "confirmed",
            razorpayOrderId: razorpayOrderId ||
                null,
            razorpayPaymentId: razorpayPaymentId ||
                null,
            rating: null,
            createdAt: new Date().toISOString()
        };
        bookings.push(booking);
        setStationAvailable(station, Math.max(0, available - 1));
        station.updatedAt =
            new Date().toISOString();
        writeJson(BOOKINGS_FILE, bookings);
        writeJson(STATIONS_FILE, stations);
        const database = readDatabase();
        const orderRecord = {
            id: finalBookingId,
            bookingId: finalBookingId,
            userEmail: cleanEmail,
            customerName: String(name).trim(),
            stationId: station.id,
            stationName: booking.stationName,
            address: booking.address,
            chargerName: booking.chargerName,
            date: booking.date,
            time: booking.time,
            vehicle: booking.vehicleModel,
            vehicleNumber: booking.vehicleNumber,
            amount: numericAmount,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            status: booking.status,
            razorpayOrderId: booking.razorpayOrderId,
            razorpayPaymentId: booking.razorpayPaymentId,
            rating: null,
            createdAt: booking.createdAt
        };
        const existingOrderIndex = database.orders.findIndex(o => (o.id ===
            finalBookingId ||
            o.bookingId ===
                finalBookingId) &&
            (!cleanEmail ||
                o.userEmail ===
                    cleanEmail));
        if (existingOrderIndex === -1) {
            database.orders.unshift(orderRecord);
        }
        else {
            database.orders[existingOrderIndex] = {
                ...database.orders[existingOrderIndex],
                ...orderRecord
            };
        }
        writeJson(DATABASE_FILE, database);
        io.emit("booking:created", booking);
        broadcastStations();
        res.status(201).json({
            success: true,
            message: "Booking confirmed",
            data: booking
        });
    }
    catch (error) {
        next(error);
    }
});

// ==================================================
// GET BOOKINGS

// ==================================================

app.get("/api/bookings", (req, res) => {
    let bookings = readJson(BOOKINGS_FILE);
    if (req.query.vehicleNumber) {
        const vehicleNumber = String(req.query.vehicleNumber)
            .trim()
            .toUpperCase();
        bookings =
            bookings.filter(b => String(b.vehicleNumber).toUpperCase() ===
                vehicleNumber);
    }
    if (req.query.userEmail) {
        const email = String(req.query.userEmail)
            .trim()
            .toLowerCase();
        bookings =
            bookings.filter(b => String(b.userEmail ||
                "").toLowerCase() ===
                email);
    }
    if (req.query.status) {
        bookings =
            bookings.filter(b => b.status ===
                req.query.status);
    }
    bookings.sort((a, b) => new Date(b.createdAt) -
        new Date(a.createdAt));
    res.json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

app.get("/api/bookings/:id", (req, res) => {
    const bookings = readJson(BOOKINGS_FILE);
    const booking = bookings.find(b => String(b.id) ===
        String(req.params.id) ||
        String(b.bookingId) ===
            String(req.params.id));
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }
    res.json({
        success: true,
        data: booking
    });
});

app.patch("/api/bookings/:id/rating", (req, res) => {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5) {
        return res.status(400).json({
            success: false,
            message: "rating must be an integer from 1 to 5"
        });
    }
    const bookings = readJson(BOOKINGS_FILE);
    const index = bookings.findIndex(b => String(b.id) ===
        String(req.params.id) ||
        String(b.bookingId) ===
            String(req.params.id));
    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }
    bookings[index].rating =
        rating;
    bookings[index].ratedAt =
        new Date().toISOString();
    writeJson(BOOKINGS_FILE, bookings);
    const database = readDatabase();
    const orderIndex = database.orders.findIndex(o => String(o.id) ===
        String(bookings[index]
            .id) ||
        String(o.bookingId) ===
            String(bookings[index]
                .bookingId));
    if (orderIndex !== -1) {
        database.orders[orderIndex].rating =
            rating;
        database.orders[orderIndex].ratedAt =
            bookings[index]
                .ratedAt;
        writeJson(DATABASE_FILE, database);
    }
    res.json({
        success: true,
        data: bookings[index]
    });
});

// ==================================================
// CANCEL BOOKING

// ==================================================

app.patch("/api/bookings/:id/cancel", (req, res) => {
    const bookings = readJson(BOOKINGS_FILE);
    const bookingIndex = bookings.findIndex(b => String(b.id) ===
        String(req.params.id) ||
        String(b.bookingId) ===
            String(req.params.id));
    if (bookingIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }
    if (bookings[bookingIndex]
        .status ===
        "cancelled") {
        return res.status(400).json({
            success: false,
            message: "Booking is already cancelled"
        });
    }
    const stationId = bookings[bookingIndex]
        .stationId;
    const stations = readJson(STATIONS_FILE);
    const stationIndex = stations.findIndex(s => normalizeStationId(s.id) ===
        normalizeStationId(stationId));
    const booking = bookings[bookingIndex];
    booking.status =
        "cancelled";
    booking.cancelledAt =
        new Date().toISOString();
    if (stationIndex !== -1) {
        const current = getStationAvailable(stations[stationIndex]);
        const total = getStationTotal(stations[stationIndex]);
        setStationAvailable(stations[stationIndex], Math.min(total, current + 1));
        stations[stationIndex].updatedAt =
            new Date().toISOString();
    }
    writeJson(BOOKINGS_FILE, bookings);
    writeJson(STATIONS_FILE, stations);
    const database = readDatabase();
    const orderIndex = database.orders.findIndex(o => String(o.id) ===
        String(booking.id) ||
        String(o.bookingId) ===
            String(booking.bookingId));
    if (orderIndex !== -1) {
        database.orders[orderIndex].status =
            "cancelled";
        database.orders[orderIndex].cancelledAt =
            booking.cancelledAt;
        writeJson(DATABASE_FILE, database);
    }
    io.emit("booking:cancelled", booking);
    broadcastStations();
    res.json({
        success: true,
        message: "Booking cancelled",
        data: booking
    });
});

// ==================================================
// UPDATE STATION AVAILABILITY

// ==================================================

app.patch("/api/stations/:id/availability", (req, res) => {
    const availableSlots = Number(req.body.availableSlots);
    if (!Number.isInteger(availableSlots) ||
        availableSlots < 0) {
        return res.status(400).json({
            success: false,
            message: "availableSlots must be a non-negative integer"
        });
    }
    const stations = readJson(STATIONS_FILE);
    const stationIndex = stations.findIndex(s => normalizeStationId(s.id) ===
        normalizeStationId(req.params.id));
    if (stationIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Station not found"
        });
    }
    const totalSlots = getStationTotal(stations[stationIndex]);
    if (availableSlots >
        totalSlots) {
        return res.status(400).json({
            success: false,
            message: "availableSlots cannot exceed totalSlots"
        });
    }
    setStationAvailable(stations[stationIndex], availableSlots);
    stations[stationIndex].updatedAt =
        new Date().toISOString();
    writeJson(STATIONS_FILE, stations);
    broadcastStations();
    res.json({
        success: true,
        message: "Availability updated",
        data: enrichStation(stations[stationIndex])
    });
});

// ==================================================
// RAZORPAY PAYMENT — CREATE ORDER

// ==================================================

app.post("/api/payment/create-order", async (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured. Install the razorpay package and add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env."
            });
        }
        const amount = Number(req.body.amount);
        const currency = String(req.body.currency ||
            "INR").toUpperCase();
        const receipt = String(req.body.receipt ||
            generateBookingId());
        if (!Number.isInteger(amount) ||
            amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid positive amount is required"
            });
        }
        if (currency !== "INR") {
            return res.status(400).json({
                success: false,
                message: "This VoltMap configuration currently accepts INR payments only"
            });
        }
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency,
            receipt,
            notes: {
                source: "VoltMap",
                userEmail: String(req.body.userEmail ||
                    "")
                    .trim()
                    .toLowerCase()
            }
        });
        res.status(201).json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                status: razorpayOrder.status,
                receipt: razorpayOrder.receipt,
                keyId: process.env
                    .RAZORPAY_KEY_ID
            }
        });
    }
    catch (error) {
        next(error);
    }
});

// ==================================================
// RAZORPAY PAYMENT — VERIFY SIGNATURE + CREATE BOOKING

// ==================================================

app.post("/api/payment/verify", (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured on the server."
            });
        }
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, userEmail, name, stationId, vehicleNumber, date, time, durationMinutes = 60 } = req.body;
        if (!razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Razorpay payment verification data is incomplete"
            });
        }
        const signatureBody = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env
            .RAZORPAY_KEY_SECRET)
            .update(signatureBody)
            .digest("hex");
        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const receivedBuffer = Buffer.from(String(razorpaySignature), "utf8");
        const signaturesMatch = expectedBuffer.length ===
            receivedBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
        if (!signaturesMatch) {
            return res.status(400).json({
                success: false,
                message: "Razorpay payment signature verification failed"
            });
        }
        if (!stationId ||
            !name ||
            !userEmail ||
            !vehicleNumber ||
            !date ||
            !time) {
            return res.status(400).json({
                success: false,
                message: "Booking information is incomplete"
            });
        }
        const stations = readJson(STATIONS_FILE);
        const stationIndex = stations.findIndex(s => normalizeStationId(s.id) ===
            normalizeStationId(stationId));
        if (stationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Station not found"
            });
        }
        const station = stations[stationIndex];
        const available = getStationAvailable(station);
        if (available <= 0) {
            return res.status(409).json({
                success: false,
                message: "No charging slots are currently available"
            });
        }
        const database = readDatabase();
        const cleanEmail = String(userEmail)
            .trim()
            .toLowerCase();
        const existingOrder = database.orders.find(o => o.razorpayPaymentId ===
            razorpayPaymentId);
        if (existingOrder) {
            return res.json({
                success: true,
                message: "Payment was already processed",
                data: existingOrder
            });
        }
        const bookings = readJson(BOOKINGS_FILE);
        const bookingId = generateBookingId();
        const numericAmount = Number(amount) || 0;
        const booking = {
            id: bookingId,
            bookingId,
            stationId: station.id,
            stationName: String(station.name ||
                "EV Charging Station"),
            address: String(station.address ||
                ""),
            name: String(name).trim(),
            customerName: String(name).trim(),
            userEmail: cleanEmail,
            vehicleNumber: String(vehicleNumber)
                .trim()
                .toUpperCase(),
            date: String(date),
            time: String(time),
            durationMinutes: Number(durationMinutes) || 60,
            chargerName: String(req.body.chargerName ||
                "Charger"),
            amount: numericAmount,
            paymentMethod: "RAZORPAY",
            paymentStatus: "Paid",
            status: "Paid & confirmed",
            razorpayOrderId,
            razorpayPaymentId,
            rating: null,
            createdAt: new Date().toISOString()
        };
        bookings.push(booking);
        setStationAvailable(station, Math.max(0, available - 1));
        station.updatedAt =
            new Date().toISOString();
        writeJson(BOOKINGS_FILE, bookings);
        writeJson(STATIONS_FILE, stations);
        const orderRecord = {
            id: bookingId,
            bookingId,
            userEmail: cleanEmail,
            customerName: booking.customerName,
            stationId: station.id,
            stationName: booking.stationName,
            address: booking.address,
            chargerName: booking.chargerName,
            date: booking.date,
            time: booking.time,
            vehicle: String(req.body.vehicleModel ||
                ""),
            vehicleNumber: booking.vehicleNumber,
            amount: numericAmount,
            paymentMethod: "RAZORPAY",
            paymentStatus: "Paid",
            status: "Paid & confirmed",
            razorpayOrderId,
            razorpayPaymentId,
            rating: null,
            createdAt: booking.createdAt
        };
        database.orders.unshift(orderRecord);
        writeJson(DATABASE_FILE, database);
        io.emit("payment:successful", {
            bookingId,
            booking
        });
        io.emit("booking:created", booking);
        broadcastStations();
        res.json({
            success: true,
            message: "Payment verified and booking confirmed",
            data: orderRecord
        });
    }
    catch (error) {
        next(error);
    }
});

// ==================================================
// DEMO PAYMENT

// ==================================================

app.post("/api/payment/demo", (req, res) => {
    const { amount, paymentMethod, userEmail } = req.body;
    const validMethods = [
        "QR",
        "UPI",
        "CARD"
    ];
    const method = String(paymentMethod || "").toUpperCase();
    if (!validMethods.includes(method)) {
        return res.status(400).json({
            success: false,
            message: "Payment method must be QR, UPI or CARD"
        });
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) ||
        numericAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid payment amount is required"
        });
    }
    res.json({
        success: true,
        message: "Demo payment approved",
        data: {
            paymentId: `DEMO-${uuid()
                .slice(0, 10)
                .toUpperCase()}`,
            paymentMethod: method,
            amount: numericAmount,
            userEmail: String(userEmail || "")
                .trim()
                .toLowerCase(),
            status: "Paid"
        }
    });
});

app.get("/api/payment/status", (req, res) => {
    res.json({
        success: true,
        razorpayConfigured: Boolean(razorpay),
        keyId: process.env
            .RAZORPAY_KEY_ID ||
            null
    });
});

// ==================================================
// SOCKET.IO

// ==================================================

io.on("connection", socket => {
    console.log(`⚡ Client connected: ${socket.id}`);
    const stations = readJson(STATIONS_FILE);
    socket.emit("stations:update", stations.map(enrichStation));
    socket.emit("stats:update", getStats(stations));
    socket.on("request:refresh", () => broadcastStations());
    socket.on("disconnect", () => console.log(`Client disconnected: ${socket.id}`));
});

// ==================================================
// DEMO REAL-TIME AVAILABILITY

// ==================================================

setInterval(() => {
    try {
        const stations = readJson(STATIONS_FILE);
        if (!stations.length)
            return;
        const index = Math.floor(Math.random() *
            stations.length);
        const station = stations[index];
        const total = getStationTotal(station);
        const available = getStationAvailable(station);
        const change = Math.random() > 0.5
            ? 1
            : -1;
        const newAvailability = Math.max(0, Math.min(total, available +
            change));
        if (newAvailability !==
            available) {
            setStationAvailable(station, newAvailability);
            station.updatedAt =
                new Date().toISOString();
            writeJson(STATIONS_FILE, stations);
            broadcastStations();
            console.log(`🔄 ${station.name}: ${newAvailability}/${total} slots available`);
        }
    }
    catch (error) {
        // A demo timer must never be able to take the whole process down.
        console.error("Live availability tick failed:", error.message);
    }
}, 15000);

// ==================================================
// 404 HANDLER

// ==================================================

app.use((req, res) => {
    if (req.method === "GET" &&
        req.accepts("html")) {
        return res.sendFile(path.join(__dirname, "..", "index.html"));
    }
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// ==================================================
// ERROR HANDLER

// ==================================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// ==================================================
// START SERVER

// ==================================================

server.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("========================================");
    console.log("       ⚡ VOLTMAP BACKEND SERVER");
    console.log("========================================");
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
    console.log(`📍 Stations: http://localhost:${PORT}/api/stations`);
    console.log(`💳 Razorpay: ${razorpay ? "CONFIGURED" : "NOT CONFIGURED"}`);
    console.log("🔌 Socket.IO: ENABLED");
    console.log("========================================");
    console.log("");
});