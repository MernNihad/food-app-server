import { PaymentModel } from "../models/Payment.js";
import crypto from 'crypto'
import Razorpay from 'razorpay';


const razorpay = new Razorpay({
  key_id: 'rzp_test_H0JW7KXTkvpj4p',
  key_secret: 'r5PVx9y34zYDmFybBsgK61iE'
})







export const PaymentData = async (req,res) => {
    const options = {
        amount: Number(req.body.amount*100),
        currency:"INR"
    };
    const order = await instance.orders.create(options);
    console.log(order);
    res.status(200).json({
        success:true, order
    })
}

export const PaymentVerify = async (req,res) => {
    const{razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    const body = razorpay_order_id + " " + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', 'r5PVx9y34zYDmFybBsgK61iE').update(body.toString()).digest('hex')
    const isauth = expectedSignature === razorpay_signature

    if(isauth){
        await PaymentModel.create({
            razorpay_order_Id, razorpay_payment_Id, razorpay_signature
        })
        res.direct(`http://localhost:4000/paymentsuccess?reference= ${razorpay_payment_id}`)
    }else{
        res.status(400).json({success:false})
    }
}

export const GettingKey = async (req,res) => {
    return res.status(200).json({key:'rzp_test_H0JW7KXTkvpj4p'})
}