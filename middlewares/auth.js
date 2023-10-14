import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JWTservice";

const auth = async (req, res, next) => {
  //get authorizatin header first
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    //auth header not sent by user means not sent token so, block this profile
    return next(CustomErrorHandler.unAuthorized()); //create one more custom error for unauthorized access
  }
  //if we have header
  // first spit by space and get token out of it.
  const token = authHeader.split(" ")[1];

  //now we have to verify the token
  try {
    const { id, role } = await JwtService.verify(token); //destrucutre id and role from payload using jwt.verify
    const user = {
      id: id,
      role: role,
    };
    req.user = user; //here what we do is send user object as a request in middleware

    next();
  } catch (err) {
    return next(CustomErrorHandler.unAuthorized());
  }
};
export default auth;
