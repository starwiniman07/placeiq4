const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from the root .env.local
dotenv.config({ path: '../.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth.routes');
const aptitudeRoutes = require('./routes/aptitude.routes');
const technicalRoutes = require('./routes/technical.routes');
const interviewRoutes = require('./routes/interview.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const paymentRoutes = require('./routes/payment.routes');
const hrRoutes = require('./routes/hr.routes');
const resumeRoutes = require('./routes/resume.routes');
const communityRoutes = require('./routes/community.routes');
const roadmapRoutes = require('./routes/roadmap.routes');

app.use('/api/auth', authRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/technical', technicalRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('PlaceIQ Backend API is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
