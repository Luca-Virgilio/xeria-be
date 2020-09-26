const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.js');

// /* GET users listing. */
router
.route('/')
.get(userController.getUsers)
.post(userController.createUser);

router.get('/:id', userController.getUser);

module.exports = router;
