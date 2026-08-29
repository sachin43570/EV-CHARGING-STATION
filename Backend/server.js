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


// ==================================================
// OPTIONAL RAZORPAY
// ==================================================

let Razorpay = null;

try {
    Razorpay = require("razorpay");
}
catch (error) {
    console.warn(
        "Razorpay package not installed. Demo payments will still work."
    );
}


// ==================================================
// EXPRESS SERVER
// ==================================================

const app = express();

const server =
    http.createServer(app);


const PORT =
    process.env.PORT || 5500;


const CLIENT_URL =
    process.env.CLIENT_URL || "*";


// ==================================================
// FILE PATHS
// ==================================================

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );


const STATIONS_FILE =
    path.join(
        DATA_DIR,
        "stations.json"
    );


const BOOKINGS_FILE =
    path.join(
        DATA_DIR,
        "bookings.json"
    );


const DATABASE_FILE =
    path.join(
        DATA_DIR,
        "database.json"
    );


// ==================================================
// CREATE DATA DIRECTORY / FILES
// ==================================================

if (
    !fs.existsSync(
        DATA_DIR
    )
) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );

}


if (
    !fs.existsSync(
        STATIONS_FILE
    )
) {

    fs.writeFileSync(
        STATIONS_FILE,
        "[]"
    );

}


if (
    !fs.existsSync(
        BOOKINGS_FILE
    )
) {

    fs.writeFileSync(
        BOOKINGS_FILE,
        "[]"
    );

}


if (
    !fs.existsSync(
        DATABASE_FILE
    )
) {

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


// ==================================================
// RAZORPAY INSTANCE
// ==================================================

const razorpay =
    Razorpay &&
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET

        ? new Razorpay({

            key_id:
                process.env.RAZORPAY_KEY_ID,

            key_secret:
                process.env.RAZORPAY_KEY_SECRET

        })

        : null;


// ==================================================
// SOCKET.IO
// ==================================================

const io =
    new Server(
        server,
        {
            cors: {
                origin:
                    CLIENT_URL === "*"
                        ? true
                        : CLIENT_URL,

                methods: [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                ]
            }
        }
    );


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(

    helmet({

        crossOriginResourcePolicy:
            false,

        contentSecurityPolicy:
            false

    })

);


app.use(

    cors({

        origin:
            CLIENT_URL === "*"
                ? true
                : CLIENT_URL,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ]

    })

);


app.use(
    express.json({
        limit: "1mb"
    })
);


app.use(
    morgan("dev")
);


// Serve frontend
app.use(
    express.static(
        path.join(
            __dirname,
            ".."
        )
    )
);


// ==================================================
// HELPER FUNCTIONS
// ==================================================

function readJson(
    file
) {

    try {

        return JSON.parse(
            fs.readFileSync(
                file,
                "utf8"
            )
        );

    }
    catch (error) {

        console.error(
            `Error reading ${file}:`,
            error
        );

        return [];

    }

}


function writeJson(
    file,
    data
) {

    fs.writeFileSync(

        file,

        JSON.stringify(
            data,
            null,
            2
        ),

        "utf8"

    );

}


function readDatabase() {

    const database =
        readJson(
            DATABASE_FILE
        );


    return {

        users:
            Array.isArray(
                database.users
            )
                ? database.users
                : [],

        stationRatings:
            Array.isArray(
                database.stationRatings
            )
                ? database.stationRatings
                : [],

        savedPlaces:
            Array.isArray(
                database.savedPlaces
            )
                ? database.savedPlaces
                : [],

        orders:
            Array.isArray(
                database.orders
            )
                ? database.orders
                : []

    };

}


function normalizeStationId(
    value
) {

    return String(
        value
    );


}


function getStationAvailable(
    station
) {

    if (
        station.availableSlots !==
        undefined
    ) {

        return Number(
            station.availableSlots
        );

    }


    if (
        station.available !==
        undefined
    ) {

        return Number(
            station.available
        );

    }


    return 0;

}


function getStationTotal(
    station
) {

    if (
        station.totalSlots !==
        undefined
    ) {

        return Number(
            station.totalSlots
        );

    }


    if (
        station.total !==
        undefined
    ) {

        return Number(
            station.total
        );

    }


    return 0;

}


function setStationAvailable(
    station,
    value
) {

    if (
        station.availableSlots !==
        undefined
    ) {

        station.availableSlots =
            value;

        return;

    }


    if (
        station.available !==
        undefined
    ) {

        station.available =
            value;

        return;

    }


    station.availableSlots =
        value;

}


function setStationTotal(
    station,
    value
) {

    if (
        station.totalSlots !==
        undefined
    ) {

        station.totalSlots =
            value;

        return;

    }


    if (
        station.total !==
        undefined
    ) {

        station.total =
            value;

        return;

    }


    station.totalSlots =
        value;

}


// ==================================================
// UNIQUE BOOKING ID
// ==================================================

function generateBookingId() {

    const date =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            )
            .replace(
                /-/g,
                ""
            );


    const random =
        crypto
            .randomBytes(
                4
            )
            .toString(
                "hex"
            )
            .toUpperCase();


    return `VM-${date}-${random}`;

}


// ==================================================
// STATION STATUS
// ==================================================

function getStationStatus(
    station
) {

    const available =
        getStationAvailable(
            station
        );


    const total =
        getStationTotal(
            station
        );


    if (
        available <= 0
    ) {

        return "full";

    }


    if (
        available <=
        Math.max(
            1,
            Math.ceil(
                total * 0.3
            )
        )
    ) {

        return "low";

    }


    return "available";

}


function enrichStation(
    station
) {

    const available =
        getStationAvailable(
            station
        );


    const total =
        getStationTotal(
            station
        );


    return {

        ...station,

        availableSlots:
            available,

        totalSlots:
            total,

        available:
            station.available !==
            undefined
                ? station.available
                : available,

        total:
            station.total !==
            undefined
                ? station.total
                : total,

        status:
            getStationStatus(
                station
            )

    };

}


// ==================================================
// DASHBOARD STATISTICS
// ==================================================

