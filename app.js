/* =========================================================
   VOLTMAP — SMART EV CHARGING PLATFORM
   Frontend version

   Later connect these functions to:
   Node.js + Express + PostgreSQL + Socket.io
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE = "http://localhost:5000/api";

async function apiRequest(path, options = {}) {

    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    const payload = await response.json();

    if (!response.ok) {
        const error = new Error(payload.message || "Request failed");
        error.isApiError = true;
        throw error;
    }

    return payload;

}

function syncToBackend(path, options) {

    apiRequest(path, options).catch(() => {
        // The browser cache remains usable when the local API is not running.
    });

}

// When deployed:
// const API_BASE = "https://your-backend-url.com/api";


/* =========================================================
   DEMO STATION DATA
   ========================================================= */

const stations = [

    {
        id: 1,
        name: "VoltMap Energy Hub",
        operator: "VoltMap Energy",
        address: "Whitefield Main Road, Bengaluru",
        lat: 12.9698,
        lng: 77.7500,

        chargerType: "DC",
        connector: "CCS2",

        power: 120,
        price: 18,

        available: 6,
        total: 8,

        rating: 4.8,
        reviews: 126,

        open: true,

        amenities: [
            "cafe",
            "parking",
            "wifi",
            "restroom"
        ],

        distance: 1.8,

        favorite: false
    },

    {
        id: 2,
        name: "ChargeZone Whitefield",
        operator: "ChargeZone",
        address: "ITPL Main Road, Whitefield",
        lat: 12.9850,
        lng: 77.7350,

        chargerType: "DC",
        connector: "CCS2",

        power: 150,
        price: 20,

        available: 2,
        total: 6,

        rating: 4.7,
        reviews: 98,

        open: true,

        amenities: [
            "parking",
            "wifi"
        ],

        distance: 2.4,

        favorite: false
    },

    {
        id: 3,
        name: "Tata Power Charging Hub",
        operator: "Tata Power",
        address: "Brookefield, Bengaluru",
        lat: 12.9692,
        lng: 77.7160,

        chargerType: "DC",
        connector: "CCS2",

        power: 60,
        price: 18,

        available: 4,
        total: 6,

        rating: 4.6,
        reviews: 87,

        open: true,

        amenities: [
            "cafe",
            "parking",
            "restroom"
        ],

        distance: 3.1,

        favorite: false
    },

    {
        id: 4,
        name: "Ather Grid Station",
        operator: "Ather",
        address: "Marathahalli, Bengaluru",
        lat: 12.9590,
        lng: 77.6970,

        chargerType: "AC",
        connector: "Type2",

        power: 7.4,
        price: 12,

        available: 5,
        total: 6,

        rating: 4.5,
        reviews: 63,

        open: true,

        amenities: [
            "parking",
            "wifi"
        ],

        distance: 4.5,

        favorite: false
    },

    {
        id: 5,
        name: "EVRE Fast Charge",
        operator: "EVRE",
        address: "Bellandur, Bengaluru",
        lat: 12.9300,
        lng: 77.6780,

        chargerType: "DC",
        connector: "CCS2",

        power: 180,
        price: 22,

        available: 1,
        total: 4,

        rating: 4.4,
        reviews: 45,

        open: true,

        amenities: [
            "parking",
            "cafe"
        ],

        distance: 6.2,

        favorite: false
    },

    {
        id: 6,
        name: "Shell Recharge Point",
        operator: "Shell",
        address: "Outer Ring Road, Bengaluru",
        lat: 12.9400,
        lng: 77.6900,

        chargerType: "DC",
        connector: "CHAdeMO",

        power: 100,
        price: 21,

        available: 0,
        total: 4,

        rating: 4.2,
        reviews: 38,

        open: true,

        amenities: [
            "cafe",
            "parking",
            "restroom"
        ],

        distance: 5.3,

        favorite: false
    },

    {
        id: 7,
        name: "GreenCharge Koramangala",
        operator: "GreenCharge",
        address: "Koramangala 5th Block",
        lat: 12.9352,
        lng: 77.6245,

        chargerType: "DC",
        connector: "CCS2",

        power: 100,
        price: 16,

        available: 3,
        total: 5,

        rating: 4.9,
        reviews: 211,

        open: true,

        amenities: [
            "cafe",
            "wifi",
            "parking"
        ],

        distance: 8.1,

        favorite: false
    },

    {
        id: 8,
        name: "BESCOM EV Station",
        operator: "BESCOM",
        address: "Indiranagar, Bengaluru",
        lat: 12.9719,
        lng: 77.6412,

        chargerType: "AC",
        connector: "Type2",

        power: 22,
        price: 10,

        available: 4,
        total: 4,

        rating: 4.1,
        reviews: 32,

        open: true,

        amenities: [
            "parking"
        ],

        distance: 7.4,

        favorite: false
    },

    {
        id: 9,
        name: "Jio-bp Pulse",
        operator: "Jio-bp",
        address: "Old Airport Road",
        lat: 12.9600,
        lng: 77.6500,

        chargerType: "DC",
        connector: "CCS2",

        power: 120,
        price: 19,

        available: 5,
        total: 6,

        rating: 4.7,
        reviews: 119,

        open: true,

        amenities: [
            "cafe",
            "parking",
            "restroom",
            "wifi"
        ],

        distance: 6.8,

        favorite: false
    },

    {
        id: 10,
        name: "Mahadevapura Charge Point",
        operator: "Statiq",
        address: "Phoenix Marketcity Road, Mahadevapura",
        lat: 12.9948,
        lng: 77.6964,
        chargerType: "DC",
        connector: "CCS2",
        power: 80,
        price: 17,
        available: 4,
        total: 6,
        rating: 4.6,
        reviews: 74,
        open: true,
        amenities: ["cafe", "parking", "restroom"],
        distance: 5.1,
        favorite: false
    },

    {
        id: 11,
        name: "HSR Layout EV Hub",
        operator: "Bolt.Earth",
        address: "27th Main Road, HSR Layout",
        lat: 12.9116,
        lng: 77.6389,
        chargerType: "DC",
        connector: "CCS2",
        power: 120,
        price: 18,
        available: 3,
        total: 8,
        rating: 4.5,
        reviews: 91,
        open: true,
        amenities: ["cafe", "wifi", "parking"],
        distance: 10.4,
        favorite: false
    },

    {
        id: 12,
        name: "Jayanagar Green Charge",
        operator: "GreenCharge",
        address: "4th Block, Jayanagar",
        lat: 12.9250,
        lng: 77.5938,
        chargerType: "AC",
        connector: "Type2",
        power: 22,
        price: 11,
        available: 6,
        total: 8,
        rating: 4.4,
        reviews: 58,
        open: true,
        amenities: ["parking", "wifi", "restroom"],
        distance: 12.7,
        favorite: false
    },

    {
        id: 13,
        name: "Yelahanka Fast Charge",
        operator: "Tata Power",
        address: "New Town, Yelahanka",
        lat: 13.1007,
        lng: 77.5963,
        chargerType: "DC",
        connector: "CCS2",
        power: 150,
        price: 20,
        available: 2,
        total: 6,
        rating: 4.7,
        reviews: 104,
        open: true,
        amenities: ["cafe", "parking", "restroom"],
        distance: 19.3,
        favorite: false
    },

    {
        id: 14,
        name: "Sarjapur Road EV Lounge",
        operator: "ChargeZone",
        address: "Sarjapur Main Road, Bengaluru",
        lat: 12.9103,
        lng: 77.6880,
        chargerType: "DC",
        connector: "CHAdeMO",
        power: 100,
        price: 19,
        available: 5,
        total: 8,
        rating: 4.6,
        reviews: 83,
        open: true,
        amenities: ["cafe", "parking", "wifi", "restroom"],
        distance: 13.4,
        favorite: false
    },

    {
        id: 15,
        name: "MG Road City Charger",
        operator: "BESCOM",
        address: "MG Road, Bengaluru",
        lat: 12.9756,
        lng: 77.6065,
        chargerType: "DC",
        connector: "CCS2",
        power: 60,
        price: 16,
        available: 1,
        total: 4,
        rating: 4.3,
        reviews: 67,
        open: true,
        amenities: ["cafe", "parking", "wifi"],
        distance: 9.2,
        favorite: false
    }

];


