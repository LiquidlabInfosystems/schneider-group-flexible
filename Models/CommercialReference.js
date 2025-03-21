// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// DATABASE PART SCHEMA
const partSchema = new Schema({
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
  parentNumber: {
    type: String,
  },
});


// DATABASE COMMERCIAL REFERENCE SCHEMA
const CommercialReference = new Schema(
  {
    referenceNumber: {
      type: String,
      // required: true,
    },
    description: {
      type: String,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      // required: true,
    },
    parts: {
      type: [partSchema],
    },
    quantity: {
      type: Number,
    },
    productNumber: {
      type: String,
    },
    isCritical: {
      type: Boolean,
    },
    isActive:{
      type:Boolean,
      default:true
    }
  },
  {
    timestamps: true,
  }
);


// EXPORT COMMERTIAL REFERENCE
module.exports = mongoose.model("CommercialReference", CommercialReference);
