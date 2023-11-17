const asyncHandler = require("express-async-handler");
const Product = require("../models/product.model");
const { fileSizeFormatter } = require("../utils/fileUpload");
const { Op } = require("sequelize");
const db = require("../models");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Prouct
const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;

  //   Validation
  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  console.log(fileData);
  // Create a transaction to ensure data consistency
  const transaction = await db.sequelize.transaction();

  try {
    console.log("Before Create");
    // Create Product and Image within the transaction
    const product = await db.Product.create(
      {
        userId: req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
      },
      { transaction }
    );

    const imageProduct = await db.Image.create(
      {
        productId: product.id,
        fileName: fileData.fileName || null,
        filePath: fileData.filePath || null,
        fileType: fileData.fileType || null,
        fileSize: fileData.fileSize,
      },
      { transaction }
    );

    // Commit the transaction to persist the changes
    await transaction.commit();
    const dataReturn = {
      product,
      imageProduct,
    };
    res.status(201).json(dataReturn);
    console.log("Transaction committed successfully");
  } catch (error) {
    // If an error occurs, roll back the transaction to undo the changes
    await transaction.rollback();
    console.error("Error occurred, transaction rolled back:", error);
  }
});

// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  const products = await db.Product.findAll({
    where: { userId: req.user.id },
  });
  res.status(200).json(products);
});

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await db.Product.findOne({
    where: { id: req.params.id },
  });

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(product);
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await db.Product.findOne({
    where: { id: req.params.id },
  });
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await product.destroy();
  res.status(200).json({ message: "Product deleted." });
});

// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, description } = req.body;
  const { id } = req.params;

  const product = await db.Product.findOne({
    where: { id: id },
  });

  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pinvent App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Create a transaction to ensure data consistency
  const transaction = await db.sequelize.transaction();

  try {
    // Create Product and Image within the transaction
    const product = await db.Product.update(
      {
        name,
        sku,
        category,
        quantity,
        price,
        description,
      },
      { transaction }
    );

    const imageProduct = await db.Image.update({
      where: {productId: product.id}
    },
      {
        productId: product.id,
        fileName: fileData.fileName || null,
        filePath: fileData.filePath || null,
        fileType: fileData.fileType || null,
        fileSize: fileData.fileSize,
      },
      { transaction }
    );

    // Commit the transaction to persist the changes
    await transaction.commit();
    const dataReturn = {
      product,
      imageProduct,
    };
    res.status(201).json(dataReturn);
    console.log("Transaction committed successfully");
  } catch (error) {
    // If an error occurs, roll back the transaction to undo the changes
    await transaction.rollback();
    console.error("Error occurred, transaction rolled back:", error);
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
