import { DEBUG_MODE } from "../config";
import { ValidationError } from "joi";
import CustomErrorHandler from "../services/CustomErrorHandler";

const errorHandler = (err, req, res, next) => {
  // by default status
  // client need two main things : statusCode and message
  let statusCode = 500;
  // our default error data object that we are send to client
  let data = {
    message: "Internal Server error",
    //here : we also need to send a client a original server error but only in debug mode .. in production mode we dont want to send original server error
    // debug mode comes from .env
    ...(DEBUG_MODE === "true" && { originalError: err.message }),
  };
  //if this err is a instance of  : jo bhi object recieve ho rha hai wo kis class or kis object ka instance hai
  //validationError : this is provided by joi library
  //here we check is this error is a instance of validatinError class this error came from registerSchema.validate
  if (err instanceof ValidationError) {
    //if this error is comming from joi(library imported above) error then its a vlidation error
    statusCode = 422; //validation error
    data = {
      message: err.message,
    };
  }

  if (err instanceof CustomErrorHandler) {
    statusCode = err.status;
    data = {
      message: err.message,
    };
  }

  // here we return error with status code
  return res.status(statusCode).json(data);
};
export default errorHandler;

// Note : for this middleware to work we have to register it using another middleware ie. app.use();
