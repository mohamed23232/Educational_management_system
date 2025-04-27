// routes/errorRoutes.js

const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');

// Define route to handle 404 error page
router.use((req, res, next) => {
    errorController.handle404(req, res);
});

module.exports = router;
