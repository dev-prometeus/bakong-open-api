// // server.js
// require('dotenv').config();
// const express = require('express');
// const paymentRoutes = require('./src/api/routes/paymentRoute');
// const connectDB = require('./src/config/db');

// connectDB();

// const app = express();
// app.use(express.json());

// // Routes
// app.use('/api', paymentRoutes);

// // Only start server if not in test environment
// if (process.env.NODE_ENV !== 'test') {
//   const PORT = process.env.PORT || 4000;
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// }

// // Export app for testing
// module.exports = app;


// server.js
require('dotenv').config();
const express = require('express');
const paymentRoutes = require('./src/api/routes/paymentRoute');
const connectDB = require('./src/config/db');

const app = express();
app.use(express.json());

// Routes
app.use('/api', paymentRoutes);

// Only connect to DB & start server if not testing
if (process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('DB connection error:', err));
}

module.exports = app;
