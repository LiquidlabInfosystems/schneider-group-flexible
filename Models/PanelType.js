// // IMPORT MODULES
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;


// // SCHEMA FOR BOM
// const BOM = new Schema ({
//     componentID:{
//         type: mongoose.Types.ObjectId
//     },
//     qnty:{
//         type: Number,
//         default:1
//     },
// })

// // SCHEMA FOR PANELTYPE
// const PanelType = new Schema(
//   {
//     PanelType: {
//       type: String,
//       required: true,
//     },
//     BOMList: {
//       type: [BOM],
    
//     },
//   },
//   {
//     timestamps: true,
//   }
// );


// // EXPORT PANELTYPE
// module.exports = mongoose.model("PanelType", PanelType);
