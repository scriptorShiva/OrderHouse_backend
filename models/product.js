import { APP_URL } from "../config";

export default (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        //in db we do not store file data  , what we can do is we : store our file in server file system and path of file is stored in DB , that path is a url and url is  a string.
        type: DataTypes.STRING,
        allowNull: false,
        get() {
          const imagePath = this.getDataValue("image");
          return `${APP_URL}${imagePath}`;
        },
      },
    },
    {
      tableName: "products",
      timestamps: true, //show createdAT, updatedAt
    }
  );
  return Product;
};
