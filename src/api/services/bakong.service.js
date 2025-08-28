const axios = require('axios');
const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");

// In-memory cache for the Bakong access token
let tokenCache = {
    accessToken: null,
    expiresAt: 0,
};

class BakongService {
    /**
     * Retrieves a valid Bakong access token, fetching a new one if necessary.
     * @private
     */
    async _getAccessToken() {
        // If we have a valid token in cache, return it
        if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
            return tokenCache.accessToken;
        }

        console.log('Fetching new Bakong access token...');
        try {
            const response = await axios.post(`${process.env.BAKONG_BASE_URL}/token`, {
                merchant_id: process.env.BAKONG_MERCHANT_ID,
                secret: process.env.BAKONG_SECRET,
            });

            const { accessToken, expiresIn } = response.data.data;
            
            // Store the new token and calculate its expiry time (with a 60-second buffer)
            tokenCache.accessToken = accessToken;
            tokenCache.expiresAt = Date.now() + (expiresIn - 60) * 1000;
            
            return accessToken;
        } catch (error) {
            console.error('Failed to fetch Bakong access token:', error.response?.data || error.message);
            throw new Error('Could not authenticate with Bakong service.');
        }
    }

    /**
     * Generates a KHQR string and MD5 hash using the bakong-khqr library.
     * @param {object} paymentData - Contains amount, currency, and orderId.
     */
    async generateQrCode(paymentData) {
        const { amount, currency, orderId } = paymentData;

        try {
            const accessToken = await this._getAccessToken();
            
            // Set expiration for 5 minutes from now
            const expirationDate = new Date(Date.now() + (5 * 60 * 1000));

            const optionalData = {
                currency: currency === 'KHR' ? khqrData.currency.khr : khqrData.currency.usd,
                amount: parseFloat(amount),
                billNumber: orderId, // Use the unique orderId from your system
                storeLabel: "Your Store Name", // Should be from .env
                terminalLabel: "Online Payment",
                expirationTimestamp: expirationDate.getTime(),
                merchantCategoryCode: "5999", // Example code
            };

            const individualInfo = new IndividualInfo(
                process.env.BAKONG_ACCOUNT_ID,
                optionalData.currency,
                "Your Merchant Name", // Should be from .env
                "Phnom Penh",
                optionalData
            );

            const khqr = new BakongKHQR(accessToken);
            const response = khqr.generateIndividual(individualInfo);

            return {
                ...response, // This will contain 'khqr' and 'md5'
                expiresAt: expirationDate,
            };

        } catch (error) {
            console.error('Error generating KHQR code:', error);
            throw new Error('Failed to generate payment QR code.');
        }
    }

    /**
     * Checks the status of a transaction with the Bakong API.
     * @param {string} md5 - The MD5 hash of the transaction to check.
     */
    async checkTransactionStatus(md5) {
        try {
            const accessToken = await this._getAccessToken();
            const response = await axios.post(
                `${process.env.BAKONG_BASE_URL}/check_transaction_by_md5`,
                { md5 },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to check transaction status:', error.response?.data || error.message);
            // Don't throw an error if the transaction is just not found, let the controller handle it
            if (error.response?.status === 404) {
                return null;
            }
            throw new Error('Could not check transaction status with Bakong.');
        }
    }
}

// Export a singleton instance of the service
module.exports = new BakongService();