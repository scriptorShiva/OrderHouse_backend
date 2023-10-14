import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { User } from "../../models";
import JwtService from "../../services/JWTservice";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const refreshController = {
  async refreshRotation(req, res, next) {
    //validate request
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    //use Joi
    const { error } = refreshSchema.validate(req.body);

    //handle error
    if (error) {
      return next(error);
    }
    //if error not present then : verify refresh token is valid or not use try and catch
    let refreshToken = req.body.refresh_token;
    let userIdOnVerify;
    try {
      //destructure payload on verify as verify return payload of token so access it
      const { id } = await JwtService.verify(refreshToken, REFRESH_SECRET);
      userIdOnVerify = id;
    } catch (err) {
      return next(err);
    }

    //now we have to check the person with this refresh token is present in our DB or not using userIdOnVerfiy
    try {
      const userExist = await User.findOne({
        where: { id: userIdOnVerify },
      });

      //error handle if user DNE
      if (!userExist) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      //if user present then go and now we have to generate new access token
      const access_token = JwtService.sign({
        id: userExist.id,
        role: userExist.role,
      });

      // also generate new refresh token for refresh token rotation
      const refresh_token = JwtService.sign(
        {
          id: userExist.id,
          role: userExist.role,
        },
        "1y",
        REFRESH_SECRET
      );

      // send access token as body and refresh token set in httpOnlyCookie
      // Set the HTTPOnly cookie
      res.cookie("refreshToken", refresh_token, {
        httpOnly: true,
        secure: true, // Enable this if your app uses HTTPS
        sameSite: "strict", // Adjust the sameSite attribute as needed
        path: "/", // Accessible across the entire application
      });

      res.json({ access_token });
    } catch (err) {
      return next(err);
    }
  },
  async refreshTokenFromCookie(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        res.json({ refreshToken });
      }
    } catch (err) {
      console.error("Error while retrieving refreshToken:", err);
      return next(err);
    }
  },
};
export default refreshController;
