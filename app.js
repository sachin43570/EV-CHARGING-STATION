/* =========================================================
   VOLTMAP — SMART EV CHARGING PLATFORM
   Frontend version
   ========================================================= */

const API_BASE = "https://ev-charging-station-0lbc.onrender.com";

/* =========================================================
   FIXED ADMIN ACCOUNT
   Only this single email/password combination may ever sign
   in as admin, and no new admin accounts can be created from
   the sign-up form. Change these two values to your own —
   for a real deployment, move this check to the backend
   instead of trusting it purely on the frontend.
   ========================================================= */
const ADMIN_CREDENTIALS = {
    email: "sachinmaurya43570@gmail.com",
    password: "Sachin@9580"
};

/* =========================================================
   GOOGLE SIGN-IN
   Replace with your OAuth 2.0 Client ID from
   https://console.cloud.google.com/apis/credentials
   ========================================================= */
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com";

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (parseError) {
        payload = {};
    }

    if (!response.ok) {
        const error = new Error(payload.message || `Request failed (${response.status})`);
        error.isApiError = true;
        throw error;
    }

    return payload;
}

function syncToBackend(path, options) {
    apiRequest(path, options).catch(() => {
        // Browser/localStorage remains usable when backend is unavailable.
    });
}

/* =========================================================
   DEMO STATION DATA
   ========================================================= */

const stations = [
    { id: 1, name: "VoltMap Energy Hub", operator: "VoltMap Energy", address: "Whitefield Main Road, Bengaluru", lat: 12.9698, lng: 77.7500, chargerType: "DC", connector: "CCS2", power: 120, price: 18, available: 6, total: 8, rating: 4.8, reviews: 126, open: true, amenities: ["cafe", "parking", "wifi", "restroom"], distance: 1.8, favorite: false },
    { id: 2, name: "ChargeZone Whitefield", operator: "ChargeZone", address: "ITPL Main Road, Whitefield", lat: 12.9850, lng: 77.7350, chargerType: "DC", connector: "CCS2", power: 150, price: 20, available: 2, total: 6, rating: 4.7, reviews: 98, open: true, amenities: ["parking", "wifi"], distance: 2.4, favorite: false },
    { id: 3, name: "Tata Power Charging Hub", operator: "Tata Power", address: "Brookefield, Bengaluru", lat: 12.9692, lng: 77.7160, chargerType: "DC", connector: "CCS2", power: 60, price: 18, available: 4, total: 6, rating: 4.6, reviews: 87, open: true, amenities: ["cafe", "parking", "restroom"], distance: 3.1, favorite: false },
    { id: 4, name: "Ather Grid Station", operator: "Ather", address: "Marathahalli, Bengaluru", lat: 12.9590, lng: 77.6970, chargerType: "AC", connector: "Type2", power: 7.4, price: 12, available: 5, total: 6, rating: 4.5, reviews: 63, open: true, amenities: ["parking", "wifi"], distance: 4.5, favorite: false },
    { id: 5, name: "EVRE Fast Charge", operator: "EVRE", address: "Bellandur, Bengaluru", lat: 12.9300, lng: 77.6780, chargerType: "DC", connector: "CCS2", power: 180, price: 22, available: 1, total: 4, rating: 4.4, reviews: 45, open: true, amenities: ["parking", "cafe"], distance: 6.2, favorite: false },
    { id: 6, name: "Shell Recharge Point", operator: "Shell", address: "Outer Ring Road, Bengaluru", lat: 12.9400, lng: 77.6900, chargerType: "DC", connector: "CHAdeMO", power: 100, price: 21, available: 0, total: 4, rating: 4.2, reviews: 38, open: true, amenities: ["cafe", "parking", "restroom"], distance: 5.3, favorite: false },
    { id: 7, name: "GreenCharge Koramangala", operator: "GreenCharge", address: "Koramangala 5th Block", lat: 12.9352, lng: 77.6245, chargerType: "DC", connector: "CCS2", power: 100, price: 16, available: 3, total: 5, rating: 4.9, reviews: 211, open: true, amenities: ["cafe", "wifi", "parking"], distance: 8.1, favorite: false },
    { id: 8, name: "BESCOM EV Station", operator: "BESCOM", address: "Indiranagar, Bengaluru", lat: 12.9719, lng: 77.6412, chargerType: "AC", connector: "Type2", power: 22, price: 10, available: 4, total: 4, rating: 4.1, reviews: 32, open: true, amenities: ["parking"], distance: 7.4, favorite: false },
    { id: 9, name: "Jio-bp Pulse", operator: "Jio-bp", address: "Old Airport Road", lat: 12.9600, lng: 77.6500, chargerType: "DC", connector: "CCS2", power: 120, price: 19, available: 5, total: 6, rating: 4.7, reviews: 119, open: true, amenities: ["cafe", "parking", "restroom", "wifi"], distance: 6.8, favorite: false },
    { id: 10, name: "Mahadevapura Charge Point", operator: "Statiq", address: "Phoenix Marketcity Road, Mahadevapura", lat: 12.9948, lng: 77.6964, chargerType: "DC", connector: "CCS2", power: 80, price: 17, available: 4, total: 6, rating: 4.6, reviews: 74, open: true, amenities: ["cafe", "parking", "restroom"], distance: 5.1, favorite: false },
    { id: 11, name: "HSR Layout EV Hub", operator: "Bolt.Earth", address: "27th Main Road, HSR Layout", lat: 12.9116, lng: 77.6389, chargerType: "DC", connector: "CCS2", power: 120, price: 18, available: 3, total: 8, rating: 4.5, reviews: 91, open: true, amenities: ["cafe", "wifi", "parking"], distance: 10.4, favorite: false },
    { id: 12, name: "Jayanagar Green Charge", operator: "GreenCharge", address: "4th Block, Jayanagar", lat: 12.9250, lng: 77.5938, chargerType: "AC", connector: "Type2", power: 22, price: 11, available: 6, total: 8, rating: 4.4, reviews: 58, open: true, amenities: ["parking", "wifi", "restroom"], distance: 12.7, favorite: false },
    { id: 13, name: "Yelahanka Fast Charge", operator: "Tata Power", address: "New Town, Yelahanka", lat: 13.1007, lng: 77.5963, chargerType: "DC", connector: "CCS2", power: 150, price: 20, available: 2, total: 6, rating: 4.7, reviews: 104, open: true, amenities: ["cafe", "parking", "restroom"], distance: 19.3, favorite: false },
    { id: 14, name: "Sarjapur Road EV Lounge", operator: "ChargeZone", address: "Sarjapur Main Road, Bengaluru", lat: 12.9103, lng: 77.6880, chargerType: "DC", connector: "CHAdeMO", power: 100, price: 19, available: 5, total: 8, rating: 4.6, reviews: 83, open: true, amenities: ["cafe", "parking", "wifi", "restroom"], distance: 13.4, favorite: false },
    { id: 15, name: "MG Road City Charger", operator: "BESCOM", address: "MG Road, Bengaluru", lat: 12.9756, lng: 77.6065, chargerType: "DC", connector: "CCS2", power: 60, price: 16, available: 1, total: 4, rating: 4.3, reviews: 67, open: true, amenities: ["cafe", "parking", "wifi"], distance: 9.2, favorite: false }
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
let currentPaymentAmount = 0;

/* =========================================================
   DOM
   ========================================================= */

const stationList = document.getElementById("stationList");
const stationCount = document.getElementById("stationCount");
const mapStationCount = document.getElementById("mapStationCount");
const searchInput = document.getElementById("searchInput");
const stationDrawer = document.getElementById("stationDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const stationDetails = document.getElementById("stationDetails");
const filterModal = document.getElementById("filterModal");
const bookingModal = document.getElementById("bookingModal");
const notificationPanel = document.getElementById("notificationPanel");
const toast = document.getElementById("toast");

/* =========================================================
   FAVORITES PERSISTENCE
   (previously favorites reset on every reload — never saved)
   ========================================================= */

function loadFavorites() {
    const saved = JSON.parse(localStorage.getItem("voltmap-favorites") || "[]");
    stations.forEach(s => { s.favorite = saved.includes(s.id); });
}

function persistFavorites() {
    const favoriteIds = stations.filter(s => s.favorite).map(s => s.id);
    localStorage.setItem("voltmap-favorites", JSON.stringify(favoriteIds));
}

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadFavorites();

    try { initializeMap(); }
    catch (mapError) { console.error("Map failed to initialize:", mapError); }

    try { renderStations(); }
    catch (renderError) { console.error("Station list failed to render:", renderError); }

    try { setupEvents(); }
    catch (eventsError) { console.error("UI events failed to bind:", eventsError); }

    updateStats();

    try { initializeTheme(); }
    catch (themeError) { console.error("Theme failed to initialize:", themeError); }

    try { initializeAuth(); }
    catch (authError) { console.error("Auth failed to initialize:", authError); }

    simulateLiveUpdates();
});

/* =========================================================
   MAP
   ========================================================= */

function initializeMap() {
    map = L.map("map", { zoomControl: false }).setView([12.9716, 77.5946], 12);
    updateMapTheme();
    renderMarkers();
    renderSavedPlaces();
}

function updateMapTheme() {
    if (!map) return;

    if (map.baseLayer) map.removeLayer(map.baseLayer);

    const light = document.body.classList.contains("light");

    map.baseLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
        subdomains: "abc"
    }).addTo(map);

    document.getElementById("map").classList.toggle("light-map", light);
}

/* =========================================================
   CUSTOM MARKER
   ========================================================= */

