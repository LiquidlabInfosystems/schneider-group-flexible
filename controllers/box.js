// IMPORT MODULES
const mongoose = require("mongoose");
const boxSerialNo = require("../Models/BoxSerialNo");
const utils = require("../controllers/utils");
const shortid = require("shortid");
const Project = require("../Models/Projects");
const ProjectBoxSerial = require("../Models/BoxSerialNo");
const Boxes = require("../Models/box");
const Component = require("../Models/Components.js");
const Hub = require("../Models/Hubs.js");
const ComponentSerialNo = require("../Models/componentSerialNo.js");
const Parts = require("../Models/Parts.js");
const PartsSerialNo = require("../Models/PartsSerialNo.js");
const Partserialinfo = require("../Models/Partserialinfo.js");



// HANDLES CHECK COMPONENTS QUANTITY
async function checkComponentQuntityExceeded(
  totalQuantity,
  reference,
  projectId
) {
  var isExceedded = false;
  const checkQuntity = await Project.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $unwind: "$switchBoardData",
    },
    {
      $unwind: "$switchBoardData.components",
    },
    {
      $match: {
        "switchBoardData.components.Reference": reference,
      },
    },
    {
      $group: {
        _id: new mongoose.Types.ObjectId(projectId),
        totalQuantity: {
          $sum: "$switchBoardData.components.Quantity",
        },
      },
    },
    {
      $project: {
        isQuantityExceeded: {
          $lte: ["$totalQuantity", totalQuantity],
        },
      },
    },
  ]);

  if (checkQuntity.length > 0) {
    return (isExceedded = checkQuntity[0].isQuantityExceeded ?? false);
  } else {
    return isExceedded;
  }
}



// HANDLES CHECKCOMPONENT EXIST
async function checkComponentExitInTheProject(res, componentID, projectID) {
  try {
    const findComponentExist = await Component.aggregate([
      {
        $match: {
          // '_id': new ObjectId('6716323a8693a807bcb8106e')
          _id: new mongoose.Types.ObjectId(componentID),
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "componentName",
          foreignField: "switchBoardData.components.Reference",
          as: "projects",
          pipeline: [
            {
              $match: {
                // '_id': new ObjectId('6716323f8693a807bcb81d9f')
                _id: new mongoose.Types.ObjectId(projectID),
              },
            },
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isComponentExist: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: "$projects",
                  },
                  0,
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          isComponentExist: 1,
        },
      },
    ]);
    return findComponentExist;
  } catch (error) {
    utils.commonResponse(res, 500, error.toString());
  }
}




