import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    quantity:{
        type:Number,
        default:1
    }
},
    {
        timestamps: true,
    }
);

export const Cart = mongoose.model("Cart", cartSchema);

// import mongoose,{Schema} from "mongoose";

// const cartSchema = new mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     price:{
//         type:Number,
//         required:true
//     },
//     hotelname:{
//         type:String,
//         required:true
//     },
//     ImageLink:{
//         type:String,
//         required:true
//     }
// })

// export const CartModel = mongoose.model('cart',cartSchema)