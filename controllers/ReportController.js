const { default: mongoose } = require("mongoose");
const utils = require("../controllers/utils");
const Projects = require("../Models/Projects");
const Boxes = require("../Models/box");

exports.generateProjectStatusReport = async (req, res) => {
    let { projectID } = req.body

    try {
        let project = await Projects.findById(new mongoose.Types.ObjectId(projectID))
        if (!project) return utils.commonResponse(res, 200, "projectID not found in the request")

        let data = {
            'project': project,
            'boxes_and_parts': [],
            "pendingParts": []
        }
        let SerialNumberofBoxesInProject = project?.boxSerialNumbers
        let boxesInProject = await Promise.all(
            SerialNumberofBoxesInProject.map(async (serial) => {
                return await Boxes.findOne({ serialNo: serial });
            })
        );

        data.boxes_and_parts = boxesInProject;
        // console.log("packedpartsInBoxes", data);

        // calculate pending parts
        let packedpartsInBoxes = [];

        boxesInProject?.forEach((box) => {
            box.components.forEach((part) => {
                packedpartsInBoxes.push({
                    partName: part.componentName,
                    quantity: part.quantity
                });
            });
        });

        // console.log("packedpartsInBoxes", packedpartsInBoxes);

        // let 
        let packedparts = packedpartsInBoxes?.reduce((acc, part) => {
            let existingPart = acc.find(p => p.partName === part.partName);

            if (existingPart) {
                existingPart.quantity += part.quantity;
            } else {
                acc.push({ ...part }); // Spread to avoid reference issues
            }

            return acc; // Important: Always return the accumulator
        }, []);


        // partsrequiedforproject
        let requiredpartforproject = []

        project.partList?.map((part, key) => {
            requiredpartforproject.push({
                partName: part.partNumber,
                quanity: part.quantity
            })
        })


        // find part that are in project but not in yet packet
        let pendingparts = [];
        let pendingpartspec
        requiredpartforproject.forEach((part) => {
            pendingpartspec = part
            let packed = false; // Default to false, meaning part is **not found** in `packedparts`

            packedparts.forEach((ppart) => {
                if (part.partName === ppart.partName) {
                    if(part.quanity == ppart.quantity){
                        packed = true;
                    }
                    else{
                        let balanceQuanity = part.quanity  - ppart.quantity
                        pendingpartspec.quanity = balanceQuanity
                    }
                     // Found, so it's packed
                }
            });

            if (!packed) {
                pendingparts.push(pendingpartspec); // Add only if **not packed**
            }
        });

        // console.log("pendingparts", pendingparts);
        data.pendingParts = pendingparts
        // console.log("pendingparts", pendingparts, requiredpartforproject, packedparts);
        return utils.commonResponse(res, 200,"success", data)
    }
    catch {

    }
}