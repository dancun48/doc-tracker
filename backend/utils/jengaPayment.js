import axios from 'axios';
import crypto from 'crypto';

class JengaPayment {
  constructor() {
    this.apiKey = process.env.JENGA_API_KEY;
    this.username = process.env.JENGA_USERNAME;
    this.password = process.env.JENGA_PASSWORD;
    this.baseURL = process.env.JENGA_BASE_URL;
    this.accountNumber = process.env.JENGA_ACCOUNT_NUMBER;
  }

  // Get Jenga authentication token
  async getAuthToken() {
    try {
      const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/identity/v2/token`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.accessToken;
    } catch (error) {
      console.error('Jenga Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Jenga API');
    }
  }

  // Generate signature for Jenga requests
  generateSignature(message) {
    return crypto
      .createHmac('sha256', this.apiKey)
      .update(message)
      .digest('base64');
  }

  // Merchant Payment - For payments to your business account
  async initiateMerchantPayment(paymentData) {
    try {
      const token = await this.getAuthToken();
      
      const requestBody = {
        source: {
          countryCode: "KE",
          name: paymentData.patientName,
          accountNumber: paymentData.patientAccountNumber || this.accountNumber
        },
        destination: {
          type: "merchant",
          countryCode: "KE",
          name: "Tech Services",
          mobileNumber: paymentData.patientPhone, // Client's phone for M-Pesa
          accountNumber: this.accountNumber, // Your merchant account
          merchantCode: process.env.JENGA_MERCHANT_CODE
        },
        transfer: {
          type: "MerchantPay",
          amount: paymentData.amount,
          currencyCode: "KES",
          reference: paymentData.reference,
          date: new Date().toISOString().split('T')[0],
          description: `Medical Appointment - ${paymentData.patientName} - ${paymentData.appointmentId}`
        }
      };

      // Generate signature
      const signatureMessage = `${this.username}${paymentData.amount}${paymentData.reference}`;
      const signature = this.generateSignature(signatureMessage);

      const response = await axios.post(
        `${this.baseURL}/transaction/v2/remittance`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Signature': signature,
            'Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        reference: paymentData.reference,
        status: response.data.status,
        message: "Payment initiated successfully"
      };

    } catch (error) {
      console.error('Jenga Payment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Payment initiation failed');
    }
  }

  // Airline/Merchant Payment (Alternative method)
  async initiateAirlinePayment(paymentData) {
    try {
      const token = await this.getAuthToken();

      const requestBody = {
        source: {
          countryCode: "KE",
          name: paymentData.patientName,
          accountNumber: this.accountNumber
        },
        destination: {
          type: "airline",
          countryCode: "KE",
          name: "Medical Services Ltd",
          accountNumber: this.accountNumber
        },
        transfer: {
          type: "AirlinePay",
          amount: paymentData.amount,
          currencyCode: "KES",
          reference: paymentData.reference,
          date: new Date().toISOString().split('T')[0],
          description: `Doctor Appointment Fee - ${paymentData.patientName}`
        }
      };

      const signatureMessage = `${this.username}${paymentData.amount}${paymentData.reference}`;
      const signature = this.generateSignature(signatureMessage);

      const response = await axios.post(
        `${this.baseURL}/transaction/v2/remittance`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Signature': signature,
            'Api-Key': this.apiKey
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        reference: paymentData.reference,
        status: response.data.status,
        message: "Payment initiated successfully"
      };

    } catch (error) {
      console.error('Jenga Airline Payment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Airline payment failed');
    }
  }

  // Check transaction status
  async checkTransactionStatus(reference) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(
        `${this.baseURL}/transaction/v2/remittance/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Api-Key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Jenga Status Check Error:', error.response?.data || error.message);
      throw new Error('Failed to check transaction status');
    }
  }

  // Get account balance
  async getAccountBalance() {
    try {
      const token = await this.getAuthToken();
      const countryCode = "KE";
      const accountId = this.accountNumber;

      const response = await axios.get(
        `${this.baseURL}/account/v2/accounts/balances/${countryCode}/${accountId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Api-Key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Jenga Balance Check Error:', error.response?.data || error.message);
      throw new Error('Failed to get account balance');
    }
  }
}

export default JengaPayment;