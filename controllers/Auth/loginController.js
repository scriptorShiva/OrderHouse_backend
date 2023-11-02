import Joi from "joi";
import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JWTservice";
import bcrypt from "bcrypt";
import { REFRESH_SECRET } from "../../config";

const loginController = {
  //create login method
  async login(req, res, next) {
    //1. validate the request
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
        .required(),
    });

    const { error } = loginSchema.validate(req.body);

    //error handler
    if (error) {
      return next(error); //validation error
    }

    //check email already exist in our db or not: use try and catch
    try {
      const userFetch = await User.findOne({
        where: { email: req.body.email },
      });

      //if user not found
      if (!userFetch) {
        return next(CustomErrorHandler.wrongCredentials()); //thats our custom error
      }
      //authenticate user password with our db passoword
      const matchPass = await bcrypt.compare(
        req.body.password,
        userFetch.password
      );
      if (!matchPass) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      //after password match now generate access token and refresh and store refresh in db
      const access_token = JwtService.sign({
        id: userFetch.id,
        role: userFetch.role,
      });
      //create refresh token also
      const refresh_token = JwtService.sign(
        {
          id: userFetch.id,
          role: userFetch.role,
        },
        "1y",
        REFRESH_SECRET
      );

      // set refresh token in http only cookie
      // Set the HTTPOnly cookie
      res.cookie("refreshToken", refresh_token, {
        httpOnly: true,
        secure: true, // Enable this if your app uses HTTPS
        sameSite: "strict", // Adjust the sameSite attribute as needed
        path: "/", // Accessible across the entire application
      });

      res.json({
        access_token: access_token,
        message: "successfully loggedIn",
      });
    } catch (err) {
      //thats our DB error
      return next(err);
    }
  },
  async logout(req, res, next) {
    try {
      // Clear the HTTP-only cookie by setting its value to null and setting an expiration date in the past
      // res.clearCookie(cookieName, { httpOnly: true });

      // Clear the refresh token cookie by setting an expired cookie
      res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: true, // Enable this if your app uses HTTPS
        sameSite: "strict", // Adjust the sameSite attribute as needed
        path: "/", // Specify the same path used for setting the cookie
        expires: new Date(0), // Set an expiration date in the past to invalidate the cookie
      });
      res.json({ message: "Logout successful" });
    } catch (err) {
      return next(err);
    }
  },
};
export default loginController;
