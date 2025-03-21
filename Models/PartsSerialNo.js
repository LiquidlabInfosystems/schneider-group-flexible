// IMPORTI MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA FOR HUBBSERIALNO
const HubSerialNo = new Schema({
  hubId: {
    type: mongoose.Types.ObjectId,
  },
  serialNo: {
    type: Number,
    default: 1,
  },
  serialNos: {
    type: [String],
  },
});


// SCHEMA FOR PARTSERIAL NO
const PartsSerialNo = new Schema(
  {
    hubSerialNo: {
      type: [HubSerialNo],
      required: true,
    },
    partId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    partNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


// EXPORTING PARTSERIAL NO
module.exports = mongoose.model("PartsSerialNo", PartsSerialNo);
