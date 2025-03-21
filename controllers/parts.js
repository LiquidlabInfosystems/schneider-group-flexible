// IMPORT MODULES
const Components = require("../Models/Components");
const componentSerialNo = require("../Models/componentSerialNo");
const utils = require("./utils");
const Box = require("../Models/box");
const Parts = require("../Models/Parts");
const mongoose = require("mongoose");
const CommercialReference = require("../Models/CommercialReference");


// HANDLES CREATE COMPONENT 
exports.createComponent = async (req, res) => {
  try {
    const { componentName, compShortName, compPartNo, compDescription } =
      req.body;
    itemCheck = await Components.findOne({ compPartNo: compPartNo });
    if (itemCheck) {
      utils.commonResponse(
        res,
        201,
        "Item with same part number available available in the system",
        itemCheck
      );
    }
    Components.create({
      componentName,
      compShortName,
      compPartNo,
      compDescription,
    })
      .then(async (component) => {
        await componentSerialNo.create({
          componentID: component._id,
          hubSerialNo: [],
        });
        utils.commonResponse(
          res,
          200,
          "component created successfully",
          component
        );
      })
      .catch((error) => {
        utils.commonResponse(
          res,
          500,
          "Unexpected server error",
          error.toString()
        );
      });
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};


// HELPS IN GETTING ALL 
exports.getAllComponents = async (req, res) => {
  try {
    const allComponents = await Components.find();
    utils.commonResponse(
      res,
      200,
      "All components fetched successfully",
      allComponents
    );
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};

exports.getAllCommertialReferences = async (req, res) => {
  try {
    const allComponents = await CommercialReference.find();
    utils.commonResponse(
      res,
      200,
      "All components fetched successfully",
      allComponents
    );
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};

exports.getAllParts = async (req, res) => {
  try {
    const allComponents = await Parts.find().select('-parentIds -quantity');
    utils.commonResponse(
      res,
      200,
      "All components fetched successfully",
      allComponents
    );
  } catch (error) {
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
};

exports.getBoxDetailsBasedOnComponentScan = async (req, res) => {
  try {
    const componentID = req.body.componentID;
    const serialNo = req.body.serialNo;

    const getBoxDetails = await Box.aggregate([
      {
        $match: {
          components: {
            $elemMatch: {
              componentID: new mongoose.Types.ObjectId(componentID),
              componentSerialNo: {
                $elemMatch: {
                  $eq: serialNo,
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$components",
      },
      {
        $lookup: {
          from: "components",
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
          "components.serial": "$components.serial",
          "components.componentName": "$componentDetails.componentName",
          "components.quantity": "$components.quantity",
          "components._id": "$components._id",
          "components.compDescription": "$componentDetails.compDescription",
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
              serial: "$components.serial",
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
              serial: "$component.serial",
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

    if (getBoxDetails.length > 0) {
      utils.commonResponse(
        res,
        200,
        "Box details fetched successfully based on componet present in the box",
        getBoxDetails[0]
      );
    } else {
      utils.commonResponse(res, 404, "component or box data not found");
    }
  } catch (error) {
    utils.commonResponse(
      res,
      500,
      `unexpected server error ${error.toString()}`
    );
  }
};

exports.partScanResult = async(req, res)=>{
  try{
    let {qr_data} = req.body
    
    
    let part_details = {
      "project_name":"hi"
    }
    utils.commonResponse(res, 200, "success", part_details);
    
  }
  catch{
    utils.commonResponse(res, 500, "Unexpected server error", error.toString());
  }
}