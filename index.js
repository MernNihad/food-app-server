import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { AdminModel } from "./models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ProductModel } from "./models/Product.js";
import { UserModel } from "./models/User.js";
import { HotelModel } from "./models/Hotel.js";
import {
  OrderProduct,
  OrderView,
  deleteProductById,
  updateProductById,
} from "./Controllers/AdminCon.js";
import {
  GettingKey,
  PaymentData,
  PaymentVerify,
} from "./Controllers/PaymentController.js";
import Razorpay from "razorpay";
import {
  addToCart,
  decrementCart,
  decrementCartQuantity,
  getAll,
  getById,
  incrementCartQuantity,
  listCartByUser,
  removeCartQuantity,
} from "./Controllers/CartController.js";
import { OrderModel } from "./models/Order.js";
import { Cart } from "./models/Cart.js";

const razorpay = new Razorpay({
  key_id: "rzp_test_H0JW7KXTkvpj4p",
  key_secret: "r5PVx9y34zYDmFybBsgK61iE",
});

const app = express();
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json({ limit: "50mb" })); // Image uploading fileBase64

const mongooseConnection = async () => {
  try {
    const db_conn = await mongoose.connect(
      "mongodb://localhost:27017/new_project"
    );
    console.log("connected...");
  } catch (error) {
    console.log("error connection", error.message);
  }
};

mongooseConnection();