function getStats(
    stations
) {

    const totalStations =
        stations.length;


    const totalSlots =
        stations.reduce(
            (
                sum,
                station
            ) =>
                sum +
                getStationTotal(
                    station
                ),

            0
        );


    const availableSlots =
        stations.reduce(
            (
                sum,
                station
            ) =>
                sum +
                getStationAvailable(
                    station
                ),

            0
        );


    const busySlots =
        Math.max(
            0,
            totalSlots -
            availableSlots
        );


    const prices =
        stations
            .map(
                station =>
                    Number(
                        station.pricePerKwh ??
                        station.price ??
                        0
                    )
            )
            .filter(
                value =>
                    Number.isFinite(
                        value
                    )
            );


    const averagePrice =
        prices.length

            ? Number(
                (
                    prices.reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum +
                            value,

                        0
                    ) /
                    prices.length
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


// ==================================================
// BROADCAST REAL-TIME STATIONS
// ==================================================

function broadcastStations() {

    const stations =
        readJson(
            STATIONS_FILE
        );


    io.emit(
        "stations:update",
        stations.map(
            enrichedStation
        )
    );


    io.emit(
        "stats:update",
        getStats(
            stations
        )
    );

}


// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success:
                true,

            service:
                "VoltMap API",

            status:
                "online",

            razorpay:
                Boolean(
                    razorpay
                ),

            time:
                new Date()
                    .toISOString()

        });

    }
);


// ==================================================
// AUTHENTICATION
// ==================================================

app.post(
    "/api/auth/signup",
    async (
        req,
        res,
        next
    ) => {

        try {

            const name =
                String(
                    req.body.name ||
                    ""
                ).trim();


            const email =
                String(
                    req.body.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const password =
                String(
                    req.body.password ||
                    ""
                );


            const role =
                req.body.role ===
                "admin"
                    ? "admin"
                    : "user";


            if (
                !name ||
                !email.includes("@") ||
                password.length < 6
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Name, a valid email, and a password of at least 6 characters are required"

                });

            }


            const database =
                readDatabase();


            if (
                database.users.some(
                    user =>
                        user.email ===
                        email &&
                        user.role ===
                        role
                )
            ) {

                return res.status(
                    409
                ).json({

                    success:
                        false,

                    message:
                        "An account with this email and role already exists"

                });

            }


            const user = {

                id:
                    `USR-${
                        uuid()
                            .slice(
                                0,
                                8
                            )
                            .toUpperCase()
                    }`,

                name,

                email,

                role,

                passwordHash:
                    await bcrypt.hash(
                        password,
                        12
                    ),

                createdAt:
                    new Date()
                        .toISOString()

            };


            database.users.push(
                user
            );


            writeJson(
                DATABASE_FILE,
                database
            );


            res.status(
                201
            ).json({

                success:
                    true,

                data: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });

        }
        catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


app.post(
    "/api/auth/login",
    async (
        req,
        res,
        next
    ) => {

        try {

            const email =
                String(
                    req.body.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const password =
                String(
                    req.body.password ||
                    ""
                );


            const role =
                req.body.role ===
                "admin"
                    ? "admin"
                    : "user";


            const database =
                readDatabase();


            const user =
                database.users.find(
                    item =>
                        item.email ===
                        email &&
                        item.role ===
                        role
                );


            if (
                !user ||
                !user.passwordHash ||
                !(await bcrypt.compare(
                    password,
                    user.passwordHash
                ))
            ) {

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "Incorrect email, password, or account type"

                });

            }


            res.json({

                success:
                    true,

                data: {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email,

                    role:
                        user.role

                }

            });

        }
        catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


app.post(
    "/api/auth/forgot-password",
    (
        req,
        res
    ) => {

        const email =
            String(
                req.body.email ||
                ""
            )
                .trim()
                .toLowerCase();


        const database =
            readDatabase();


        const accountExists =
            database.users.some(
                user =>
                    user.email ===
                    email
            );


        res.json({

            success:
                true,

            message:
                accountExists

                    ? "Password reset request recorded. Connect an email provider to send the reset link."

                    : "If an account exists, reset instructions will be sent."

        });

    }
);


// ==================================================
// SAVED PLACES
// ==================================================

app.put(
    "/api/users/:email/saved-places",
    (
        req,
        res
    ) => {

        const email =
            String(
                req.params.email
            )
                .trim()
                .toLowerCase();


        const place =
            String(
                req.body.place ||
                ""
            )
                .trim()
                .toLowerCase();


        const lat =
            Number(
                req.body.lat
            );


        const lng =
            Number(
                req.body.lng
            );


        if (
            ![
                "home",
                "office",
                "college"
            ].includes(
                place
            ) ||
            !Number.isFinite(
                lat
            ) ||
            !Number.isFinite(
                lng
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Valid place, lat and lng are required"

            });

        }


        const database =
            readDatabase();


        const index =
            database.savedPlaces.findIndex(
                item =>
                    item.email ===
                    email &&
                    item.place ===
                    place
            );


        const record = {

            email,

            place,

            lat,

            lng,

            updatedAt:
                new Date()
                    .toISOString()

        };


        if (
            index ===
            -1
        ) {

            database.savedPlaces.push(
                record
            );

        }
        else {

            database.savedPlaces[index] =
                record;

        }


        writeJson(
            DATABASE_FILE,
            database
        );


        res.json({

            success:
                true,

            data:
                record

        });

    }
);


app.get(
    "/api/users/:email/saved-places",
    (
        req,
        res
    ) => {

        const email =
            String(
                req.params.email
            )
                .trim()
                .toLowerCase();


        const database =
            readDatabase();


        const places =
            database.savedPlaces.filter(
                item =>
                    item.email ===
                    email
            );


        res.json({

            success:
                true,

            data:
                places

        });

    }
);


// ==================================================
// STATION RATINGS
// ==================================================

app.post(
    "/api/stations/:id/ratings",
    (
        req,
        res
    ) => {

        const email =
            String(
                req.body.email ||
                ""
            )
                .trim()
                .toLowerCase();


        const rating =
            Number(
                req.body.rating
            );


        if (
            !email ||
            !Number.isInteger(
                rating
            ) ||
            rating < 1 ||
            rating > 5
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Email and a rating from 1 to 5 are required"

            });

        }


        const database =
            readDatabase();


        const index =
            database.stationRatings.findIndex(
                item =>
                    normalizeStationId(
                        item.stationId
                    ) ===
                    normalizeStationId(
                        req.params.id
                    ) &&
                    item.email ===
                    email
            );


        const record = {

            stationId:
                req.params.id,

            email,

            rating,

            updatedAt:
                new Date()
                    .toISOString()

        };


        if (
            index ===
            -1
        ) {

            database.stationRatings.push(
                record
            );

        }
        else {

            database.stationRatings[index] =
                record;

        }


        writeJson(
            DATABASE_FILE,
            database
        );


        res.json({

            success:
                true,

            data:
                record

        });

    }
);


