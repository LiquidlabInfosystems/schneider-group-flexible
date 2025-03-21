// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// ADMIN DATABASE SCHEMA
const Admin = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// EXPORTIG ADMIN
module.exports = mongoose.model("Admin", Admin);
