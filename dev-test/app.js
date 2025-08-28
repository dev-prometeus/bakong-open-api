// Import required packages
require('dotenv').config();
const {BakongKHQR, khqrData, IndividualInfo, MerchantInfo, SourceInfo} = require("bakong-khqr");
const express = require('express');
const axios = require('axios');



// --- Generate KHQR and MD5 ---- //

const optionalData = {
    currency: khqrData.currency.khr,
    amount: 100,
    billNumber: "#000002",
    mobileNumber: "070773389",
    storeLabel: "Chanvuthy Leap",
    terminalLabel: "T000001",
    expirationTimestamp: Date.now() + (2 * 60 * 1000),
    merchantCategoryCode: "5999",
};

const individualInfo = new IndividualInfo(
    "chanvuthy_leap3@aclb",
    khqrData.currency.khr,
    "chanvuthy",
    "PhnomPenh",
    optionalData
);

const khqr = new BakongKHQR("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiODgwMGY3ZGZlN2ZhNGY1YSJ9LCJpYXQiOjE3NTYyNjM3MjIsImV4cCI6MTc2NDAzOTcyMn0.x1cJwa1e32sKa0lRsENb5gw8oVsOa2mk_8Scy5ffxwE");
const response = khqr.generateIndividual(individualInfo);
console.log(response);


// --- Verify QR --- //
const qrString = "00020101021129240020chanvuthy_leap3@aclb5204599953031165802KH59031166009chanvuthy63040798";
const isKhqr = BakongKHQR.verify(qrString);
// console.log("isKhqr", isKhqr.isValid);
// --- Verify QR ---//


// --- Decoded QR --- //
const qrStringForDecoded = "00020101021129240020chanvuthy_leap1@aclb5204599953031165802KH59031166009chanvuthy63048F7E";
const decodedValue = BakongKHQR.decode(qrStringForDecoded);
// console.log("decodedValue", decodedValue);


// --- Generate KHQR Deeplink --- //

// Request api : https://sit-api-bakong.nbc.gov.kh/v1/generate_deeplink_by_qr 
 
// Request body : {
//   "qr": "00020101021129240020chanvuthy_leap1@aclb5204599953031165802KH59031166009chanvuthy63048F7E",
//   "sourceInfo": {
//     "appIconUrl": "https://your-app.com/icon.png",
//     "appName": "Leap Chanvuthy App",
//     "appDeepLinkCallback": "yourawesomeapp://payment/success"
//   }
// }