// ==================================================
// FRONTEND ORDERS
// ==================================================

app.post(
    "/api/orders",
    (
        req,
        res
    ) => {

        const order =
            req.body ||
            {};


        const userEmail =
            String(
                order.userEmail ||
                ""
            )
                .trim()
                .toLowerCase();


        if (
            !userEmail ||
            !order.stationName ||
            !order.vehicleNumber ||
            !Number.isFinite(
                Number(
                    order.amount
                )
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "userEmail, stationName, vehicleNumber and amount are required"

            });

        }


        const database =
            readDatabase();


        const record = {

            id:
                order.id ||
                order.bookingId ||
                generateBookingId(),

            bookingId:
                order.bookingId ||
                order.id ||
                generateBookingId(),

            userEmail,

            customerName:
                String(
                    order.customerName ||
                    order.name ||
                    ""
                ),

            stationId:
                order.stationId ||
                null,

            stationName:
                String(
                    order.stationName
                ),

            address:
                String(
                    order.address ||
                    ""
                ),

            chargerName:
                String(
                    order.chargerName ||
                    "Charger"
                ),

            date:
                String(
                    order.date ||
                    ""
                ),

            time:
                String(
                    order.time ||
                    ""
                ),

            vehicle:
                String(
                    order.vehicle ||
                    order.vehicleModel ||
                    ""
                ),

            vehicleNumber:
                String(
                    order.vehicleNumber
                ).toUpperCase(),

            amount:
                Number(
                    order.amount
                ),

            paymentMethod:
                String(
                    order.paymentMethod ||
                    ""
                ),

            paymentStatus:
                String(
                    order.paymentStatus ||
                    "Paid"
                ),

            status:
                String(
                    order.status ||
                    "Paid & confirmed"
                ),

            razorpayOrderId:
                order.razorpayOrderId ||
                null,

            razorpayPaymentId:
                order.razorpayPaymentId ||
                null,

            rating:
                Number.isInteger(
                    order.rating
                )
                    ? order.rating
                    : null,

            createdAt:
                order.createdAt ||
                new Date()
                    .toISOString()

        };


        const index =
            database.orders.findIndex(
                item =>
                    item.id ===
                    record.id &&
                    item.userEmail ===
                    userEmail
            );


        if (
            index ===
            -1
        ) {

            database.orders.push(
                record
            );

        }
        else {

            database.orders[index] =
                {
                    ...database.orders[index],
                    ...record
                };

        }


        writeJson(
            DATABASE_FILE,
            database
        );


        res.status(
            index === -1
                ? 201
                : 200
        ).json({

            success:
                true,

            data:
                record

        });

    }
);


app.get(
    "/api/orders",
    (
        req,
        res
    ) => {

        const email =
            String(
                req.query.userEmail ||
                ""
            )
                .trim()
                .toLowerCase();


        const database =
            readDatabase();


        const orders =
            database.orders

                .filter(
                    order =>
                        !email ||
                        order.userEmail ===
                        email
                )

                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                );


        res.json({

            success:
                true,

            count:
                orders.length,

            data:
                orders

        });

    }
);


app.patch(
    "/api/orders/:id/rating",
    (
        req,
        res
    ) => {

        const rating =
            Number(
                req.body.rating
            );


        const userEmail =
            String(
                req.body.userEmail ||
                ""
            )
                .trim()
                .toLowerCase();


        if (
            !Number.isInteger(
                rating
            ) ||
            rating < 1 ||
            rating > 5 ||
            !userEmail
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "userEmail and a rating from 1 to 5 are required"

            });

        }


        const database =
            readDatabase();


        const index =
            database.orders.findIndex(
                item =>
                    (
                        item.id ===
                        req.params.id ||
                        item.bookingId ===
                        req.params.id
                    ) &&
                    item.userEmail ===
                    userEmail
            );


        if (
            index ===
            -1
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Order not found"

            });

        }


        database.orders[index].rating =
            rating;


        database.orders[index].ratedAt =
            new Date()
                .toISOString();


        writeJson(
            DATABASE_FILE,
            database
        );


        res.json({

            success:
                true,

            data:
                database.orders[index]

        });

    }
);


// ==================================================
// DASHBOARD STATS
// ==================================================

app.get(
    "/api/stats",
    (
        req,
        res
    ) => {

        const stations =
            readJson(
                STATIONS_FILE
            );


        res.json({

            success:
                true,

            data:
                getStats(
                    stations
                )

        });

    }
);


// ==================================================
// GET ALL STATIONS
// ==================================================

