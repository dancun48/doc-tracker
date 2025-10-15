import express from 'express';
import { 
  initiateAppointmentPayment, 
  verifyPayment, 
  jengaWebhook
} from '../controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.post('/initiate-payment', initiateAppointmentPayment);
paymentRouter.post('/verify-payment', verifyPayment);
paymentRouter.post('/webhook/jenga', jengaWebhook);

export default paymentRouter;