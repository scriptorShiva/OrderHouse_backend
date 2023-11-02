import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const userController = {
  async me(req, res, next) {
    // here we want loggedInUser Details based on token
    //its a get request so directly we do db query
    try {
      //to get user here we use middleware because the resouce we wnat to get is a protected resource we do not want to access it without access token or loggedIn ,so for each request on "me" route , we have to intercept this request and check if token present or not if yes then check is it valid or not.
      //with the help of req.user in middleware we are able to get req.user.id
      //select is used for hide some particular fields
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ["password", "updatedAt"] },
      });
      if (!user) {
        return next(CustomErrorHandler.notFound());
      }
      //if user present then
      res.json(user);
    } catch (err) {
      return next(err);
    }
  },
};
export default userController;