/* =========================================================
   STATE
   ========================================================= */

let filteredStations = [...stations];

let selectedStation = null;

let selectedCharger = null;

let bookingStep = 1;

let map;

let markers = {};

let savedPlaceMarkers = {};

let userLocation = null;

let selectedChargerType = "all";

let currentUser = null;

let selectedPaymentMethod = "qr";

let bookingDraft = {};


/* =========================================================
   DOM
   ========================================================= */

const stationList =
    document.getElementById("stationList");

const stationCount =
    document.getElementById("stationCount");

const mapStationCount =
    document.getElementById("mapStationCount");

const searchInput =
    document.getElementById("searchInput");

const stationDrawer =
    document.getElementById("stationDrawer");

const drawerOverlay =
    document.getElementById("drawerOverlay");

const stationDetails =
    document.getElementById("stationDetails");

const filterModal =
    document.getElementById("filterModal");

const bookingModal =
    document.getElementById("bookingModal");

const notificationPanel =
    document.getElementById("notificationPanel");

const toast =
    document.getElementById("toast");


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeMap();

    renderStations();

    setupEvents();

    updateStats();

    initializeTheme();

    initializeAuth();

    simulateLiveUpdates();

});


/* =========================================================
   MAP
   ========================================================= */

function initializeMap() {

    map = L.map("map", {
        zoomControl: false
    }).setView(
        [12.9716, 77.5946],
        12
    );


    updateMapTheme();


    renderMarkers();

    renderSavedPlaces();

}

