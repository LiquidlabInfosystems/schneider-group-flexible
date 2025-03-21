// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// SCHEMA OF HUBUSER
const HubUsers = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    hub_id:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true,
        default:true
    }
  },
  {
    timestamps: true,
  }
);


// EXPORGTING HUBUSER
module.exports = mongoose.model("HubUsers", HubUsers);