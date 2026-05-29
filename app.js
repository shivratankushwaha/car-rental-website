require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    }
  })
});

const locations = ['New York', 'Los Angeles', 'Houston', 'Chicago'];
const categories = ['Sedan', 'SUV', 'Van'];
const transmissions = ['Automatic', 'Manual', 'Semi-Automatic'];
const fuelTypes = ['Gas', 'Diesel', 'Petrol', 'Electric', 'Hybrid'];

const assets = {
  logo: 'https://car-rental-gs.vercel.app/assets/logo-CF3gF4eH.svg',
  mainCar: 'https://car-rental-gs.vercel.app/assets/main_car-hpkzbezO.png',
  bannerCar: 'https://car-rental-gs.vercel.app/assets/banner_car_image-B9uXTQkB.png',
  testimonialOne: 'https://car-rental-gs.vercel.app/assets/testimonial_image_1-CoRIPhVu.png',
  testimonialTwo: 'https://car-rental-gs.vercel.app/assets/testimonial_image_2-CKWN3yCB.png'
};

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function flash(req, type, message) {
  req.session.flash = { type, message };
}

function apiError(res, error) {
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Something went wrong.'
  });
}

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function statusClass(status) {
  return {
    pending: 'text-bg-warning',
    confirmed: 'text-bg-success',
    cancelled: 'text-bg-secondary'
  }[status] || 'text-bg-light';
}

function requireLogin(req, res, next) {
  if (!req.session.user) {
    flash(req, 'warning', 'Please login to continue.');
    return res.redirect('/?login=1');
  }
  return next();
}

function requireOwner(req, res, next) {
  if (!req.session.user) {
    flash(req, 'warning', 'Please login to manage cars.');
    return res.redirect('/?login=1');
  }
  if (req.session.user.role !== 'owner') {
    flash(req, 'warning', 'Switch to an owner account to open the dashboard.');
    return res.redirect('/');
  }
  return next();
}

function requireApiLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Please login to continue.' });
  }
  return next();
}

function requireApiOwner(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Please login to continue.' });
  }
  if (req.session.user.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Owner access required.' });
  }
  return next();
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'car-rental-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.flash = req.session.flash || null;
  res.locals.showLogin = req.query.login === '1';
  res.locals.assets = assets;
  res.locals.locations = locations;
  res.locals.categories = categories;
  res.locals.transmissions = transmissions;
  res.locals.fuelTypes = fuelTypes;
  res.locals.helpers = {
    formatDate,
    formatMoney,
    statusClass,
    todayInput
  };
  delete req.session.flash;
  next();
});

app.get('/', asyncHandler(async (req, res) => {
  const cars = await store.getCars({ available: true });
  res.render('pages/home', {
    title: 'Luxury cars on Rent',
    cars: cars.slice(0, 6)
  });
}));

app.get('/cars', asyncHandler(async (req, res) => {
  const { q = '', pickupLocation = '', pickupDate = '', returnDate = '' } = req.query;
  const hasAvailabilitySearch = pickupLocation && pickupDate && returnDate;
  let cars = hasAvailabilitySearch
    ? await store.checkAvailability({ location: pickupLocation, pickupDate, returnDate })
    : await store.getCars({ q, available: true });

  if (q && hasAvailabilitySearch) {
    cars = cars.filter((car) => [car.brand, car.model, car.category, car.transmission, car.fuel_type, car.location].join(' ').toLowerCase().includes(q.toLowerCase()));
  }

  res.render('pages/cars', {
    title: 'Available Cars',
    cars,
    query: { q, pickupLocation, pickupDate, returnDate }
  });
}));

app.get('/car-details/:id', asyncHandler(async (req, res) => {
  const car = await store.getCarById(req.params.id);
  if (!car) {
    return res.status(404).render('pages/error', {
      title: 'Car not found',
      message: 'The car you are looking for is no longer available.'
    });
  }

  return res.render('pages/car-details', {
    title: `${car.brand} ${car.model}`,
    car
  });
}));

app.get('/my-bookings', requireLogin, asyncHandler(async (req, res) => {
  const bookings = await store.getUserBookings(req.session.user.id);
  res.render('pages/my-bookings', {
    title: 'My Bookings',
    bookings
  });
}));

app.get('/owner/start', requireLogin, asyncHandler(async (req, res) => {
  if (req.session.user.role !== 'owner') {
    req.session.user = await store.setUserRole(req.session.user.id, 'owner');
    flash(req, 'success', 'Your account is ready for car listing.');
  }
  res.redirect('/owner');
}));

app.get('/owner', requireOwner, asyncHandler(async (req, res) => {
  const dashboard = await store.ownerDashboard(req.session.user.id);
  res.render('pages/owner/dashboard', {
    title: 'Owner Dashboard',
    dashboard
  });
}));

app.get('/owner/add-car', requireOwner, (req, res) => {
  res.render('pages/owner/add-car', {
    title: 'Add New Car'
  });
});

