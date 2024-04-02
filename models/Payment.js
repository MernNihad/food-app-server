import mongoose, {Schema} from 'mongoose'

const paymentSchema = new mongoose.Schema({
    razorpay_order_Id: {
        type: String,
        required: true,
    },
    razorpay_payment_Id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: true,
    }
});

export const PaymentModel = mongoose.model('Payment', paymentSchema,'Payments');