// EXPORT GENERATE BOX SERIAL NUMBER
exports.generateBoxSerialNo = async (req, res) => {
  // THIS FUNCTION WILL GENERATE SERIAL NUMBERS FOR BOXES 
  // REQUEST WITH
  // HUBID AND QUANTITY AS ( hubID, qnty )
  // RESPONSE
  // LIST OF BOX SERIAL NUMBERS
  try {
    const { hubID, qnty } = req.body;
    if (!hubID || !qnty || typeof qnty !== "number" || qnty <= 0) {
      return utils.commonResponse(res, 400, "Invalid input parameters");
    }
    const existingBoxSerial = await boxSerialNo.findOne({ hubID });
    let serialCounter = existingBoxSerial
      ? existingBoxSerial.serialNos.length + 1
      : 1;
    const boxSerialNos = Array.from({ length: qnty }, () => {
      const serialNo = shortid.generate();
      const sixDigitNo = serialCounter.toString().padStart(6, "0");
      serialCounter += 1;
      return `${serialNo}${sixDigitNo}`;
    });
    if (existingBoxSerial) {
      await boxSerialNo.updateOne(
        { hubID },
        {
          $push: { serialNos: { $each: boxSerialNos } },
          $inc: { serialNoCount: qnty },
        }
      );
    } else {
      await boxSerialNo.create({
        hubID,
        serialNos: boxSerialNos,
        serialNoCount: qnty,
      });
    }
    utils.commonResponse(res, 200, "Box serial numbers generated", {
      hubID,
      boxSerialNos,
    });
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};



// HANDLES ADD BOX TO PROJECT
exports.addBoxToProject = async (req, res) => {
  // THIS FUNCTION WILL ADD A BOX TO A PROJECT
  // REQUEST MUST CONTAIN
  // projectID and serialNo
  // RESPONSE
  // OBJECT WITH BOX DATA
  try {
    const { projectID, serialNo } = req.body;
    if (!projectID || !serialNo) {
      return utils.commonResponse(res, 400, "Invalid input parameters");
    }
    const existingBoxSerial = await boxSerialNo.findOne({
      serialNos: serialNo,
    });

    if (!existingBoxSerial) {
      return utils.commonResponse(res, 404, "Serial number not found");
    }
    const existingBox = await Boxes.findOne({
      projectId: projectID,
      serialNo,
    });

    if (existingBox) {
      return utils.commonResponse(
        res,
        409,
        "Box with this serial number already exists in the project"
      );
    }
    const box = await Boxes.create({
      projectId: new mongoose.Types.ObjectId(projectID),
      serialNo,
    });
    await Project.findByIdAndUpdate(
      projectID,
      { $addToSet: { boxSerialNumbers: serialNo } },
      { new: true }
    );
    utils.commonResponse(
      res,
      200,
      "Serial number connected to project successfully",
      {
        _id: box._id,
        boxSerialNo: box.serialNo,
        status: box.status,
        quantity: box.quantity,
      }
    );
  } catch (error) {
    console.error("Error in addBoxToProject:", error);
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};



// HANDLES REMOVE BOX FROM PROJECT
exports.removeBoxFromProject = async (req, res) => {
  // THE FUNCTION CAN BE USED TO REMOVE BOX FROM A PROJECT
  // REQUEST MUST CONTAIN 
  // projectId, serialNo\
  // RESPONSE 
  // MESSAGE SAYING "BOX DELETED FROM PROJECT SUCCESSFULLY"
  try {
    const { projectID, serialNo } = req.body;
    if (!projectID || !serialNo) {
      return utils.commonResponse(res, 400, "Invalid input parameters plz provide projectID and serialNo (box serial no)");
    }
    const existingBoxSerial = await boxSerialNo.findOne({
      serialNos: serialNo,
    });
    if (existingBoxSerial) {
      const existingBox = await Boxes.findOne({
        projectId: projectID,
        serialNo,
      });
      // If box exists, proceed to remove it
      await Boxes.deleteOne({ _id: existingBox._id });
      return utils.commonResponse(res, 404, "Box Deleted from project successfully");
    }
    else {
      return utils.commonResponse(res, 404, "Box Serial Number Do Not Exist");

    }
  } catch (error) {
    console.error("Error in addBoxToProject:", error);
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};



// NO IN USE
exports.addComponentsToBox = async (req, res) => {
  try {
    const {
      hubID,
      componentID,
      boxSerialNo,
      projectID,
      componentSerialNumber,
    } = req.body;

    if (
      !hubID ||
      !componentID ||
      !boxSerialNo ||
      !projectID ||
      !componentSerialNumber
    ) {
      return utils.commonResponse(res, 400, "Invalid input parameters");
    }

    // const findComponentAvailableInBox =
    const findComponentExist = await checkComponentExitInTheProject(
      res,
      componentID,
      projectID
    );

    if (findComponentExist.length > 0) {
      if (!findComponentExist[0].isComponentExist) {
        return utils.commonResponse(
          res,
          201,
          "This Component/item not listed in this project, please check..."
        );
      }
    }

    const box = await Boxes.findOne({ serialNo: boxSerialNo });
    if (!box) {
      return utils.commonResponse(res, 404, "Box serial number not found");
    }

    const component = await ComponentSerialNo.findOne({
      componentID: componentID,
    });

    const componentName = await Component.findOne({
      _id: new mongoose.Types.ObjectId(componentID),
    });

    if (!component) {
      return utils.commonResponse(res, 404, "Component ID not found");
    }

    const hub = await Hub.findById(hubID);
    if (!hub) {
      return utils.commonResponse(res, 404, "Hub ID not found");
    }

    const componentSerialEntry = await ComponentSerialNo.findOne({
      componentID: componentID,
      "hubSerialNo.hubID": hubID,
      "hubSerialNo.serialNos": componentSerialNumber,
    });

    if (!componentSerialEntry) {
      return utils.commonResponse(
        res,
        404,
        "Component Serial Number not found for the provided Component ID and Hub ID"
      );
    }
    const allProjectBasedBoxes = await Boxes.find({
      projectId: new mongoose.Types.ObjectId(projectID),
    });

    for (const serialBox of allProjectBasedBoxes) {
      const existingComponent = serialBox.components.find(
        (comp) => comp.componentID && comp.componentID.equals(componentID)
      );

      if (existingComponent) {
        if (
          existingComponent.componentSerialNo.includes(componentSerialNumber)
        ) {
          return utils.commonResponse(
            res,
            400,
            "Serial number already exists for this component in the box"
          );
        }

        // Add the serial number and update the quantity
        existingComponent.componentSerialNo.push(componentSerialNumber);
        existingComponent.quantity = existingComponent.componentSerialNo.length;

        // // Save the updated box
        // await serialBox.save();
      }
    }

    // else {
    box.components.push({
      componentID,
      componentName: componentName.componentName,
      componentSerialNo: [componentSerialNumber],
      quantity: 1,
    });
    // }
    const totalComponentsQuantity = await Boxes.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectID),
        },
      },
      {
        $unwind: "$components",
      },
      {
        $match: {
          "components.componentID": new mongoose.Types.ObjectId(componentID),
        },
      },
      {
        $group: {
          _id: "$components.componentID",
          totalQuantity: {
            $sum: "$components.quantity",
          },
        },
      },
    ]);

    const isExeed = await checkComponentQuntityExceeded(
      totalComponentsQuantity.length > 0
        ? totalComponentsQuantity[0].totalQuantity ?? 0
        : 0,
      componentName.componentName,
      projectID
    );
    if (isExeed) {
      return utils.commonResponse(
        res,
        201,
        "The ordered quantity of this item has been added to the box."
      );
    }

    box.quantity += 1;
    await box.save();

    utils.commonResponse(res, 200, "Component added to box successfully", {
      boxid: box._id,
      totalComponents: box.quantity,
    });
  } catch (error) {
    console.error("Error in addComponentsToBox:", error);
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};