app.get('/owner/manage-cars', requireOwner, asyncHandler(async (req, res) => {
  const cars = await store.getOwnerCars(req.session.user.id);
  res.render('pages/owner/manage-cars', {
    title: 'Manage Cars',
    cars
  });
}));

app.get('/owner/manage-bookings', requireOwner, asyncHandler(async (req, res) => {
  const bookings = await store.getOwnerBookings(req.session.user.id);
  res.render('pages/owner/manage-bookings', {
    title: 'Manage Bookings',
    bookings
  });
}));

app.get('/api/user/cars', asyncHandler(async (req, res) => {
  const cars = await store.getCars({ q: req.query.q || '', available: req.query.available !== 'false' });
  res.json({ success: true, cars });
}));

app.get('/api/cars/:id', asyncHandler(async (req, res) => {
  const car = await store.getCarById(req.params.id);
  if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
  return res.json({ success: true, car });
}));

app.post('/api/user/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Please enter a name, email, and password with at least 6 characters.' });
  }

  const user = await store.createUser({ name, email, password });
  req.session.user = user;
  return res.json({ success: true, message: 'Account created successfully.', user });
}));

app.post('/api/user/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await store.verifyUser(email || '', password || '');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  req.session.user = user;
  return res.json({ success: true, message: 'Logged in successfully.', user });
}));

app.post('/api/user/logout', requireApiLogin, (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

app.get('/api/user/data', requireApiLogin, (req, res) => {
  res.json({ success: true, user: req.session.user });
});

app.post('/api/owner/change-role', requireApiLogin, asyncHandler(async (req, res) => {
  req.session.user = await store.setUserRole(req.session.user.id, 'owner');
  res.json({ success: true, message: 'Owner dashboard enabled.', user: req.session.user });
}));

app.post('/api/bookings/check-availability', asyncHandler(async (req, res) => {
  const availableCars = await store.checkAvailability({
    location: req.body.location,
    pickupDate: req.body.pickupDate,
    returnDate: req.body.returnDate
  });
  res.json({ success: true, availableCars });
}));

app.post('/api/bookings/create', requireApiLogin, asyncHandler(async (req, res) => {
  const booking = await store.createBooking({
    userId: req.session.user.id,
    carId: req.body.carId,
    pickupDate: req.body.pickupDate,
    returnDate: req.body.returnDate
  });
  res.json({ success: true, message: 'Booking request submitted.', booking });
}));

app.get('/api/bookings/user', requireApiLogin, asyncHandler(async (req, res) => {
  const bookings = await store.getUserBookings(req.session.user.id);
  res.json({ success: true, bookings });
}));

app.get('/api/bookings/owner', requireApiOwner, asyncHandler(async (req, res) => {
  const bookings = await store.getOwnerBookings(req.session.user.id);
  res.json({ success: true, bookings });
}));

app.post('/api/bookings/change-status', requireApiOwner, asyncHandler(async (req, res) => {
  const booking = await store.changeBookingStatus(req.session.user.id, req.body.bookingId, req.body.status);
  res.json({ success: true, message: 'Booking status updated.', booking });
}));

app.get('/api/owner/dashboard', requireApiOwner, asyncHandler(async (req, res) => {
  const dashboard = await store.ownerDashboard(req.session.user.id);
  res.json({ success: true, dashboard });
}));

app.post('/api/owner/add-car', requireApiOwner, upload.single('image'), asyncHandler(async (req, res) => {
  const body = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : body.imageUrl;

  if (!image) {
    return res.status(400).json({ success: false, message: 'Please upload an image or provide an image URL.' });
  }

  const required = ['brand', 'model', 'year', 'pricePerDay', 'category', 'transmission', 'fuel_type', 'seating_capacity', 'location', 'description'];
  const missing = required.find((field) => !body[field]);
  if (missing) {
    return res.status(400).json({ success: false, message: `Missing field: ${missing}` });
  }

  const car = await store.addCar(req.session.user.id, { ...body, image });
  res.json({ success: true, message: 'Car added successfully.', car });
}));

app.post('/api/owner/toggle-car', requireApiOwner, asyncHandler(async (req, res) => {
  const car = await store.toggleCarAvailability(req.session.user.id, req.body.carId);
  res.json({ success: true, message: 'Car availability updated.', car });
}));

app.delete('/api/owner/cars/:id', requireApiOwner, asyncHandler(async (req, res) => {
  await store.deleteCar(req.session.user.id, req.params.id);
  res.json({ success: true, message: 'Car deleted successfully.' });
}));

app.post('/api/newsletter', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  await store.addNewsletterSubscriber(email);
  res.json({ success: true, message: 'Subscribed successfully.' });
}));

app.use((req, res) => {
  res.status(404).render('pages/error', {
    title: 'Page not found',
    message: 'The page you are looking for does not exist.'
  });
});

app.use((error, req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return apiError(res, error);
  }

  console.error(error);
  return res.status(error.status || 500).render('pages/error', {
    title: 'Something went wrong',
    message: error.message || 'Please try again in a moment.'
  });
});

app.listen(PORT, () => {
  console.log(`CarRental app running at http://localhost:${PORT}`);
});
