// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA FOR PARTSERIALINFO
let Partsserialinfo = new Schema({
  serial_no: {
    type: String,
  },
  qty: {
    type: Number,
  },
});

// EXPORTING PARTSERIALINFO
module.exports = mongoose.model("Partsserialinfo", Partsserialinfo);
// TODO: NOTE
// 1. partName is part reference
// 2. crId is commercial refference id
