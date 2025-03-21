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

function calculatePackets(requiredQuantity, maxPerPacket) {
  const packets = [];
  let remainingQuantity = requiredQuantity;
  while (remainingQuantity > 0) {
    const quantityInPacket = Math.min(remainingQuantity, maxPerPacket);
    packets.push(quantityInPacket);
    remainingQuantity -= quantityInPacket;
  }
  return packets;
}

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

exports.generatePartSerialNo = async (req, res) => {
  // THIS FUNCTION WILL GENERATE SERIAL NUMBER FOR PARTS
  try {
    const { hubID, partID, partNumber, qnty, projectId } = req.body;
    if (!qnty || typeof qnty !== "number" || !hubID || !partNumber) {
      return utils.commonResponse(
        res,
        400,
        "Required Quantity (qnty) , hubID, partNumber"
      );
    }
    // check the project details
    console.log(req.body)
    let cpart

    if(projectId){
      console.log("searching for part in project")
      let project_id = new mongoose.Types.ObjectId(projectId)
      let project = await Projects.findOne({_id:project_id})
      let partList = project.partList
      partList.forEach((part, key)=>{
        if(part.partNumber == partNumber){
          cpart = part
        }
      })
    }
    else{
      cpart = await parts.findOne({ partNumber })
    }

    console.log(cpart)

    let serialNumbers
    let PiecePerPacket = []
    let grouped = false
    if (cpart.grouped) {
      const requiredQuantity = qnty;
      const maxPerPacket = cpart.PiecePerPacket;
      const packets = calculatePackets(requiredQuantity, maxPerPacket);
      PiecePerPacket = packets
      grouped = true
      serialNumbers = Array.from({ length: packets.length }, () =>
        shortid.generate(6)
      );
    }
    else {
      serialNumbers = Array.from({ length: qnty }, () =>
        shortid.generate(6)
      );
    }
    let hubIDasObject = new mongoose.Types.ObjectId(hubID)
    const searchCriteria = partID ? { partId: partID } : { partNumber: partNumber };
    const partSerialRecord = await partSerialNo.findOne(searchCriteria);
    if (partSerialRecord) {
      const hubEntry = partSerialRecord.hubSerialNo.find(
        (entry) => entry.hubId === hubIDasObject
      );
      console.log(hubIDasObject, partID, hubEntry)
      // loop to serial number and create partserialinfo

      for (let i = 0; i < serialNumbers.length; i++) {
        const serial = serialNumbers[i];
        const qty = PiecePerPacket[i];
        console.log(serial, qty)
        await Partserialinfo.create({ serial_no: serial, qty }); // Await the creation
      }

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
                serialNo: qnty,
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
              serialNo: qnty,
              serialNos: serialNumbers,
            },
          },
        },
        { upsert: true }
      );
    }
    const part = partID
      ? await parts.findById(partID)
      : await parts.findOne({ partNumber: partNumber });
    return utils.commonResponse(res, 200, "Part serial number generated", {
      hubID: hubIDasObject,
      partID: part ? part._id : null,
      partNumber: part ? part.partNumber : partNumber,
      partDescription: part
        ? `${part.partNumber} - ${part.partDescription}`
        : "",
      qnty: qnty,
      grouped: grouped,
      serialNos: serialNumbers,
      PiecePerPacket: PiecePerPacket,
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