function updateMapTheme() {

    if (!map) return;

    if (map.baseLayer) {
        map.removeLayer(map.baseLayer);
    }

    const light = document.body.classList.contains("light");

    map.baseLayer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/${light ? "light_all" : "dark_all"}/{z}/{x}/{y}{r}.png`,
        {
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            maxZoom: 19
        }
    ).addTo(map);

    document.getElementById("map").classList.toggle("light-map", light);

}


/* =========================================================
   CUSTOM MARKER
   ========================================================= */

function createMarkerIcon(station) {

    let color = "#00e5a0";

    if (station.available === 0) {
        color = "#ff5c5c";
    }
    else if (station.available <= 2) {
        color = "#ffb020";
    }

    return L.divIcon({

        className: "custom-marker",

        html: `
            <div style="
                width:34px;
                height:34px;
                border-radius:50% 50% 50% 0;
                transform:rotate(-45deg);
                background:${color};
                border:3px solid ${document.body.classList.contains("light") ? "#ffffff" : "#071018"};
                box-shadow:0 0 18px ${color}55;
                display:flex;
                align-items:center;
                justify-content:center;
            ">
                <span style="
                    transform:rotate(45deg);
                    color:#071018;
                    font-weight:900;
                    font-size:13px;
                ">
                    ⚡
                </span>
            </div>
        `,

        iconSize: [34, 34],
        iconAnchor: [17, 34]

    });

}


/* =========================================================
   RENDER MARKERS
   ========================================================= */

function renderMarkers() {

    Object.values(markers).forEach(marker => {
        map.removeLayer(marker);
    });

    markers = {};


    filteredStations.forEach(station => {

        const marker =
            L.marker(
                [station.lat, station.lng],
                {
                    icon: createMarkerIcon(station)
                }
            )
            .addTo(map);


        marker.bindPopup(`
            <div>

                <div class="popup-title">
                    ${station.name}
                </div>

                <div style="
                    color:#94a3ad;
                    font-size:10px;
                    margin-top:4px;
                ">
                    ${station.address}
                </div>

                <div class="popup-status">
                    ● ${station.available}/${station.total}
                    available
                </div>

                <div style="
                    margin-top:5px;
                    font-size:10px;
                ">
                    ⚡ ${station.power} kW
                    &nbsp; • &nbsp;
                    ₹${station.price}/kWh
                </div>

                <button
                    class="popup-book"
                    onclick="openStation(${station.id})"
                >
                    View station
                </button>

            </div>
        `);


        marker.on("click", () => {

            selectedStation = station;

            highlightCard(station.id);

        });


        markers[station.id] = marker;

    });

}


/* =========================================================
   STATION CARDS
   ========================================================= */

function renderStations() {

    stationList.innerHTML = "";


    if (filteredStations.length === 0) {

        stationList.innerHTML = `

            <div style="
                padding:40px 20px;
                text-align:center;
            ">

                <div style="
                    width:55px;
                    height:55px;
                    display:grid;
                    place-items:center;
                    margin:auto;
                    border-radius:15px;
                    background:var(--card);
                    color:var(--muted);
                    font-size:20px;
                ">
                    <i class="fa-solid fa-plug-circle-xmark"></i>
                </div>

                <h3 style="
                    font-family:var(--font-display);
                    font-size:15px;
                    margin:15px 0 7px;
                ">
                    No chargers found
                </h3>

                <p style="
                    color:var(--muted);
                    font-size:10px;
                    line-height:1.6;
                ">
                    Try changing your filters
                    or searching another location.
                </p>

                <button
                    class="btn-primary"
                    onclick="resetFilters()"
                >
                    Reset filters
                </button>

            </div>

        `;

        updateStats();

        renderMarkers();

        return;
    }


    filteredStations.forEach(station => {

        const card =
            document.createElement("div");

        card.className = "station-card";

        card.dataset.id = station.id;


        let statusClass = "available";
        let statusText = "AVAILABLE";

        if (station.available === 0) {

            statusClass = "full";
            statusText = "FULL";

        }
        else if (station.available <= 2) {

            statusClass = "limited";
            statusText = "LIMITED";

        }


        const percentage =
            (station.available / station.total) * 100;


        card.innerHTML = `

            <div class="station-top">

                <div>

                    <div class="station-name">
                        ${station.name}
                    </div>

                    <div class="station-address">
                        ${station.address}
                    </div>

                </div>

                <div class="status ${statusClass}">

                    <span class="status-dot"></span>

                    ${statusText}

                </div>

            </div>


            <div class="station-info-row">

                <span class="info-pill">
                    ${station.chargerType}
                </span>

                <span class="info-pill">
                    ${station.connector}
                </span>

                <span class="info-pill">
                    ${station.power} kW
                </span>

                <span class="info-pill">
                    ${station.distance} km
                </span>

                <span class="info-pill">
                    <i class="fa-regular fa-clock"></i>
                    ${getWaitingTime(station)}
                </span>

            </div>


            <div class="availability">

                <div class="availability-head">

                    <span>
                        Charger availability
                    </span>

                    <strong>
                        ${station.available}/${station.total}
                    </strong>

                </div>

                <div class="availability-bar">

                    <div
                        class="availability-progress"
                        style="
                            width:${percentage}%;
                            background:
                            ${station.available === 0
                                ? "var(--red)"
                                : station.available <= 2
                                    ? "var(--yellow)"
                                    : "var(--green)"
                            };
                        "
                    ></div>

                </div>

            </div>


            <div class="station-bottom">

                <div>

                    <div class="price">
                        ₹${station.price}
                        <span>/kWh</span>
                    </div>

                    <div class="rating">
                        ★ ${station.rating}
                        <span style="
                            color:var(--faint);
                            font-size:8px;
                        ">
                            (${station.reviews})
                        </span>
                    </div>

                </div>


                <div class="station-actions">

                    <button
                        class="favorite-btn
                        ${station.favorite ? "active" : ""}"
                        onclick="
                            event.stopPropagation();
                            toggleFavorite(${station.id})
                        "
                    >
                        <i class="
                            ${station.favorite
                                ? "fa-solid"
                                : "fa-regular"
                            }
                            fa-heart
                        "></i>
                    </button>

                    <button
                        type="button"
                        class="book-btn station-book"
                        data-station-id="${station.id}"
                    >
                        Book now
                    </button>

                </div>

            </div>

        `;


        card.addEventListener("click", () => {

            openStation(station.id);

        });

        card.querySelector(".station-book").addEventListener("click", event => {
            event.stopPropagation();
            startBooking(station.id);
        });


        stationList.appendChild(card);

    });


    updateStats();

    renderMarkers();

}


/* =========================================================
   OPEN STATION
   ========================================================= */

function openStation(id) {

    const station =
        stations.find(s => s.id === id);

    if (!station) return;

    selectedStation = station;


    stationDetails.innerHTML = `

        <div class="drawer-hero">

            <div class="drawer-operator">
                ${station.operator}
            </div>

            <h2 class="drawer-title">
                ${station.name}
            </h2>

            <div class="drawer-rating">
                ★ ${station.rating}
                <span style="color:var(--faint)">
                    (${station.reviews} reviews)
                </span>
            </div>

            <div class="drawer-address">

                <i class="fa-solid fa-location-dot"></i>

                ${station.address}

                <br><br>

                <span style="color:var(--green)">
                    ${station.distance} km away
                </span>

            </div>

        </div>


        <div class="drawer-status-card">

            <div class="drawer-stat">

                <span>Available</span>

                <strong style="
                    color:${station.available === 0
                        ? "var(--red)"
                        : "var(--green)"
                    };
                ">
                    ${station.available}/${station.total}
                </strong>

            </div>

            <div class="drawer-stat">

                <span>Power</span>

                <strong>
                    ${station.power} kW
                </strong>

            </div>

            <div class="drawer-stat">

                <span>Price</span>

                <strong>
                    ₹${station.price}
                </strong>

            </div>

        </div>


        <div class="drawer-section">

            <h4>
                Available chargers
            </h4>

            <div class="charger-list">

                ${createChargers(station)}

            </div>

        </div>


        <div class="drawer-section">

            <h4>
                Amenities
            </h4>

            <div class="amenity-grid">

                ${createAmenities(station)}

            </div>

        </div>


        <div class="drawer-section">

            <h4>
                Station information
            </h4>

            <div style="
                padding:13px;
                background:var(--card);
                border:1px solid var(--border);
                border-radius:9px;
                color:var(--muted);
                font-size:10px;
                line-height:1.8;
            ">

                <div>
                    <strong style="color:var(--text)">
                        Status:
                    </strong>

                    ${station.open
                        ? "Open 24/7"
                        : "Closed"
                    }
                </div>

                <div>
                    <strong style="color:var(--text)">
                        Connector:
                    </strong>

                    ${station.connector}
                </div>

                <div>
                    <strong style="color:var(--text)">
                        Last updated:
                    </strong>

                    Just now
                </div>

            </div>

        </div>


        <div class="drawer-section">

            <h4>Travel & waiting time</h4>

            ${createTravelDetails(station)}

        </div>


        <div class="drawer-section">

            <h4>Rate this station</h4>

            ${createStationRating(station)}

        </div>


        <div class="drawer-section">

            <h4>
                While you charge
            </h4>

            <div class="nearby-recommendations">

                ${createRecommendations(station)}

            </div>

        </div>


        <div class="drawer-section">

            <h4>Station support</h4>

            ${createStationContact(station)}

        </div>


        <div class="drawer-buttons">

            <button
                type="button"
                class="btn-secondary drawer-directions"
                data-station-id="${station.id}"
            >
                <i class="fa-solid fa-route"></i>
                Directions
            </button>

            <button
                type="button"
                class="btn-primary drawer-book"
                data-station-id="${station.id}"
                ${station.available === 0
                    ? "disabled"
                    : ""
                }
            >
                <i class="fa-regular fa-calendar"></i>
                Book charger
            </button>

        </div>

    `;

    stationDetails.querySelector(".drawer-directions")?.addEventListener("click", () => {
        getDirections(station.id);
    });

    stationDetails.querySelector(".drawer-book")?.addEventListener("click", () => {
        startBooking(station.id);
    });


    stationDrawer.classList.add("open");

    drawerOverlay.classList.add("open");


    if (markers[id]) {

        map.setView(
            [station.lat, station.lng],
            15,
            {
                animate: true
            }
        );

        markers[id].openPopup();

    }


    highlightCard(id);

}


/* =========================================================
   CHARGERS
   ========================================================= */

function createChargers(station) {

    const count =
        Math.min(station.total, 4);

    let html = "";

    for (let i = 1; i <= count; i++) {

        const active =
            i <= station.available;

        html += `

            <div class="charger-item">

                <div class="charger-item-left">

                    <div class="charger-icon">
                        <i class="fa-solid fa-bolt"></i>
                    </div>

                    <div>

                        <div class="charger-name">
                            Charger ${String(i).padStart(2, "0")}
                        </div>

                        <div class="charger-meta">
                            ${station.connector}
                            • ${station.power} kW
                        </div>

                    </div>

                </div>

                <div class="charger-status"
                    style="
                        color:${active
                            ? "var(--green)"
                            : "var(--red)"
                        };
                    "
                >
                    ${active ? "AVAILABLE" : "BUSY"}
                </div>

            </div>

        `;

    }

    return html;

}


/* =========================================================
   AMENITIES
   ========================================================= */

function createAmenities(station) {

    const names = {

        cafe: [
            "fa-mug-hot",
            "Cafe"
        ],

        parking: [
            "fa-square-parking",
            "Parking"
        ],

        wifi: [
            "fa-wifi",
            "Wi-Fi"
        ],

        restroom: [
            "fa-restroom",
            "Restroom"
        ]

    };


    return station.amenities
        .map(a => {

            const item = names[a];

            if (!item) return "";

            return `

                <div class="amenity">

                    <i class="fa-solid ${item[0]}"
                       style="
                           color:var(--green);
                           margin-right:5px;
                       "
                    ></i>

                    ${item[1]}

                </div>

            `;

        })
        .join("");

}


/* =========================================================
   NEARBY RECOMMENDATIONS
   ========================================================= */

function createRecommendations(station) {

    const places = [
        ["fa-mug-hot", "Cafe", `Brew & Bean · ${station.distance < 4 ? "3" : "6"} min walk`],
        ["fa-hotel", "Hotel", "Comfort stay & lobby workspace nearby"],
        ["fa-store", "Nearby mall", "Shopping, dining and essentials" ]
    ];

    return places.map(place => `

        <div class="recommendation-place">
            <i class="fa-solid ${place[0]}"></i>
            <div>
                <strong>${place[1]}</strong>
                <span>${place[2]}</span>
            </div>
        </div>

    `).join("");

}


/* =========================================================
   TRAVEL, ROUTES, RATINGS & CONTACT
   ========================================================= */

function getWaitingTime(station) {

    if (station.available === 0) return "25–35 min";
    if (station.available <= 2) return "10–15 min";
    return "No expected wait";

}


function getTravelTime(station) {

    const distance = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, station.lat, station.lng)
        : station.distance;
    const minutes = Math.max(4, Math.round((distance / 28) * 60));

    return `${minutes} min`;

}


function calculateDistanceKm(lat1, lng1, lat2, lng2) {

    const toRadians = value => value * Math.PI / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) ** 2;

    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

}


function createTravelDetails(station) {

    const eta = getTravelTime(station);
    const wait = getWaitingTime(station);

    return `
        <div class="travel-overview">
            <div class="travel-stat"><span>Estimated drive</span><strong>${eta}</strong></div>
            <div class="travel-stat"><span>Expected wait</span><strong>${wait}</strong></div>
        </div>
        <button class="route-choice recommended" onclick="startSuggestedRoute(${station.id}, 'best')">
            <div><strong>Best route · recommended</strong><span>Fastest drive estimate · ${eta}</span></div>
            <i class="fa-solid fa-route"></i>
        </button>
        <button class="route-choice" onclick="startSuggestedRoute(${station.id}, 'alternate')">
            <div><strong>Alternate route</strong><span>May be useful if traffic is heavy</span></div>
            <i class="fa-solid fa-arrow-right"></i>
        </button>
    `;

}


function getStationRating(id) {

    if (!currentUser) return 0;
    const ratings = JSON.parse(localStorage.getItem("voltmap-station-ratings") || "{}");
    return ratings[`${currentUser.email}:${id}`] || 0;

}


function createStationRating(station) {

    const rating = getStationRating(station.id);

    return `
        <div class="station-rating">
            <span>${rating ? `Your rating: ${rating}/5` : `Community rating: ${station.rating}/5`}</span>
            <div>
                ${[1, 2, 3, 4, 5].map(star => `<button onclick="rateStation(${station.id}, ${star})" aria-label="Rate ${star} stars">${star <= rating ? "★" : "☆"}</button>`).join("")}
            </div>
        </div>
    `;

}


function rateStation(id, rating) {

    if (!currentUser) return;

    const ratings = JSON.parse(localStorage.getItem("voltmap-station-ratings") || "{}");
    ratings[`${currentUser.email}:${id}`] = rating;
    localStorage.setItem("voltmap-station-ratings", JSON.stringify(ratings));

    syncToBackend(`/stations/${id}/ratings`, {
        method: "POST",
        body: JSON.stringify({ email: currentUser.email, rating })
    });

    openStation(id);
    showToast("Station rating saved", `You rated this station ${rating}/5.`);

}


function createStationContact(station) {

    const contactCode = String(station.id).padStart(3, "0");

    return `
        <div class="station-contact">
            <strong style="color:var(--text)">Station admin desk</strong><br>
            <i class="fa-solid fa-phone"></i> <a href="tel:+918055550${contactCode}">+91 80 5555 0${contactCode}</a><br>
            <i class="fa-regular fa-envelope"></i> <a href="mailto:station${contactCode}@voltmap.demo">station${contactCode}@voltmap.demo</a><br>
            <span>For charger access, availability, or site support.</span>
        </div>
    `;

}


/* =========================================================
   BOOKING
   ========================================================= */

function startBooking(id) {

    if (!currentUser) {
        document.getElementById("authOverlay").classList.remove("hidden");
        return;
    }

    const station =
        stations.find(s => s.id === id);

    if (!station || station.available === 0) {

        showToast(
            "Unavailable",
            "No charger is currently available."
        );

        return;

    }

    selectedStation = station;

    selectedCharger = null;

    bookingDraft = {};

    bookingStep = 1;

    renderBooking();

    bookingModal.classList.add("open");

}


/* =========================================================
   BOOKING UI
   ========================================================= */

function renderBooking() {

    const content =
        document.getElementById("bookingContent");

    updateBookingProgress();


    if (bookingStep === 1) {

        content.innerHTML = `

            <h2 class="booking-title">
                Choose your charger
            </h2>

            <p class="booking-subtitle">
                Select an available connector at
                ${selectedStation.name}.
            </p>


            <div class="charger-choice">

                ${createBookingChargers()}

            </div>


            <button
                type="button"
                class="btn-primary full-btn booking-next"
                style="margin-top:18px"
            >
                Continue
                <i class="fa-solid fa-arrow-right"></i>
            </button>

        `;

    }


    else if (bookingStep === 2) {

        content.innerHTML = `

            <h2 class="booking-title">
                Choose date & time
            </h2>

            <p class="booking-subtitle">
                Select when you want to charge.
            </p>


            <div class="booking-form">

                <label>
                    Date

                    <input
                        type="date"
                        id="bookingDate"
                        min="${getToday()}"
                    >

                </label>


                <label>
                    Time

                    <input
                        type="time"
                        id="bookingTime"
                        value="19:30"
                    >

                </label>


                <button
                    type="button"
                    class="btn-primary booking-next"
                >
                    Continue
                    <i class="fa-solid fa-arrow-right"></i>
                </button>

            </div>

        `;

    }


    else if (bookingStep === 3) {

        content.innerHTML = `

            <h2 class="booking-title">
                Select your vehicle
            </h2>

            <p class="booking-subtitle">
                Choose a vehicle for this charging session.
            </p>


            <div class="booking-form">

                <label>

                    Vehicle

                    <select id="vehicleSelect">

                        <option>
                            Tata Nexon EV
                        </option>

                        <option>
                            Hyundai Ioniq 5
                        </option>

                        <option>
                            MG ZS EV
                        </option>

                        <option>
                            Add new vehicle
                        </option>

                    </select>

                </label>


                <label>

                    Vehicle number

                    <input
                        id="vehicleNumber"
                        placeholder="KA05MX1234"
                    >

                </label>


                <button
                    type="button"
                    class="btn-primary booking-next"
                >
                    Review booking
                    <i class="fa-solid fa-arrow-right"></i>
                </button>

            </div>

        `;

    }


    else {

        const date = bookingDraft.date || getToday();

        const time = bookingDraft.time || "19:30";


        content.innerHTML = `

            <h2 class="booking-title">
                Review booking
            </h2>

            <p class="booking-subtitle">
                Check your details before confirming.
            </p>


            <div class="booking-summary">

                <div class="summary-line">

                    <span>Station</span>

                    <strong>
                        ${selectedStation.name}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Charger</span>

                    <strong>
                        ${selectedCharger?.name || "CCS2"}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Date</span>

                    <strong>
                        ${date}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Time</span>

                    <strong>
                        ${time}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Vehicle</span>

                    <strong>
                        ${bookingDraft.vehicle || "Tata Nexon EV"}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Estimated energy</span>

                    <strong>
                        18.4 kWh
                    </strong>

                </div>


                <div class="summary-line summary-total">

                    <span>Estimated cost</span>

                    <strong>
                        ₹${Math.round(
                            18.4 *
                            selectedStation.price
                        )}
                    </strong>

                </div>

            </div>


            <button
                type="button"
                class="btn-primary full-btn open-payment"
            >
                Continue to payment
                <i class="fa-solid fa-arrow-right"></i>
            </button>

        `;

    }

    bindBookingStepEvents();

}


function bindBookingStepEvents() {

    const content = document.getElementById("bookingContent");

    content.querySelectorAll(".booking-charger").forEach(button => {
        button.addEventListener("click", () => {
            selectCharger(button, Number(button.dataset.charger));
        });
    });

    content.querySelector(".booking-next")?.addEventListener("click", bookingNext);
    content.querySelector(".open-payment")?.addEventListener("click", openPayment);

}


/* =========================================================
   BOOKING CHARGERS
   ========================================================= */

function createBookingChargers() {

    const count =
        Math.min(selectedStation.available, 4);

    let html = "";

    for (let i = 1; i <= count; i++) {

        html += `

            <button
                type="button"
                class="booking-charger"
                data-charger="${i}"
            >

                <span class="choice-name">
                    Charger ${i}
                </span>

                <span class="choice-meta">
                    ${selectedStation.connector}
                    •
                    ${selectedStation.power} kW
                </span>

            </button>

        `;

    }

    return html;

}


function selectCharger(button, number) {

    document
        .querySelectorAll(".charger-choice button")
        .forEach(btn =>
            btn.classList.remove("selected")
        );

    button.classList.add("selected");


    selectedCharger = {

        name: `Charger ${number}`,

        connector: selectedStation.connector,

        power: selectedStation.power

    };

}


/* =========================================================
   BOOKING NEXT
   ========================================================= */

function bookingNext() {

    if (bookingStep === 1 && !selectedCharger) {

        showToast(
            "Select charger",
            "Please select an available charger."
        );

        return;

    }


    if (bookingStep === 2) {

        const date =
            document.getElementById("bookingDate");

        const time =
            document.getElementById("bookingTime");


        if (!date?.value || !time?.value) {

            showToast(
                "Missing information",
                "Select date and time."
            );

            return;

        }

        bookingDraft.date = date.value;
        bookingDraft.time = time.value;

    }


    if (bookingStep === 3) {

        const vehicle = document.getElementById("vehicleSelect");
        const vehicleNumber = document.getElementById("vehicleNumber");

        if (!vehicle || !vehicleNumber?.value.trim()) {

            showToast(
                "Vehicle number required",
                "Enter your vehicle number to continue."
            );

            return;

        }

        bookingDraft.vehicle = vehicle.value;
        bookingDraft.vehicleNumber = vehicleNumber.value.trim().toUpperCase();

    }


    bookingStep++;

    renderBooking();

}


/* =========================================================
   CONFIRM BOOKING
   ========================================================= */

function openPayment() {

    if (!bookingDraft.vehicleNumber) {
        showToast("Vehicle number required", "Enter your vehicle number before payment.");
        return;
    }

    bookingModal.classList.remove("open");
    renderPayment();
    document.getElementById("paymentModal").classList.add("open");

}


function updateBookingProgress() {

    document
        .querySelectorAll(".booking-progress .progress-step")
        .forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle("active", stepNumber === bookingStep);
            step.classList.toggle("complete", stepNumber < bookingStep);
        });

    document
        .querySelectorAll(".booking-progress .progress-line")
        .forEach((line, index) => {
            line.classList.toggle("complete", index + 1 < bookingStep);
        });

}


function renderPayment() {

    const amount = Math.round(18.4 * selectedStation.price);
    const paymentContent = document.getElementById("paymentContent");

    paymentContent.innerHTML = `

        <div class="payment-total">
            <span>${selectedStation.name}<br><small>${selectedCharger?.name || "Charger"} · ${bookingDraft.date}, ${bookingDraft.time}</small></span>
            <strong>₹${amount}</strong>
        </div>

        <div class="payment-methods">
            <button type="button" class="payment-method ${selectedPaymentMethod === "qr" ? "active" : ""}" data-payment-method="qr"><i class="fa-solid fa-qrcode"></i>QR / UPI</button>
            <button type="button" class="payment-method ${selectedPaymentMethod === "upi" ? "active" : ""}" data-payment-method="upi"><i class="fa-solid fa-mobile-screen"></i>UPI ID</button>
            <button type="button" class="payment-method ${selectedPaymentMethod === "card" ? "active" : ""}" data-payment-method="card"><i class="fa-regular fa-credit-card"></i>Card</button>
        </div>

        <div class="payment-method-content">
            ${createPaymentMethodContent(amount)}
        </div>

        <p class="payment-note">This demo confirms the payment in the interface only. Connect a verified payment provider and server-side credentials before taking live payments.</p>

        <button type="button" class="btn-primary full-btn" id="payButton">
            <i class="fa-solid fa-lock"></i> Pay ₹${amount} & reserve
        </button>

    `;

    paymentContent.querySelectorAll("[data-payment-method]").forEach(button => {
        button.addEventListener("click", () => selectPaymentMethod(button.dataset.paymentMethod));
    });

    paymentContent.querySelector("#payButton").addEventListener("click", processPayment);

}


function createPaymentMethodContent(amount) {

    if (selectedPaymentMethod === "card") {
        return `
            <label class="payment-field">Card number<input id="cardNumber" inputmode="numeric" placeholder="1234 5678 9012 3456"></label>
            <label class="payment-field">Name on card<input id="cardName" placeholder="Cardholder name"></label>
        `;
    }

    if (selectedPaymentMethod === "upi") {
        return `
            <label class="payment-field">UPI ID<input id="upiId" placeholder="name@bank"></label>
            <p class="payment-note">You will approve the request in your UPI app.</p>
        `;
    }

    return `
        <div class="qr-payment">
            <svg class="qr-code" viewBox="0 0 21 21" aria-label="Demo QR payment code" role="img">
                <rect width="21" height="21" fill="#fff"/>
                <g fill="#071018"><path d="M1 1h6v6H1zm1 1v4h4V2zm11-1h7v6h-7zm1 1v4h4V2zM1 13h6v7H1zm1 1v5h4v-5zM9 1h2v2H9zm2 2h2v2h-2zm-2 3h4v2H9zm5 1h2v2h-2zm3 1h3v2h-3zM9 9h2v2H9zm3 0h2v4h-2zm4 2h4v2h-4zM8 12h3v2H8zm4 2h2v2h-2zm3-1h2v4h-2zm3 3h2v2h-2zM8 16h2v4H8zm3 2h3v2h-3z"/></g>
            </svg>
            <div><strong>Scan with any UPI app</strong><p>Amount: ₹${amount}<br>Use your preferred UPI app to complete the payment.</p></div>
        </div>
    `;

}


function selectPaymentMethod(method) {

    selectedPaymentMethod = method;
    renderPayment();

}


function processPayment() {

    if (selectedPaymentMethod === "upi" && !document.getElementById("upiId")?.value.trim()) {
        showToast("UPI ID required", "Enter a UPI ID to continue.");
        return;
    }

    if (selectedPaymentMethod === "card") {
        const card = document.getElementById("cardNumber")?.value.replace(/\s/g, "");
        if (!card || card.length < 12 || !document.getElementById("cardName")?.value.trim()) {
            showToast("Card details required", "Enter a valid card number and cardholder name.");
            return;
        }
    }

    const bookingId = "VM-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
    const amount = Math.round(18.4 * selectedStation.price);
    const order = {
        id: bookingId,
        userEmail: currentUser.email,
        stationName: selectedStation.name,
        chargerName: selectedCharger?.name || "Charger",
        date: bookingDraft.date,
        time: bookingDraft.time,
        vehicleNumber: bookingDraft.vehicleNumber,
        amount,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        status: "Paid & confirmed",
        rating: null,
        createdAt: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem("voltmap-orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("voltmap-orders", JSON.stringify(orders));

    syncToBackend("/orders", {
        method: "POST",
        body: JSON.stringify(order)
    });

    selectedStation.available = Math.max(0, selectedStation.available - 1);
    document.getElementById("paymentModal").classList.remove("open");
    showConfirmation(bookingId);
    renderStations();

}

function confirmBooking() {

    const bookingId =
        "VM-" +
        new Date().getFullYear() +
        "-" +
        Math.floor(
            100000 +
            Math.random() * 900000
        );


    selectedStation.available =
        Math.max(
            0,
            selectedStation.available - 1
        );


    bookingModal.classList.remove("open");


    showConfirmation(bookingId);

    renderStations();

}


/* =========================================================
   CONFIRMATION
   ========================================================= */

function showConfirmation(bookingId) {

    const modal =
        document.createElement("div");

    modal.className = "modal-overlay open";

    modal.innerHTML = `

        <div class="modal"
            style="text-align:center">

            <div style="
                width:70px;
                height:70px;
                margin:10px auto 18px;

                display:grid;
                place-items:center;

                border-radius:50%;

                background:var(--green-soft);
                color:var(--green);

                font-size:30px;
            ">
                <i class="fa-solid fa-check"></i>
            </div>


            <span class="modal-eyebrow">
                RESERVATION CONFIRMED
            </span>


            <h2 style="
                font-family:var(--font-display);
                margin:7px 0;
            ">
                You're all set!
            </h2>


            <p style="
                color:var(--muted);
                font-size:11px;
            ">
                Your charger has been reserved successfully.
            </p>


            <div class="booking-summary"
                style="
                    text-align:left;
                    margin-top:20px;
                "
            >

                <div class="summary-line">

                    <span>Booking ID</span>

                    <strong>
                        ${bookingId}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Station</span>

                    <strong>
                        ${selectedStation.name}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Charger</span>

                    <strong>
                        ${selectedCharger?.name || "CCS2"}
                    </strong>

                </div>


                <div class="summary-line">

                    <span>Power</span>

                    <strong>
                        ${selectedStation.power} kW
                    </strong>

                </div>


                <div class="summary-line summary-total">

                    <span>Estimated cost</span>

                    <strong>
                        ₹${Math.round(
                            18.4 *
                            selectedStation.price
                        )}
                    </strong>

                </div>

            </div>


            <div style="
                display:flex;
                gap:8px;
                margin-top:15px;
            ">

                <button
                    class="btn-secondary"
                    style="flex:1"
                    onclick="
                        this.closest('.modal-overlay').remove()
                    "
                >
                    Done
                </button>

                <button
                    class="btn-primary"
                    style="flex:1"
                    onclick="
                        addToCalendar();
                    "
                >
                    Add to calendar
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);

}


