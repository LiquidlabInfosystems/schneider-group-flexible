// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA FOR PARENTIDSOBJ
const parentIdsObj = new Schema({
  productId: {
    type: mongoose.Types.ObjectId, //currently not using
  },
  crId: {
    type: mongoose.Types.ObjectId, //currently not using
  },
  productNumber: {
    type: String,
  },
  crNumber: {
    type: String,
  },
});


// SCHEMA FOR PARTS
const Parts = new Schema({
  partNumber: {
    type: String,
  },
  partDescription: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  grouped: {
    type: Boolean,
  },
  PiecePerPacket: {
    type: Number
  },
  videoUrl: {
    type: String,
  },
  isCritical: {
    type: Boolean,
  },
  parentIds: [parentIdsObj],
});


// EXPORT MODULES
module.exports = mongoose.model("Parts", Parts);
// TODO: NOTE
// 1. partName is part reference
// 2. crId is commercial refference id
