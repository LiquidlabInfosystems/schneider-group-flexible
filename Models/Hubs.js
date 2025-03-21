// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA FOR HUB
const Hub = new Schema(
  {
    hubName: {
      type: String,
      required: true,
    },
    hubShortName: {
      type: String,
      required: true,
    },
    isHubActive: {
      type: Boolean,
      required: true,
      default:true
    },
    logo_ZPL:{
      type:String,
    },
  },
  {
    timestamps: true,
  }
);

// EXPORTING HUB 
module.exports = mongoose.model("Hubs", Hub);