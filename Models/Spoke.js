// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// SCHEMA FOR SPOKE
const Spoke = new Schema(
  {
    spokeName: {
      type: String,
      required: true,
    },
    spokeShortName: {
      type: String,
      required: true,
    },
    spokeUserName: {
      type: String,
      required: true,
    },
    spokePassword: {
      type: String,
      required: true,
    },
    isSpokeActive: {
      type: Boolean,
      required: true,
      default:true
    },
  },
  {
    timestamps: true,
  }
);


// EXPORTING SPOKE 
module.exports = mongoose.model("Spokes", Spoke);