// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// DATABASE SCHEMA FOR BOX SERIAL NO
const BoxSerialNo = new Schema(
  {
    hubID: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    serialNos: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


// EXPORTING BOXSERIALNO
module.exports = mongoose.model("BoxSerialNo", BoxSerialNo);
