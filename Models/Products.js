// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// SCHEMA FOR PRODUCTS
const Products = new Schema({
  productNumber: {
    type: String,
  },
  productDescription: {
    type: String,
  },
  crId: {
    type: mongoose.Types.ObjectId,
  },
  crNumber: {
    type: String,
  },
  quantity: {
    type: Number,
  },
});

// EXPORTING PRODUCTS
module.exports = mongoose.model("Products", Products);