app.get(
    "/api/stations",
    (
        req,
        res
    ) => {

        let stations =
            readJson(
                STATIONS_FILE
            );


        const {
            chargerType,
            connector,
            maxPrice,
            availableOnly,
            sort,
            search
        } =
            req.query;


        // ------------------------------------------
        // Charger type
        // ------------------------------------------

        if (
            chargerType
        ) {

            stations =
                stations.filter(
                    station =>
                        String(
                            station.chargerType ||
                            station.type ||
                            ""
                        )
                            .toLowerCase() ===
                        String(
                            chargerType
                        )
                            .toLowerCase()
                );

        }


        // ------------------------------------------
        // Connector
        // ------------------------------------------

        if (
            connector
        ) {

            stations =
                stations.filter(
                    station => {

                        const connectors =
                            Array.isArray(
                                station.connectors
                            )
                                ? station.connectors
                                : [
                                    station.connector
                                ];


                        return connectors.some(
                            item =>
                                String(
                                    item ||
                                    ""
                                )
                                    .toLowerCase() ===
                                String(
                                    connector
                                )
                                    .toLowerCase()
                        );

                    }
                );

        }


        // ------------------------------------------
        // Maximum price
        // ------------------------------------------

        if (
            maxPrice
        ) {

            stations =
                stations.filter(
                    station =>
                        Number(
                            station.pricePerKwh ??
                            station.price ??
                            0
                        ) <=
                        Number(
                            maxPrice
                        )
                );

        }


        // ------------------------------------------
        // Available
        // ------------------------------------------

        if (
            availableOnly ===
            "true"
        ) {

            stations =
                stations.filter(
                    station =>
                        getStationAvailable(
                            station
                        ) > 0
                );

        }


        // ------------------------------------------
        // Search
        // ------------------------------------------

        if (
            search
        ) {

            const query =
                String(
                    search
                )
                    .toLowerCase();


            stations =
                stations.filter(
                    station =>
                        [
                            station.name,
                            station.address,
                            station.city,
                            station.operator
                        ]
                            .some(
                                value =>
                                    String(
                                        value ||
                                        ""
                                    )
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
                            )
                );

        }


        // ------------------------------------------
        // Sorting
        // ------------------------------------------

        if (
            sort ===
            "price_asc"
        ) {

            stations.sort(
                (a, b) =>
                    Number(
                        a.pricePerKwh ??
                        a.price ??
                        0
                    ) -
                    Number(
                        b.pricePerKwh ??
                        b.price ??
                        0
                    )
            );

        }


        if (
            sort ===
            "price_desc"
        ) {

            stations.sort(
                (a, b) =>
                    Number(
                        b.pricePerKwh ??
                        b.price ??
                        0
                    ) -
                    Number(
                        a.pricePerKwh ??
                        a.price ??
                        0
                    )
            );

        }


        if (
            sort ===
            "power_desc"
        ) {

            stations.sort(
                (a, b) =>
                    Number(
                        b.powerKw ??
                        b.power ??
                        0
                    ) -
                    Number(
                        a.powerKw ??
                        a.power ??
                        0
                    )
            );

        }


        if (
            sort ===
            "rating_desc"
        ) {

            stations.sort(
                (a, b) =>
                    Number(
                        b.rating ||
                        0
                    ) -
                    Number(
                        a.rating ||
                        0
                    )
            );

        }


        res.json({

            success:
                true,

            count:
                stations.length,

            data:
                stations.map(
                    enrichStation
                )

        });

    }
);


// ==================================================
// GET SINGLE STATION
// ==================================================

app.get(
    "/api/stations/:id",
    (
        req,
        res
    ) => {

        const stations =
            readJson(
                STATIONS_FILE
            );


        const station =
            stations.find(
                item =>
                    normalizeStationId(
                        item.id
                    ) ===
                    normalizeStationId(
                        req.params.id
                    )
            );


        if (!station) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Station not found"

            });

        }


        res.json({

            success:
                true,

            data:
                enrichStation(
                    station
                )

        });

    }
);


// ==================================================
// NEARBY STATIONS
// ==================================================

app.get(
    "/api/stations/nearby/search",
    (
        req,
        res
    ) => {

        const lat =
            Number(
                req.query.lat
            );


        const lng =
            Number(
                req.query.lng
            );


        const radiusKm =
            Number(
                req.query.radius ||
                10
            );


        if (
            !Number.isFinite(
                lat
            ) ||
            !Number.isFinite(
                lng
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "lat and lng are required"

            });

        }


        const stations =
            readJson(
                STATIONS_FILE
            );


        const toRad =
            degrees =>
                degrees *
                Math.PI /
                180;


        function distanceKm(
            lat1,
            lng1,
            lat2,
            lng2
        ) {

            const earthRadius =
                6371;


            const dLat =
                toRad(
                    lat2 -
                    lat1
                );


            const dLng =
                toRad(
                    lng2 -
                    lng1
                );


            const a =
                Math.sin(
                    dLat / 2
                ) ** 2 +

                Math.cos(
                    toRad(
                        lat1
                    )
                ) *

                Math.cos(
                    toRad(
                        lat2
                    )
                ) *

                Math.sin(
                    dLng / 2
                ) ** 2;


            return (

                earthRadius *
                2 *
                Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(
                        1 - a
                    )
                )

            );

        }


        const result =
            stations

                .map(
                    station => {

                        const stationLat =
                            Number(
                                station.lat ??
                                station.latitude
                            );


                        const stationLng =
                            Number(
                                station.lng ??
                                station.longitude
                            );


                        const distance =
                            distanceKm(
                                lat,
                                lng,
                                stationLat,
                                stationLng
                            );


                        return {

                            ...enrichStation(
                                station
                            ),

                            distanceKm:
                                Number(
                                    distance.toFixed(
                                        2
                                    )
                                )

                        };

                    }
                )

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

            success:
                true,

            count:
                result.length,

            data:
                result

        });

    }
);


// ==================================================
// CREATE BOOKING
// ==================================================

