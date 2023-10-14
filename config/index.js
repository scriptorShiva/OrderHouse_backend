import dotenv from "dotenv";
dotenv.config();
//object des
export const {
  APP_PORT,
  DEBUG_MODE,
  DB_NAME,
  DB_PASSWORD,
  DB_USERNAME,
  JWT_SECRET,
  REFRESH_SECRET,
  APP_URL,
  REACT_APP_URL,
} = process.env;
