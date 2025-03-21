// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA FOR PRINTER
const Printer = new Schema({
  printerIP: {
    type: String,
  },
  PrinterName:{
    type: String,
  }
});

// EXPORT SCHEMA
module.exports = mongoose.model("Printer", Printer);