app.post("/api/v1/admin/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    if (!name) {
      return res.status(400).send({ message: `Name field can not be empty` });
    }

    const isMailExist = await AdminModel.findOne({ email: req.body.email });

    if (isMailExist) {
      return res
        .status(409)
        .send({ message: "User already exist with this Email Id." });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const newAdmin = new AdminModel({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    });

    const savedAdmin = await newAdmin.save();

    return res.status(201).json({ message: "User created", data: savedAdmin });
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

app.post("/api/v1/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    console.log(req.body);
    const dat = await AdminModel.find();
    console.log(dat);

    const isMailExist = await AdminModel.findOne({ email: req.body.email });

    console.log(isMailExist);
    if (isMailExist) {
      // const isMatchPassword = await bcrypt.compare(req.body.password, isMailExist.password);
      let isMatchPassword = bcrypt.compareSync(
        req.body.password,
        isMailExist.password
      );

      console.log(isMatchPassword);
      if (!isMatchPassword) {
        return res.status(401).send({ message: "Invalid Password!" });
      } else {
        // create token
        const token = jwt.sign({ _id: isMailExist._id }, "example", {
          expiresIn: "30 days",
        });

        return res
          .status(200)
          .send({
            message: "Admin logged",
            data: { token, user: isMailExist },
          });
      }
    } else {
      return res.status(409).send({ message: "Admin not exist." });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

// app.get("/api/v1/admin/profile", async (req, res) => {
//   if (!req.headers.authorization) {
//     return res.status(401).json({ message: "No Token Provided" });
//   }

//   var token = req.headers.authorization;

//   var decoded = jwt.verify(token, "example");

//   if (!decoded) {
//     return res.status(401).json({ message: "Unauthorized Access" });
//   }

//   const isUser = await AdminModel.findById(decoded._id);

//   if (!isUser) {
//     return res.status(404).json({ message: "User Not Found" });
//   }
//   return res.status(200).send({ message: "profile", data: { user: isUser } });
// });

app.post("/api/v1/admin/product/add-product", async (req, res) => {
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

    const dat = new ProductModel(req.body);
    console.log(dat);
    let response = await dat.save();
    console.log(response);
    return res.status(200).send({ message: "addd success" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

app.post("/api/v1/admin/product/order-address/:id", async (req, res) => {
  try {
    // console.log(req.body);
    // return true

    const orders = await Cart.find({
      userId: new mongoose.Types.ObjectId(req.params.id),
    });

    const newOrder = new OrderModel({
      ...req.body,
      cartsArray: orders,
      userid: req.params.id,
    });

    const savedOrder = await newOrder.save();

    for (let order of orders) {
      await Cart.findByIdAndDelete(order._id);
    }

    return res.status(200).send({ message: "Ordered" });
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});
app.get("/api/v1/admin/product/grt-order-address/:id", async (req, res) => {
  try {
    const orders = await OrderModel.find({
      userid: new mongoose.Types.ObjectId(req.params.id),
    });

    let ordersArray = []
    for (let order of orders) {
      let productsArray = [];
      for (let carts of order.cartsArray) {
        const product = await ProductModel.findById(carts.productId);
        productsArray.push(product)
      }
      ordersArray.push({...order._doc,cartsArray:productsArray})

    }
 

    return res.status(200).send({result:ordersArray });
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

app.get("/api/v1/userproduct/", async (req, res) => {
  try {
    const response = await ProductModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/v1/user/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    if (!name) {
      return res.status(400).send({ message: `Name field can not be empty` });
    }

    const isMailExist = await UserModel.findOne({ email: req.body.email });

    if (isMailExist) {
      return res
        .status(409)
        .send({ message: "User already exist with this Email Id." });
    }

    const hash = bcrypt.hashSync(req.body.password, 10);

    const newUser = new UserModel({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    });

    const savedUser = await newUser.save();

    return res.status(201).json({ message: "User created", data: savedUser });
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

app.post("/api/v1/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }

    console.log(req.body);
    const dat = await UserModel.find();
    console.log(dat);

    const isMailExist = await UserModel.findOne({ email: req.body.email });

    console.log(isMailExist);
    if (isMailExist) {
      // const isMatchPassword = await bcrypt.compare(req.body.password, isMailExist.password);
      let isMatchPassword = bcrypt.compareSync(
        req.body.password,
        isMailExist.password
      );

      console.log(isMatchPassword);
      if (!isMatchPassword) {
        return res.status(401).send({ message: "Invalid Password!" });
      } else {
        // create token
        const token = jwt.sign({ _id: isMailExist._id }, "example", {
          expiresIn: "30 days",
        });

        return res
          .status(200)
          .send({ message: "User logged", data: { token, user: isMailExist } });
      }
    } else {
      return res.status(409).send({ message: "User not exist." });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

app.get("/api/v1/user/", async (req, res) => {
  try {
    const response = await UserModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}); // For Data Fetch

app.post("/api/v1/hotel/submit", async (req, res) => {
  try {
    const { email, location, name, number } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!location) {
      return res.status(400).send({ message: "location is required" });
    }

    if (!name) {
      return res.status(400).send({ message: `Name field can not be empty` });
    }

    if (!number) {
      return res.status(400).send({ message: `Phone Number can not be empty` });
    }

    const isMailExist = await HotelModel.findOne({ email: req.body.email });

    if (isMailExist) {
      return res
        .status(409)
        .send({ message: "Already exist an hotel with this Email Id." });
    }

    // const hash = bcrypt.hashSync(req.body.password, 10);

    const newHotel = new HotelModel({
      email: req.body.email,
      location: req.body.location,
      number: req.body.number,
      name: req.body.name,
      // password: hash,
    });

    const savedHotel = await newHotel.save();

    return res.status(201).json({ message: "Hotel created", data: savedHotel });
  } catch (error) {
    return res
      .status(400)
      .send({ message: error.message || "internal server error" });
  }
});

app.get("/api/v1/hotel/", async (req, res) => {
  try {
    const response = await HotelModel.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}); // For Data Fetch

app.get("/api/v1/get-hotel/:id", async (req, res) => {
  try {
    const response = await HotelModel.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}); // For Data Fetch

app.get("/api/v1/get-product/:id", async (req, res) => {
  try {
    const response = await ProductModel.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}); // For Data Fetch

app.get("/api/v1/get-user/:id", async (req, res) => {
  try {
    const response = await UserModel.findById(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}); // For Data Fetch

app.put("/api/v1/edit-hotel/:id", async (req, res) => {
  try {
    const response = await HotelModel.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    return res.status(200).json(response);
  } catch (err) {
    return res.status(404).json({ message: err.message || "Error" });
  }
}); // For Data Fetch

app.put("/api/v1/edit-product/:id", async (req, res) => {
  try {
    const response = await ProductModel.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    return res.status(200).json(response);
  } catch (err) {
    return res.status(404).json({ message: err.message || "Error" });
  }
}); // For Data Fetch

//AdminController

app.delete("/deleteproduct/:id", deleteProductById);
app.put("/update/:id", updateProductById);
app.post("/order/:id", OrderProduct);
app.get("/vieworderproduct", OrderView);

// Payment Controller

app.post("/checkout", PaymentData);
app.post("/paymentverification", PaymentVerify);
app.get("/api/getkey", GettingKey);

// For Cart

app.post("/addToCart", addToCart);
app.post("/decrement-to-cart", decrementCart);
app.get("/listCart/:id", listCartByUser);
app.get("/:id", getById);
app.get("/viewAll", getAll);
app.get("/decrement-cart/:userId/:productId", decrementCartQuantity);
app.get("/remove-cart/:userId/:productId", removeCartQuantity);
app.post("/increment-cart/:userId/:productId", incrementCartQuantity);
app.delete(`/api/v1/hotel-delete/:id`, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Id not provided!" });
  }

  const response = await HotelModel.findByIdAndDelete(req.params.id);

  if (response) {
    return res.status(200).json({ result: response, messgae: "Deleted" });
  } else {
    return res.status(400).json({ message: "Error" });
  }
});

app.listen(8080, () => {
  mongooseConnection();
  console.log(`port running 8080`);
});
