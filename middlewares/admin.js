//middleware is a funciton only
//we execute this middleware after auth middleware runs
import { User } from "../models";
import CustomErrorHandler from "../services/CustomErrorHandler";

const admin = async (req, res, next) => {
  try {
    //this req.user.id is came from auth middleware there we return it
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    //now check role of user
    if (user.role === "admin") {
      next(); //means next middlewre ko call karo , if we write anything in next it means next middleware for error handling
    } else {
      return next(CustomErrorHandler.unAuthorized());
    }
  } catch (err) {
    return next(CustomErrorHandler.serverError());
  }
};
export default admin;
