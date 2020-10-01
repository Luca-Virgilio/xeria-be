const express = require('express');
const router = express.Router();
const onnxController = require('../controllers/onnxController');


router
.route('/test1')
.get(onnxController.testApi);
router
.route('/test2')
.get(onnxController.testApi2);

module.exports = router;