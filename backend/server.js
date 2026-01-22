const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Load env vars first
dotenv.config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
// const paymentRoutes = require('./routes/payments'); // DISABLED to fix crash

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
// app.use('/api/payments', paymentRoutes); // DISABLED

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
