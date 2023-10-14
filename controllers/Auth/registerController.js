//A database schema is a blueprint or architecture of how our data will look.
import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { User } from "../../models";
import bcrypt from "bcrypt";
import JwtService from "../../services/JWTservice";
import { REFRESH_SECRET } from "../../config";

const registerController = {
  async register(req, res, next) {
    //validation
    //define validaiton
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      userName: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
        .required(),
      confirm_password: Joi.ref("password"),
    });

    //use the validation
    const { error } = registerSchema.validate(req.body);

    if (error) {
      //if any error came in our applicaiton and we pass it in next so its catch in our middleware and we pass it from there.
      // point to be noted : express byDefault error like throw error -- not properly catchers async function error so we called our next paramater and spec. error handling middle ware catches it
      return next(error); //middleware catch from here then it check
    }

    //if error is not happen then:: we check if user again send same email or not from DB so for that we have to error handling imporatant
    //query from DB so we use try-catch
    try {
      const emailExist = await User.findOne({
        where: { email: req.body.email },
      });

      if (emailExist) {
        //here we make our own custum error handler
        return next(
          // we called class method alreadyExist without creating its objects as its a static method
          CustomErrorHandler.alreadyExist("This Email is already exist")
        );
      }
    } catch (err) {
      return next(err); //this error also goes in customErrorHandler class but goes into custom type or js Error object that we use as this.error...
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //prepare the model
    //here you have to write req.body many times so you can use destructuring
    const { name, userName, email } = req.body;
    const createUser = {
      name: name,
      userName: userName,
      email: email,
      password: hashedPassword,
    };
    //now save it in database use try catch always
    try {
      await User.create(createUser);
    } catch (err) {
      return next(err);
    }

    res.json({
      status: "success",
      message: "successfully registered",
    });
  },
};

export default registerController;
