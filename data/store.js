const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getPool, query } = require('../config/db');

const DAY_MS = 24 * 60 * 60 * 1000;

const seedCars = [
  {
    id: '685a66c8409f80f19ec33772',
    ownerId: 'demo-owner',
    brand: 'Toyota',
    model: 'Corolla',
    image: 'https://ik.imagekit.io/greatstack/tr:w-1280:q-auto:f-webp/cars/car_image2_K-t4zyiXPE.png',
    year: 2021,
    category: 'Sedan',
    seating_capacity: 4,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    pricePerDay: 130,
    location: 'Los Angeles',
    description: 'The Toyota Corolla is a mid-size luxury sedan produced by Toyota. The Corolla made its debut in 2008 as the first sedan ever produced by Toyota.',
    isAvaliable: true,
    seedOrder: 1
  },
  {
    id: '67ff5bc069c03d4e45f30b77',
    ownerId: 'demo-owner',
    brand: 'BMW',
    model: 'X5',
    image: 'https://ik.imagekit.io/devtechz/tr:q-auto:f-webp:w-1280/cars/car_image4_FMYxA8pev.png',
    year: 2006,
    category: 'SUV',
    seating_capacity: 4,
    fuel_type: 'Hybrid',
    transmission: 'Semi-Automatic',
    pricePerDay: 300,
    location: 'New York',
    description: 'The BMW X5 is a mid-size luxury SUV produced by BMW. The X5 made its debut in 1999 as the first SUV ever produced by BMW.',
    isAvaliable: true,
    seedOrder: 2
  },
  {
    id: '67ff6b9f8f1b3684286a2a68',
    ownerId: 'demo-owner',
    brand: 'Jeep',
    model: 'Wrangler',
    image: 'https://ik.imagekit.io/greatstack/tr:w-1280:q-auto:f-webp/cars/car_image3_gdP9kgWZz.png',
    year: 2023,
    category: 'SUV',
    seating_capacity: 4,
    fuel_type: 'Hybrid',
    transmission: 'Automatic',
    pricePerDay: 200,
    location: 'Los Angeles',
    description: 'The Jeep Wrangler is a mid-size luxury SUV produced by Jeep. The Wrangler made its debut in 2003 as the first SUV ever produced by Jeep.',
    isAvaliable: true,
    seedOrder: 3
  },
  {
    id: '67ff6b758f1b3684286a2a65',
    ownerId: 'demo-owner',
    brand: 'Toyota',
    model: 'Corolla',
    image: 'https://ik.imagekit.io/greatstack/tr:w-1280:q-auto:f-webp/cars/car_image2_K-t4zyiXPE.png',
    year: 2021,
    category: 'Sedan',
    seating_capacity: 4,
    fuel_type: 'Diesel',
    transmission: 'Manual',
    pricePerDay: 130,
    location: 'Chicago',
    description: 'The Toyota Corolla is a mid-size luxury sedan produced by Toyota. The Corolla made its debut in 2008 as the first sedan ever produced by Toyota.',
    isAvaliable: true,
    seedOrder: 4
  },
  {
    id: '68009c93a3f5fc6338ea7e34',
    ownerId: 'demo-owner',
    brand: 'Ford',
    model: 'Neo 6',
    image: 'https://ik.imagekit.io/devtechz/tr:q-auto:f-webp:w-1280/cars/car_image4_FMYxA8pev.png',
    year: 2022,
    category: 'Sedan',
    seating_capacity: 2,
    fuel_type: 'Diesel',
    transmission: 'Semi-Automatic',
    pricePerDay: 209,
    location: 'Houston',
    description: 'A compact luxury sedan with a quiet cabin, responsive steering, and plenty of comfort for long-distance travel.',
    isAvaliable: true,
    seedOrder: 5
  },
  {
    id: '6847f997cb6e523e5f531897',
    ownerId: 'demo-owner',
    brand: 'BMW',
    model: 'M4',
    image: 'https://ik.imagekit.io/devtechz/tr:q-auto:f-webp:w-1280/cars/car_image4_FMYxA8pev.png',
    year: 2021,
    category: 'Sedan',
    seating_capacity: 2,
    fuel_type: 'Hybrid',
    transmission: 'Automatic',
    pricePerDay: 220,
    location: 'New York',
    description: 'The BMW M4 blends track-inspired power with everyday refinement, pairing a sculpted cabin with serious road presence.',
    isAvaliable: true,
    seedOrder: 6
  },
  {
    id: '685cf1ffadf42036223090e1',
    ownerId: 'demo-owner',
    brand: 'Volvo',
    model: 'C40 EV',
    image: 'https://ik.imagekit.io/greatstack/tr:w-1280:q-auto:f-webp/cars/car_image3_gdP9kgWZz.png',
    year: 2021,
    category: 'SUV',
    seating_capacity: 5,
    fuel_type: 'Electric',
    transmission: 'Automatic',
    pricePerDay: 150,
    location: 'New York',
    description: 'Step into the future with Volvo EVs, a powerful, efficient, and beautifully electric car with advanced safety and elegant design.',
    isAvaliable: true,
    seedOrder: 7
  }
];

