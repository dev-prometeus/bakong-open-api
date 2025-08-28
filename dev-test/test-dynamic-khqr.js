const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");

const optionalData = {
    currency: khqrData.currency.khr,
    amount: 100, // Example amount in KHR (e.g., 50,000 KHR)
    expirationTimestamp: Date.now() + (5 * 60 * 1000) // Expires in 5 minutes
};

const individualInfo = new IndividualInfo(
    "chanvuthy_leap3@aclb", // Bakong Account ID of the individual
    "Chanvuthy Leap",     // Name of the individual
    "PHNOMPENH",     // City of the individual
    optionalData
);

const khqr = new BakongKHQR();
const qrString = khqr.generateIndividual(individualInfo);

console.log(qrString);