app.post(
    "/api/bookings",
    (
        req,
        res,
        next
    ) => {

        try {

            const {

                stationId,

                name,

                userEmail,

                vehicleNumber,

                vehicleModel,

                date,

                time,

                durationMinutes =
                    30,

                paymentMethod =
                    "",

                amount =
                    0,

                bookingId,

                paymentStatus,

                razorpayOrderId,

                razorpayPaymentId

            } =
                req.body;


            // --------------------------------------
            // Validate
            // --------------------------------------

            if (
                !stationId ||
                !name ||
                !vehicleNumber ||
                !date ||
                !time
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "stationId, name, vehicleNumber, date and time are required"

                });

            }


            const stations =
                readJson(
                    STATIONS_FILE
                );


            const stationIndex =
                stations.findIndex(
                    station =>
                        normalizeStationId(
                            station.id
                        ) ===
                        normalizeStationId(
                            stationId
                        )
                );


            if (
                stationIndex ===
                -1
            ) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Station not found"

                });

            }


            const station =
                stations[
                    stationIndex
                ];


            const available =
                getStationAvailable(
                    station
                );


            // --------------------------------------
            // Check availability
            // --------------------------------------

            if (
                available <=
                0
            ) {

                return res.status(
                    409
                ).json({

                    success:
                        false,

                    message:
                        "No charging slots are currently available"

                });

            }


            const bookings =
                readJson(
                    BOOKINGS_FILE
                );


            // --------------------------------------
            // Prevent duplicate client booking
            // --------------------------------------

            if (
                bookingId
            ) {

                const existing =
                    bookings.find(
                        booking =>
                            String(
                                booking.bookingId ||
                                booking.id
                            ) ===
                            String(
                                bookingId
                            )
                    );


                if (existing) {

                    return res.status(
                        200
                    ).json({

                        success:
                            true,

                        message:
                            "Booking already exists",

                        data:
                            existing

                    });

                }

            }


            const finalBookingId =
                bookingId ||
                generateBookingId();


            const cleanEmail =
                String(
                    userEmail ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const numericAmount =
                Number(
                    amount
                ) || 0;


            // --------------------------------------
            // Create booking
            // --------------------------------------

            const booking = {

                id:
                    finalBookingId,

                bookingId:
                    finalBookingId,

                stationId:
                    station.id,

                stationName:
                    String(
                        station.name ||
                        "EV Charging Station"
                    ),

                address:
                    String(
                        station.address ||
                        ""
                    ),

                name:
                    String(
                        name
                    ).trim(),

                customerName:
                    String(
                        name
                    ).trim(),

                userEmail:
                    cleanEmail,

                vehicleNumber:
                    String(
                        vehicleNumber
                    )
                        .trim()
                        .toUpperCase(),

                vehicleModel:
                    String(
                        vehicleModel ||
                        ""
                    ).trim(),

                date:
                    String(
                        date
                    ),

                time:
                    String(
                        time
                    ),

                durationMinutes:
                    Number(
                        durationMinutes
                    ) || 30,

                chargerName:
                    String(
                        req.body.chargerName ||
                        "Charger"
                    ),

                amount:
                    numericAmount,

                paymentMethod:
                    String(
                        paymentMethod ||
                        ""
                    ).trim(),

                paymentStatus:
                    String(
                        paymentStatus ||
                        (
                            paymentMethod
                                ? "Paid"
                                : "Pending"
                        )
                    ),

                status:
                    paymentMethod
                        ? "Paid & confirmed"
                        : "confirmed",

                razorpayOrderId:
                    razorpayOrderId ||
                    null,

                razorpayPaymentId:
                    razorpayPaymentId ||
                    null,

                rating:
                    null,

                createdAt:
                    new Date()
                        .toISOString()

            };


            bookings.push(
                booking
            );


            // --------------------------------------
            // Decrease availability
            // --------------------------------------

            const newAvailability =
                Math.max(
                    0,
                    available -
                    1
                );


            setStationAvailable(
                station,
                newAvailability
            );


            station.updatedAt =
                new Date()
                    .toISOString();


            writeJson(
                BOOKINGS_FILE,
                bookings
            );


            writeJson(
                STATIONS_FILE,
                stations
            );


            // --------------------------------------
            // Also store an order record
            // --------------------------------------

            const database =
                readDatabase();


            const orderRecord = {

                id:
                    finalBookingId,

                bookingId:
                    finalBookingId,

                userEmail:
                    cleanEmail,

                customerName:
                    String(
                        name
                    ).trim(),

                stationId:
                    station.id,

                stationName:
                    booking.stationName,

                address:
                    booking.address,

                chargerName:
                    booking.chargerName,

                date:
                    booking.date,

                time:
                    booking.time,

                vehicle:
                    booking.vehicleModel,

                vehicleNumber:
                    booking.vehicleNumber,

                amount:
                    numericAmount,

                paymentMethod:
                    booking.paymentMethod,

                paymentStatus:
                    booking.paymentStatus,

                status:
                    booking.status,

                razorpayOrderId:
                    booking.razorpayOrderId,

                razorpayPaymentId:
                    booking.razorpayPaymentId,

                rating:
                    null,

                createdAt:
                    booking.createdAt

            };


            const existingOrderIndex =
                database.orders.findIndex(
                    item =>
                        (
                            item.id ===
                            finalBookingId ||
                            item.bookingId ===
                            finalBookingId
                        ) &&
                        (
                            !cleanEmail ||
                            item.userEmail ===
                            cleanEmail
                        )
                );


            if (
                existingOrderIndex ===
                -1
            ) {

                database.orders.unshift(
                    orderRecord
                );

            }
            else {

                database.orders[
                    existingOrderIndex
                ] =
                    {
                        ...database.orders[
                            existingOrderIndex
                        ],

                        ...orderRecord
                    };

            }


            writeJson(
                DATABASE_FILE,
                database
            );


            // --------------------------------------
            // Real-time notifications
            // --------------------------------------

            io.emit(
                "booking:created",
                booking
            );


            broadcastStations();


            // --------------------------------------
            // Response
            // --------------------------------------

            res.status(
                201
            ).json({

                success:
                    true,

                message:
                    "Booking confirmed",

                data:
                    booking

            });

        }
        catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


// ==================================================
// GET BOOKINGS
// ==================================================

app.get(
    "/api/bookings",
    (
        req,
        res
    ) => {

        let bookings =
            readJson(
                BOOKINGS_FILE
            );


        // ------------------------------------------
        // Vehicle
        // ------------------------------------------

        if (
            req.query.vehicleNumber
        ) {

            const vehicleNumber =
                String(
                    req.query.vehicleNumber
                )
                    .trim()
                    .toUpperCase();


            bookings =
                bookings.filter(
                    booking =>
                        String(
                            booking.vehicleNumber
                        ).toUpperCase() ===
                        vehicleNumber
                );

        }


        // ------------------------------------------
        // User
        // ------------------------------------------

        if (
            req.query.userEmail
        ) {

            const email =
                String(
                    req.query.userEmail
                )
                    .trim()
                    .toLowerCase();


            bookings =
                bookings.filter(
                    booking =>
                        String(
                            booking.userEmail ||
                            ""
                        )
                            .toLowerCase() ===
                        email
                );

        }


        // ------------------------------------------
        // Status
        // ------------------------------------------

        if (
            req.query.status
        ) {

            bookings =
                bookings.filter(
                    booking =>
                        booking.status ===
                        req.query.status
                );

        }


        // ------------------------------------------
        // Latest first
        // ------------------------------------------

        bookings.sort(
            (a, b) =>
                new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                )
        );


        res.json({

            success:
                true,

            count:
                bookings.length,

            data:
                bookings

        });

    }
);