function createMarkerIcon(station) {
    let color = "#00e5a0";
    if (station.available === 0) color = "#ff5c5c";
    else if (station.available <= 2) color = "#ffb020";

    return L.divIcon({
        className: "custom-marker",
        html: `
            <div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
                background:${color};border:3px solid ${document.body.classList.contains("light") ? "#ffffff" : "#071018"};
                box-shadow:0 0 18px ${color}55;display:flex;align-items:center;justify-content:center;">
                <span style="transform:rotate(45deg);color:#071018;font-weight:900;font-size:13px;">⚡</span>
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
    if (!map) return;

    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};

    filteredStations.forEach(station => {
        const marker = L.marker([station.lat, station.lng], { icon: createMarkerIcon(station) }).addTo(map);

        marker.bindPopup(`
            <div>
                <div class="popup-title">${station.name}</div>
                <div style="color:#94a3ad;font-size:10px;margin-top:4px;">${station.address}</div>
                <div class="popup-status">● ${station.available}/${station.total} available</div>
                <div style="margin-top:5px;font-size:10px;">⚡ ${station.power} kW &nbsp; • &nbsp; ₹${station.price}/kWh</div>
                <button class="popup-book" onclick="openStation(${station.id})">View station</button>
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
            <div style="padding:40px 20px;text-align:center;">
                <div style="width:55px;height:55px;display:grid;place-items:center;margin:auto;
                    border-radius:15px;background:var(--card);color:var(--muted);font-size:20px;">
                    <i class="fa-solid fa-plug-circle-xmark"></i>
                </div>
                <h3 style="font-family:var(--font-display);font-size:15px;margin:15px 0 7px;">No chargers found</h3>
                <p style="color:var(--muted);font-size:10px;line-height:1.6;">
                    Try changing your filters or searching another location.
                </p>
                <button class="btn-primary" onclick="resetFilters()">Reset filters</button>
            </div>
        `;
        updateStats();
        renderMarkers();
        return;
    }

    filteredStations.forEach(station => {
        const card = document.createElement("div");
        card.className = "station-card";
        card.dataset.id = station.id;

        let statusClass = "available";
        let statusText = "AVAILABLE";

        if (station.available === 0) {
            statusClass = "full";
            statusText = "FULL";
        } else if (station.available <= 2) {
            statusClass = "limited";
            statusText = "LIMITED";
        }

        const percentage = (station.available / station.total) * 100;

        card.innerHTML = `
            <div class="station-top">
                <div>
                    <div class="station-name">${station.name}</div>
                    <div class="station-address">${station.address}</div>
                </div>
                <div class="status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
                </div>
            </div>

            <div class="station-info-row">
                <span class="info-pill">${station.chargerType}</span>
                <span class="info-pill">${station.connector}</span>
                <span class="info-pill">${station.power} kW</span>
                <span class="info-pill">${station.distance} km</span>
                <span class="info-pill"><i class="fa-regular fa-clock"></i> ${getWaitingTime(station)}</span>
            </div>

            <div class="availability">
                <div class="availability-head">
                    <span>Charger availability</span>
                    <strong>${station.available}/${station.total}</strong>
                </div>
                <div class="availability-bar">
                    <div class="availability-progress" style="width:${percentage}%;background:
                        ${station.available === 0 ? "var(--red)" : station.available <= 2 ? "var(--yellow)" : "var(--green)"};">
                    </div>
                </div>
            </div>

            <div class="station-bottom">
                <div>
                    <div class="price">₹${station.price}<span>/kWh</span></div>
                    <div class="rating">★ ${station.rating}
                        <span style="color:var(--faint);font-size:8px;">(${station.reviews})</span>
                    </div>
                </div>

                <div class="station-actions">
                    <button class="favorite-btn ${station.favorite ? "active" : ""}"
                        onclick="event.stopPropagation(); toggleFavorite(${station.id})">
                        <i class="${station.favorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
                    </button>
                    <button type="button" class="book-btn station-book" data-station-id="${station.id}">
                        Book now
                    </button>
                </div>
            </div>
        `;

        card.addEventListener("click", () => openStation(station.id));

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
    const station = stations.find(s => s.id === id);
    if (!station) return;

    selectedStation = station;

    stationDetails.innerHTML = `
        <div class="drawer-hero">
            <div class="drawer-operator">${station.operator}</div>
            <h2 class="drawer-title">${station.name}</h2>
            <div class="drawer-rating">★ ${station.rating}
                <span style="color:var(--faint)">(${station.reviews} reviews)</span>
            </div>
            <div class="drawer-address">
                <i class="fa-solid fa-location-dot"></i> ${station.address}
                <br><br>
                <span style="color:var(--green)">${station.distance} km away</span>
            </div>
        </div>

        <div class="drawer-status-card">
            <div class="drawer-stat">
                <span>Available</span>
                <strong style="color:${station.available === 0 ? "var(--red)" : "var(--green)"};">
                    ${station.available}/${station.total}
                </strong>
            </div>
            <div class="drawer-stat">
                <span>Power</span>
                <strong>${station.power} kW</strong>
            </div>
            <div class="drawer-stat">
                <span>Price</span>
                <strong>₹${station.price}</strong>
            </div>
        </div>

        <div class="drawer-section">
            <h4>Available chargers</h4>
            <div class="charger-list">${createChargers(station)}</div>
        </div>

        <div class="drawer-section">
            <h4>Amenities</h4>
            <div class="amenity-grid">${createAmenities(station)}</div>
        </div>

        <div class="drawer-section">
            <h4>Station information</h4>
            <div style="padding:13px;background:var(--card);border:1px solid var(--border);border-radius:9px;
                color:var(--muted);font-size:10px;line-height:1.8;">
                <div><strong style="color:var(--text)">Status:</strong> ${station.open ? "Open 24/7" : "Closed"}</div>
                <div><strong style="color:var(--text)">Connector:</strong> ${station.connector}</div>
                <div><strong style="color:var(--text)">Last updated:</strong> Just now</div>
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
            <h4>While you charge</h4>
            <div class="nearby-recommendations">${createRecommendations(station)}</div>
        </div>

        <div class="drawer-section">
            <h4>Station support</h4>
            ${createStationContact(station)}
        </div>

        <div class="drawer-buttons">
            <button type="button" class="btn-secondary drawer-directions" data-station-id="${station.id}">
                <i class="fa-solid fa-route"></i> Directions
            </button>
            <button type="button" class="btn-primary drawer-book" data-station-id="${station.id}"
                ${station.available === 0 ? "disabled" : ""}>
                <i class="fa-regular fa-calendar"></i> Book charger
            </button>
        </div>
    `;

    stationDetails.querySelector(".drawer-directions")?.addEventListener("click", () => getDirections(station.id));
    stationDetails.querySelector(".drawer-book")?.addEventListener("click", () => startBooking(station.id));

    stationDrawer.classList.add("open");
    drawerOverlay.classList.add("open");

    if (markers[id]) {
        map.setView([station.lat, station.lng], 15, { animate: true });
        markers[id].openPopup();
    }

    highlightCard(id);
}

/* =========================================================
   CHARGERS
   ========================================================= */

function createChargers(station) {
    const count = Math.min(station.total, 4);
    let html = "";

    for (let i = 1; i <= count; i++) {
        const active = i <= station.available;
        html += `
            <div class="charger-item">
                <div class="charger-item-left">
                    <div class="charger-icon"><i class="fa-solid fa-bolt"></i></div>
                    <div>
                        <div class="charger-name">Charger ${String(i).padStart(2, "0")}</div>
                        <div class="charger-meta">${station.connector} • ${station.power} kW</div>
                    </div>
                </div>
                <div class="charger-status" style="color:${active ? "var(--green)" : "var(--red)"};">
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
        cafe: ["fa-mug-hot", "Cafe"],
        parking: ["fa-square-parking", "Parking"],
        wifi: ["fa-wifi", "Wi-Fi"],
        restroom: ["fa-restroom", "Restroom"]
    };

    return station.amenities.map(a => {
        const item = names[a];
        if (!item) return "";
        return `
            <div class="amenity">
                <i class="fa-solid ${item[0]}" style="color:var(--green);margin-right:5px;"></i>
                ${item[1]}
            </div>
        `;
    }).join("");
}

/* =========================================================
   RECOMMENDATIONS
   ========================================================= */

function createRecommendations(station) {
    const places = [
        ["fa-mug-hot", "Cafe", `Brew & Bean · ${station.distance < 4 ? "3" : "6"} min walk`],
        ["fa-hotel", "Hotel", "Comfort stay & lobby workspace nearby"],
        ["fa-store", "Nearby mall", "Shopping, dining and essentials"]
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
   TRAVEL / RATINGS / SUPPORT
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
    const toRadians = value => (value * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createTravelDetails(station) {
    const eta = getTravelTime(station);
    const wait = getWaitingTime(station);

    return `
        <div class="travel-overview">
            <div class="travel-stat">
                <span>Estimated drive</span>
                <strong>${eta}</strong>
            </div>
            <div class="travel-stat">
                <span>Expected wait</span>
                <strong>${wait}</strong>
            </div>
        </div>

        <button class="route-choice recommended" onclick="startSuggestedRoute(${station.id}, 'best')">
            <div>
                <strong>Best route · recommended</strong>
                <span>Fastest drive estimate · ${eta}</span>
            </div>
            <i class="fa-solid fa-route"></i>
        </button>

        <button class="route-choice" onclick="startSuggestedRoute(${station.id}, 'alternate')">
            <div>
                <strong>Alternate route</strong>
                <span>May be useful if traffic is heavy</span>
            </div>
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
                ${[1, 2, 3, 4, 5].map(star => `
                    <button onclick="rateStation(${station.id}, ${star})" aria-label="Rate ${star} stars">
                        ${star <= rating ? "★" : "☆"}
                    </button>
                `).join("")}
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
            <strong style="color:var(--text)">Station admin desk</strong>
            <br>
            <i class="fa-solid fa-phone"></i>
            <a href="tel:+918055550${contactCode}">+91 80 5555 0${contactCode}</a>
            <br>
            <i class="fa-regular fa-envelope"></i>
            <a href="mailto:station${contactCode}@voltmap.demo">station${contactCode}@voltmap.demo</a>
            <br>
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

    const station = stations.find(s => s.id === id);

    if (!station || station.available === 0) {
        showToast("Unavailable", "No charger is currently available.");
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
    const content = document.getElementById("bookingContent");
    updateBookingProgress();

    if (bookingStep === 1) {
        content.innerHTML = `
            <h2 class="booking-title">Choose your charger</h2>
            <p class="booking-subtitle">Select an available connector at ${selectedStation.name}.</p>
            <div class="charger-choice">${createBookingChargers()}</div>
            <button type="button" class="btn-primary full-btn booking-next" style="margin-top:18px">
                Continue <i class="fa-solid fa-arrow-right"></i>
            </button>
        `;
    } else if (bookingStep === 2) {
        content.innerHTML = `
            <h2 class="booking-title">Choose date & time</h2>
            <p class="booking-subtitle">Select when you want to charge.</p>
            <div class="booking-form">
                <label>Date
                    <input type="date" id="bookingDate" min="${getToday()}" value="${getToday()}">
                </label>
                <label>Time
                    <input type="time" id="bookingTime" value="19:30">
                </label>
                <button type="button" class="btn-primary booking-next">
                    Continue <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    } else if (bookingStep === 3) {
        content.innerHTML = `
            <h2 class="booking-title">Select your vehicle</h2>
            <p class="booking-subtitle">Choose a vehicle for this charging session.</p>
            <div class="booking-form">
                <label>Vehicle
                    <select id="vehicleSelect">
                        <option>Tata Nexon EV</option>
                        <option>Hyundai Ioniq 5</option>
                        <option>MG ZS EV</option>
                        <option>Add new vehicle</option>
                    </select>
                </label>
                <label>Vehicle number
                    <input id="vehicleNumber" placeholder="KA05MX1234">
                </label>
                <button type="button" class="btn-primary booking-next">
                    Review booking <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    } else {
        const date = bookingDraft.date || getToday();
        const time = bookingDraft.time || "19:30";

        content.innerHTML = `
            <h2 class="booking-title">Review booking</h2>
            <p class="booking-subtitle">Check your details before confirming.</p>
            <div class="booking-summary">
                <div class="summary-line"><span>Station</span><strong>${selectedStation.name}</strong></div>
                <div class="summary-line"><span>Charger</span><strong>${selectedCharger?.name || "CCS2"}</strong></div>
                <div class="summary-line"><span>Date</span><strong>${date}</strong></div>
                <div class="summary-line"><span>Time</span><strong>${time}</strong></div>
                <div class="summary-line"><span>Vehicle</span><strong>${bookingDraft.vehicle || "Tata Nexon EV"}</strong></div>
                <div class="summary-line"><span>Estimated energy</span><strong>18.4 kWh</strong></div>
                <div class="summary-line summary-total">
                    <span>Estimated cost</span>
                    <strong>₹${Math.round(18.4 * selectedStation.price)}</strong>
                </div>
            </div>
            <button type="button" class="btn-primary full-btn open-payment">
                Continue to payment <i class="fa-solid fa-arrow-right"></i>
            </button>
        `;
    }

    bindBookingStepEvents();
}

function bindBookingStepEvents() {
    const content = document.getElementById("bookingContent");

    content.querySelectorAll(".booking-charger").forEach(button => {
        button.addEventListener("click", () => selectCharger(button, Number(button.dataset.charger)));
    });

    content.querySelector(".booking-next")?.addEventListener("click", bookingNext);
    content.querySelector(".open-payment")?.addEventListener("click", openPayment);
}

/* =========================================================
   BOOKING CHARGERS
   ========================================================= */

function createBookingChargers() {
    const count = Math.min(selectedStation.available, 4);
    let html = "";

    for (let i = 1; i <= count; i++) {
        html += `
            <button type="button" class="booking-charger" data-charger="${i}">
                <span class="choice-name">Charger ${i}</span>
                <span class="choice-meta">${selectedStation.connector} • ${selectedStation.power} kW</span>
            </button>
        `;
    }

    return html;
}

function selectCharger(button, number) {
    document.querySelectorAll(".charger-choice button").forEach(btn => btn.classList.remove("selected"));
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
        showToast("Select charger", "Please select an available charger.");
        return;
    }

    if (bookingStep === 2) {
        const date = document.getElementById("bookingDate");
        const time = document.getElementById("bookingTime");

        if (!date?.value || !time?.value) {
            showToast("Missing information", "Select date and time.");
            return;
        }

        bookingDraft.date = date.value;
        bookingDraft.time = time.value;
    }

    if (bookingStep === 3) {
        const vehicle = document.getElementById("vehicleSelect");
        const vehicleNumber = document.getElementById("vehicleNumber");

        if (!vehicle || !vehicleNumber?.value.trim()) {
            showToast("Vehicle number required", "Enter your vehicle number to continue.");
            return;
        }

        bookingDraft.vehicle = vehicle.value;
        bookingDraft.vehicleNumber = vehicleNumber.value.trim().toUpperCase();
    }

    bookingStep++;
    renderBooking();
}

/* =========================================================
   PAYMENT MODAL
   ========================================================= */

function ensurePaymentModal() {
    let modal = document.getElementById("paymentModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "paymentModal";
    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal payment-modal" style="position:relative;">
            <button class="modal-close" id="paymentCloseBtn" type="button"
                style="position:absolute;top:17px;right:17px;z-index:5;">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div class="booking-progress">
                <div class="progress-step complete"><span>1</span>Details</div>
                <div class="progress-line complete"></div>
                <div class="progress-step complete"><span>2</span>Review</div>
                <div class="progress-line complete"></div>
                <div class="progress-step active"><span>3</span>Payment</div>
                <div class="progress-line"></div>
                <div class="progress-step"><span>4</span>Confirm</div>
            </div>

            <div id="paymentContent"></div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", event => {
        if (event.target === modal) modal.classList.remove("open");
    });

    document.getElementById("paymentCloseBtn")?.addEventListener("click", () => {
        modal.classList.remove("open");
        bookingModal.classList.add("open");
    });

    return modal;
}

/* =========================================================
   PAYMENT
   ========================================================= */

function openPayment() {
    if (!bookingDraft.vehicleNumber) {
        showToast("Vehicle number required", "Enter your vehicle number before payment.");
        return;
    }

    ensurePaymentModal();
    bookingModal.classList.remove("open");
    renderPayment();
    document.getElementById("paymentModal").classList.add("open");
}

/* =========================================================
   UPDATE BOOKING PROGRESS
   ========================================================= */

function updateBookingProgress() {
    document.querySelectorAll(".booking-progress .progress-step").forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.toggle("active", stepNumber === bookingStep);
        step.classList.toggle("complete", stepNumber < bookingStep);
    });

    document.querySelectorAll(".booking-progress .progress-line").forEach((line, index) => {
        line.classList.toggle("complete", index + 1 < bookingStep);
    });
}

/* =========================================================
   PAYMENT RENDER
   ========================================================= */

function renderPayment() {
    if (!selectedStation) return;

    const amount = Math.round(18.4 * selectedStation.price);
    currentPaymentAmount = amount;

    const paymentModal = ensurePaymentModal();
    const paymentContent = paymentModal.querySelector("#paymentContent");

    if (!paymentContent) {
        console.error("Payment content element not found.");
        return;
    }

    paymentContent.innerHTML = `
        <h2 class="booking-title">Complete payment</h2>
        <p class="booking-subtitle">Choose your preferred payment method.</p>

        <div class="payment-total" style="display:flex;justify-content:space-between;gap:15px;align-items:center;
            padding:15px;margin-bottom:16px;background:var(--card);border:1px solid var(--border);border-radius:12px;">
            <span>
                ${selectedStation.name}
                <br>
                <small style="color:var(--muted);">
                    ${selectedCharger?.name || "Charger"} · ${bookingDraft.date || getToday()}, ${bookingDraft.time || "19:30"}
                </small>
            </span>
            <strong style="font-size:20px;">₹${amount}</strong>
        </div>

        <div class="payment-methods">
            <button type="button" class="payment-method ${selectedPaymentMethod === "qr" ? "active" : ""}" data-payment-method="qr">
                <i class="fa-solid fa-qrcode"></i> QR / UPI
            </button>
            <button type="button" class="payment-method ${selectedPaymentMethod === "upi" ? "active" : ""}" data-payment-method="upi">
                <i class="fa-solid fa-mobile-screen"></i> UPI ID
            </button>
            <button type="button" class="payment-method ${selectedPaymentMethod === "card" ? "active" : ""}" data-payment-method="card">
                <i class="fa-regular fa-credit-card"></i> Card
            </button>
            <button type="button" class="payment-method ${selectedPaymentMethod === "razorpay" ? "active" : ""}" data-payment-method="razorpay">
                <i class="fa-solid fa-wallet"></i> Razorpay
            </button>
        </div>

        <div class="payment-method-content" style="margin-top:18px;">
            ${createPaymentMethodContent(amount)}
        </div>

        <p class="payment-note">
            Demo payment is available immediately.
            Razorpay requires the backend payment routes and Razorpay credentials.
        </p>

        <button type="button" class="btn-primary full-btn" id="payButton">
            ${selectedPaymentMethod === "razorpay"
                ? `<i class="fa-solid fa-credit-card"></i> Pay ₹${amount} with Razorpay`
                : `<i class="fa-solid fa-lock"></i> Pay ₹${amount} & reserve`}
        </button>

        <button type="button" class="btn-secondary full-btn" id="backToBookingPayment" style="margin-top:10px;">
            <i class="fa-solid fa-arrow-left"></i> Back to booking
        </button>
    `;

    paymentContent.querySelectorAll("[data-payment-method]").forEach(button => {
        button.addEventListener("click", () => selectPaymentMethod(button.dataset.paymentMethod));
    });

    paymentContent.querySelector("#payButton")?.addEventListener("click", processPayment);

    paymentContent.querySelector("#backToBookingPayment")?.addEventListener("click", () => {
        document.getElementById("paymentModal")?.classList.remove("open");
        bookingModal.classList.add("open");
    });
}

/* =========================================================
   PAYMENT METHOD CONTENT
   ========================================================= */

function createPaymentMethodContent(amount) {

    if (selectedPaymentMethod === "card") {
        return `
            <div class="payment-form" style="display:grid;gap:12px;">
                <label class="payment-field">Card number
                    <input id="cardNumber" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456">
                </label>
                <label class="payment-field">Name on card
                    <input id="cardName" placeholder="Cardholder name">
                </label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <label class="payment-field">Expiry
                        <input id="cardExpiry" placeholder="MM/YY" maxlength="5">
                    </label>
                    <label class="payment-field">CVV
                        <input id="cardCvv" type="password" inputmode="numeric" maxlength="4" placeholder="•••">
                    </label>
                </div>
            </div>
        `;
    }

    if (selectedPaymentMethod === "upi") {
        return `
            <div class="payment-form" style="display:grid;gap:12px;">
                <label class="payment-field">UPI ID
                    <input id="upiId" placeholder="name@bank">
                </label>
                <p class="payment-note" style="margin:0;">
                    Enter your UPI ID. You will approve the payment in your UPI application.
                </p>
            </div>
        `;
    }

    if (selectedPaymentMethod === "razorpay") {
        return `
            <div style="padding:20px;text-align:center;background:var(--card);border:1px solid var(--border);border-radius:12px;">
                <div style="width:62px;height:62px;margin:0 auto 14px;display:grid;place-items:center;
                    border-radius:50%;background:var(--green-soft);color:var(--green);font-size:25px;">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <strong>Secure Razorpay Checkout</strong>
                <p style="color:var(--muted);font-size:11px;line-height:1.6;margin:8px 0 0;">
                    You will be redirected to Razorpay's secure checkout to complete ₹${amount}.
                </p>
            </div>
        `;
    }

    // QR / UPI default — real scannable QR image, not a placeholder graphic.
    return `
        <div class="qr-payment" style="display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;
            padding:18px;background:var(--card);border:1px solid var(--border);border-radius:12px;">
            <div style="width:170px;height:170px;padding:8px;background:#ffffff;border-radius:10px;
                display:grid;place-items:center;margin:auto;">
                <img src="qr-code.jpeg" alt="Scan to pay" style="width:154px;height:154px;object-fit:contain;border-radius:6px;">
            </div>
            <div>
                <strong style="display:block;margin-bottom:7px;">Scan with any UPI app</strong>
                <p style="color:var(--muted);font-size:11px;line-height:1.6;margin:0;">
                    Amount: <strong>₹${amount}</strong>
                    <br><br>
                    Open Google Pay, PhonePe, Paytm or another UPI app and scan this code to pay.
                    Once you've completed the payment, tap "Pay & reserve" below to confirm your booking.
                </p>
            </div>
        </div>
    `;
}

/* =========================================================
   SELECT PAYMENT METHOD
   ========================================================= */

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    renderPayment();
}

/* =========================================================
   PROCESS PAYMENT
   ========================================================= */

async function processPayment() {
    if (!selectedStation) {
        showToast("Booking error", "Please select a charging station.");
        return;
    }

    if (!currentUser?.email) {
        showToast("Sign in required", "Please sign in before making a payment.");
        document.getElementById("paymentModal")?.classList.remove("open");
        document.getElementById("authOverlay")?.classList.remove("hidden");
        return;
    }

    if (selectedPaymentMethod === "razorpay") {
        await processRazorpayPayment();
        return;
    }

    if (selectedPaymentMethod === "upi") {
        const upi = document.getElementById("upiId")?.value.trim();

        if (!upi) {
            showToast("UPI ID required", "Enter your UPI ID to continue.");
            return;
        }
        if (!upi.includes("@")) {
            showToast("Invalid UPI ID", "Please enter a valid UPI ID.");
            return;
        }
    }

    if (selectedPaymentMethod === "card") {
        const card = document.getElementById("cardNumber")?.value.replace(/\s/g, "");
        const name = document.getElementById("cardName")?.value.trim();
        const expiry = document.getElementById("cardExpiry")?.value.trim();
        const cvv = document.getElementById("cardCvv")?.value.trim();

        if (!card || card.length < 12 || !name || !expiry || !cvv) {
            showToast("Card details required", "Enter the complete card details.");
            return;
        }
        if (cvv.length < 3) {
            showToast("Invalid CVV", "Enter a valid CVV.");
            return;
        }
    }

    const payButton = document.getElementById("payButton");

    if (payButton) {
        payButton.disabled = true;
        payButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing payment...`;
    }

    try {
        // DEMO PAYMENT — confirms QR / UPI / Card in the UI without moving real money.
        await delay(900);

        const bookingId = generateUniqueBookingId();
        const amount = Math.round(18.4 * selectedStation.price);

        const order = {
            id: bookingId,
            bookingId: bookingId,
            userEmail: currentUser.email,
            customerName: currentUser.name,
            stationId: selectedStation.id,
            stationName: selectedStation.name,
            address: selectedStation.address,
            chargerName: selectedCharger?.name || "Charger",
            connector: selectedStation.connector,
            power: selectedStation.power,
            date: bookingDraft.date || getToday(),
            time: bookingDraft.time || "19:30",
            vehicle: bookingDraft.vehicle || "Tata Nexon EV",
            vehicleNumber: bookingDraft.vehicleNumber,
            amount: amount,
            paymentMethod: selectedPaymentMethod.toUpperCase(),
            paymentStatus: "Paid",
            status: "Paid & confirmed",
            rating: null,
            createdAt: new Date().toISOString()
        };

        // Save locally first so My Orders works even if the backend is unavailable.
        const orders = JSON.parse(localStorage.getItem("voltmap-orders") || "[]");
        orders.unshift(order);
        localStorage.setItem("voltmap-orders", JSON.stringify(orders));

        try {
            await apiRequest("/orders", { method: "POST", body: JSON.stringify(order) });
        } catch (backendOrderError) {
            console.warn("Backend order save failed. Local order was retained.", backendOrderError);
        }

        try {
            const bookingResponse = await apiRequest("/bookings", {
                method: "POST",
                body: JSON.stringify({
                    stationId: selectedStation.id,
                    name: currentUser.name,
                    userEmail: currentUser.email,
                    vehicleNumber: bookingDraft.vehicleNumber,
                    date: bookingDraft.date || getToday(),
                    time: bookingDraft.time || "19:30",
                    durationMinutes: 60,
                    paymentMethod: selectedPaymentMethod.toUpperCase(),
                    amount: amount,
                    bookingId: bookingId
                })
            });

            if (bookingResponse?.data) {
                const backendBooking = bookingResponse.data;
                order.id = backendBooking.id || bookingId;
                order.bookingId = backendBooking.id || bookingId;
            }
        } catch (bookingError) {
            console.warn("Backend booking endpoint was not available. Local booking retained.", bookingError);
        }

        selectedStation.available = Math.max(0, selectedStation.available - 1);
        filteredStations = filteredStations.map(s => (s.id === selectedStation.id ? selectedStation : s));

        renderStations();
        document.getElementById("paymentModal")?.classList.remove("open");
        showPaymentSuccess(order);

    } catch (error) {
        console.error("Payment error:", error);

        if (payButton) {
            payButton.disabled = false;
            payButton.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₹${currentPaymentAmount} & reserve`;
        }

        showToast("Payment failed", error.message || "Please try again.");
    }
}

/* =========================================================
   RAZORPAY
   ========================================================= */

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve(window.Razorpay);
            return;
        }

        const existing = document.querySelector('script[data-razorpay-sdk="true"]');

        if (existing) {
            existing.addEventListener("load", () => resolve(window.Razorpay));
            existing.addEventListener("error", reject);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.dataset.razorpaySdk = "true";
        script.onload = () => resolve(window.Razorpay);
        script.onerror = () => reject(new Error("Razorpay checkout could not be loaded."));

        document.head.appendChild(script);
    });
}

async function processRazorpayPayment() {
    if (!selectedStation) return;

    const amount = Math.round(18.4 * selectedStation.price);
    const payButton = document.getElementById("payButton");

    if (payButton) {
        payButton.disabled = true;
        payButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Opening Razorpay...`;
    }

    try {
        const Razorpay = await loadRazorpayScript();

        const response = await apiRequest("/payment/create-order", {
            method: "POST",
            body: JSON.stringify({ amount: amount, currency: "INR", receipt: generateUniqueBookingId() })
        });

        if (!response?.success || !response?.data) {
            throw new Error(response?.message || "Unable to create Razorpay order.");
        }

        const razorpayOrder = response.data;

        const options = {
            key: razorpayOrder.keyId || response.keyId || "",
            amount: razorpayOrder.amount || amount * 100,
            currency: razorpayOrder.currency || "INR",
            name: "VoltMap",
            description: "EV Charging Reservation",
            order_id: razorpayOrder.orderId || razorpayOrder.id,
            prefill: { name: currentUser.name, email: currentUser.email },
            theme: { color: "#00e5a0" },
            handler: async function (paymentResponse) {
                await verifyRazorpayPayment(paymentResponse, amount);
            },
            modal: {
                ondismiss: () => {
                    const button = document.getElementById("payButton");
                    if (button) {
                        button.disabled = false;
                        button.innerHTML = `<i class="fa-solid fa-credit-card"></i> Pay ₹${amount} with Razorpay`;
                    }
                }
            }
        };

        if (!options.key) throw new Error("Razorpay key was not returned by the backend.");

        const checkout = new Razorpay(options);
        checkout.open();

    } catch (error) {
        console.error("Razorpay error:", error);

        if (payButton) {
            payButton.disabled = false;
            payButton.innerHTML = `<i class="fa-solid fa-credit-card"></i> Pay ₹${amount} with Razorpay`;
        }

        showToast("Razorpay unavailable", error.message || "Start the updated backend and configure Razorpay credentials.");
    }
}

async function verifyRazorpayPayment(paymentResponse, amount) {
    try {
        const verification = await apiRequest("/payment/verify", {
            method: "POST",
            body: JSON.stringify({
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySignature: paymentResponse.razorpay_signature,
                amount: amount,
                userEmail: currentUser.email,
                name: currentUser.name,
                stationId: selectedStation.id,
                vehicleNumber: bookingDraft.vehicleNumber,
                date: bookingDraft.date,
                time: bookingDraft.time,
                durationMinutes: 60
            })
        });

        if (!verification?.success) {
            throw new Error(verification?.message || "Payment verification failed.");
        }

        const serverOrder = verification.data || {};
        const bookingId = serverOrder.bookingId || serverOrder.id || generateUniqueBookingId();

        const order = {
            id: bookingId,
            bookingId: bookingId,
            userEmail: currentUser.email,
            customerName: currentUser.name,
            stationId: selectedStation.id,
            stationName: selectedStation.name,
            address: selectedStation.address,
            chargerName: selectedCharger?.name || "Charger",
            date: bookingDraft.date || getToday(),
            time: bookingDraft.time || "19:30",
            vehicle: bookingDraft.vehicle || "Tata Nexon EV",
            vehicleNumber: bookingDraft.vehicleNumber,
            amount: amount,
            paymentMethod: "RAZORPAY",
            paymentStatus: "Paid",
            status: "Paid & confirmed",
            razorpayOrderId: paymentResponse.razorpay_order_id,
            razorpayPaymentId: paymentResponse.razorpay_payment_id,
            createdAt: new Date().toISOString(),
            rating: null
        };

        const orders = JSON.parse(localStorage.getItem("voltmap-orders") || "[]");
        orders.unshift(order);
        localStorage.setItem("voltmap-orders", JSON.stringify(orders));

        selectedStation.available = Math.max(0, selectedStation.available - 1);
        renderStations();

        document.getElementById("paymentModal")?.classList.remove("open");
        showPaymentSuccess(order);

    } catch (error) {
        console.error("Razorpay verification error:", error);
        showToast("Payment verification failed", error.message || "Do not close the page. Contact support if money was deducted.");
    }
}

/* =========================================================
   PAYMENT SUCCESS
   ========================================================= */

function showPaymentSuccess(order) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay open";
    modal.dataset.paymentSuccess = "true";

    modal.innerHTML = `
        <div class="modal" style="text-align:center;position:relative;">
            <button type="button" class="modal-close" data-success-close style="position:absolute;top:17px;right:17px;">
                <i class="fa-solid fa-xmark"></i>
            </button>

            <div style="width:72px;height:72px;margin:8px auto 18px;display:grid;place-items:center;
                border-radius:50%;background:var(--green-soft);color:var(--green);font-size:30px;">
                <i class="fa-solid fa-check"></i>
            </div>

            <span class="modal-eyebrow">PAYMENT SUCCESSFUL</span>
            <h2 style="font-family:var(--font-display);margin:8px 0;">Booking confirmed!</h2>
            <p style="color:var(--muted);font-size:11px;line-height:1.7;">
                Your charging slot has been reserved successfully.
            </p>

            <div style="margin-top:18px;padding:17px;border:1px solid var(--border);background:var(--card);border-radius:12px;">
                <span style="display:block;color:var(--muted);font-family:var(--font-mono);font-size:9px;letter-spacing:.12em;">
                    BOOKING ID
                </span>
                <strong style="display:block;font-family:var(--font-mono);font-size:18px;color:var(--green);margin:7px 0;">
                    ${escapeHtmlSafe(order.bookingId || order.id)}
                </strong>
                <button type="button" class="btn-secondary" data-copy-booking>
                    <i class="fa-regular fa-copy"></i> Copy Booking ID
                </button>
            </div>

            <div class="booking-summary" style="text-align:left;margin-top:18px;">
                <div class="summary-line"><span>Station</span><strong>${escapeHtmlSafe(order.stationName)}</strong></div>
                <div class="summary-line"><span>Charger</span><strong>${escapeHtmlSafe(order.chargerName)}</strong></div>
                <div class="summary-line"><span>Date</span><strong>${escapeHtmlSafe(order.date)}</strong></div>
                <div class="summary-line"><span>Time</span><strong>${escapeHtmlSafe(order.time)}</strong></div>
                <div class="summary-line"><span>Vehicle</span><strong>${escapeHtmlSafe(order.vehicleNumber)}</strong></div>
                <div class="summary-line summary-total"><span>Paid</span><strong>₹${order.amount}</strong></div>
            </div>

            <div style="display:grid;gap:9px;margin-top:18px;">
                <button type="button" class="btn-primary full-btn" data-view-orders>
                    <i class="fa-regular fa-calendar-check"></i> View My Orders
                </button>
                <button type="button" class="btn-secondary full-btn" data-success-close>Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll("[data-success-close]").forEach(button => {
        button.addEventListener("click", () => modal.remove());
    });

    modal.querySelector("[data-copy-booking]")?.addEventListener("click", async () => {
        const id = order.bookingId || order.id;
        try {
            await navigator.clipboard.writeText(id);
            showToast("Copied", "Booking ID copied to clipboard.");
        } catch {
            showToast("Booking ID", id);
        }
    });

    modal.querySelector("[data-view-orders]")?.addEventListener("click", () => {
        modal.remove();
        openOrders();
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) modal.remove();
    });

    showToast("Payment successful", `Booking ID: ${order.bookingId || order.id}`);
}

/* =========================================================
   UNIQUE BOOKING ID
   ========================================================= */

function generateUniqueBookingId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `VM-${timestamp}-${random}`;
}

/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeHtmlSafe(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
}

/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener("input", debounce(() => applySearch(), 250));

function applySearch() {
    const query = searchInput.value.trim().toLowerCase();

    filteredStations = stations.filter(station =>
        station.name.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query) ||
        station.operator.toLowerCase().includes(query) ||
        station.connector.toLowerCase().includes(query)
    );

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
        suggestionBox.innerHTML = `
            <div class="suggestion-item">
                <i class="fa-solid fa-location-dot"></i>
                <span>
                    <strong>No charging locations found</strong>
                    <small>Try another area or station name.</small>
                </span>
            </div>
        `;
    } else {
        suggestionBox.innerHTML = matches.map(station => `
            <button class="suggestion-item" onclick="selectSearchSuggestion(${station.id})">
                <i class="fa-solid fa-charging-station"></i>
                <span>
                    <strong>${station.name}</strong>
                    <small>${station.address} · ${station.available}/${station.total} available</small>
                </span>
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

document.getElementById("sortSelect").addEventListener("change", e => {
    const type = e.target.value;

    if (type === "distance") filteredStations.sort((a, b) => a.distance - b.distance);
    else if (type === "price-low") filteredStations.sort((a, b) => a.price - b.price);
    else if (type === "price-high") filteredStations.sort((a, b) => b.price - a.price);
    else if (type === "speed-high") filteredStations.sort((a, b) => b.power - a.power);
    else if (type === "rating") filteredStations.sort((a, b) => b.rating - a.rating);
    else if (type === "availability") filteredStations.sort((a, b) => b.available - a.available);
    else filteredStations.sort((a, b) => recommendationScore(b) - recommendationScore(a));

    renderStations();
});

function recommendationScore(station) {
    const availability = station.available / station.total;
    const distanceScore = 1 / Math.max(station.distance, 1);
    const speedScore = Math.min(station.power / 150, 1);
    const priceScore = 1 / station.price;

    return availability * 5 + distanceScore * 2 + speedScore * 2 + station.rating + priceScore * 2;
}

/* =========================================================
   QUICK FILTERS
   ========================================================= */

document.querySelectorAll(".quick-filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".quick-filter").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;

        if (filter === "available") filteredStations = stations.filter(s => s.available > 0);
        else if (filter === "fast") filteredStations = stations.filter(s => s.power >= 100);
        else if (filter === "cheap") filteredStations = stations.filter(s => s.price <= 18);
        else filteredStations = [...stations];

        renderStations();
    });
});

/* =========================================================
   ADVANCED FILTER
   ========================================================= */

document.getElementById("filterBtn").addEventListener("click", () => filterModal.classList.add("open"));
document.getElementById("applyFilters").addEventListener("click", applyAdvancedFilters);

function applyAdvancedFilters() {
    const connector = document.getElementById("connectorFilter").value;
    const maxPrice = Number(document.getElementById("priceRange").value);
    const minSpeed = Number(document.getElementById("speedFilter").value);
    const availableOnly = document.getElementById("availableFilter").checked;

    filteredStations = stations.filter(station => {
        if (selectedChargerType !== "all" && station.chargerType !== selectedChargerType) return false;
        if (connector !== "all" && station.connector !== connector) return false;
        if (station.price > maxPrice) return false;
        if (station.power < minSpeed) return false;
        if (availableOnly && station.available === 0) return false;
        return true;
    });

    filterModal.classList.remove("open");
    renderStations();

    showToast("Filters applied", `${filteredStations.length} stations found.`);
}

/* =========================================================
   CHARGER TYPE BUTTONS
   ========================================================= */

document.querySelectorAll(".option-btn[data-type='charger']").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".option-btn[data-type='charger']").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        selectedChargerType = button.dataset.value;
    });
});