/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener(
    "input",
    debounce(() => {

        applySearch();

    }, 250)
);


function applySearch() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    filteredStations =
        stations.filter(station => {

            return (
                station.name.toLowerCase().includes(query) ||
                station.address.toLowerCase().includes(query) ||
                station.operator.toLowerCase().includes(query) ||
                station.connector.toLowerCase().includes(query)
            );

        });


    renderStations();

    renderSearchSuggestions(query);

}


function renderSearchSuggestions(query) {

    const suggestionBox = document.getElementById("searchSuggestions");

    if (!query) {
        suggestionBox.classList.remove("open");
        suggestionBox.innerHTML = "";
        return;
    }

    const matches = stations.filter(station =>
        [station.name, station.address, station.operator, station.connector]
            .some(value => value.toLowerCase().includes(query))
    ).slice(0, 5);

    if (!matches.length) {
        suggestionBox.innerHTML = `<div class="suggestion-item"><i class="fa-solid fa-location-dot"></i><span><strong>No charging locations found</strong><small>Try another area or station name.</small></span></div>`;
    }
    else {
        suggestionBox.innerHTML = matches.map(station => `
            <button class="suggestion-item" onclick="selectSearchSuggestion(${station.id})">
                <i class="fa-solid fa-charging-station"></i>
                <span><strong>${station.name}</strong><small>${station.address} · ${station.available}/${station.total} available</small></span>
            </button>
        `).join("");
    }

    suggestionBox.classList.add("open");

}


