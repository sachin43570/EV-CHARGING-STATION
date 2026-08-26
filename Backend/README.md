# VoltMap local server

## Run

1. Open a terminal in `Backend`.
2. Run `npm install` once.
3. Run `npm start`.
4. Open `http://localhost:5000`.

The server delivers both the VoltMap frontend and its API on port 5000.

## Local data store

`data/database.json` contains users, paid orders, station ratings, and saved places.
`data/bookings.json` contains API booking records and `data/stations.json` contains station availability.

Passwords are never stored as readable text. They are saved as bcrypt password hashes in `database.json`, which is the correct approach for a real application.

## API additions

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/orders`, `GET /api/orders?userEmail=...`
- `PATCH /api/orders/:id/rating`
- `POST /api/stations/:id/ratings`
- `GET` / `PUT /api/users/:email/saved-places`
