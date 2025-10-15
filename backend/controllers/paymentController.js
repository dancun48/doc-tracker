import JengaPayment from '../utils/jengaPayment.js';
import appointmentModel from '../models/appointmentModel.js';
import jwt from 'jsonwebtoken'

const jengaPayment = new JengaPayment();

const initiateAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod = 'merchant' } = req.body;
    const token = req.headers.token;

    if (!token) {
      return res.json({ success: false, message: "Authentication token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get appointment details
    const appointment = await appointmentModel.findOne({ _id: appointmentId });
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Payment already completed" });
    }

    // Generate unique reference
    const reference = `APT${appointmentId.slice(-8)}${Date.now().toString().slice(-6)}`;

    // Prepare payment data
    const paymentData = {
      patientName: appointment.userData.name,
      patientPhone: appointment.userData.phone,
      amount: appointment.amount,
      reference: reference,
      appointmentId: appointmentId
    };

    console.log('🟡 Initiating payment for appointment:', appointmentId);
    
    let paymentResult;

    // Choose payment method
    if (paymentMethod === 'airline') {
      paymentResult = await jengaPayment.initiateAirlinePayment(paymentData);
    } else {
      paymentResult = await jengaPayment.initiateMerchantPayment(paymentData);
    }

    // Update appointment with payment reference - match your schema fields
    await appointmentModel.findOneAndUpdate(
      { _id: appointmentId },
      { 
        paymentReference: reference,
        paymentStatus: 'pending',
        paymentMethod: paymentMethod,
        transactionId: paymentResult.transactionId,
        transactionStatus: 'pending'
        // Keep payment: false for now, will update when payment completes
      }
    );

    // If mock mode, auto-complete the payment after 3 seconds
    if (jengaPayment.isMockMode) {
      setTimeout(async () => {
        await appointmentModel.findOneAndUpdate(
          { _id: appointmentId },
          { 
            payment: true, // boolean field
            paymentStatus: 'paid', // string field
            paymentDate: new Date(),
            transactionStatus: 'completed'
          }
        );
        console.log('✅ Mock payment auto-completed for:', appointmentId);
      }, 3000);
    }

    res.json({
      success: true,
      message: paymentResult.message,
      paymentReference: reference,
      transactionId: paymentResult.transactionId,
      status: paymentResult.status,
      isMockMode: jengaPayment.isMockMode,
      nextSteps: jengaPayment.isMockMode 
        ? "Mock payment - will auto-complete in 3 seconds" 
        : "Complete payment through your Equity Bank account or M-Pesa"
    });

  } catch (error) {
    console.error('❌ Payment Initiation Error:', error.message);
    res.json({ 
      success: false, 
      message: error.message 
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentReference, appointmentId } = req.body;

    // Check payment status
    const paymentStatus = await jengaPayment.checkTransactionStatus(paymentReference);

    if (paymentStatus.status === 'SUCCESS' || paymentStatus.transactionStatus === 'SUCCESS') {
      // Update appointment as paid - update both boolean and string fields
      await appointmentModel.findOneAndUpdate(
        { _id: appointmentId },
        { 
          payment: true, // boolean field
          paymentStatus: 'paid', // string field
          paymentDate: new Date(),
          transactionStatus: 'completed'
        }
      );

      res.json({
        success: true,
        message: "Payment verified successfully",
        appointmentId: appointmentId,
        isMockMode: jengaPayment.isMockMode,
        transactionDetails: paymentStatus
      });
    } else {
      res.json({
        success: false,
        message: "Payment not completed yet",
        status: paymentStatus.status,
        transactionStatus: paymentStatus.transactionStatus
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.json({ success: false, message: error.message });
  }
};

// Webhook for Jenga notifications
const jengaWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Jenga Webhook Received:', webhookData);

    if (webhookData.transactionStatus === 'SUCCESS' && webhookData.reference) {
      await appointmentModel.findOneAndUpdate(
        { paymentReference: webhookData.reference },
        { 
          payment: true, // boolean field
          paymentStatus: 'paid', // string field
          paymentDate: new Date(),
          transactionId: webhookData.transactionId,
          transactionStatus: 'completed'
        }
      );
      
      console.log(`✅ Payment completed via webhook: ${webhookData.reference}`);
    }

    res.status(200).json({ status: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Jenga Webhook Error:', error);
    res.status(400).json({ status: 'Webhook processing failed' });
  }
};

export {
  initiateAppointmentPayment,
  verifyPayment,
  jengaWebhook
};