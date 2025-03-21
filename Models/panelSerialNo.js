// IMPORTING MODULES
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA FOR HUBSERIAL NO
const HubSerialNo = new Schema({
    hubID: {
        type: mongoose.Types.ObjectId
    },
    serialNo: {
        type: Number,
        default: 1
    },
    serialNos: {
        type: [String],
    }
})

// SCHENMA FOR PANELSERIAL NO
const PanelSerialNo = new Schema(
    {
        hubSerialNo: {
            type: [HubSerialNo],
            required: true,
        },
        panelID: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


// EXPORT PANELSERIAL NO
module.exports = mongoose.model("PanelSerialNo", PanelSerialNo);
