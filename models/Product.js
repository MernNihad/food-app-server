import mongoose,{Schema} from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    hotelname:{
        type:String,
        required:true
    },
    ImageLink:{
        type:String,
        required:true
    }
})

export const ProductModel = mongoose.model('product',productSchema)