// ==================================================
// GET SINGLE BOOKING
// ==================================================

app.get(
    "/api/bookings/:id",
    (
        req,
        res
    ) => {

        const bookings =
            readJson(
                BOOKINGS_FILE
            );


        const booking =
            bookings.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        req.params.id
                    ) ||
                    String(
                        item.bookingId
                    ) ===
                    String(
                        req.params.id
                    )
            );


        if (!booking) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Booking not found"

            });

        }


        res.json({

            success:
                true,

            data:
                booking

        });

    }
);


// ==================================================
// RATE A BOOKING
// ==================================================

app.patch(
    "/api/bookings/:id/rating",
    (
        req,
        res
    ) => {

        const rating =
            Number(
                req.body.rating
            );


        if (
            !Number.isInteger(
                rating
            ) ||
            rating < 1 ||
            rating > 5
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "rating must be an integer from 1 to 5"

            });

        }


        const bookings =
            readJson(
                BOOKINGS_FILE
            );


        const index =
            bookings.findIndex(
                booking =>
                    String(
                        booking.id
                    ) ===
                    String(
                        req.params.id
                    ) ||
                    String(
                        booking.bookingId
                    ) ===
                    String(
                        req.params.id
                    )
            );


        if (
            index ===
            -1
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Booking not found"

            });

        }


        bookings[index].rating =
            rating;


        bookings[index].ratedAt =
            new Date()
                .toISOString();


        writeJson(
            BOOKINGS_FILE,
            bookings
        );


        // Keep database order rating synchronized.
        const database =
            readDatabase();


        const orderIndex =
            database.orders.findIndex(
                order =>
                    String(
                        order.id
                    ) ===
                    String(
                        bookings[index].id
                    ) ||
                    String(
                        order.bookingId
                    ) ===
                    String(
                        bookings[index].bookingId
                    )
            );


        if (
            orderIndex !==
            -1
        ) {

            database.orders[
                orderIndex
            ].rating =
                rating;


            database.orders[
                orderIndex
            ].ratedAt =
                bookings[index].ratedAt;


            writeJson(
                DATABASE_FILE,
                database
            );

        }


        res.json({

            success:
                true,

            data:
                bookings[index]

        });

    }
);


// ==================================================
// CANCEL BOOKING
// ==================================================

app.patch(
    "/api/bookings/:id/cancel",
    (
        req,
        res
    ) => {

        const bookings =
            readJson(
                BOOKINGS_FILE
            );


        const bookingIndex =
            bookings.findIndex(
                booking =>
                    String(
                        booking.id
                    ) ===
                    String(
                        req.params.id
                    ) ||
                    String(
                        booking.bookingId
                    ) ===
                    String(
                        req.params.id
                    )
            );


        if (
            bookingIndex ===
            -1
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Booking not found"

            });

        }


        if (
            bookings[
                bookingIndex
            ].status ===
            "cancelled"
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Booking is already cancelled"

            });

        }


        const stationId =
            bookings[
                bookingIndex
            ].stationId;


        const stations =
            readJson(
                STATIONS_FILE
            );


        const stationIndex =
            stations.findIndex(
                station =>
                    normalizeStationId(
                        station.id
                    ) ===
                    normalizeStationId(
                        stationId
                    )
            );


        const booking =
            bookings[
                bookingIndex
            ];


        booking.status =
            "cancelled";


        booking.cancelledAt =
            new Date()
                .toISOString();


        if (
            stationIndex !==
            -1
        ) {

            const current =
                getStationAvailable(
                    stations[
                        stationIndex
                    ]
                );


            const total =
                getStationTotal(
                    stations[
                        stationIndex
                    ]
                );


            setStationAvailable(
                stations[
                    stationIndex
                ],

                Math.min(
                    total,
                    current +
                    1
                )
            );


            stations[
                stationIndex
            ].updatedAt =
                new Date()
                    .toISOString();

        }


        writeJson(
            BOOKINGS_FILE,
            bookings
        );


        writeJson(
            STATIONS_FILE,
            stations
        );


        // Synchronize order status
        const database =
            readDatabase();


        const orderIndex =
            database.orders.findIndex(
                order =>
                    String(
                        order.id
                    ) ===
                    String(
                        booking.id
                    ) ||
                    String(
                        order.bookingId
                    ) ===
                    String(
                        booking.bookingId
                    )
            );


        if (
            orderIndex !==
            -1
        ) {

            database.orders[
                orderIndex
            ].status =
                "cancelled";


            database.orders[
                orderIndex
            ].cancelledAt =
                booking.cancelledAt;


            writeJson(
                DATABASE_FILE,
                database
            );

        }


        io.emit(
            "booking:cancelled",
            booking
        );


        broadcastStations();


        res.json({

            success:
                true,

            message:
                "Booking cancelled",

            data:
                booking

        });

    }
);


// ==================================================
// UPDATE STATION AVAILABILITY
// ==================================================

app.patch(
    "/api/stations/:id/availability",
    (
        req,
        res
    ) => {

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

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "availableSlots must be a non-negative integer"

            });

        }


        const stations =
            readJson(
                STATIONS_FILE
            );


        const stationIndex =
            stations.findIndex(
                station =>
                    normalizeStationId(
                        station.id
                    ) ===
                    normalizeStationId(
                        req.params.id
                    )
            );


        if (
            stationIndex ===
            -1
        ) {

            return res.status(
                404
            ).json({

                success:
                    false,

                message:
                    "Station not found"

            });

        }


        const totalSlots =
            getStationTotal(
                stations[
                    stationIndex
                ]
            );


        if (
            availableSlots >
            totalSlots
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "availableSlots cannot exceed totalSlots"

            });

        }


        setStationAvailable(
            stations[
                stationIndex
            ],
            availableSlots
        );


        stations[
            stationIndex
        ].updatedAt =
            new Date()
                .toISOString();


        writeJson(
            STATIONS_FILE,
            stations
        );


        broadcastStations();


        res.json({

            success:
                true,

            message:
                "Availability updated",

            data:
                enrichStation(
                    stations[
                        stationIndex
                    ]
                )

        });

    }
);


