import sequelize from "../db/dbConnect";
import UserModel from "./user";
import ProductModel from "./product";
import { DataTypes } from "sequelize";

const User = UserModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);

// Define associations here

export { User, Product };
