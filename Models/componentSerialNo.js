// // IMPORTING MODULES
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// // HUBSERIALNO SCHEMA
// const HubSerialNo = new Schema ({
//     hubID:{
//         type: mongoose.Types.ObjectId
//     },
//     serialNo:{
//         type: Number,
//         default:1
//     },
//     serialNos:{
//         type:[String],
//     }
// })


// // COMPOENT SERIAL NO SCHEMA
// const ComponentSerialNo = new Schema(
//   {
//     hubSerialNo: {
//       type: [HubSerialNo],
//       required: true,
//     },
//     componentID: {
//       type: mongoose.Types.ObjectId,
//       required: true,
//     },
//     componentName:{
//       type:String
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// // EXPORTING COMPONET SERIAL NO
// module.exports = mongoose.model("ComponentSerialNo", ComponentSerialNo);