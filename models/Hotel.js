import mongoose,{Schema} from "mongoose";

const hotelSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    number:{
        type:Number,
        required:true
    }
})

export const HotelModel = mongoose.model('hotel',hotelSchema)