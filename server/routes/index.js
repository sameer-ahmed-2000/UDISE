const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const dataRoutes = require('./school');

router.use('/auth', authRoutes);
router.use('/data', dataRoutes);

module.exports = router;
