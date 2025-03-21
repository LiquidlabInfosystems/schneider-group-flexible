// IMPORTING MODULES
const mongoose = require("mongoose");

// DATABASE SCHEMA OF COMPONENT
const ComponentSchema = new mongoose.Schema({
  componentName: {
    type: String,
  },
  componentSerialNo: {
    type: [String],
    required: true,
  },
  componentID: {
    type: mongoose.Types.ObjectId,
  },
  quantity: {
    type: Number,
    // required: true,
    default: 0,
  },
});


// DATABASE SCEMA OF BOX
const BoxesSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
      // required: true,
    },
    status: {
      type: String,
      default: "open",
    },
    serialNo: {
      type: String,
      required: true,
      unique: true,
    },
    quantity: {
      type: Number,
      // required: true,
      default: 0,
    },
    components: [ComponentSchema],
  },
  {
    timestamps: true,
  }
);


// EXPORTING BOEX
module.exports = mongoose.model("Boxes", BoxesSchema);