/* =========================================================
   PRICE SLIDER
   ========================================================= */

document.getElementById("priceRange").addEventListener("input", e => {
    document.getElementById("priceValue").textContent = e.target.value;
});

/* =========================================================
   CLEAR FILTERS
   ========================================================= */

document.getElementById("clearFilters").addEventListener("click", resetFilters);

function resetFilters() {
    selectedChargerType = "all";

    document.getElementById("connectorFilter").value = "all";
    document.getElementById("priceRange").value = 25;
    document.getElementById("priceValue").textContent = 25;
    document.getElementById("speedFilter").value = 0;
    document.getElementById("availableFilter").checked = false;

    document.querySelectorAll(".option-btn[data-type='charger']").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".option-btn[data-value='all']").classList.add("active");

    filteredStations = [...stations];
    filterModal.classList.remove("open");
    renderStations();
}

/* =========================================================
   FAVORITES
   ========================================================= */

function toggleFavorite(id) {
    const station = stations.find(s => s.id === id);
    if (!station) return;

    station.favorite = !station.favorite;
    persistFavorites();
    renderStations();

    showToast(station.favorite ? "Added to favorites" : "Removed from favorites", station.name);
}

/* =========================================================
   GEOLOCATION
   ========================================================= */

function locateUser() {
    if (!navigator.geolocation) {
        showToast("Not supported", "Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            userLocation = { lat, lng };

            map.setView([lat, lng], 14, { animate: true });

            L.circleMarker([lat, lng], { radius: 8, color: "#ffffff", weight: 3, fillColor: "#5b9cff", fillOpacity: 1 })
                .addTo(map)
                .bindPopup("You are here");

            showToast("Location found", "Showing charging stations near you.");
        },
        () => showToast("Location unavailable", "Please allow location access.")
    );
}

