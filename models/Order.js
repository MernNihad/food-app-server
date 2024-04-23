import mongoose,{Schema} from "mongoose";

const orderSchema = new mongoose.Schema({
    cartsArray:{
        type:Array,
    },
    userid:{
        type:mongoose.Types.ObjectId,
    },
    total:{
        type:Number
    },
    name:{
        type:String
    },
    address:{
        type:String
    },
    number:{
        type:Number
    },
   
},{
    timestamps:true
})

export const OrderModel = mongoose.model('order',orderSchema)