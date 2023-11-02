import path from "path";
import fs from "fs";
import { DB_NAME, DB_USERNAME, DB_PASSWORD } from "../config";
import { Sequelize, DataTypes } from "sequelize";

const sequelizeObj = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: "localhost",
  logging: false,
  dialect: "postgres",
});

/*
These are configuration options provided as an object to the Sequelize constructor:
host: "localhost": Specifies the host where the PostgreSQL database is located. In this case, the database is assumed to be hosted on the same machine ("localhost"). If the database is hosted on a different server, you would provide the appropriate hostname or IP address here.
logging: false: This option controls whether Sequelize should log SQL queries and other information to the console. Setting it to false disables logging. This is often done in production to reduce unnecessary logging output.
dialect: "postgres": Specifies the dialect of the database you're connecting to. In this case, it's set to "postgres" to indicate that you're using PostgreSQL as the database.
 */

try {
  sequelizeObj.authenticate();
  console.log("connection has been established successfully");
} catch (err) {
  console.error("Unable to connect to the database:", err);
}

/**Auto-Loading Models: Create a script that dynamically loads and registers all the models in the models directory. You can use Node.js' fs module to achieve this. */
// Function to load and associate models
const loadModels = () => {
  const models = {};
  const currentDirectory = __dirname;
  const parentDirectory = path.join(currentDirectory, "..");

  /**
   * readdirSync is a function provided by the Node.js fs (file system) module for synchronously reading the contents of a directory. It returns an array of all the file names (and directory names) present in the specified directory.
   */

  fs.readdirSync(path.join(parentDirectory, "models")).forEach((file) => {
    if (file.endsWith(".js") && file !== "index.js") {
      // The error message "require(...) is not a function" typically indicates that you are trying to execute a module as a function, but the required module is not a function.
      const modelDefinition = require(path.join(
        parentDirectory,
        "models",
        file
      ));

      const model = modelDefinition.default(sequelizeObj, DataTypes);
      const modelName = model.name;
      models[modelName] = model;
    }
  });

  // Define associations here if needed
  Object.values(models).forEach((model) => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
};

// Load models and associate them
const loadedModels = loadModels();

sequelizeObj.models = loadedModels;

//very important line to connect db with your tables other error : no users found
// Sync the models with the database
sequelizeObj
  .sync({ force: false })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

/*
 Here's what each part of the line does:
sequelizeObj: This refers to an instance of the Sequelize object, which is the main entry point for using Sequelize. It's usually created by invoking the new Sequelize() constructor and providing database connection details.
.sync({ force: false }): This is a method provided by Sequelize to synchronize your models with the database schema. The sync() method ensures that the tables representing your Sequelize models are created in the database if they don't exist. If the tables already exist, Sequelize will perform some checks to determine if any changes to the schema are needed.
{ force: false }: This is an optional configuration object passed as an argument to the sync() method. When force is set to false, Sequelize will not drop any existing tables and recreate them. In other words, if a table already exists, Sequelize will perform minimal changes to match the model's structure, such as adding missing columns or indexes. It won't modify existing data or remove columns that aren't defined in the model.
If force were set to true, Sequelize would drop all the existing tables and recreate them according to the models' definitions. This is a destructive action that should be used with caution, typically during development and not in production environments.
 */

export default sequelizeObj;
