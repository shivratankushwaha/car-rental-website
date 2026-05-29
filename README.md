# CarRental Express/EJS/MySQL Website

This is a full-stack car rental website inspired by the GreatStack live preview, rebuilt with Node.js, Express.js, EJS, Bootstrap, vanilla JavaScript REST calls, and MySQL.

## Run it

```bash
npm install
copy .env.example .env
npm run seed
npm start
```

Open `http://localhost:3000`.

Demo accounts after seeding:

- Owner: `owner@example.com` / `owner123`
- Customer: `customer@example.com` / `customer123`

If MySQL is not running, the app automatically previews with in-memory demo data unless `USE_MEMORY_STORE=false` and `MYSQL_REQUIRED=true` are set.

## Pages

- `/` home page with hero search, featured cars, owner CTA, testimonials, and newsletter form
- `/cars` searchable listing and availability-filtered search
- `/car-details/:id` car detail and booking form
- `/my-bookings` customer booking history
- `/owner` owner dashboard
- `/owner/add-car` add car form
- `/owner/manage-cars` owner car management
- `/owner/manage-bookings` owner booking management

## REST APIs

- `GET /api/user/cars`
- `GET /api/cars/:id`
- `POST /api/user/register`
- `POST /api/user/login`
- `POST /api/user/logout`
- `GET /api/user/data`
- `POST /api/bookings/check-availability`
- `POST /api/bookings/create`
- `GET /api/bookings/user`
- `GET /api/bookings/owner`
- `POST /api/bookings/change-status`
- `GET /api/owner/dashboard`
- `POST /api/owner/change-role`
- `POST /api/owner/add-car`
- `POST /api/owner/toggle-car`
- `DELETE /api/owner/cars/:id`

## MySQL

The schema lives in `schema.sql`; `scripts/seed.js` creates the database, creates tables, and inserts demo users/cars/bookings.