// ==================================================
// RAZORPAY PAYMENT
// CREATE ORDER
// ==================================================

app.post(
    "/api/payment/create-order",
    async (
        req,
        res,
        next
    ) => {

        try {

            if (!razorpay) {

                return res.status(
                    503
                ).json({

                    success:
                        false,

                    message:
                        "Razorpay is not configured. Install the razorpay package and add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env."

                });

            }


            const amount =
                Number(
                    req.body.amount
                );


            const currency =
                String(
                    req.body.currency ||
                    "INR"
                )
                    .toUpperCase();


            const receipt =
                String(
                    req.body.receipt ||
                    generateBookingId()
                );


            if (
                !Number.isInteger(
                    amount
                ) ||
                amount <= 0
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "A valid positive amount is required"

                });

            }


            if (
                currency !==
                "INR"
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "This VoltMap configuration currently accepts INR payments only"

                });

            }


            // Razorpay expects amount in currency subunits.
            const razorpayOrder =
                await razorpay.orders.create({

                    amount:
                        amount *
                        100,

                    currency,

                    receipt,

                    notes: {

                        source:
                            "VoltMap",

                        userEmail:
                            String(
                                req.body.userEmail ||
                                ""
                            )
                                .trim()
                                .toLowerCase()

                    }

                });


            res.status(
                201
            ).json({

                success:
                    true,

                data: {

                    orderId:
                        razorpayOrder.id,

                    amount:
                        razorpayOrder.amount,

                    currency:
                        razorpayOrder.currency,

                    status:
                        razorpayOrder.status,

                    receipt:
                        razorpayOrder.receipt,

                    keyId:
                        process.env.RAZORPAY_KEY_ID

                }

            });

        }
        catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


// ==================================================
// RAZORPAY PAYMENT
// VERIFY SIGNATURE + CREATE BOOKING
// ==================================================

app.post(
    "/api/payment/verify",
    (
        req,
        res,
        next
    ) => {

        try {

            if (!razorpay) {

                return res.status(
                    503
                ).json({

                    success:
                        false,

                    message:
                        "Razorpay is not configured on the server."

                });

            }


            const {

                razorpayOrderId,

                razorpayPaymentId,

                razorpaySignature,

                amount,

                userEmail,

                name,

                stationId,

                vehicleNumber,

                date,

                time,

                durationMinutes =
                    60

            } =
                req.body;


            // --------------------------------------
            // Validate callback fields
            // --------------------------------------

            if (
                !razorpayOrderId ||
                !razorpayPaymentId ||
                !razorpaySignature
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Razorpay payment verification data is incomplete"

                });

            }


            // --------------------------------------
            // Verify HMAC signature
            // --------------------------------------
            //
            // Signature:
            // HMAC-SHA256(
            //      order_id + "|" + payment_id,
            //      key_secret
            // )
            //
            // This must happen on the server.
            // --------------------------------------

            const signatureBody =
                `${razorpayOrderId}|${razorpayPaymentId}`;


            const expectedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env
                            .RAZORPAY_KEY_SECRET
                    )
                    .update(
                        signatureBody
                    )
                    .digest(
                        "hex"
                    );


            const expectedBuffer =
                Buffer.from(
                    expectedSignature,
                    "utf8"
                );


            const receivedBuffer =
                Buffer.from(
                    String(
                        razorpaySignature
                    ),
                    "utf8"
                );


            const signaturesMatch =

                expectedBuffer.length ===
                receivedBuffer.length &&

                crypto.timingSafeEqual(
                    expectedBuffer,
                    receivedBuffer
                );


            if (
                !signaturesMatch
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Razorpay payment signature verification failed"

                });

            }


            // --------------------------------------
            // Validate booking information
            // --------------------------------------

            if (
                !stationId ||
                !name ||
                !userEmail ||
                !vehicleNumber ||
                !date ||
                !time
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Booking information is incomplete"

                });

            }


            const stations =
                readJson(
                    STATIONS_FILE
                );


            const stationIndex =
                stations.findIndex(
                    station =>
                        normalizeStationId(
                            station.id
                        ) ===
                        normalizeStationId(
                            stationId
                        )
                );


            if (
                stationIndex ===
                -1
            ) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "Station not found"

                });

            }


            const station =
                stations[
                    stationIndex
                ];


            const available =
                getStationAvailable(
                    station
                );


            if (
                available <=
                0
            ) {

                return res.status(
                    409
                ).json({

                    success:
                        false,

                    message:
                        "No charging slots are currently available"

                });

            }


            const database =
                readDatabase();


            const cleanEmail =
                String(
                    userEmail
                )
                    .trim()
                    .toLowerCase();


            // --------------------------------------
            // Idempotency
            // --------------------------------------

            const existingOrder =
                database.orders.find(
                    order =>
                        order.razorpayPaymentId ===
                        razorpayPaymentId
                );


            if (
                existingOrder
            ) {

                return res.json({

                    success:
                        true,

                    message:
                        "Payment was already processed",

                    data:
                        existingOrder

                });

            }


            const bookings =
                readJson(
                    BOOKINGS_FILE
                );


            const bookingId =
                generateBookingId();


            const numericAmount =
                Number(
                    amount
                ) || 0;


            // --------------------------------------
            // Create paid booking
            // --------------------------------------

            const booking = {

                id:
                    bookingId,

                bookingId,

                stationId:
                    station.id,

                stationName:
                    String(
                        station.name ||
                        "EV Charging Station"
                    ),

                address:
                    String(
                        station.address ||
                        ""
                    ),

                name:
                    String(
                        name
                    ).trim(),

                customerName:
                    String(
                        name
                    ).trim(),

                userEmail:
                    cleanEmail,

                vehicleNumber:
                    String(
                        vehicleNumber
                    )
                        .trim()
                        .toUpperCase(),

                date:
                    String(
                        date
                    ),

                time:
                    String(
                        time
                    ),

                durationMinutes:
                    Number(
                        durationMinutes
                    ) || 60,

                chargerName:
                    String(
                        req.body.chargerName ||
                        "Charger"
                    ),

                amount:
                    numericAmount,

                paymentMethod:
                    "RAZORPAY",

                paymentStatus:
                    "Paid",

                status:
                    "Paid & confirmed",

                razorpayOrderId,

                razorpayPaymentId,

                rating:
                    null,

                createdAt:
                    new Date()
                        .toISOString()

            };


            bookings.push(
                booking
            );


            // --------------------------------------
            // Decrease station availability
            // --------------------------------------

            setStationAvailable(
                station,
                Math.max(
                    0,
                    available -
                    1
                )
            );


            station.updatedAt =
                new Date()
                    .toISOString();


            // --------------------------------------
            // Persist booking
            // --------------------------------------

            writeJson(
                BOOKINGS_FILE,
                bookings
            );


            writeJson(
                STATIONS_FILE,
                stations
            );


            // --------------------------------------
            // Persist order
            // --------------------------------------

            const orderRecord = {

                id:
                    bookingId,

                bookingId,

                userEmail:
                    cleanEmail,

                customerName:
                    booking.customerName,

                stationId:
                    station.id,

                stationName:
                    booking.stationName,

                address:
                    booking.address,

                chargerName:
                    booking.chargerName,

                date:
                    booking.date,

                time:
                    booking.time,

                vehicle:
                    String(
                        req.body.vehicleModel ||
                        ""
                    ),

                vehicleNumber:
                    booking.vehicleNumber,

                amount:
                    numericAmount,

                paymentMethod:
                    "RAZORPAY",

                paymentStatus:
                    "Paid",

                status:
                    "Paid & confirmed",

                razorpayOrderId,

                razorpayPaymentId,

                rating:
                    null,

                createdAt:
                    booking.createdAt

            };


            database.orders.unshift(
                orderRecord
            );


            writeJson(
                DATABASE_FILE,
                database
            );


            // --------------------------------------
            // Real-time events
            // --------------------------------------

            io.emit(
                "payment:successful",
                {
                    bookingId,
                    booking
                }
            );


            io.emit(
                "booking:created",
                booking
            );


            broadcastStations();


            res.json({

                success:
                    true,

                message:
                    "Payment verified and booking confirmed",

                data:
                    orderRecord

            });

        }
        catch (
            error
        ) {

            next(
                error
            );

        }

    }
);