document.getElementById("locationBtn").addEventListener("click", locateUser);
document.getElementById("mapLocationBtn").addEventListener("click", locateUser);

/* =========================================================
   DIRECTIONS
   ========================================================= */

function getDirections(id) {
    const station = stations.find(s => s.id === id);
    if (!station) return;

    const url = `https://www.google.com/maps/dir/?api=1` +
        `${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ""}` +
        `&destination=${station.lat},${station.lng}`;

    window.open(url, "_blank");
}

/* =========================================================
   DRAWER
   ========================================================= */

document.getElementById("drawerClose").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

function closeDrawer() {
    stationDrawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
}

/* =========================================================
   MODAL CLOSE
   ========================================================= */

document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById(button.dataset.close).classList.remove("open");
    });
});

document.querySelectorAll(".modal-overlay").forEach(modal => {
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("open");
    });
});

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

document.getElementById("notificationBtn").addEventListener("click", () => {
    notificationPanel.classList.toggle("open");
});

document.getElementById("markRead").addEventListener("click", () => {
    document.querySelector(".notifications").replaceChildren();
    document.querySelector(".notification-count").textContent = "0";
    notificationPanel.classList.remove("open");
    showToast("Notifications cleared", "All notifications have been removed.");
});

/* =========================================================
   THEME
   ========================================================= */

