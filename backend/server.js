require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./config/db');

require('./models/index');

const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

// Allow all Vercel deployments + localhost + any custom CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow ALL vercel.app deployments (preview + production)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow netlify deployments
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check — Render pings this to keep the service alive
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/test',           require('./routes/test'));
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/patients',       require('./routes/patients'));
app.use('/api/doctors',        require('./routes/doctors'));
app.use('/api/receptionists',  require('./routes/receptionists'));
app.use('/api/departments',    require('./routes/departments'));
app.use('/api/appointments',   require('./routes/appointments'));
app.use('/api/prescriptions',  require('./routes/prescriptions'));
app.use('/api/billing',        require('./routes/billing'));
app.use('/api/admissions',     require('./routes/admissions'));
app.use('/api/rooms',          require('./routes/rooms'));
app.use('/api/medical-records',require('./routes/medicalRecords'));
app.use('/api/dashboard',      require('./routes/dashboard'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏥 HealthAxis Backend running on port ${PORT}`);
});