function selectSearchSuggestion(id) {

    const station = stations.find(item => item.id === id);
    if (!station) return;

    searchInput.value = station.name;
    filteredStations = [station];
    document.getElementById("searchSuggestions").classList.remove("open");
    renderStations();
    openStation(id);

}


/* =========================================================
   SORTING
   ========================================================= */

document
    .getElementById("sortSelect")
    .addEventListener("change", e => {

        const type = e.target.value;


        if (type === "distance") {

            filteredStations.sort(
                (a, b) =>
                    a.distance - b.distance
            );

        }

        else if (type === "price") {

            filteredStations.sort(
                (a, b) =>
                    a.price - b.price
            );

        }

        else if (type === "speed") {

            filteredStations.sort(
                (a, b) =>
                    b.power - a.power
            );

        }

        else if (type === "rating") {

            filteredStations.sort(
                (a, b) =>
                    b.rating - a.rating
            );

        }

        else if (type === "availability") {

            filteredStations.sort(
                (a, b) =>
                    b.available - a.available
            );

        }

        else {

            filteredStations.sort(
                (a, b) =>
                    recommendationScore(b)
                    -
                    recommendationScore(a)
            );

        }


        renderStations();

    });


function recommendationScore(station) {

    const availability =
        station.available /
        station.total;

    const distanceScore =
        1 /
        Math.max(station.distance, 1);

    const speedScore =
        Math.min(station.power / 150, 1);

    const priceScore =
        1 /
        station.price;

    return (
        availability * 5 +
        distanceScore * 2 +
        speedScore * 2 +
        station.rating +
        priceScore * 2
    );

}