document.getElementById("themeBtn").addEventListener("click", toggleTheme);

function toggleTheme() {
    document.body.classList.toggle("light");
    const light = document.body.classList.contains("light");

    localStorage.setItem("voltmap-theme", light ? "light" : "dark");
    document.querySelector("#themeBtn i").className = light ? "fa-solid fa-moon" : "fa-solid fa-sun";

    updateMapTheme();
    renderMarkers();
}

function initializeTheme() {
    const theme = localStorage.getItem("voltmap-theme");

    if (theme === "light") {
        document.body.classList.add("light");
        document.querySelector("#themeBtn i").className = "fa-solid fa-moon";
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
                html: `
                    <div style="width:30px;height:30px;display:grid;place-items:center;background:#5b9cff;
                        color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 4px 12px #0005">
                        <i class="fa-solid ${icons[type]}"></i>
                    </div>
                `,
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

document.getElementById("fullscreenBtn").addEventListener("click", () => {
    const mapElement = document.getElementById("map");

    if (!document.fullscreenElement) mapElement.requestFullscreen?.();
    else document.exitFullscreen?.();
});

/* =========================================================
   COST CALCULATOR
   ========================================================= */

function openCalculator() {
    document.getElementById("calculatorModal").classList.add("open");
}

document.getElementById("calculateBtn").addEventListener("click", calculateCost);

function calculateCost() {
    const capacity = Number(document.getElementById("batteryCapacity").value);
    const current = Number(document.getElementById("currentBattery").value);
    const target = Number(document.getElementById("targetBattery").value);
    const price = Number(document.getElementById("chargePrice").value);

    if (capacity <= 0 || target <= current) {
        showToast("Invalid values", "Check your battery percentages.");
        return;
    }

    const energy = capacity * ((target - current) / 100);
    const cost = energy * price;
    const chargingPower = 100;
    const time = (energy / chargingPower) * 60;

    document.getElementById("energyResult").textContent = energy.toFixed(2) + " kWh";
    document.getElementById("costResult").textContent = "₹" + Math.round(cost);
    document.getElementById("timeResult").textContent = Math.max(1, Math.round(time)) + " min";

    renderStationComparison(energy, 30);
}

function renderStationComparison(energy, duration) {
    const container = document.getElementById("stationCompareResult");
    if (!container) return;

    const hasDuration = Number.isFinite(duration) && duration > 0;

    const ranked = stations
        .filter(station => station.open)
        .map(station => {
            const timeNeeded = (energy / station.power) * 60;
            const fitsInTime = !hasDuration || timeNeeded <= duration;
            const cost = energy * station.price;
            return { station, timeNeeded, fitsInTime, cost };
        })
        .sort((a, b) => a.cost - b.cost)
        .slice(0, 5);

    if (!ranked.length) {
        container.innerHTML = `<p class="payment-note">No stations available to compare right now.</p>`;
        return;
    }

    container.innerHTML = ranked.map(entry => `
        <div class="compare-station-row">
            <div>
                <strong>${entry.station.name}</strong>
                <span>${entry.station.power} kW · ₹${entry.station.price}/kWh</span>
            </div>
            <div class="compare-station-figures">
                <span class="compare-cost">₹${Math.round(entry.cost)}</span>
                <span class="compare-time ${entry.fitsInTime ? "" : "compare-time-warn"}">
                    ${Math.max(1, Math.round(entry.timeNeeded))} min
                    ${hasDuration && !entry.fitsInTime ? " · over your time" : ""}
                </span>
            </div>
        </div>
    `).join("");
}

/* =========================================================
   LIVE AVAILABILITY
   ========================================================= */

function simulateLiveUpdates() {
    setInterval(() => {
        const station = stations[Math.floor(Math.random() * stations.length)];
        if (!station) return;

        const change = Math.random() > 0.5 ? 1 : -1;
        station.available = Math.max(0, Math.min(station.total, station.available + change));

        const visible = filteredStations.some(s => s.id === station.id);
        if (visible) renderStations();
    }, 10000);
}

/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats() {
    stationCount.textContent = filteredStations.length;
    mapStationCount.textContent = filteredStations.length;
}

/* =========================================================
   HIGHLIGHT CARD
   ========================================================= */

function highlightCard(id) {
    document.querySelectorAll(".station-card").forEach(card => card.classList.remove("selected"));

    const card = document.querySelector(`.station-card[data-id="${id}"]`);
    if (card) {
        card.classList.add("selected");
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

/* =========================================================
   TOAST
   ========================================================= */

let toastTimeout;

function showToast(title, message) {
    document.getElementById("toastTitle").textContent = title;
    document.getElementById("toastMessage").textContent = message;

    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* =========================================================
   DATE
   ========================================================= */

function getToday() {
    return new Date().toISOString().split("T")[0];
}

/* =========================================================
   CALENDAR
   ========================================================= */

function addToCalendar() {
    showToast("Calendar", "Booking added to your calendar.");
}

/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(callback, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
    };
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    document.getElementById("clearSearch").addEventListener("click", () => {
        searchInput.value = "";
        document.getElementById("searchSuggestions").classList.remove("open");
        filteredStations = [...stations];
        renderStations();
    });

    document.getElementById("profileBtn").addEventListener("click", () => openSettings());
    document.getElementById("ordersBtn").addEventListener("click", openOrders);
    document.getElementById("logoutBtn").addEventListener("click", logout);

    document.getElementById("savedPlacesBtn").addEventListener("click", () => {
        document.getElementById("savedPlacesPanel").classList.toggle("open");
    });

    document.getElementById("calculatorBtn").addEventListener("click", openCalculator);

    document.getElementById("closeSavedPlaces").addEventListener("click", () => {
        document.getElementById("savedPlacesPanel").classList.remove("open");
    });

    document.querySelectorAll(".saved-place-actions button").forEach(button => {
        button.addEventListener("click", () => saveMapCenter(button.dataset.place));
    });

    // FIX: the bottom mobile nav bar existed in HTML/CSS with no click
    // handlers at all. On phones the desktop profile button is hidden,
    // so there was previously no way to reach Settings/Logout/Orders.
    function setMobileNavActive(id) {
        document.querySelectorAll(".mobile-nav button").forEach(btn => btn.classList.remove("active"));
        document.getElementById(id)?.classList.add("active");
    }

    document.getElementById("mobileMapBtn")?.addEventListener("click", () => {
        closeDrawer();
        document.getElementById("savedPlacesPanel").classList.remove("open");
        setMobileNavActive("mobileMapBtn");
    });

    document.getElementById("mobileExplore")?.addEventListener("click", () => {
        document.querySelector(".sidebar").scrollIntoView({ behavior: "smooth", block: "start" });
        setMobileNavActive("mobileExplore");
    });

    document.getElementById("mobileBookings")?.addEventListener("click", () => {
        if (!currentUser) {
            document.getElementById("authOverlay").classList.remove("hidden");
            return;
        }
        openOrders();
        setMobileNavActive("mobileBookings");
    });

    document.getElementById("mobileFavorites")?.addEventListener("click", () => {
        filteredStations = stations.filter(s => s.favorite);
        renderStations();
        setMobileNavActive("mobileFavorites");
    });

    document.getElementById("mobileProfile")?.addEventListener("click", () => {
        if (!currentUser) {
            document.getElementById("authOverlay").classList.remove("hidden");
            return;
        }
        openSettings();
        setMobileNavActive("mobileProfile");
    });
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

/* =========================================================
   GOOGLE SIGN-IN
   Loads Google Identity Services on demand and mounts a
   "Sign in with Google" button into the auth card. Requires
   a real GOOGLE_CLIENT_ID (see top of file) with this site's
   origin added under "Authorized JavaScript origins" in the
   Google Cloud Console.

   On success this calls POST /auth/google { credential } on
   your backend so the ID token can be verified server-side —
   add that route to your API. If it isn't available yet, this
   falls back to a local demo account keyed by the Google
   email so the button is still testable end to end.
   ========================================================= */

function loadGoogleScript() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve(window.google);
            return;
        }

        const existing = document.querySelector('script[data-google-sdk="true"]');

        if (existing) {
            existing.addEventListener("load", () => resolve(window.google));
            existing.addEventListener("error", reject);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.googleSdk = "true";
        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error("Google Sign-In could not be loaded."));

        document.head.appendChild(script);
    });
}

function ensureGoogleSignInMount() {
    if (document.getElementById("googleSignInMount")) return;

    const authForm = document.getElementById("authForm");
    if (!authForm) return;

    authForm.insertAdjacentHTML("afterend", `
        <div style="display:flex;align-items:center;gap:10px;margin:18px 0 12px;color:var(--faint);font-size:9px;letter-spacing:.08em;">
            <span style="flex:1;height:1px;background:var(--border);"></span>
            OR CONTINUE WITH
            <span style="flex:1;height:1px;background:var(--border);"></span>
        </div>
        <div id="googleSignInMount" style="display:flex;justify-content:center;"></div>
    `);
}

async function initializeGoogleSignIn() {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE_OAUTH_CLIENT_ID")) {
        console.warn("Google Sign-In: set GOOGLE_CLIENT_ID at the top of script.js to enable it.");
        return;
    }

    ensureGoogleSignInMount();

    try {
        const google = await loadGoogleScript();

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential
        });

        const mount = document.getElementById("googleSignInMount");

        if (mount) {
            google.accounts.id.renderButton(mount, {
                theme: "filled_black",
                size: "large",
                shape: "pill",
                width: 320,
                text: "continue_with"
            });
        }
    } catch (error) {
        console.warn("Google Sign-In unavailable:", error);
    }
}

