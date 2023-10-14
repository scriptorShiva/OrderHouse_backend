import express from "express";
import auth from "../middlewares/auth";
import admin from "../middlewares/admin";

const router = express.Router();
import {
  registerController,
  loginController,
  userController,
  refreshController,
  productController,
} from "../controllers";

router.post("/register", registerController.register);
router.post("/login", loginController.login);

// here auth is our middleware to authenticate the token recieved is valid or not.
router.get("/me", auth, userController.me);
// genreate new accesss and refresh token
router.post("/refresh-rotation", refreshController.refreshRotation);
// get refresh token from httpOnlyCookie
router.get("/cookie-refresh-token", refreshController.refreshTokenFromCookie);

router.get("/logout", auth, loginController.logout);

//for creating a product we need token otherwise no access for that we use auth middleware
//but here problem on send auth is : is only verify the token so any token works here  but I want only role: admin user can able to change the product.
//for that I create another middleware i.e admin.js
router.post("/products", [auth, admin], productController.store);
//for product to be create first verfiy token then check role as admin and in productController we create update function.
router.put("/products/:productId", [auth, admin], productController.update);
//this : productId is our dynamic parameter
router.delete("/products/:productId", [auth, admin], productController.delete);
router.get("/products", productController.getProducts);
//get single product
router.get("/products/:productId", productController.getSingleProduct);
//retrieve data based on id's
router.post("/products/cart-items", productController.productBasedOnId);

export default router;