/* =========================================================
   QUICK FILTERS
   ========================================================= */

document
    .querySelectorAll(".quick-filter")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".quick-filter")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");


            const filter =
                button.dataset.filter;


            if (filter === "available") {

                filteredStations =
                    stations.filter(
                        s => s.available > 0
                    );

            }

            else if (filter === "fast") {

                filteredStations =
                    stations.filter(
                        s => s.power >= 100
                    );

            }

            else if (filter === "cheap") {

                filteredStations =
                    stations.filter(
                        s => s.price <= 18
                    );

            }

            else {

                filteredStations =
                    [...stations];

            }


            renderStations();

        });

    });


/* =========================================================
   ADVANCED FILTER
   ========================================================= */

document
    .getElementById("filterBtn")
    .addEventListener("click", () => {

        filterModal.classList.add("open");

    });


document
    .getElementById("applyFilters")
    .addEventListener("click", applyAdvancedFilters);


function applyAdvancedFilters() {

    const connector =
        document.getElementById(
            "connectorFilter"
        ).value;


    const maxPrice =
        Number(
            document.getElementById(
                "priceRange"
            ).value
        );


    const minSpeed =
        Number(
            document.getElementById(
                "speedFilter"
            ).value
        );


    const availableOnly =
        document.getElementById(
            "availableFilter"
        ).checked;


    filteredStations =
        stations.filter(station => {

            if (
                selectedChargerType !== "all" &&
                station.chargerType !== selectedChargerType
            ) {
                return false;
            }


            if (
                connector !== "all" &&
                station.connector !== connector
            ) {
                return false;
            }


            if (
                station.price > maxPrice
            ) {
                return false;
            }


            if (
                station.power < minSpeed
            ) {
                return false;
            }


            if (
                availableOnly &&
                station.available === 0
            ) {
                return false;
            }


            return true;

        });


    filterModal.classList.remove("open");

    renderStations();

    showToast(
        "Filters applied",
        `${filteredStations.length} stations found.`
    );

}


/* =========================================================
   CHARGER TYPE BUTTONS
   ========================================================= */

document
    .querySelectorAll(
        ".option-btn[data-type='charger']"
    )
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(
                    ".option-btn[data-type='charger']"
                )
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedChargerType =
                button.dataset.value;

        });

    });


/* =========================================================
   PRICE SLIDER
   ========================================================= */

document
    .getElementById("priceRange")
    .addEventListener("input", e => {

        document.getElementById(
            "priceValue"
        ).textContent =
            e.target.value;

    });


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

document
    .getElementById("clearFilters")
    .addEventListener(
        "click",
        resetFilters
    );


function resetFilters() {

    selectedChargerType = "all";

    document.getElementById(
        "connectorFilter"
    ).value = "all";

    document.getElementById(
        "priceRange"
    ).value = 25;

    document.getElementById(
        "priceValue"
    ).textContent = 25;

    document.getElementById(
        "speedFilter"
    ).value = 0;

    document.getElementById(
        "availableFilter"
    ).checked = false;


    document
        .querySelectorAll(
            ".option-btn[data-type='charger']"
        )
        .forEach(btn =>
            btn.classList.remove("active")
        );

    document
        .querySelector(
            ".option-btn[data-value='all']"
        )
        .classList.add("active");


    filteredStations =
        [...stations];


    filterModal.classList.remove("open");

    renderStations();

}


/* =========================================================
   FAVORITES
   ========================================================= */

function toggleFavorite(id) {

    const station =
        stations.find(s => s.id === id);

    if (!station) return;

    station.favorite =
        !station.favorite;


    renderStations();


    showToast(
        station.favorite
            ? "Added to favorites"
            : "Removed from favorites",

        station.name
    );

}


/* =========================================================
   GEOLOCATION
   ========================================================= */

function locateUser() {

    if (!navigator.geolocation) {

        showToast(
            "Not supported",
            "Geolocation is not supported by this browser."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            const lat =
                position.coords.latitude;

            const lng =
                position.coords.longitude;


            userLocation = {
                lat,
                lng
            };


            map.setView(
                [lat, lng],
                14,
                {
                    animate: true
                }
            );


            L.circleMarker(
                [lat, lng],
                {
                    radius: 8,
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#5b9cff",
                    fillOpacity: 1
                }
            )
            .addTo(map)
            .bindPopup("You are here");


            showToast(
                "Location found",
                "Showing charging stations near you."
            );

        },

        () => {

            showToast(
                "Location unavailable",
                "Please allow location access."
            );

        }

    );

}


document
    .getElementById("locationBtn")
    .addEventListener(
        "click",
        locateUser
    );


document
    .getElementById("mapLocationBtn")
    .addEventListener(
        "click",
        locateUser
    );


/* =========================================================
   DIRECTIONS
   ========================================================= */

