import Product from "../models/product";
import multer from "multer";
import path from "path";
import CustomErrorHandler from "../services/CustomErrorHandler";
import fs from "fs";
import productSchema from "../validators/productValidator";
//where our file is stored or storage area , its path, filename etc...

const storage = multer.diskStorage({
  //wehere we have to store that file for that we need to return a funciton : cb: callback , file : taht we want ot upload
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    //what we do : is create a random number and file extension of it eg : 65456-534543.png and we store this path in db
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName); //null is for error
  }, //name of filename that we want to store
});

//now we need special function from multer
const handleMultiplepartData = multer({
  storage,
  limits: { fileSize: 100000 * 5 },
}).single("image"); //limits is our file upload limit which we set is 5mb , single : means we upload only one file and field name is 'image'

const productController = {
  //store method
  async store(req, res, next) {
    // console.log(req);
    //we want to upload a product and we also have image of it for image we user some special format
    //multipart form data process : this feature is not inbuilt in express for that we need to install a library called multer
    // steup multer : there are many ways of using multer: as a middleware or as a function in our case we use as a function

    handleMultiplepartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      //now question is where we get req.file because of multer you can check by clg... suprisgly image already been uploaded
      const filePath = req.file.path.replace("\\", "/");

      //we not validate till yet so now we have to validate first
      //we create a validator function seperate productValidator.js

      const { error } = productSchema.validate(req.body);
      if (error) {
        //if image is uploaded before validation and if our validation is failed so we have to delete our image
        //we have to delete image in upload folder for that we use fs module of node and in first para : filepath is half path of file
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          //there will be no space between otherwise error occurs
          //as unlink is our async function so after run 2nd parameter callback run if error then agin callback run
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        }); // rootfolder/uploads/filename.png , appRoot is a global variable.
        return next(error);
      }

      //fetch all data from body

      const { name, price, size } = req.body;
      let productData = {
        name: name,
        price: price,
        size: size,
        image: filePath,
      };
      //add all data in DB
      let createProduct;
      try {
        createProduct = await Product.create(productData);
      } catch (err) {
        return next(err);
      }
      res.status(201).json({ product: createProduct });
    });
  },
  //create update method
  async update(req, res, next) {
    handleMultiplepartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }

      //we want to be optional : whether user update image or not
      let filePath;
      if (req.image) {
        filePath = req.file.path;
      }

      //we create seperate productValidator.js
      const { error } = productSchema.validate(req.body);

      if (error) {
        if (req.image) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }
        return next(error);
      }

      //fetch all data from body

      const { name, price, size } = req.body;
      let productData = {
        name: name,
        price: price,
        size: size,
        //here we use spread operator to add image as we use conditon
        //why req.file??
        ...(req.file && { image: filePath }),
      };
      //add all data in DB
      // console.log(productData);

      let updateProduct;
      try {
        //before update let check first whether id is valid or not
        const checkId = await Product.findOne({
          where: { id: req.params.productId },
        });

        if (!checkId) {
          //js error
          return next(new Error("Product is not available"));
        }
        //we filter out our product and  update it
        updateProduct = await Product.update(productData, {
          where: { id: req.params.productId },
        });
      } catch (err) {
        return next(err);
      }
      res.status(201).json({ updated_Product: updateProduct });
    });
  },

  //create delete method
  async delete(req, res, next) {
    //we have to delte from DB directly just by id
    let deleteData;
    try {
      //before update let check first whether id is valid or not
      const checkId = await Product.findOne({
        where: { id: req.params.productId },
      });
      if (!checkId) {
        //js error
        return next(new Error("Nothing to delete"));
      }

      deleteData = await Product.destroy({
        where: { id: req.params.productId },
      }); //return index which deleted
      // everything is deleted from server but image that you stored in server you have to delete it also
      // first get iamge path
      const imgPath = checkId.doc.image; //.doc is for delete image so that it cant use getters as path
      fs.unlink(`${appRoot}/${imgPath}`, (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError());
        }
      });

      res.status(200).json({ deleted: deleteData });
    } catch (err) {
      return next(err);
    }
  },

  //for get products
  async getProducts(req, res, next) {
    let products;
    try {
      products = await Product.findAll();
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.json(products);
  },

  //for get single product
  async getSingleProduct(req, res, next) {
    let product;

    try {
      let productId = req.params.productId;
      if (!productId) {
        return next(err);
      }

      product = await Product.findOne({
        where: { id: productId },
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.json(product);
  },

  //retrive products based on id
  async productBasedOnId(req, res, next) {
    let ids, products;
    try {
      ids = req.body.ids;
      // console.log(req.body);
      products = await Product.findAll({
        where: { id: ids },
      });
      if (!products) {
        return next("Product is not available");
      }
      res.json({ products: products });
    } catch (error) {
      next(CustomErrorHandler.serverError());
    }
  },
};
export default productController;