// HELPS IN GETING BOX DETAILS
exports.getBoxDetails = async (req, res) => {
  // THE FUNCTION IS TO RESPOND WITH THE BOX DETAILS CONTAINING THE PARTS INSIDE IT , PROJECT DETAILS AND SO ON
  try {
    const { _id, serialNo } = req.body;

    const box = await Boxes.aggregate([
      {
        $match: {
          $expr: {
            $cond: {
              if: { $eq: ["$_id", new mongoose.Types.ObjectId(_id)] },
              then: { $eq: ["$_id", new mongoose.Types.ObjectId(_id)] },
              else: { $eq: ["$serialNo", serialNo] },
            },
          },
        },
      },
      {
        $unwind: "$components",
      },

      {
        $lookup: {
          from: "parts",
          localField: "components.componentID",
          foreignField: "_id",
          as: "componentDetails",
        },
      },
      {
        $unwind: "$componentDetails",
      },
      {
        $project: {
          _id: 1,
          status: 1,
          quantity: 1,
          serialNo: 1,
          projectId: 1,
          "components.componentID": "$components.componentID",
          "components.componentSerialNo": "$components.componentSerialNo",
          "components.componentName": "$componentDetails.partNumber",
          "components.quantity": "$components.quantity",
          "components._id": "$components._id",
          "components.compDescription": "$componentDetails.partDescription",
        },
      },
      {
        $group: {
          _id: {
            projectId: "$_id",
            componentName: "$components.componentName",
          },
          status: {
            $first: "$status",
          },
          serialNo: {
            $first: "$serialNo",
          },
          quantity: {
            $first: "$quantity",
          },
          totalQuantity: {
            $sum: "$components.quantity",
          },
          projectId: {
            $first: "$projectId",
          },
          component: {
            $first: {
              componentID: "$components.componentID",
              componentSerialNo: "$components.componentSerialNo",
              componentName: "$components.componentName",
              compDescription: "$components.compDescription",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.projectId",
          status: {
            $first: "$status",
          },
          serialNo: {
            $first: "$serialNo",
          },
          quantity: {
            $first: "$quantity",
          },
          projectId: {
            $first: "$projectId",
          },
          components: {
            $push: {
              componentID: "$component.componentID",
              componentSerialNo: "$component.componentSerialNo",
              componentName: "$component.componentName",
              compDescription: "$component.compDescription",
              quantity: "$totalQuantity",
            },
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectName",
          pipeline: [
            {
              $project: {
                ProjectName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          projectName: {
            $arrayElemAt: ["$projectName.ProjectName", 0],
          },
        },
      },
    ]);
    if (!box) {
      return utils.commonResponse(res, 404, "Box not found");
    } else {
    }
    utils.commonResponse(res, 200, "Box fetched successfully", box[0]);
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};


// HELPS TO UPDATE THE BOX STATUS
exports.updateBoxStatus = async (req, res) => {
  try {
    const { _id, status } = req.body;
    if (!_id || !status) {
      utils.commonResponse(res, 400, "Both _id and status are required.");
    }
    const validStatuses = ["open", "shipped"];
    if (!validStatuses.includes(status)) {
      utils.commonResponse(
        res,
        400,
        "Invalid status. Must be 'open' or 'shipped'."
      );
    }
    const updatedBoxes = await Boxes.findOneAndUpdate(
      { _id },
      { status },
      { new: true }
    );
    if (!updatedBoxes) {
      utils.commonResponse(res, 404, "Boxes not found.");
    }
    utils.commonResponse(res, 200, "Boxes closed successfully");
  } catch (error) {
    console.error("Error closing the boxes:", error);
    utils.commonResponse(res, 500, "Internal server error.");
  }
};


// NOT USING
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


// HELPS IN ADDING PART TO BOX
exports.addPartsToBox = async (req, res) => {
  try {
    // console.log('addpart', req.body)
    const { hubID, partID, boxSerialNo, projectID, partSerialNumber, qty } = req.body;
    // console.log(partID)
    let projectWithID = new mongoose.Types.ObjectId(projectID)
    let project  = await Project.findOne({_id:projectWithID})
    // console.log(project)
    let partList = project?.partList
    // console.log(partList)
    let currentpart  = {}
    let pid = ""
    partList.map((part, key)=>{
      // pid = new mongoose.Types.ObjectId(partID)
      // pidpart =  new mongoose.Types.ObjectId(part.partID)
      if(partID === part.partID){
        console.log("-------match---------",part.partID, partID)

        currentpart = part
      }
      else{
        console.log('else-----',part.partID, partID)
      }
    })

    console.log('part---------',currentpart)
    // let currentpart = await Parts.findOne({ _id: new mongoose.Types.ObjectId(partID) })
    // console.log(currentpart.partNumber, "current part")
    let currentpartNumber = currentpart.partNumber
    let hubIDasObject = new mongoose.Types.ObjectId(hubID)
    // console.log(currentpartNumber, hubIDasObject, partSerialNumber)
    if (!hubID || !partID || !boxSerialNo || !projectID || !partSerialNumber) {
      return utils.commonResponse(res, 400, "Invalid input parameters");
    }
    const [part, box, hub] = await Promise.all([
      Parts.findById(partID),
      Boxes.findOne({ serialNo: boxSerialNo, projectId: projectID }),
      Hub.findById(hubID),
    ]);
    if (!part) return utils.commonResponse(res, 404, "Part ID not found");
    if (!box) return utils.commonResponse(res, 404, "Box serial number not found");
    if (!hub) return utils.commonResponse(res, 404, "Hub ID not found");
    const isSerialValid = await PartsSerialNo.exists({
      partNumber: currentpartNumber,
      hubSerialNo: {
        $elemMatch: { hubId: hubIDasObject, serialNos: partSerialNumber },
      },
    });
    if (!isSerialValid) {
      return utils.commonResponse(
        res,
        404,
        "Part Serial Number not found for the provided Part ID and Hub ID"
      );
    }
    const projectBoxes = await Boxes.find({ projectId: projectID });
    // Check if the part exists in any project box
    const existingPart = projectBoxes.flatMap(box => box.components).find(
      comp => comp.componentID?.equals(partID) && comp.componentSerialNo.includes(partSerialNumber)
    );
    if (existingPart) {
      return utils.commonResponse(
        res,
        400,
        "Serial number already exists for this Part in the box"
      );
    }
    // Add the part to the box or update its quantity and serial numbers
    const existingComponent = box.components.find(comp => comp.componentID?.equals(partID));
    if (existingComponent) {
      existingComponent.componentSerialNo.push(partSerialNumber);
      console.log(currentpart)
      if (currentpart.grouped) {
        let item = await Partserialinfo.findOne({ serial_no: partSerialNumber })
        existingComponent.quantity += item.qty;
      }
      else {
        existingComponent.quantity += 1;
      }
    }
    else {
      if (currentpart.grouped) {
        let item = await Partserialinfo.findOne({ serial_no: partSerialNumber })
        box.components.push({
          componentID: partID,
          componentName: part.partNumber,
          componentSerialNo: [partSerialNumber],
          quantity: parseInt(item.qty),
        });
      }
      else {
        box.components.push({
          componentID: partID,
          componentName: part.partNumber,
          componentSerialNo: [partSerialNumber],
          quantity: 1,
        });
      }
    }
    // Check if the total quantity exceeds the allowed limit
    const totalComponentsQuantity = await Boxes.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectID) } },
      { $unwind: "$components" },
      { $match: { "components.componentID": new mongoose.Types.ObjectId(partID) } },
      { $group: { _id: "$components.componentID", totalQuantity: { $sum: "$components.quantity" } } },
    ]);
    const totalQuantity = totalComponentsQuantity.length > 0 ? totalComponentsQuantity[0].totalQuantity : 0;
    const isExceed = await checkComponentQuntityExceeded(totalQuantity, part.partNumber, projectID);
    if (isExceed) {
      return utils.commonResponse(
        res,
        201,
        "The ordered quantity of this item has been added to the box."
      );
    }
    // Save the box and respond
    if (currentpart.grouped) {
      let item = await Partserialinfo.findOne({ serial_no: partSerialNumber })
      console.log("item", item.qty)
      box.quantity += item.qty;
    }
    else {
      box.quantity += 1;
    }
    await box.save();
    return utils.commonResponse(res, 200, "Part added to box successfully", {
      boxid: box._id,
      totalParts: box.quantity,
      part:part,
    });

  } catch (error) {
    console.error("Error in addPartsToBox:", error);
    return utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};


// HELPS TO REMOVE PARTS FROM BOXES
exports.removePartsFromBoxes = async (req, res) => {
  try {
    console.log('remove part', req.body)
    const { hubID, partID, boxSerialNo, projectID, partSerialNumber } = req.body;
    if (!hubID || !partID || !boxSerialNo || !projectID || !partSerialNumber) {
      return utils.commonResponse(res, 400, "Invalid input parameters");
    }
    const [part, box, hub] = await Promise.all([
      Parts.findById(partID),
      Boxes.findOne({ serialNo: boxSerialNo, projectId: projectID }),
      Hub.findById(hubID),
    ]);
    if (!part) return utils.commonResponse(res, 404, "Part ID not found");
    if (!box) return utils.commonResponse(res, 404, "Box serial number not found");
    if (!hub) return utils.commonResponse(res, 404, "Hub ID not found");
    // Check if the part exists in the box
    const existingComponent = box.components.find(comp => comp.componentID?.equals(partID))
    // console.log(existingComponent)
    if (existingComponent) {
      //   // Remove the serial number from the componentSerialNo array
      const filteredList = existingComponent.componentSerialNo.filter((data) => {
        return data != partSerialNumber
      });
      // console.log(filteredList)
      // Save the box and respond
      if (part.grouped) {
        let item = await Partserialinfo.findOne({ serial_no: partSerialNumber })
        existingComponent.quantity -= item.qty; // Decrease the quantity
      }
      else {
        existingComponent.quantity -= 1; // Decrease the quantity
      }
      existingComponent.componentSerialNo = filteredList
      // If the quantity becomes 0 or no serial numbers are left, remove the component from the box
      if (existingComponent.quantity <= 0 || existingComponent.componentSerialNo.length === 0) {
        box.components = box.components.filter(comp => !comp.componentID?.equals(partID));
      }
      if (part.grouped) {
        let item = await Partserialinfo.findOne({ serial_no: partSerialNumber })
        box.quantity -= item.qty;
      }
      else {
        box.quantity -= 1;
      }
      await box.save();
      return utils.commonResponse(res, 200, "Part removed from the box successfully", {
        boxid: box._id,
        totalParts: box.quantity,
      });
    }
    else {
      return utils.commonResponse(res, 200, "Part do not exist Exist")
    }
  } catch (error) {
    console.error("Error in addPartsToBox:", error);
    return utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};


// HELPS TO GET ALL PARTS IN THE BOXES
exports.getAllPartsInAllBoxes = async (req, res) => {
  try {
    const projectId = req.body.projectId;
    const boxSerialNos = req.body.boxSerialNos;
    const allParts = await Boxes.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          serialNo: {
            $in: boxSerialNos,
          },
        },
      },
      {
        $unwind: {
          path: "$components",
        },
      },
      {
        $project: {
          partNumber: "$components.componentName",
          componentID: "$components.componentID",
          quantity: "$components.quantity",
        },
      },
      {
        $group: {
          _id: "$componentID",
          quantity: {
            $sum: "$quantity",
          },
          partNumber: {
            $first: "$partNumber",
          },
        },
      },
    ]);
    if (allParts.length == 0) {
      utils.commonResponse(res, 201, "no parts found");
    }
    utils.commonResponse(res, 200, "all parts fetched successfully", allParts);
  } catch (error) {
    utils.commonResponse(res, 500, "unexpected server error", error.toString());
  }
};
