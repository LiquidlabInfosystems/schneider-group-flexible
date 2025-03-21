// // NOT IN USE FOR NOW

// const Panels = require("../Models/Panels")
// const panelSerialNo = require("../Models/panelSerialNo")
// const utils = require("../controllers/utils")
// const PanelType = require("../Models/PanelType")

// exports.createPanel = async (req, res) => { 
//     try {
//         const { panelName, panelShortName, panelPartNo, panelSize } =
//             req.body;
//         panelCheck = await Panels.findOne({ panelPartNo: panelPartNo });
//         if (panelCheck) {
//             utils.commonResponse(res, 201, "Panel with same part number available available in the system", panelCheck);
//         }
//         Panels.create({ panelName, panelShortName, panelPartNo, panelSize }).then(async (panel) => {
//             await panelSerialNo.create({ panelID: panel._id, hubSerialNo: [] })
//             utils.commonResponse(res, 200, "panel created successfully", panel)
//         }).catch((error) => {
//             utils.commonResponse(res, 500, "Unexpected server error", error.toString())
//         })
//     } catch (error) {
//         utils.commonResponse(res, 500, "Unexpected server error", error.toString())
//     }
// }


// exports.getAllPanels = async (req, res) => {
//     try {
//         const allPanels = await Panels.find();
//         utils.commonResponse(res, 200, "All panels fetched successfully", allPanels);

//     } catch (error) {
//         utils.commonResponse(res, 500, "Unexpected server error", error.toString())
//     }
// }

// exports.createPanelType = async (req, res) => {
//     try {
//         const { panelType } = req.body;
//         checkPanelType = await PanelType.findOne({ PanelType: panelType })
//         if (checkPanelType) {
//             utils.commonResponse(res, 201, "Similar panel type already present in the system", panelType);
//         } else {
//             await PanelType.create({
//                 PanelType: panelType
//             })
//             utils.commonResponse(res, 200, "Panel type created", panelType);
//         }

//     } catch (error) {
//         utils.commonResponse(res, 500, "Unexpected server error", error.toString())
//     }
// }

// exports.addBOMToPanelTypes = async (req, res) => {
//     try {

//         const { panelTypeID, bomIDList } = req.body;
//         panelType = await PanelType.findByIdAndUpdate({ _id: panelTypeID }, {
//             $addToSet: { BOMList: { $each: bomIDList } }
//         }, { returnNewDocument: true })

//         utils.commonResponse(res, 200, "Panel BOM added", panelType)

//     } catch (error) {
//         utils.commonResponse(res, 500, "Unexpected server error", error.toString())
//     }
// }

// exports.getAllPanelTypes = async (req, res) => {
//     try {
//         // Fetch all panel types from the database
//         const allPanelTypes = await PanelType.find();

//         // Respond with success message and data
//         utils.commonResponse(res, 200, "All panel types fetched successfully", allPanelTypes);
//     } catch (error) {
//         // Handle unexpected server errors
//         utils.commonResponse(res, 500, "Unexpected server error", error.toString());
//     }
// };