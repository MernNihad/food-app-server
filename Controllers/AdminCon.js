import jwt from "jsonwebtoken";


// For deleting product by Admin

import { ProductModel } from "../models/Product.js";
import { OrderModel } from "../models/Order.js";
import { CartModel } from "../models/Cart.js";


export const deleteProductById = async (req, res) => {
    console.log(req.params.id);
    try {
        if(!req.params.id) {
            return res.status(400).json({ message: "error while deleting!!!" });
        }
        await ProductModel.findByIdAndDelete(req.params.id)
        return res.status(200).json({ message: "deleted" });
    } catch(error) {
        return res.status(200).json({ message: error.message || 'error' });
    }
}


// Edit the product by Admin
 
export const updateProductById = async (req, res) => {
    console.log(req.params.id);

    try {
        if(!req.params.id) {
            return res.status(400).json({ message: 'error while deleting!' });
        }

        await ProductModel.findByIdAndUpdate(req.params.id,{$set:req.body});
        return res.status(200).json({ message: "updated" });
    } catch (error) {
        return res.status(400).json({ message: error.message || "updation error" })
    }
}


// For Order

export const OrderProduct = async (req,res) => {
    // console.log(req.params.id);
    try {
    
        if (!req.headers.authorization) {
          return res.status(401).json({ message: "No Token Provided" });
        }
    
        var token = req.headers.authorization.split(" ")[1];
   
        jwt.verify(token,'example',async function(err,decoded){
            console.log(decoded,'decoded');
            console.log(err,'error');
            if(err){
                return res.status(200).send({ message: err.message || "addd success" });
            }
            const dat = new OrderModel({productid:req.params.id,userid:decoded._id})
            console.log(dat,'datt');
            let response=await dat.save()
            console.log(response,'ree');
            
            return res.status(200).send({ message: "addd success" });
          })
     
       
        
      } catch (error) {
        return res
          .status(400)
          .send({ message: error.message || "internal server error" });
      }
    }
    
export const OrderView = async (req, res) => {
        try{
          const response = await OrderModel.aggregate([
            {
                $lookup:{
                    from:"products",
                    foreignField:"_id",
                    localField:"productid",
                    as:"productInfo"
                },
                
            },
            {
              $unwind:"$productInfo"
            },
        
            {
                $lookup:{
                    from:"users",
                    foreignField:"_id",
                    localField:"userid",
                    as:"userInfo"
                },
            }
            ,    {
              $unwind:"$userInfo"
            },
          ])
          console.log(response,'responseorder')
          res.status(200).json(response)
        }catch(error) {
             console.log(error);
        }
      } ;

      export const AddtoCart = async (req, res) => {
            try {
              
              console.log(req.headers);
              // console.log(req.body);
              if (!req.headers.authorization) {
                return res.status(401).json({ message: "No Token Provided" });
              }
          
              var token = req.headers.authorization.split(" ")[1];
              console.log(token);
          
              var decoded = jwt.verify(token, "example");
          
              if (!decoded) {
                return res.status(401).json({ message: "Unauthorized Access" });
              }
           
          
              const { name, price, hotelname, ImageLink } = req.body;
          
              if (!name) {
                return res.status(400).send({ message: "Name is required" }); 
              }
          
              if (!price) {
                return res.status(400).send({ message: "Price is required" });
              }
              if (!hotelname) {
                return res.status(400).send({ message: "Hotel Name is required" });
              }
          
              if (!ImageLink) {
                return res.status(400).send({ message: "ImageLink is required" });
              }
          
              const dat = new CartModel(
                  req.body
            )
                console.log(dat);
                let response=await dat.save()
                console.log(response);
                return res.status(200).send({ message: "addd success" });
          
              
            } catch (error) {
              return res
                .status(400)
                .send({ message: error.message || "internal server error" });
            }
          };

            export const CartData = async (req, res) => {
            try{
              const response = await CartModel.find()
              res.status(200).json(response)
            }catch(error) {
                 console.log(error);
            }
          }
