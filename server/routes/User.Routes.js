const express = require('express');
const router = express.Router();
const userController = require('../controllers/User.Controller');

// Register a new user
router.post('/register', userController.registerUser);
module.exports = router;