const memory = {
  users: [
    {
      id: 'demo-owner',
      name: 'Demo Owner',
      email: 'owner@example.com',
      passwordHash: bcrypt.hashSync('owner123', 10),
      role: 'owner',
      createdAt: new Date('2026-01-05').toISOString()
    },
    {
      id: 'demo-customer',
      name: 'Demo Customer',
      email: 'customer@example.com',
      passwordHash: bcrypt.hashSync('customer123', 10),
      role: 'user',
      createdAt: new Date('2026-01-10').toISOString()
    }
  ],
  cars: seedCars.map((car) => ({ ...car })),
  bookings: [
    {
      id: 'booking-demo-1',
      userId: 'demo-customer',
      carId: '685a66c8409f80f19ec33772',
      pickupDate: '2026-06-05',
      returnDate: '2026-06-08',
      price: 390,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date('2026-05-18').toISOString()
    },
    {
      id: 'booking-demo-2',
      userId: 'demo-customer',
      carId: '67ff5bc069c03d4e45f30b77',
      pickupDate: '2026-06-14',
      returnDate: '2026-06-16',
      price: 600,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date('2026-05-22').toISOString()
    }
  ],
  subscribers: []
};

let dbModePromise;

function newId() {
  return crypto.randomUUID();
}

function isTruthy(value) {
  return value === true || value === 1 || value === '1';
}

