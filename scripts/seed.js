require('dotenv').config();

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { mysql, mysqlConfig } = require('../config/db');
const { seedCars } = require('../data/store');

async function main() {
  const database = process.env.DB_NAME || 'car_rental_db';
  const connection = await mysql.createConnection({
    ...mysqlConfig(false),
    multipleStatements: true
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await connection.query(`USE \`${database}\``);

  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schema);

  await connection.query('DELETE FROM bookings');
  await connection.query('DELETE FROM cars');
  await connection.query('DELETE FROM users');

  const users = [
    {
      id: 'demo-owner',
      name: 'Demo Owner',
      email: 'owner@example.com',
      password: 'owner123',
      role: 'owner'
    },
    {
      id: 'demo-customer',
      name: 'Demo Customer',
      email: 'customer@example.com',
      password: 'customer123',
      role: 'user'
    }
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await connection.execute(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, passwordHash, user.role]
    );
  }

  for (const car of seedCars) {
    await connection.execute(
      `INSERT INTO cars
       (id, owner_id, brand, model, image, year, category, seating_capacity, fuel_type, transmission, price_per_day, location, description, is_available, seed_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        car.id,
        car.ownerId,
        car.brand,
        car.model,
        car.image,
        car.year,
        car.category,
        car.seating_capacity,
        car.fuel_type,
        car.transmission,
        car.pricePerDay,
        car.location,
        car.description,
        car.isAvaliable ? 1 : 0,
        car.seedOrder
      ]
    );
  }

  const bookings = [
    {
      id: 'booking-demo-1',
      userId: 'demo-customer',
      carId: '685a66c8409f80f19ec33772',
      pickupDate: '2026-06-05',
      returnDate: '2026-06-08',
      price: 390,
      status: 'confirmed',
      paymentStatus: 'paid'
    },
    {
      id: 'booking-demo-2',
      userId: 'demo-customer',
      carId: '67ff5bc069c03d4e45f30b77',
      pickupDate: '2026-06-14',
      returnDate: '2026-06-16',
      price: 600,
      status: 'pending',
      paymentStatus: 'unpaid'
    }
  ];

  for (const booking of bookings) {
    await connection.execute(
      'INSERT INTO bookings (id, user_id, car_id, pickup_date, return_date, price, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        booking.id,
        booking.userId,
        booking.carId,
        booking.pickupDate,
        booking.returnDate,
        booking.price,
        booking.status,
        booking.paymentStatus
      ]
    );
  }

  await connection.end();
  console.log(`Seeded ${database} with ${users.length} users, ${seedCars.length} cars, and ${bookings.length} bookings.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
