// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// SCHEMA FOR PARTS
const PartsSchema = new Schema({
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
    default:false,
    type: Boolean,
  },
  PiecePerPacket: {
    type: Number
  },

  isCritical: {
    type: Boolean,
  },
})


// SCHEMA FOR COMPONENTS
const componentSchema = new Schema({
  Enclosure: {
    type: String,
  },
  Reference: {
    type: String,
  },
  description: {
    type: String,
  },
  referenceNumber: {
    type: String,
  },
  compShortName: {
    type: String,
  },
  Quantity: {
    type: Number,
  },
  FixedQuantity: {
    type: Number,
    default: 0
  },
  isCritical: {
    type: Number,
  },
  parts: {
    type: [PartsSchema]
  }
});


// SCHEMA FOR SWITCHBOARD
const switchBoardSchema = new Schema({
  switchBoard: {
    type: String,
  },
  components: {
    type: [componentSchema],
  },
});

const partList = new Schema({
  partNumber:{
    type:String,
  },
  quantity:{
    type:Number,
  },
  description:{
    type:String,
  },
  grouped:{
    type:Boolean,
  },
  PiecePerPacket:{
    type:Number,
  },
  partID:{
    type:String
  }
})

// SCHEMA FOR PROJECTS
const Projects = new Schema(
  {
    ProjectName: {
      type: String,
      required: true,
    },
    ProjectID: {
      type: String,
      // required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    createdTo: {
      type: mongoose.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
    },
    switchBoardData: {
      type: [switchBoardSchema],
    },
    partList:{
      type:[partList]
    },
    ProjectDate: {
      type: Date,
    },
    boxSerialNumbers: {  // New field to store box serial numbers
      type: [String],     // Array of strings
    },
  },
  {
    timestamps: true,
  }
);


// EXPORTING PROJECTS
module.exports = mongoose.model("Project", Projects);
