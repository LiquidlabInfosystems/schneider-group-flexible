const componentSerialNo = require("../Models/componentSerialNo.js");
const partSerialNo = require("../Models/PartsSerialNo.js");
const parts = require("../Models/Parts.js");
const panelSerialNo = require("../Models/panelSerialNo");
const Components = require("../Models/Components");
const Panels = require("../Models/Panels");
const utils = require("../controllers/utils");
const shortid = require("shortid");
const { default: mongoose } = require("mongoose");
const Partserialinfo = require("../Models/Partserialinfo.js");
const Projects = require("../Models/Projects.js");
const Boxes = require("../Models/box");


exports.generateComponentSerialNo = async (req, res) => {
  // THIS WILL GENERATE PARTS SERIAL NUMBERS FOR A CERTAIN QUANTITY
  try {
    const { hubID, componentID, qnty } = req.body;
    const arr1 = new Array(qnty).fill(0).map((x) => shortid.generate(6));
    componentSerialNo
      .findOneAndUpdate(
        {
          componentID: componentID,
          hubSerialNo: {
            $elemMatch: {
              hubID: hubID,
            },
          },
        },
        {
          $inc: { "hubSerialNo.$.serialNo": qnty },
          $push: { "hubSerialNo.$.serialNos": { $each: arr1 } },
        },
        { returnNewDocument: true }
      )
      .then(async (compenetSerial) => {
        //console.log("generated");
        if (!compenetSerial) {
          await componentSerialNo.findOneAndUpdate(
            { componentID: componentID },
            {
              $push: {
                hubSerialNo: { hubID: hubID, serialNo: qnty, serialNos: arr1 },
              },
            },
            { upsert: true } //this line will add new document if the component is not already present in the ComponentSerialNo collection
          );
        }

        const component = await Components.findById({ _id: componentID });
        utils.commonResponse(res, 200, "Component serial number generated", {
          hubID: hubID,
          componentID: componentID,
          serialNos: arr1,
          compShortName:
            component != null
              ? `${component.compShortName} \n ${component.compDescription}`
              : "",
        });
      });
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};


// exports.generatePartSerialNo = async (req, res) => {
//   // THIS FUNCTION WILL GENERATE SERIAL NUMBER FOR PARTS
//   try {
//     const { hubID, partID, partNumber, qnty, projectId } = req.body;
//     if (!qnty || typeof qnty !== "number" || !hubID || !partNumber) {
//       return utils.commonResponse(
//         res,
//         400,
//         "Required Quantity (qnty) , hubID, partNumber"
//       );
//     }
//     let scannedPart

//     if (projectId) {
//       console.log("searching for part in project")
//       let project_id = new mongoose.Types.ObjectId(projectId)
//       let project = await Projects.findOne({ _id: project_id })
//       let partList = project.partList
//       scannedPart = partList.find(part => part.partNumber === partNumber);
//       if (scannedPart.length === 0) {
//         return utils.commonResponse(res, 200, "part not in this current project")
//       }
//     }
//     else {
//       return utils.commonResponse(res, 200, "projectId missing in the request")
//     }

//     let serialNumbers
//     let PiecePerPacket = []
//     let grouped = false

//     if (scannedPart.grouped) {
//       const requiredQuantity = qnty;
//       const maxPerPacket = scannedPart.PiecePerPacket;
//       const packets = calculatePackets(requiredQuantity, maxPerPacket);
//       PiecePerPacket = packets
//       grouped = true
//       serialNumbers = Array.from({ length: packets.length }, () =>
//         shortid.generate(6)
//       );
//     }
//     else {
//       serialNumbers = Array.from({ length: qnty }, () =>
//         shortid.generate(6)
//       );
//     }
//     let hubIDasObject = new mongoose.Types.ObjectId(hubID)
//     const searchCriteria = partID ? { partId: partID } : { partNumber: partNumber };
//     const partSerialRecord = await partSerialNo.findOne(searchCriteria);
//     if (partSerialRecord) {
//       const hubEntry = partSerialRecord.hubSerialNo.find(
//         (entry) => entry.hubId === hubIDasObject
//       );
//       // console.log(hubIDasObject, partID, hubEntry)
//       // loop to serial number and create partserialinfo

//       for (let i = 0; i < serialNumbers.length; i++) {
//         const serial = serialNumbers[i];
//         const qty = PiecePerPacket[i];
//         // console.log(serial, qty)
//         await Partserialinfo.create({ serial_no: serial, qty }); // Await the creation
//       }

//       if (hubEntry) {


//         await partSerialNo.updateOne(
//           {
//             ...searchCriteria,
//             "hubSerialNo.hubId": hubIDasObject,
//           },
//           {
//             $inc: { "hubSerialNo.$.serialNo": qnty },
//             $push: { "hubSerialNo.$.serialNos": { $each: serialNumbers } },
//           }
//         );
//       } else {
//         await partSerialNo.updateOne(
//           searchCriteria,
//           {
//             $push: {
//               hubSerialNo: {
//                 hubId: hubIDasObject,
//                 serialNo: qnty,
//                 serialNos: serialNumbers,
//               },
//             },
//           }
//         );
//       }
//     } else {
//       await partSerialNo.updateOne(
//         searchCriteria,
//         {
//           $setOnInsert: searchCriteria,
//           $push: {
//             hubSerialNo: {
//               hubId: hubIDasObject,
//               serialNo: qnty,
//               serialNos: serialNumbers,
//             },
//           },
//         },
//         { upsert: true }
//       );
//     }
//     const part = partID
//       ? await parts.findById(partID)
//       : await parts.findOne({ partNumber: partNumber });
//     return utils.commonResponse(res, 200, "Part serial number generated", {
//       hubID: hubIDasObject,
//       partID: part ? part._id : null,
//       partNumber: part ? part.partNumber : partNumber,
//       partDescription: part
//         ? `${part.partNumber} - ${part.partDescription}`
//         : "",
//       qnty: qnty,
//       grouped: grouped,
//       serialNos: serialNumbers,
//       PiecePerPacket: PiecePerPacket,
//     });
//   } catch (error) {
//     console.error("Error generating part serial number:", error);
//     return utils.commonResponse(res, 500, "Internal Server Error", error);
//   }
// };

exports.generatePartSerialNo = async (req, res) => {
  // THIS FUNCTION WILL GENERATE SERIAL NUMBER FOR PARTS
  try {
    const { hubID, partID, partNumber, projectId, PiecePerPacket, grouped } = req.body;
    let scannedPart
    let serialNumbers
    let partList
    let project
    const missingFields = [];
    // if (grouped) missingFields.push("grouped");
    if (!hubID) missingFields.push("hubID");
    if (!partNumber) missingFields.push("partNumber");
    if (!projectId) missingFields.push("projectId");
    if (missingFields.length > 0) {
      return utils.commonResponse(
        res,
        400,
        `Required: ${missingFields.join(", ")}`
      );
    }
    if (projectId) {
      try { project = await Projects.findOne({ _id: new mongoose.Types.ObjectId(projectId) }) }
      catch {
        return utils.commonResponse(res, 200, "Invalid project ID")
      }
      partList = project.partList
      scannedPart = partList.find(part => part.partNumber === partNumber);
      if (scannedPart.length === 0) {
        return utils.commonResponse(res, 200, "part not in this current project")
      }
    }
    else {
      return utils.commonResponse(res, 200, "projectId missing in the request")
    }
    const projectBoxes = await Boxes.find({ projectId: projectId });
    const existingPartsInfo = [];
    // Iterate through boxes directly instead of flattening first
    for (const box of projectBoxes) {
      const matchingComponents = box.components.filter(
        comp => comp.componentName === partNumber
      );
      if (matchingComponents.length > 0) {
        existingPartsInfo.push({
          boxSerial: box.serialNo || 'Unknown Serial',
          components: matchingComponents
        });
      }
    }
    if (existingPartsInfo.length > 0) {
      const boxSerials = existingPartsInfo.map(info => info.boxSerial).join(', ');
      return utils.commonResponse(
        res,
        400,
        `Serial Number cannot be generated for part ${partNumber}. ` +
        `Found in box(es): ${boxSerials}`
      );
    }
    if (grouped) {
      const missingFields = [];
      if (!PiecePerPacket) missingFields.push('PiecePerPacket');
      if (missingFields.length > 0) {
        return utils.commonResponse(
          res,
          400,
          `Required: ${missingFields.join(", ")}`
        );
      }
      // partListUpdates = { "isgrouped": true, "PiecePerPacket": PiecePerPacket }
      let sumOfPiecePerPacket = 0
      PiecePerPacket.map((packetqty, key) => {
        sumOfPiecePerPacket = sumOfPiecePerPacket + packetqty
      })
      if (sumOfPiecePerPacket != scannedPart.quantity) {
        return utils.commonResponse(
          res, 201,
          `The sum of pieces in each packet (${sumOfPiecePerPacket}) is not matching with the required quanity (${scannedPart.quantity})`
        );
      }
      project.partList.map((part, key) => {
        if (part.partNumber == partNumber) {
          part.grouped = true,
            part.PiecePerPacket = PiecePerPacket
        }
      })
      serialNumbers = Array.from({ length: PiecePerPacket.length }, () =>
        shortid.generate(6)
      );
      for (let i = 0; i < serialNumbers.length; i++) {
        const serial = serialNumbers[i];
        const qty = PiecePerPacket[i];
        await Partserialinfo.create({ serial_no: serial, qty }); // Await the creation
      }
    }
    else {
      project.partList.map((part, key) => {
        if (part.partNumber == partNumber) {
          part.grouped = false
          part.PiecePerPacket = []
        }
      })
      serialNumbers = Array.from({ length: scannedPart.quantity }, () =>
        shortid.generate(6)
      );

      for (let i = 0; i < serialNumbers.length; i++) {
        const serial = serialNumbers[i];
        const qty = scannedPart.quantity
        await Partserialinfo.create({ serial_no: serial, qty }); // Await the creation
      }
    }
    // update the partlist
    project.save()
    let hubIDasObject = new mongoose.Types.ObjectId(hubID)
    const searchCriteria = partID ? { partId: partID } : { partNumber: partNumber };
    const partSerialRecord = await partSerialNo.findOne(searchCriteria);
    if (partSerialRecord) {
      const hubEntry = partSerialRecord.hubSerialNo.find(
        (entry) => entry.hubId === hubIDasObject
      );
      if (hubEntry) {
        await partSerialNo.updateOne(
          {
            ...searchCriteria,
            "hubSerialNo.hubId": hubIDasObject,
          },
          {
            $inc: { "hubSerialNo.$.serialNo": qnty },
            $push: { "hubSerialNo.$.serialNos": { $each: serialNumbers } },
          }
        );
      } else {
        await partSerialNo.updateOne(
          searchCriteria,
          {
            $push: {
              hubSerialNo: {
                hubId: hubIDasObject,
                serialNo: scannedPart.quantity,
                serialNos: serialNumbers,
              },
            },
          }
        );
      }
    } else {
      await partSerialNo.updateOne(
        searchCriteria,
        {
          $setOnInsert: searchCriteria,
          $push: {
            hubSerialNo: {
              hubId: hubIDasObject,
              serialNo: scannedPart.quantity,
              serialNos: serialNumbers,
            },
          },
        },
        { upsert: true }
      );
    }
    return utils.commonResponse(res, 200, "Part serial number generated", {
      hubID: hubIDasObject,
      partID: scannedPart.partID,
      partNumber,
      partDescription: scannedPart.description,
      qnty: scannedPart.quantity,
      grouped: scannedPart.grouped,
      serialNos: serialNumbers,
      PiecePerPacket: scannedPart.PiecePerPacket,
    });
  } catch (error) {
    console.error("Error generating part serial number:", error);
    return utils.commonResponse(res, 500, "Internal Server Error", error);
  }
};


exports.savePartPackingMethod = async (req, res) => {
  // THIS FUNCTION WILL GENERATE SERIAL NUMBER FOR PARTS
  try {
    const { hubID, partID, partNumber, projectId, PiecePerPacket, grouped } = req.body;
    let scannedPart
    let serialNumbers
    let partList
    let project
    const missingFields = [];
    // if (grouped) missingFields.push("grouped");
    if (!hubID) missingFields.push("hubID");
    if (!partNumber) missingFields.push("partNumber");
    if (!projectId) missingFields.push("projectId");
    if (missingFields.length > 0) {
      return utils.commonResponse(
        res,
        400,
        `Required: ${missingFields.join(", ")}`
      );
    }
    if (projectId) {
      try { project = await Projects.findOne({ _id: new mongoose.Types.ObjectId(projectId) }) }
      catch {
        return utils.commonResponse(res, 200, "Invalid project ID")
      }
      partList = project.partList
      scannedPart = partList.find(part => part.partNumber === partNumber);
      if (scannedPart.length === 0) {
        return utils.commonResponse(res, 200, "part not in this current project")
      }
    }
    else {
      return utils.commonResponse(res, 200, "projectId missing in the request")
    }


    const projectBoxes = await Boxes.find({ projectId: projectId });
    const existingPartsInfo = [];
    // Iterate through boxes directly instead of flattening first
    for (const box of projectBoxes) {
      const matchingComponents = box.components.filter(
        comp => comp.componentName === partNumber
      );
      if (matchingComponents.length > 0) {
        existingPartsInfo.push({
          boxSerial: box.serialNo || 'Unknown Serial',
          components: matchingComponents
        });
      }
    }
    // if (existingPartsInfo.length > 0) {
    //   const boxSerials = existingPartsInfo.map(info => info.boxSerial).join(', ');
    //   return utils.commonResponse(
    //     res,
    //     400,
    //     `Serial Number cannot be generated for part ${partNumber}. ` +
    //     `Found in box(es): ${boxSerials}`
    //   );
    // }


    if (grouped) {
      const missingFields = [];
      if (!PiecePerPacket) missingFields.push('PiecePerPacket');
      if (missingFields.length > 0) {
        return utils.commonResponse(
          res,
          400,
          `Required: ${missingFields.join(", ")}`
        );
      }
      // partListUpdates = { "isgrouped": true, "PiecePerPacket": PiecePerPacket }
      let sumOfPiecePerPacket = 0
      PiecePerPacket.map((packetqty, key) => {
        sumOfPiecePerPacket = sumOfPiecePerPacket + packetqty
      })
      if (sumOfPiecePerPacket != scannedPart.quantity) {
        return utils.commonResponse(
          res, 201,
          `The sum of pieces in each packet (${sumOfPiecePerPacket}) is not matching with the required quanity (${scannedPart.quantity})`
        );
      }
      project.partList.map((part, key) => {
        if (part.partNumber == partNumber) {
          part.grouped = true,
            part.PiecePerPacket = PiecePerPacket
            PiecePerPacket.map((i, index)=>{
              if(part.scannedStatusOfPacket.length != PiecePerPacket.length){
                part.scannedStatusOfPacket.push(false)
              }
            })
        }
      })
     
    }
    else {
      project.partList.map((part, key) => {
        if (part.partNumber == partNumber) {
          part.grouped = false
          part.PiecePerPacket = []
          part.scannedStatusOfPacket = []
        }
      })
    }
    // update the partlist
    project.save()
    

    return utils.commonResponse(res, 200, `Part Number ${partNumber} packing configuratino saved`, {
      hubID: hubID,
      partID: scannedPart.partID,
      partNumber,
    });
  } catch (error) {
    console.error("Error generating part serial number:", error);
    return utils.commonResponse(res, 500, "Internal Server Error", error);
  }
};


exports.updatePacketQty = async(req, res)=>{
  const { packetserialno, qty } = req.body;
  let missingFields = []
  if (!packetserialno) missingFields.push("packetserialno");
  if (!qty) missingFields.push("qty");
  if (missingFields.length > 0) {
    return utils.commonResponse(
      res,
      400,
      `Required: ${missingFields.join(", ")}`
    );
  }
  await Partserialinfo.updateOne({serial_no:packetserialno},{qty:qty})
  return utils.commonResponse(
    res,
    200,
    `Updated Successfully`
  );
}


exports.removePacketSerialNo = async(req, res)=>{
  const { packetserialno } = req.body;
  let missingFields = []
  if (!packetserialno) missingFields.push("packetserialno");
  if (missingFields.length > 0) {
    return utils.commonResponse(
      res,
      400,
      `Required: ${missingFields.join(", ")}`
    );
  }
  await Partserialinfo.deleteOne({serial_no:packetserialno})
  return utils.commonResponse(
    res,
    200,
    `Deleted Successfully`
  );
}




exports.getAllPacketsInProject = async (req, res)=>{
  const { hubID, partNumber, projectId } = req.body;
  const missingFields = [];
  // if (grouped) missingFields.push("grouped");
  if (!hubID) missingFields.push("hubID");
  if (!partNumber) missingFields.push("partNumber");
  if (!projectId) missingFields.push("projectId");
  if (missingFields.length > 0) {
    return utils.commonResponse(
      res,
      400,
      `Required: ${missingFields.join(", ")}`
    );
  }
  let serials = await Partserialinfo.find({projectId, partNumber, hubID})
  return utils.commonResponse(
    res,
    200,
    {serials},
    `Fetched Successfully`
  );
}



exports.generatePacketSerialNo = async (req, res) => {
  // THIS FUNCTION WILL GENERATE SERIAL NUMBER FOR PARTS
  try {
    const { hubID, partID, partNumber, projectId, qty } = req.body;
    let scannedPart
    let serialNumbers
    let partList
    let project
    const missingFields = [];
    // if (grouped) missingFields.push("grouped");
    if (!hubID) missingFields.push("hubID");
    if (!partNumber) missingFields.push("partNumber");
    if (!projectId) missingFields.push("projectId");
    if (!qty) missingFields.push("qty");
    if (missingFields.length > 0) {
      return utils.commonResponse(
        res,
        400,
        `Required: ${missingFields.join(", ")}`
      );
    }
    if (projectId) {
      try { project = await Projects.findOne({ _id: new mongoose.Types.ObjectId(projectId) }) }
      catch {
        return utils.commonResponse(res, 200, "Invalid project ID")
      }
      partList = project.partList
      scannedPart = partList.find(part => part.partNumber === partNumber);
      if (scannedPart.length === 0) {
        return utils.commonResponse(res, 200, "part not in this current project")
      }
    }
    else {
      return utils.commonResponse(res, 200, "projectId missing in the request")
    }

    serialNumbers = Array.from({ length: 1 }, () =>
      shortid.generate(6)
    );

    await Partserialinfo.create({ serial_no: serialNumbers[0], qty , projectId, partNumber, hubID}); // Await the creation

    let hubIDasObject = new mongoose.Types.ObjectId(hubID)
    const searchCriteria = partID ? { partId: partID } : { partNumber: partNumber };
    const partSerialRecord = await partSerialNo.findOne(searchCriteria);
    if (partSerialRecord) {
      const hubEntry = partSerialRecord.hubSerialNo.find(
        (entry) => entry.hubId === hubIDasObject
      );
      if (hubEntry) {
        await partSerialNo.updateOne(
          {
            ...searchCriteria,
            "hubSerialNo.hubId": hubIDasObject,
          },
          {
            $inc: { "hubSerialNo.$.serialNo": qnty },
            $push: { "hubSerialNo.$.serialNos": { $each: serialNumbers } },
          }
        );
      } else {
        await partSerialNo.updateOne(
          searchCriteria,
          {
            $push: {
              hubSerialNo: {
                hubId: hubIDasObject,
                serialNo: scannedPart.quantity,
                serialNos: serialNumbers,
              },
            },
          }
        );
      }
    } else {
      await partSerialNo.updateOne(
        searchCriteria,
        {
          $setOnInsert: searchCriteria,
          $push: {
            hubSerialNo: {
              hubId: hubIDasObject,
              serialNo: qty,
              serialNos: serialNumbers,
            },
          },
        },
        { upsert: true }
      );
    }

    return utils.commonResponse(res, 200, `Packet serial number generated with quantity ${qty}`, {
      hubID: hubIDasObject,
      partID,
      partNumber,
      partDescription: scannedPart.description,
      qnty: qty,
      serialNo: serialNumbers,
    });
  } catch (error) {
    console.error("Error generating part serial number:", error);
    return utils.commonResponse(res, 500, "Internal Server Error", error);
  }
};



exports.generatePanelSerialNo = async (req, res) => {
  try {
    const { hubID, panelID, qnty } = req.body;
    const arr1 = new Array(qnty).fill(0).map((x) => shortid.generate(6));
    panelSerialNo
      .findOneAndUpdate(
        {
          panelID: panelID,
          hubSerialNo: {
            $elemMatch: {
              hubID: hubID,
            },
          },
        },
        {
          $inc: { "hubSerialNo.$.serialNo": qnty },
          $push: { "hubSerialNo.$.serialNos": { $each: arr1 } },
        },
        { returnNewDocument: true }
      )
      .then(async (panelSerial) => {
        if (!panelSerial) {
          await panelSerialNo.findOneAndUpdate(
            { panelID: panelID },
            {
              $push: {
                hubSerialNo: { hubID: hubID, serialNo: qnty, serialNos: arr1 },
              },
            }
          );
        }

        panel = await Panels.findById(panelID);
        utils.commonResponse(res, 200, "Panel serial number generated", {
          hubID: hubID,
          panelID: panelID,
          serialNos: arr1,
        });
      });
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};
