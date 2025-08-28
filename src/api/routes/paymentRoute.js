const express = require('express');
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Routes
router.post('/generate-khqr', paymentController.generateKHQR);
router.post('/check-payment', paymentController.checkPayment);
router.get('/order/:orderId', paymentController.getOrderInfo);

module.exports = router;