function daysBetween(pickupDate, returnDate) {
  const start = new Date(`${pickupDate}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  const days = Math.ceil((end - start) / DAY_MS);
  return Number.isFinite(days) ? days : 0;
}

function assertDateRange(pickupDate, returnDate) {
  const days = daysBetween(pickupDate, returnDate);
  if (!pickupDate || !returnDate || days < 1) {
    const error = new Error('Return date must be after pickup date.');
    error.status = 400;
    throw error;
  }
  return days;
}

function normalizeCar(row) {
  if (!row) return null;

  const car = {
    _id: String(row.id || row._id),
    id: String(row.id || row._id),
    owner: String(row.owner_id || row.ownerId || row.owner || ''),
    ownerId: String(row.owner_id || row.ownerId || row.owner || ''),
    brand: row.brand,
    model: row.model,
    image: row.image,
    year: Number(row.year),
    category: row.category,
    seating_capacity: Number(row.seating_capacity),
    fuel_type: row.fuel_type,
    transmission: row.transmission,
    pricePerDay: Number(row.price_per_day ?? row.pricePerDay),
    location: row.location,
    description: row.description,
    isAvaliable: isTruthy(row.is_available ?? row.isAvaliable),
    is_available: isTruthy(row.is_available ?? row.isAvaliable),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
    seedOrder: Number(row.seed_order ?? row.seedOrder ?? 0)
  };

  return car;
}

function normalizeUser(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash || row.passwordHash,
    role: row.role,
    createdAt: row.created_at || row.createdAt
  };
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function normalizeBooking(row) {
  if (!row) return null;

  const car = row.car || normalizeCar({
    id: row.car_id,
    owner_id: row.owner_id,
    brand: row.brand,
    model: row.model,
    image: row.image,
    year: row.year,
    category: row.category,
    seating_capacity: row.seating_capacity,
    fuel_type: row.fuel_type,
    transmission: row.transmission,
    price_per_day: row.price_per_day,
    location: row.location,
    description: row.description,
    is_available: row.is_available,
    seed_order: row.seed_order,
    created_at: row.car_created_at,
    updated_at: row.car_updated_at
  });

  return {
    id: String(row.id),
    _id: String(row.id),
    userId: String(row.user_id || row.userId || ''),
    carId: String(row.car_id || row.carId || ''),
    pickupDate: formatDateInput(row.pickup_date || row.pickupDate),
    returnDate: formatDateInput(row.return_date || row.returnDate),
    price: Number(row.price),
    status: row.status,
    paymentStatus: row.payment_status || row.paymentStatus,
    createdAt: row.created_at || row.createdAt,
    car
  };
}

function formatDateInput(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

async function shouldUseDb() {
  if (process.env.USE_MEMORY_STORE === 'true') return false;

  if (!dbModePromise) {
    dbModePromise = getPool()
      .then(() => true)
      .catch((error) => {
        if (process.env.MYSQL_REQUIRED === 'true') {
          throw error;
        }
        console.warn(`MySQL unavailable, using in-memory demo data: ${error.message}`);
        return false;
      });
  }

  return dbModePromise;
}

function carMatchesSearch(car, search) {
  if (!search) return true;
  const haystack = [
    car.brand,
    car.model,
    car.category,
    car.transmission,
    car.fuel_type,
    car.location,
    car.description
  ].join(' ').toLowerCase();

  return haystack.includes(search.toLowerCase());
}

function bookingOverlaps(booking, pickupDate, returnDate) {
  if (booking.status === 'cancelled') return false;
  return pickupDate < booking.returnDate && returnDate > booking.pickupDate;
}

async function getCars(filters = {}) {
  const q = (filters.q || '').trim();

  if (await shouldUseDb()) {
    const params = [];
    const where = [];

    if (filters.available) {
      where.push('is_available = 1');
    }
    if (filters.location) {
      where.push('location = ?');
      params.push(filters.location);
    }
    if (q) {
      where.push('(brand LIKE ? OR model LIKE ? OR category LIKE ? OR transmission LIKE ? OR fuel_type LIKE ? OR location LIKE ? OR description LIKE ?)');
      const term = `%${q}%`;
      params.push(term, term, term, term, term, term, term);
    }

    const sql = `SELECT * FROM cars ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY seed_order ASC, created_at DESC`;
    const rows = await query(sql, params);
    return rows.map(normalizeCar);
  }

  return memory.cars
    .map(normalizeCar)
    .filter((car) => (!filters.available || car.isAvaliable))
    .filter((car) => (!filters.location || car.location === filters.location))
    .filter((car) => carMatchesSearch(car, q))
    .sort((a, b) => a.seedOrder - b.seedOrder);
}

async function getCarById(id) {
  if (await shouldUseDb()) {
    const rows = await query('SELECT * FROM cars WHERE id = ? LIMIT 1', [id]);
    return normalizeCar(rows[0]);
  }

  return normalizeCar(memory.cars.find((car) => car.id === id || car._id === id));
}

async function checkAvailability({ location, pickupDate, returnDate }) {
  assertDateRange(pickupDate, returnDate);

  if (await shouldUseDb()) {
    const rows = await query(
      `SELECT c.*
       FROM cars c
       WHERE c.is_available = 1
         AND (? = '' OR c.location = ?)
         AND NOT EXISTS (
           SELECT 1 FROM bookings b
           WHERE b.car_id = c.id
             AND b.status IN ('pending', 'confirmed')
             AND ? < b.return_date
             AND ? > b.pickup_date
         )
       ORDER BY c.seed_order ASC, c.created_at DESC`,
      [location || '', location || '', pickupDate, returnDate]
    );
    return rows.map(normalizeCar);
  }

  return memory.cars
    .map(normalizeCar)
    .filter((car) => car.isAvaliable)
    .filter((car) => !location || car.location === location)
    .filter((car) => !memory.bookings.some((booking) => booking.carId === car.id && bookingOverlaps(booking, pickupDate, returnDate)))
    .sort((a, b) => a.seedOrder - b.seedOrder);
}

async function findUserByEmail(email) {
  if (await shouldUseDb()) {
    const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
    return normalizeUser(rows[0]);
  }

  return normalizeUser(memory.users.find((user) => user.email.toLowerCase() === email.toLowerCase()));
}

async function getUserById(id) {
  if (await shouldUseDb()) {
    const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return normalizeUser(rows[0]);
  }

  return normalizeUser(memory.users.find((user) => user.id === id));
}

async function createUser({ name, email, password, role = 'user' }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('An account with this email already exists.');
    error.status = 409;
    throw error;
  }

  const user = {
    id: newId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role,
    createdAt: new Date().toISOString()
  };

  if (await shouldUseDb()) {
    await query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name, user.email, user.passwordHash, user.role]
    );
  } else {
    memory.users.push(user);
  }

  return publicUser(user);
}

async function verifyUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const matches = await bcrypt.compare(password, user.passwordHash);
  return matches ? publicUser(user) : null;
}

async function setUserRole(userId, role) {
  if (await shouldUseDb()) {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
  } else {
    const user = memory.users.find((item) => item.id === userId);
    if (user) user.role = role;
  }
  return publicUser(await getUserById(userId));
}

async function createBooking({ userId, carId, pickupDate, returnDate }) {
  const days = assertDateRange(pickupDate, returnDate);
  const car = await getCarById(carId);

  if (!car || !car.isAvaliable) {
    const error = new Error('This car is not available.');
    error.status = 404;
    throw error;
  }

  const availableCars = await checkAvailability({ location: car.location, pickupDate, returnDate });
  if (!availableCars.some((item) => item.id === car.id)) {
    const error = new Error('This car is already booked for the selected dates.');
    error.status = 409;
    throw error;
  }

  const booking = {
    id: newId(),
    userId,
    carId,
    pickupDate,
    returnDate,
    price: days * car.pricePerDay,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  };

  if (await shouldUseDb()) {
    await query(
      'INSERT INTO bookings (id, user_id, car_id, pickup_date, return_date, price, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [booking.id, booking.userId, booking.carId, booking.pickupDate, booking.returnDate, booking.price, booking.status, booking.paymentStatus]
    );
  } else {
    memory.bookings.push(booking);
  }

  return normalizeBooking({ ...booking, car });
}

function bookingJoinSql(whereClause) {
  return `SELECT b.*, c.id AS car_id, c.owner_id, c.brand, c.model, c.image, c.year, c.category,
                 c.seating_capacity, c.fuel_type, c.transmission, c.price_per_day,
                 c.location, c.description, c.is_available, c.seed_order,
                 c.created_at AS car_created_at, c.updated_at AS car_updated_at
          FROM bookings b
          JOIN cars c ON c.id = b.car_id
          ${whereClause}
          ORDER BY b.created_at DESC`;
}

async function getUserBookings(userId) {
  if (await shouldUseDb()) {
    const rows = await query(bookingJoinSql('WHERE b.user_id = ?'), [userId]);
    return rows.map(normalizeBooking);
  }

  return memory.bookings
    .filter((booking) => booking.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((booking) => normalizeBooking({ ...booking, car: normalizeCar(memory.cars.find((car) => car.id === booking.carId)) }));
}

async function getOwnerBookings(ownerId) {
  if (await shouldUseDb()) {
    const rows = await query(bookingJoinSql('WHERE c.owner_id = ?'), [ownerId]);
    return rows.map(normalizeBooking);
  }

  const ownerCarIds = new Set(memory.cars.filter((car) => car.ownerId === ownerId).map((car) => car.id));
  return memory.bookings
    .filter((booking) => ownerCarIds.has(booking.carId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((booking) => normalizeBooking({ ...booking, car: normalizeCar(memory.cars.find((car) => car.id === booking.carId)) }));
}

async function getOwnerCars(ownerId) {
  if (await shouldUseDb()) {
    const rows = await query('SELECT * FROM cars WHERE owner_id = ? ORDER BY seed_order ASC, created_at DESC', [ownerId]);
    return rows.map(normalizeCar);
  }

  return memory.cars
    .filter((car) => car.ownerId === ownerId)
    .map(normalizeCar)
    .sort((a, b) => a.seedOrder - b.seedOrder);
}

async function addCar(ownerId, payload) {
  const car = normalizeCar({
    id: newId(),
    ownerId,
    brand: payload.brand,
    model: payload.model,
    image: payload.image,
    year: payload.year,
    category: payload.category,
    seating_capacity: payload.seating_capacity,
    fuel_type: payload.fuel_type,
    transmission: payload.transmission,
    pricePerDay: payload.pricePerDay,
    location: payload.location,
    description: payload.description,
    isAvaliable: true,
    seedOrder: 1000,
    createdAt: new Date().toISOString()
  });

  if (await shouldUseDb()) {
    await query(
      `INSERT INTO cars
       (id, owner_id, brand, model, image, year, category, seating_capacity, fuel_type, transmission, price_per_day, location, description, is_available, seed_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        car.id,
        ownerId,
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
  } else {
    memory.cars.push({ ...car, ownerId });
  }

  return car;
}

async function toggleCarAvailability(ownerId, carId) {
  const car = await getCarById(carId);
  if (!car || car.ownerId !== ownerId) {
    const error = new Error('Car not found.');
    error.status = 404;
    throw error;
  }

  const nextValue = !car.isAvaliable;
  if (await shouldUseDb()) {
    await query('UPDATE cars SET is_available = ? WHERE id = ? AND owner_id = ?', [nextValue ? 1 : 0, carId, ownerId]);
  } else {
    const item = memory.cars.find((entry) => entry.id === carId && entry.ownerId === ownerId);
    item.isAvaliable = nextValue;
    item.is_available = nextValue;
  }

  return getCarById(carId);
}

async function deleteCar(ownerId, carId) {
  const car = await getCarById(carId);
  if (!car || car.ownerId !== ownerId) {
    const error = new Error('Car not found.');
    error.status = 404;
    throw error;
  }

  if (await shouldUseDb()) {
    await query('DELETE FROM cars WHERE id = ? AND owner_id = ?', [carId, ownerId]);
  } else {
    memory.cars = memory.cars.filter((entry) => !(entry.id === carId && entry.ownerId === ownerId));
    memory.bookings = memory.bookings.filter((booking) => booking.carId !== carId);
  }

  return true;
}

async function changeBookingStatus(ownerId, bookingId, status) {
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    const error = new Error('Invalid booking status.');
    error.status = 400;
    throw error;
  }

  const bookings = await getOwnerBookings(ownerId);
  const booking = bookings.find((item) => item.id === bookingId);
  if (!booking) {
    const error = new Error('Booking not found.');
    error.status = 404;
    throw error;
  }

  if (await shouldUseDb()) {
    await query('UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?', [status, status === 'confirmed' ? 'paid' : booking.paymentStatus, bookingId]);
  } else {
    const item = memory.bookings.find((entry) => entry.id === bookingId);
    item.status = status;
    if (status === 'confirmed') item.paymentStatus = 'paid';
  }

  return normalizeBooking({ ...booking, status, paymentStatus: status === 'confirmed' ? 'paid' : booking.paymentStatus });
}

