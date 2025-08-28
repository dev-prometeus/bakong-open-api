// server.js
require('dotenv').config();
const express = require('express');
const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
const {successResponse , errorResponse} = require('./src/helpers/responseHelper')
const connectDB = require('./src/config/db');
const Order = require('./src/api/models/Payment');
const axios = require('axios');

connectDB();

const app = express();
app.use(express.json());

const BAKONG_BASE_URL = process.env.BAKONG_PROD_BASE_API_URL;
const BAKONG_ACCESS_TOKEN = process.env.BAKONG_ACCESS_TOKEN;


/**
 * 1️⃣ Generate Dynamic KHQR
 */
app.post('/api/generate-khqr', async (req, res) => {
  try {
    // Find the latest order to generate a new orderId
    const latestOrder = await Order.findOne().sort({ createdAt: -1 });

    let newOrderNumber = 1;
    if (latestOrder && latestOrder.orderId) {
      // Extract number from ORDER_00001
      const lastNumber = parseInt(latestOrder.orderId.split('_')[1], 10);
      newOrderNumber = lastNumber + 1;
    }

    // Format orderId (ORDER_00001, ORDER_00002, ...)
    const orderId = `ORDER_${String(newOrderNumber).padStart(5, '0')}`;

    // Expiration timestamp (5 mins from now)
    const expirationTimestamp = Date.now() + 5 * 60 * 1000;

    // Optional data for one-time KHQR
    const optionalData = {
      currency: khqrData.currency.khr,
      amount: 100, // Example: 100 KHR | If amount is set to 0, QR and MD5 will be generated without a specific amount
      expirationTimestamp,
    };

    const individualInfo = new IndividualInfo(
      "chanvuthy_leap3@aclb", // Bakong Account ID
      "Chanvuthy Leap",       // Name
      "PHNOM PENH",           // City
      optionalData
    );

    const khqr = new BakongKHQR();
    const qrData = khqr.generateIndividual(individualInfo);

    // Store in MongoDB
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        orderId,
        qr: qrData.data.qr,
        md5: qrData.data.md5,
        expiration: expirationTimestamp,
        paid: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(res, 'QR generated successfully', {
      orderId: order.orderId,
      qr: order.qr,
      md5: order.md5,
      expiresAt: order.expiresAt
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 'Internal error', err);
  }
});



/**
 * 2️⃣ Check Payment by MD5
 */
app.post('/api/check-payment', async (req, res) => {
  try {
    const { md5 } = req.body;

    if (!md5) return res.status(400).json({ message: 'md5 is required' });

    // Find order by MD5
    const order = await Order.findOne({ md5 });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Call Bakong API to check payment
    const response = await axios.post(`${BAKONG_BASE_URL}/check_transaction_by_md5`, {md5: order.md5}, {
      headers: {
        Authorization: `Bearer ${BAKONG_ACCESS_TOKEN}`,
      }
      }
    );

    const data = response.data;

    if (data.responseCode === 0 && data.data?.hash) {
      // Update order with Bakong response fields
      await Order.updateOne(
        { _id: order._id },
        {
          bakongHash: data.data.hash,
          fromAccountId: data.data.fromAccountId,
          toAccountId: data.data.toAccountId,
          currency: data.data.currency,
          amount: data.data.amount,
          description: data.data.description,
          externalRef: data.data.externalRef,
          createdDateMs: data.data.createdDateMs,
          acknowledgedDateMs: data.data.acknowledgedDateMs,
          trackingStatus: data.data.trackingStatus,
          receiverBank: data.data.receiverBank,
          receiverBankAccount: data.data.receiverBankAccount,
          instructionRef: data.data.instructionRef,
          paid: true,
          paidAt: new Date(),
        }
      );

      return res.json({
        message: 'Payment confirmed',
        orderId: order.orderId,
        bakongHash: data.data.hash,
        bakongData: data.data
      });
    } else {
      return res.status(400).json({
        message: 'Payment not found or not completed',
        bakongData: data.data || null,
      });
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Internal error', error: err.message });
  }
});


/**
 * Get order info
 */
app.get('/api/order/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Internal error', error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
