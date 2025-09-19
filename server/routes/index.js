const express = require('express');
const router = express.Router();

// Import individual route files (if you have many)
const authRoutes = require('./auth');
const dataRoutes = require('./school'); // for school CRUD APIs later

// Use the routes
router.use('/auth', authRoutes);
router.use('/data', dataRoutes);

module.exports = router;
