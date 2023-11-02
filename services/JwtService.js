import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
class JwtService {
  // method : 1
  //here if we do not give any time it bydefault set it as 60s
  static sign(payload, expiry = "60s", secret = JWT_SECRET) {
    return jwt.sign(payload, secret, {
      expiresIn: expiry,
    });
  }

  // method : 2
  static verify(token, secret = JWT_SECRET) {
    return jwt.verify(token, secret);
  }
}

export default JwtService;
