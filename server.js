//we can use es6 syntax with the help of esm package
import cookieParser from "cookie-parser";
import express from "express";
import { APP_PORT, REACT_APP_URL } from "./config";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";
import cors from "cors";

import path from "path";
// below line is call DbConnect file by adding it here
import sequelizeObj from "./db/dbConnect";
//global variabale
global.appRoot = path.resolve(__dirname); //gives current folder path: so its in server.js so gives server root path

const app = express();
//here we import or register for json data but we not register for multipart data for that we also used
app.use(express.urlencoded({ extended: false }));
/*
CORS, or Cross-Origin Resource Sharing, is a security feature implemented by web browsers to restrict webpages from making requests to a different domain than the one that served the webpage. By default, web browsers adhere to the same-origin policy,
 which means that webpages can only make requests to the same domain they were loaded from. This policy is in place to prevent various types of security vulnerabilities, such as cross-site request forgery (CSRF) and cross-site scripting (XSS) attacks.

 credentials: true :: In the code above, the app.use(cors({ credentials: true })) line enables CORS middleware and explicitly sets the credentials option to true, indicating that you want to allow cookies to be sent with cross-origin requests. This configuration should work well for handling CORS and cookies in your Express application.
 */
const corsOptions = {
  origin: REACT_APP_URL,
  credentials: true, // Allow cookies to be sent in the request
};
app.use(cors(corsOptions));
//enable express inbuild middleware for the use of express so it help to parse json
app.use(express.json());
//register cookie parser
app.use(cookieParser());
//register route in applicaiton
app.use("/api", routes);
//catch error middleware
app.use(errorHandler);
//this route is to tell express that whenever you get /uploads , make sure to serve that folder path
app.use("/uploads", express.static("uploads"));

app.listen(APP_PORT, () => console.log(`listning on port ${APP_PORT}`));
