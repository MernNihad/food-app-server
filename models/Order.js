import mongoose,{Schema} from "mongoose";

const orderSchema = new mongoose.Schema({
    productid:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    userid:{
        type:mongoose.Types.ObjectId,
        required:true
    },
   
})

export const OrderModel = mongoose.model('order',orderSchema)