// ==================================================
// DEMO PAYMENT
// ==================================================

app.post(
    "/api/payment/demo",
    (
        req,
        res
    ) => {

        const {

            amount,

            paymentMethod,

            userEmail

        } =
            req.body;


        const validMethods = [

            "QR",

            "UPI",

            "CARD"

        ];


        const method =
            String(
                paymentMethod ||
                ""
            )
                .toUpperCase();


        if (
            !validMethods.includes(
                method
            )
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Payment method must be QR, UPI or CARD"

            });

        }


        const numericAmount =
            Number(
                amount
            );


        if (
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {

            return res.status(
                400
            ).json({

                success:
                    false,

                message:
                    "Valid payment amount is required"

            });

        }


        res.json({

            success:
                true,

            message:
                "Demo payment approved",

            data: {

                paymentId:
                    `DEMO-${uuid()
                        .slice(
                            0,
                            10
                        )
                        .toUpperCase()}`,

                paymentMethod:
                    method,

                amount:
                    numericAmount,

                userEmail:
                    String(
                        userEmail ||
                        ""
                    )
                        .trim()
                        .toLowerCase(),

                status:
                    "Paid"

            }

        });

    }
);


// ==================================================
// RAZORPAY WEBHOOK PLACEHOLDER
// ==================================================
//
// For a production system, configure a Razorpay webhook
// and verify its signature using the raw request body.
// Browser callback verification above remains required.
// ==================================================

app.get(
    "/api/payment/status",
    (
        req,
        res
    ) => {

        res.json({

            success:
                true,

            razorpayConfigured:
                Boolean(
                    razorpay
                ),

            keyId:
                process.env
                    .RAZORPAY_KEY_ID ||
                null

        });

    }
);


// ==================================================
// SOCKET.IO
// ==================================================

io.on(
    "connection",
    socket => {

        console.log(
            `⚡ Client connected: ${socket.id}`
        );


        const stations =
            readJson(
                STATIONS_FILE
            );


        socket.emit(
            "stations:update",
            stations.map(
                enrichStation
            )
        );


        socket.emit(
            "stats:update",
            getStats(
                stations
            )
        );


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

    }
);


// ==================================================
// DEMO REAL-TIME AVAILABILITY
// ==================================================

setInterval(
    () => {

        const stations =
            readJson(
                STATIONS_FILE
            );


        if (
            !stations.length
        ) {

            return;

        }


        const index =
            Math.floor(
                Math.random() *
                stations.length
            );


        const station =
            stations[index];


        const total =
            getStationTotal(
                station
            );


        const available =
            getStationAvailable(
                station
            );


        const change =
            Math.random() >
            0.5
                ? 1
                : -1;


        const newAvailability =
            Math.max(
                0,

                Math.min(
                    total,
                    available +
                    change
                )
            );


        if (
            newAvailability !==
            available
        ) {

            setStationAvailable(
                station,
                newAvailability
            );


            station.updatedAt =
                new Date()
                    .toISOString();


            writeJson(
                STATIONS_FILE,
                stations
            );


            broadcastStations();


            console.log(
                `🔄 ${station.name}: ${newAvailability}/${total} slots available`
            );

        }

    },
    15000
);


// ==================================================
// 404 HANDLER
// ==================================================

app.use(
    (
        req,
        res
    ) => {

        if (
            req.method ===
            "GET" &&
            req.accepts(
                "html"
            )
        ) {

            return res.sendFile(
                path.join(
                    __dirname,
                    "..",
                    "index.html"
                )
            );

        }


        res.status(
            404
        ).json({

            success:
                false,

            message:
                "API route not found"

        });

    }
);


// ==================================================
// ERROR HANDLER
// ==================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "Server Error:",
            err
        );


        res.status(
            500
        ).json({

            success:
                false,

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
            `💳 Razorpay: ${
                razorpay
                    ? "CONFIGURED"
                    : "NOT CONFIGURED"
            }`
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