function decodeGoogleCredential(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(decodeURIComponent(escape(atob(normalized))));
    } catch {
        return null;
    }
}

async function handleGoogleCredential(response) {
    if (!response?.credential) return;

    const payload = decodeGoogleCredential(response.credential);

    if (!payload?.email) {
        showToast("Google sign-in failed", "Could not read your Google account details.");
        return;
    }

    let account;

    try {
        const result = await apiRequest("/auth/google", {
            method: "POST",
            body: JSON.stringify({ credential: response.credential })
        });
        account = result.data;

    } catch (backendError) {
        // Demo/offline fallback — create or reuse a local driver account tied to the Google email.
        const accounts = JSON.parse(localStorage.getItem("voltmap-accounts") || "[]");
        account = accounts.find(item => item.email === payload.email && item.role === "user");

        if (!account) {
            account = {
                name: payload.name || payload.email.split("@")[0],
                email: payload.email,
                role: "user",
                password: null,
                provider: "google"
            };
            accounts.push(account);
            localStorage.setItem("voltmap-accounts", JSON.stringify(accounts));
        }
    }

    currentUser = { name: account.name, email: account.email, role: account.role || "user" };
    localStorage.setItem("voltmap-session", JSON.stringify(currentUser));

    applyCurrentUser();
    document.getElementById("authOverlay").classList.add("hidden");

    showToast("Welcome to VoltMap", `Signed in as ${currentUser.name} via Google.`);
}