function getDirections(id) {

    const station =
        stations.find(s => s.id === id);

    if (!station) return;


    const url =
        `https://www.google.com/maps/dir/?api=1` +
        `${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ""}` +
        `&destination=${station.lat},${station.lng}`;


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   DRAWER
   ========================================================= */

document
    .getElementById("drawerClose")
    .addEventListener("click", closeDrawer);


drawerOverlay.addEventListener(
    "click",
    closeDrawer
);


function closeDrawer() {

    stationDrawer.classList.remove("open");

    drawerOverlay.classList.remove("open");

}


/* =========================================================
   MODAL CLOSE
   ========================================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const id =
                button.dataset.close;

            document
                .getElementById(id)
                .classList.remove("open");

        });

    });


document
    .querySelectorAll(".modal-overlay")
    .forEach(modal => {

        modal.addEventListener("click", e => {

            if (e.target === modal) {

                modal.classList.remove("open");

            }

        });

    });


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

document
    .getElementById("notificationBtn")
    .addEventListener("click", () => {

        notificationPanel.classList.toggle("open");

    });


document
    .getElementById("markRead")
    .addEventListener("click", () => {

        document
            .querySelector(".notifications")
            .replaceChildren();


        document
            .querySelector(".notification-count")
            .textContent = "0";


        notificationPanel.classList.remove("open");

        showToast("Notifications cleared", "All notifications have been removed.");

    });


/* =========================================================
   THEME
   ========================================================= */

document
    .getElementById("themeBtn")
    .addEventListener("click", toggleTheme);


function toggleTheme() {

    document.body.classList.toggle("light");

    const light =
        document.body.classList.contains("light");


    localStorage.setItem(
        "voltmap-theme",
        light
            ? "light"
            : "dark"
    );


    document
        .querySelector("#themeBtn i")
        .className =
            light
                ? "fa-solid fa-moon"
                : "fa-solid fa-sun";

    updateMapTheme();

    renderMarkers();

}


function initializeTheme() {

    const theme =
        localStorage.getItem(
            "voltmap-theme"
        );


    if (theme === "light") {

        document.body.classList.add("light");

        document
            .querySelector("#themeBtn i")
            .className =
                "fa-solid fa-moon";

    }

    updateMapTheme();

}


function startSuggestedRoute(id, routeType) {

    const station = stations.find(item => item.id === id);
    if (!station) return;

    showToast(
        routeType === "best" ? "Opening best route" : "Opening alternate routes",
        "Google Maps will use current traffic to choose the best driving route."
    );

    getDirections(id);

}


/* =========================================================
   SAVED MAP PLACES
   ========================================================= */

function getSavedPlaces() {

    return JSON.parse(localStorage.getItem("voltmap-saved-places") || "{}");

}


function saveMapCenter(place) {

    if (!map) return;

    const center = map.getCenter();
    const places = getSavedPlaces();

    places[place] = { lat: center.lat, lng: center.lng };
    localStorage.setItem("voltmap-saved-places", JSON.stringify(places));

    if (currentUser) {
        syncToBackend(`/users/${encodeURIComponent(currentUser.email)}/saved-places`, {
            method: "PUT",
            body: JSON.stringify({ place, lat: center.lat, lng: center.lng })
        });
    }

    renderSavedPlaces();
    showToast(`${place[0].toUpperCase() + place.slice(1)} saved`, "The current map centre was marked for quick access.");

}


function renderSavedPlaces() {

    if (!map) return;

    Object.values(savedPlaceMarkers).forEach(marker => map.removeLayer(marker));
    savedPlaceMarkers = {};

    const icons = { home: "fa-house", office: "fa-briefcase", college: "fa-graduation-cap" };
    const places = getSavedPlaces();

    Object.entries(places).forEach(([type, location]) => {
        const label = type[0].toUpperCase() + type.slice(1);
        const marker = L.marker([location.lat, location.lng], {
            icon: L.divIcon({
                className: "saved-place-marker",
                html: `<div style="width:30px;height:30px;display:grid;place-items:center;background:#5b9cff;color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 4px 12px #0005"><i class="fa-solid ${icons[type]}"></i></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map).bindPopup(`<strong>${label}</strong><br><small>Saved place</small>`);

        savedPlaceMarkers[type] = marker;
    });

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

document
    .getElementById("fullscreenBtn")
    .addEventListener("click", () => {

        const mapElement =
            document.getElementById("map");


        if (!document.fullscreenElement) {

            mapElement.requestFullscreen?.();

        }

        else {

            document.exitFullscreen?.();

        }

    });


/* =========================================================
   COST CALCULATOR
   ========================================================= */

function openCalculator() {

    document
        .getElementById("calculatorModal")
        .classList.add("open");

}


document
    .getElementById("calculateBtn")
    .addEventListener("click", calculateCost);


function calculateCost() {

    const capacity =
        Number(
            document.getElementById(
                "batteryCapacity"
            ).value
        );


    const current =
        Number(
            document.getElementById(
                "currentBattery"
            ).value
        );


    const target =
        Number(
            document.getElementById(
                "targetBattery"
            ).value
        );


    const price =
        Number(
            document.getElementById(
                "chargePrice"
            ).value
        );


    if (
        capacity <= 0 ||
        target <= current
    ) {

        showToast(
            "Invalid values",
            "Check your battery percentages."
        );

        return;

    }


    const energy =
        capacity *
        ((target - current) / 100);


    const cost =
        energy * price;


    const chargingPower = 100;


    const time =
        (energy / chargingPower) *
        60;


    document.getElementById(
        "energyResult"
    ).textContent =
        energy.toFixed(2) + " kWh";


    document.getElementById(
        "costResult"
    ).textContent =
        "₹" + Math.round(cost);


    document.getElementById(
        "timeResult"
    ).textContent =
        Math.max(
            1,
            Math.round(time)
        ) + " min";

}


/* =========================================================
   LIVE AVAILABILITY SIMULATION
   ========================================================= */

function simulateLiveUpdates() {

    setInterval(() => {

        const station =
            stations[
                Math.floor(
                    Math.random() *
                    stations.length
                )
            ];


        if (!station) return;


        const change =
            Math.random() > 0.5
                ? 1
                : -1;


        station.available =
            Math.max(
                0,
                Math.min(
                    station.total,
                    station.available + change
                )
            );


        const visible =
            filteredStations.some(
                s => s.id === station.id
            );


        if (visible) {

            renderStations();

        }


    }, 10000);

}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats() {

    stationCount.textContent =
        filteredStations.length;

    mapStationCount.textContent =
        filteredStations.length;

}


/* =========================================================
   HIGHLIGHT CARD
   ========================================================= */

function highlightCard(id) {

    document
        .querySelectorAll(".station-card")
        .forEach(card =>
            card.classList.remove("selected")
        );


    const card =
        document.querySelector(
            `.station-card[data-id="${id}"]`
        );


    if (card) {

        card.classList.add("selected");

        card.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout;


function showToast(title, message) {

    document.getElementById(
        "toastTitle"
    ).textContent = title;


    document.getElementById(
        "toastMessage"
    ).textContent = message;


    toast.classList.add("show");


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3500);

}


/* =========================================================
   DATE
   ========================================================= */

function getToday() {

    const date =
        new Date();


    return date
        .toISOString()
        .split("T")[0];

}


/* =========================================================
   CALENDAR
   ========================================================= */

function addToCalendar() {

    showToast(
        "Calendar",
        "Booking added to your calendar."
    );

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    delay
) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout =
            setTimeout(
                () => callback(...args),
                delay
            );

    };

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    document
        .getElementById("clearSearch")
        .addEventListener(
            "click",
            () => {

                searchInput.value = "";

                document.getElementById("searchSuggestions").classList.remove("open");

                filteredStations =
                    [...stations];

                renderStations();

            }
        );


    document
        .getElementById("profileBtn")
        .addEventListener(
            "click",
            () => {

                openSettings();

            }
        );

    document
        .getElementById("ordersBtn")
        .addEventListener("click", openOrders);

    document
        .getElementById("logoutBtn")
        .addEventListener("click", logout);

    document
        .getElementById("savedPlacesBtn")
        .addEventListener("click", () => {
            document.getElementById("savedPlacesPanel").classList.toggle("open");
        });

    document
        .getElementById("closeSavedPlaces")
        .addEventListener("click", () => {
            document.getElementById("savedPlacesPanel").classList.remove("open");
        });

    document
        .querySelectorAll(".saved-place-actions button")
        .forEach(button => {
            button.addEventListener("click", () => saveMapCenter(button.dataset.place));
        });

}


/* =========================================================
   AUTHENTICATION & ACCOUNT
   ========================================================= */

function initializeAuth() {

    const savedSession = localStorage.getItem("voltmap-session");

    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            applyCurrentUser();
            document.getElementById("authOverlay").classList.add("hidden");
        }
        catch {
            localStorage.removeItem("voltmap-session");
        }
    }

    document.getElementById("authForm").addEventListener("submit", submitAuth);
    document.getElementById("authModeToggle").addEventListener("click", toggleAuthMode);
    document.getElementById("forgotPasswordBtn").addEventListener("click", forgotPassword);

}


function toggleAuthMode() {

    const form = document.getElementById("authForm");
    const signUp = !form.dataset.mode || form.dataset.mode === "signin";

    form.dataset.mode = signUp ? "signup" : "signin";
    document.querySelector(".auth-name-field").hidden = !signUp;
    document.getElementById("authName").required = signUp;
    document.getElementById("authTitle").textContent = signUp ? "Create your account" : "Sign in to VoltMap";
    document.getElementById("authEyebrow").textContent = signUp ? "GET STARTED" : "WELCOME BACK";
    document.getElementById("authDescription").textContent = signUp ? "Create an account to manage bookings and payments." : "Choose your account type and sign in to find a charger.";
    document.getElementById("authSubmit").textContent = signUp ? "Create account" : "Sign in";
    document.getElementById("authModeToggle").textContent = signUp ? "Already have an account? Sign in" : "Create an account";
    document.getElementById("authError").textContent = "";
    document.getElementById("authPassword").autocomplete = signUp ? "new-password" : "current-password";

}


async function submitAuth(event) {

    event.preventDefault();

    const form = event.currentTarget;
    const signUp = form.dataset.mode === "signup";
    const role = document.getElementById("authRole").value;
    const email = document.getElementById("authEmail").value.trim().toLowerCase();
    const password = document.getElementById("authPassword").value;
    const name = document.getElementById("authName").value.trim();
    const error = document.getElementById("authError");

    if (!email || !email.includes("@") || password.length < 6 || (signUp && !name)) {
        error.textContent = "Enter a valid email, a password of at least 6 characters, and every required field.";
        return;
    }

    let account;

    try {

        const result = await apiRequest(
            signUp ? "/auth/signup" : "/auth/login",
            {
                method: "POST",
                body: JSON.stringify({ name, email, password, role })
            }
        );

        account = result.data;

    }
    catch (backendError) {

        if (backendError.isApiError) {
            error.textContent = backendError.message;
            return;
        }

        // Offline fallback keeps the static preview usable. The API path above
        // is used whenever the backend server is running.
        const accounts = JSON.parse(localStorage.getItem("voltmap-accounts") || "[]");

        if (signUp) {
            if (accounts.some(item => item.email === email && item.role === role)) {
                error.textContent = "An account with this email and role already exists. Sign in instead.";
                return;
            }

            account = { name, email, role, password };
            accounts.push(account);
            localStorage.setItem("voltmap-accounts", JSON.stringify(accounts));
        }
        else {
            account = accounts.find(item => item.email === email && item.role === role && item.password === password);
            if (!account) {
                error.textContent = "Start the backend server or create an offline preview account.";
                return;
            }
        }

    }

    currentUser = { name: account.name, email: account.email, role: account.role };
    localStorage.setItem("voltmap-session", JSON.stringify(currentUser));
    applyCurrentUser();
    document.getElementById("authOverlay").classList.add("hidden");
    showToast("Welcome to VoltMap", `Signed in as ${currentUser.role}.`);

}


function forgotPassword() {

    const email = document.getElementById("authEmail").value.trim();

    if (email) {
        syncToBackend("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email })
        });
    }

    document.getElementById("authError").textContent = email
        ? "Password-reset request recorded. Connect an email provider to send the reset link."
        : "Enter your email address first to reset your password.";

}


function applyCurrentUser() {

    if (!currentUser) return;

    const initials = currentUser.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
    document.querySelector(".avatar").textContent = initials;
    document.querySelector("#profileBtn span").textContent = currentUser.name.split(" ")[0];

}


function openSettings() {

    if (!currentUser) return;

    document.getElementById("settingsUser").innerHTML = `
        <strong>${currentUser.name}</strong>
        <span>${currentUser.email} · ${currentUser.role === "admin" ? "Administrator" : "Driver"}</span>
    `;
    document.getElementById("settingsModal").classList.add("open");

}


function logout() {

    localStorage.removeItem("voltmap-session");
    currentUser = null;
    document.getElementById("settingsModal").classList.remove("open");
    document.getElementById("authForm").reset();
    if (document.getElementById("authForm").dataset.mode === "signup") {
        toggleAuthMode();
    }
    document.getElementById("authError").textContent = "";
    document.getElementById("authOverlay").classList.remove("hidden");

}


/* =========================================================
   MY ORDERS & RATINGS
   ========================================================= */

function openOrders() {

    renderOrders();
    document.getElementById("ordersModal").classList.add("open");

}


function getUserOrders() {

    if (!currentUser) return [];
    return JSON.parse(localStorage.getItem("voltmap-orders") || "[]")
        .filter(order => order.userEmail === currentUser.email);

}


function renderOrders() {

    const orders = getUserOrders();
    const content = document.getElementById("ordersContent");

    if (!orders.length) {
        content.innerHTML = `<div class="orders-empty"><i class="fa-regular fa-calendar-xmark"></i><p>No bookings yet. Your paid reservations will appear here.</p></div>`;
        return;
    }

    content.innerHTML = orders.map(order => `
        <article class="order-card">
            <div class="order-card-head">
                <div><h3>${order.stationName}</h3><p>${order.id} · ${order.chargerName}</p></div>
                <span class="order-status">${order.status}</span>
            </div>
            <div class="order-meta"><span><i class="fa-regular fa-calendar"></i> ${order.date} · ${order.time}</span><span>₹${order.amount} · ${order.paymentMethod}</span></div>
            <div class="rating-row">
                <span>${order.rating ? `Your rating: ${order.rating}/5` : "Rate this charging session"}</span>
                <div class="rating-stars">
                    ${[1, 2, 3, 4, 5].map(star => `<button onclick="rateOrder('${order.id}', ${star})" aria-label="Rate ${star} stars">${star <= (order.rating || 0) ? "★" : "☆"}</button>`).join("")}
                </div>
            </div>
        </article>
    `).join("");

}


function rateOrder(id, rating) {

    const orders = JSON.parse(localStorage.getItem("voltmap-orders") || "[]");
    const order = orders.find(item => item.id === id && item.userEmail === currentUser?.email);
    if (!order) return;

    order.rating = rating;
    localStorage.setItem("voltmap-orders", JSON.stringify(orders));

    syncToBackend(`/orders/${id}/rating`, {
        method: "PATCH",
        body: JSON.stringify({ userEmail: currentUser.email, rating })
    });

    renderOrders();
    showToast("Thank you for your rating", `${rating}/5 saved for ${order.stationName}.`);

}


/* =========================================================
   SOCKET.IO — READY FOR NODE.JS
   ========================================================= */

/*

When your Node.js server is ready:

const socket = io("http://localhost:5000");

socket.on("station:availability", data => {

    const station =
        stations.find(
            s => s.id === data.stationId
        );

    if (!station) return;

    station.available =
        data.availableSlots;

    renderStations();

});

*/


/* =========================================================
   FUTURE API FUNCTIONS
   ========================================================= */

/*

async function fetchStations() {

    const response =
        await fetch(
            `${API_BASE}/stations`
        );

    const data =
        await response.json();

    stations.length = 0;

    stations.push(...data);

    filteredStations =
        [...stations];

    renderStations();

}


async function createBooking(data) {

    const token =
        localStorage.getItem(
            "voltmap-token"
        );

    const response =
        await fetch(
            `${API_BASE}/bookings`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    JSON.stringify(data)
            }
        );

    return response.json();

}

*/