async function ownerDashboard(ownerId) {
  const [cars, bookings] = await Promise.all([getOwnerCars(ownerId), getOwnerBookings(ownerId)]);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthlyRevenue = bookings
    .filter((booking) => booking.status === 'confirmed')
    .filter((booking) => {
      const created = new Date(booking.createdAt);
      return created.getMonth() === month && created.getFullYear() === year;
    })
    .reduce((sum, booking) => sum + booking.price, 0);

  return {
    totalCars: cars.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((booking) => booking.status === 'pending').length,
    confirmedBookings: bookings.filter((booking) => booking.status === 'confirmed').length,
    monthlyRevenue,
    recentBookings: bookings.slice(0, 5)
  };
}

async function addNewsletterSubscriber(email) {
  if (await shouldUseDb()) {
    await query('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)', [email.toLowerCase()]);
  } else if (!memory.subscribers.includes(email.toLowerCase())) {
    memory.subscribers.push(email.toLowerCase());
  }

  return true;
}

module.exports = {
  addCar,
  addNewsletterSubscriber,
  changeBookingStatus,
  checkAvailability,
  createBooking,
  createUser,
  deleteCar,
  getCarById,
  getCars,
  getOwnerBookings,
  getOwnerCars,
  getUserBookings,
  getUserById,
  ownerDashboard,
  publicUser,
  seedCars,
  setUserRole,
  shouldUseDb,
  toggleCarAvailability,
  verifyUser
};