function initializeAuth() {
    const savedSession = localStorage.getItem("voltmap-session");

    if (savedSession) {
        try {
            currentUser = JSON.parse(savedSession);
            applyCurrentUser();
            document.getElementById("authOverlay").classList.add("hidden");
        } catch {
            localStorage.removeItem("voltmap-session");
        }
    }

    document.getElementById("authForm").addEventListener("submit", submitAuth);
    document.getElementById("authModeToggle").addEventListener("click", toggleAuthMode);
    document.getElementById("forgotPasswordBtn").addEventListener("click", forgotPassword);

    // FIX: mount + initialize "Sign in with Google" inside the auth card.
    initializeGoogleSignIn();
}

function toggleAuthMode() {
    const form = document.getElementById("authForm");
    const signUp = !form.dataset.mode || form.dataset.mode === "signin";

    form.dataset.mode = signUp ? "signup" : "signin";

    document.querySelector(".auth-name-field").hidden = !signUp;
    document.getElementById("authName").required = signUp;

    document.getElementById("authTitle").textContent = signUp ? "Create your account" : "Sign in to VoltMap";
    document.getElementById("authEyebrow").textContent = signUp ? "GET STARTED" : "WELCOME BACK";
    document.getElementById("authDescription").textContent = signUp
        ? "Create an account to manage bookings and payments."
        : "Choose your account type and sign in to find a charger.";

    document.getElementById("authSubmit").textContent = signUp ? "Create account" : "Sign in";
    document.getElementById("authModeToggle").textContent = signUp
        ? "Already have an account? Sign in"
        : "Create an account";

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

    // FIX: single fixed admin account — no new admin accounts can ever be
    // created, and admin sign-in only succeeds against the hardcoded
    // ADMIN_CREDENTIALS above. Driver ("user") accounts are unaffected
    // and keep using the backend/localStorage flow below as before.
    if (role === "admin") {
        if (signUp) {
            error.textContent = "Admin sign-up is disabled. VoltMap has a single fixed admin account — please sign in instead.";
            return;
        }

        if (email !== ADMIN_CREDENTIALS.email.toLowerCase() || password !== ADMIN_CREDENTIALS.password) {
            error.textContent = "Invalid admin credentials.";
            return;
        }

        currentUser = { name: "VoltMap Admin", email: ADMIN_CREDENTIALS.email, role: "admin" };
        localStorage.setItem("voltmap-session", JSON.stringify(currentUser));

        applyCurrentUser();
        document.getElementById("authOverlay").classList.add("hidden");

        showToast("Welcome to VoltMap", "Signed in as admin.");
        return;
    }

    let account;

    try {
        const result = await apiRequest(signUp ? "/auth/signup" : "/auth/login", {
            method: "POST",
            body: JSON.stringify({ name, email, password, role })
        });

        account = result.data;

    } catch (backendError) {
        if (backendError.isApiError) {
            error.textContent = backendError.message;
            return;
        }

        const accounts = JSON.parse(localStorage.getItem("voltmap-accounts") || "[]");

        if (signUp) {
            if (accounts.some(item => item.email === email && item.role === role)) {
                error.textContent = "An account with this email and role already exists. Sign in instead.";
                return;
            }

            account = { name, email, role, password };
            accounts.push(account);
            localStorage.setItem("voltmap-accounts", JSON.stringify(accounts));

        } else {
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

/* =========================================================
   FORGOT PASSWORD — EMAIL CODE RESET
   Expects three backend routes (add them to your API if they
   don't exist yet):
     POST /auth/forgot-password    { email }                -> emails a code
     POST /auth/verify-reset-code  { email, code }           -> validates it
     POST /auth/reset-password     { email, newPassword }    -> sets new password
   If the backend/those routes aren't available, this falls
   back to a local demo mode (code is generated in the browser
   and shown in a toast/console) so the flow still works end to
   end for testing.
   ========================================================= */

let resetPasswordDraft = { email: "", codeVerified: false };

function forgotPassword() {
    const prefillEmail = document.getElementById("authEmail").value.trim();
    resetPasswordDraft = { email: prefillEmail, codeVerified: false };

    ensureResetPasswordModal();
    renderResetPasswordStep("email");
    document.getElementById("resetPasswordModal").classList.add("open");
}

function ensureResetPasswordModal() {
    let modal = document.getElementById("resetPasswordModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "resetPasswordModal";
    modal.className = "modal-overlay";

    modal.innerHTML = `
        <div class="modal" style="position:relative;">
            <button class="modal-close" id="resetPasswordCloseBtn" type="button"
                style="position:absolute;top:17px;right:17px;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div id="resetPasswordContent"></div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", event => {
        if (event.target === modal) modal.classList.remove("open");
    });

    document.getElementById("resetPasswordCloseBtn")?.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    return modal;
}

function renderResetPasswordStep(step) {
    const modal = ensureResetPasswordModal();
    const content = modal.querySelector("#resetPasswordContent");
    if (!content) return;

    if (step === "email") {
        content.innerHTML = `
            <span class="modal-eyebrow">RESET PASSWORD</span>
            <h2 style="font-family:var(--font-display);margin:6px 0 18px;">Forgot your password?</h2>
            <p class="booking-subtitle" style="margin-top:-8px;">Enter your account email and we'll send a verification code to it.</p>
            <label class="auth-label">Email address
                <input type="email" id="resetEmailInput" placeholder="you@example.com" value="${escapeAttribute(resetPasswordDraft.email)}">
            </label>
            <p class="auth-error" id="resetPasswordError"></p>
            <button type="button" class="btn-primary full-btn" id="sendResetCodeBtn" style="margin-top:6px;">
                <i class="fa-regular fa-paper-plane"></i> Send reset code
            </button>
        `;

        content.querySelector("#sendResetCodeBtn").addEventListener("click", () => {
            const email = content.querySelector("#resetEmailInput").value.trim().toLowerCase();
            const errorEl = content.querySelector("#resetPasswordError");

            if (!email || !email.includes("@")) {
                errorEl.textContent = "Enter a valid email address.";
                return;
            }

            errorEl.textContent = "";
            sendResetCode(email);
        });

    } else if (step === "code") {
        content.innerHTML = `
            <span class="modal-eyebrow">RESET PASSWORD</span>
            <h2 style="font-family:var(--font-display);margin:6px 0 18px;">Enter verification code</h2>
            <p class="booking-subtitle" style="margin-top:-8px;">
                We sent a 6-digit code to <strong style="color:var(--text)">${escapeHtmlSafe(resetPasswordDraft.email)}</strong>.
            </p>
            <label class="auth-label">Verification code
                <input type="text" id="resetCodeInput" inputmode="numeric" maxlength="6" placeholder="123456">
            </label>
            <p class="auth-error" id="resetPasswordError"></p>
            <button type="button" class="btn-primary full-btn" id="verifyResetCodeBtn">
                <i class="fa-solid fa-shield-halved"></i> Verify code
            </button>
            <div class="auth-links" style="margin-top:14px;">
                <button type="button" id="resendResetCodeBtn">Resend code</button>
                <button type="button" id="changeResetEmailBtn">Use a different email</button>
            </div>
        `;

        content.querySelector("#verifyResetCodeBtn").addEventListener("click", () => {
            const code = content.querySelector("#resetCodeInput").value.trim();
            const errorEl = content.querySelector("#resetPasswordError");

            if (!code) {
                errorEl.textContent = "Enter the code we sent you.";
                return;
            }

            errorEl.textContent = "";
            verifyResetCode(code);
        });

        content.querySelector("#resendResetCodeBtn").addEventListener("click", () => sendResetCode(resetPasswordDraft.email));
        content.querySelector("#changeResetEmailBtn").addEventListener("click", () => renderResetPasswordStep("email"));

    } else if (step === "newPassword") {
        content.innerHTML = `
            <span class="modal-eyebrow">RESET PASSWORD</span>
            <h2 style="font-family:var(--font-display);margin:6px 0 18px;">Set a new password</h2>
            <label class="auth-label">New password
                <input type="password" id="newPasswordInput" placeholder="At least 6 characters" autocomplete="new-password">
            </label>
            <label class="auth-label">Confirm new password
                <input type="password" id="confirmPasswordInput" placeholder="Re-enter password" autocomplete="new-password">
            </label>
            <p class="auth-error" id="resetPasswordError"></p>
            <button type="button" class="btn-primary full-btn" id="submitNewPasswordBtn" style="margin-top:6px;">
                <i class="fa-solid fa-lock"></i> Reset password
            </button>
        `;

        content.querySelector("#submitNewPasswordBtn").addEventListener("click", () => {
            const newPassword = content.querySelector("#newPasswordInput").value;
            const confirmPassword = content.querySelector("#confirmPasswordInput").value;
            submitNewPassword(newPassword, confirmPassword);
        });

    } else if (step === "done") {
        content.innerHTML = `
            <div style="text-align:center;">
                <div style="width:64px;height:64px;margin:8px auto 16px;display:grid;place-items:center;
                    border-radius:50%;background:var(--green-soft);color:var(--green);font-size:26px;">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="modal-eyebrow">PASSWORD UPDATED</span>
                <h2 style="font-family:var(--font-display);margin:8px 0;">You're all set</h2>
                <p style="color:var(--muted);font-size:11px;line-height:1.7;">
                    Your password has been reset. You can now sign in with your new password.
                </p>
                <button type="button" class="btn-primary full-btn" id="resetDoneBtn" style="margin-top:16px;">Back to sign in</button>
            </div>
        `;

        content.querySelector("#resetDoneBtn").addEventListener("click", () => {
            document.getElementById("resetPasswordModal").classList.remove("open");
            const emailField = document.getElementById("authEmail");
            if (emailField) emailField.value = resetPasswordDraft.email;
        });
    }
}

async function sendResetCode(email) {
    resetPasswordDraft.email = email;
    resetPasswordDraft.codeVerified = false;

    try {
        await apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
        showToast("Code sent", `A verification code was sent to ${email}.`);
    } catch (backendError) {
        // Demo/offline fallback so the flow can still be tested without a live email backend.
        const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
        const pending = JSON.parse(localStorage.getItem("voltmap-reset-codes") || "{}");
        pending[email] = { code: demoCode, expires: Date.now() + 10 * 60 * 1000 };
        localStorage.setItem("voltmap-reset-codes", JSON.stringify(pending));

        console.warn("Email service unavailable — demo reset code:", demoCode);
        showToast("Demo mode (no backend)", `Email service unavailable. Demo code: ${demoCode}`);
    }

    renderResetPasswordStep("code");
}

async function verifyResetCode(code) {
    try {
        await apiRequest("/auth/verify-reset-code", {
            method: "POST",
            body: JSON.stringify({ email: resetPasswordDraft.email, code })
        });

        resetPasswordDraft.codeVerified = true;
        renderResetPasswordStep("newPassword");
        return;

    } catch (backendError) {
        // Demo/offline fallback — verify against the locally generated code.
        const pending = JSON.parse(localStorage.getItem("voltmap-reset-codes") || "{}");
        const entry = pending[resetPasswordDraft.email];

        if (entry && entry.code === code && Date.now() < entry.expires) {
            resetPasswordDraft.codeVerified = true;
            renderResetPasswordStep("newPassword");
        } else {
            const modal = document.getElementById("resetPasswordModal");
            const errorEl = modal?.querySelector("#resetPasswordError");
            if (errorEl) errorEl.textContent = "That code is incorrect or has expired.";
        }
    }
}

async function submitNewPassword(newPassword, confirmPassword) {
    const modal = document.getElementById("resetPasswordModal");
    const errorEl = modal?.querySelector("#resetPasswordError");

    if (!resetPasswordDraft.codeVerified) {
        if (errorEl) errorEl.textContent = "Please verify your reset code first.";
        return;
    }

    if (newPassword.length < 6) {
        if (errorEl) errorEl.textContent = "Password must be at least 6 characters.";
        return;
    }

    if (newPassword !== confirmPassword) {
        if (errorEl) errorEl.textContent = "Passwords don't match.";
        return;
    }

    try {
        await apiRequest("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ email: resetPasswordDraft.email, newPassword })
        });
    } catch (backendError) {
        // Demo/offline fallback — update the locally stored offline account, if any.
        const accounts = JSON.parse(localStorage.getItem("voltmap-accounts") || "[]");
        const account = accounts.find(item => item.email === resetPasswordDraft.email);

        if (account) {
            account.password = newPassword;
            localStorage.setItem("voltmap-accounts", JSON.stringify(accounts));
        }
    }

    const pending = JSON.parse(localStorage.getItem("voltmap-reset-codes") || "{}");
    delete pending[resetPasswordDraft.email];
    localStorage.setItem("voltmap-reset-codes", JSON.stringify(pending));

    renderResetPasswordStep("done");
    showToast("Password updated", "You can now sign in with your new password.");
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

    if (document.getElementById("authForm").dataset.mode === "signup") toggleAuthMode();

    document.getElementById("authError").textContent = "";
    document.getElementById("authOverlay").classList.remove("hidden");
}

/* =========================================================
   MY ORDERS
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
        content.innerHTML = `
            <div class="orders-empty">
                <i class="fa-regular fa-calendar-xmark"></i>
                <p>No bookings yet. Your paid reservations will appear here.</p>
            </div>
        `;
        return;
    }

    content.innerHTML = orders.map(order => {
        const isCancellable = order.status !== "cancelled";

        return `
            <article class="order-card">
                <div class="order-card-head">
                    <div>
                        <h3>${escapeHtmlSafe(order.stationName)}</h3>
                        <p>${escapeHtmlSafe(order.bookingId || order.id)} · ${escapeHtmlSafe(order.chargerName || "Charger")}</p>
                    </div>
                    <span class="order-status">${escapeHtmlSafe(order.status || "Confirmed")}</span>
                </div>

                <div class="order-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${escapeHtmlSafe(order.date)} · ${escapeHtmlSafe(order.time)}</span>
                    <span>₹${Number(order.amount || 0)} · ${escapeHtmlSafe(order.paymentMethod || "")}</span>
                </div>

                <div class="order-bottom">
                    <span>Payment: <strong class="paid">${escapeHtmlSafe(order.paymentStatus || "Paid")}</strong></span>
                    ${order.rating
                        ? `<span>Your rating: ${order.rating}/5</span>`
                        : `<button class="rate-btn" onclick="rateOrder('${escapeAttribute(order.bookingId || order.id)}')">
                               <i class="fa-solid fa-star"></i> Rate booking
                           </button>`
                    }
                </div>

                ${isCancellable ? `
                    <button
                        type="button"
                        class="btn-secondary full-btn"
                        style="margin-top:10px;"
                        onclick="cancelBooking('${escapeAttribute(order.bookingId || order.id)}')"
                    >
                        <i class="fa-solid fa-ban"></i> Cancel booking
                    </button>
                ` : ""}

                <div style="margin-top:8px;font-family:var(--font-mono);font-size:8px;color:var(--faint);">
                    Booking ID: ${escapeHtmlSafe(order.bookingId || order.id)}
                </div>
            </article>
        `;
    }).join("");
}

/* =========================================================
   CANCEL BOOKING
   (backend route already existed — nothing in the frontend
   ever called it, so cancellations only ever happened server-side)
   ========================================================= */

async function cancelBooking(id) {
    if (!currentUser) return;
    if (!confirm("Cancel this booking? This can't be undone.")) return;

    const orders = JSON.parse(localStorage.getItem("voltmap-orders") || "[]");
    const order = orders.find(item => (item.id === id || item.bookingId === id) && item.userEmail === currentUser.email);

    if (!order) return;

    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    localStorage.setItem("voltmap-orders", JSON.stringify(orders));

    try {
        await apiRequest(`/bookings/${encodeURIComponent(id)}/cancel`, { method: "PATCH" });
    } catch (error) {
        console.warn("Backend cancellation failed, local status was still updated.", error);
    }

    const station = stations.find(s => s.id === order.stationId);
    if (station) {
        station.available = Math.min(station.total, station.available + 1);
        renderStations();
    }

    renderOrders();
    showToast("Booking cancelled", `${order.stationName} · ${order.bookingId || order.id}`);
}

/* =========================================================
   RATE ORDER
   ========================================================= */

function rateOrder(id) {
    const orders = JSON.parse(localStorage.getItem("voltmap-orders") || "[]");
    const order = orders.find(item => (item.id === id || item.bookingId === id) && item.userEmail === currentUser?.email);

    if (!order) return;

    const rating = prompt("Rate your charging experience from 1 to 5:");
    if (rating === null) return;

    const value = Number(rating);

    if (value < 1 || value > 5 || Number.isNaN(value)) {
        showToast("Invalid rating", "Please enter a rating between 1 and 5.");
        return;
    }

    order.rating = value;
    localStorage.setItem("voltmap-orders", JSON.stringify(orders));

    if (order.id) {
        syncToBackend(`/orders/${encodeURIComponent(order.id)}/rating`, {
            method: "PATCH",
            body: JSON.stringify({ userEmail: currentUser.email, rating: value })
        });
    }

    renderOrders();
    showToast("Thank you for your rating", `${value}/5 saved for ${order.stationName}.`);
}

/* =========================================================
   HELPER: ATTRIBUTE ESCAPE
   ========================================================= */

function escapeAttribute(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* =========================================================
   SOCKET.IO
   ========================================================= */

let socket = null;

function initializeSocket() {
    if (typeof io !== "function") return;

    try {
        // FIX: this was hardcoded to http://localhost:5000, which can
        // never connect once the frontend is deployed. Connect to the
        // same backend the REST calls already use.
        socket = io(API_BASE);

        socket.on("station:availability", data => {
            if (!data) return;

            const station = stations.find(item => item.id === data.stationId);
            if (!station) return;

            station.available = data.availableSlots;
            renderStations();
        });

        socket.on("stations:update", serverStations => {
            if (!Array.isArray(serverStations)) return;

            serverStations.forEach(serverStation => {
                const localStation = stations.find(station => String(station.id) === String(serverStation.id));
                if (!localStation) return;

                if (serverStation.availableSlots !== undefined) {
                    localStation.available = Number(serverStation.availableSlots);
                }
            });

            renderStations();
        });

        socket.on("connect", () => console.log("⚡ VoltMap Socket.IO connected"));
        socket.on("disconnect", () => console.log("VoltMap Socket.IO disconnected"));

    } catch (socketError) {
        console.warn("Socket.IO initialization failed:", socketError);
    }
}

try {
    initializeSocket();
} catch {
    // Socket remains optional for local frontend operation.
}