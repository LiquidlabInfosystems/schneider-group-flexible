const Spoke = require("../Models/Spoke");
const utils = require("../controllers/utils");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const generateToken = async (spoke_ID) => {
    console.log(spoke_ID)
    const token = await jwt.sign({ spoke_ID: spoke_ID }, process.env.JWT_SECRET);
    return token;
};

exports.createSpoke = async (req, res) => {
    // THIS FUNCTION WILL CREATE NEW SPOKE IN THE SYSTEM
    try {
        const { spokeName, spokeShortName , spokeUserName, spokePassword } = req.body;
        await Spoke.create({ spokeName, spokeShortName , spokeUserName, spokePassword}).then(async (result) => {
            const allSpokes = await Spoke.find();
            utils.commonResponse(res, 200, "spoke created successfully",allSpokes);
        }).catch((err) => {
            utils.commonResponse(res, 401,"unexpected server error", err.toString());
        });
    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error",error.toString());
    }
}


exports.getSpokeDetails = async (req, res) => {
    // THIS FUNCTION WILL CREATE NEW SPOKE IN THE SYSTEM
    try {
        const { spoke_id } = req.body;
        let spoke =  await Spoke.findById({_id:spoke_id})
        if(spoke){
            utils.commonResponse(res, 200, "spoke fetched successfully",spoke);
        }
        else{
            utils.commonResponse(res, 200, "spoke do not exist");
        }
      
    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error",error.toString());
    }
}


exports.LoginToSpoke = async (req, res) => {
    try {
        const { spokeUserName, spokePassword } = req.body;
        let spoke = await Spoke.findOne({spokeUserName, spokePassword})
        if(spoke){
            const token = await generateToken(spoke._id);
            console.log(generateToken)
            let data = {
                spoke,
                token
            }
            utils.commonResponse(res, 200, "spoke login successfully",data);
        }
        else{
        utils.commonResponse(res, 200, "spoke not found");
        }
    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error",error.toString());
    }
}

exports.deleteSpoke = async (req, res) => {
    // THIS FUNCTION WILL DELETE SPOKE FORM THE SYSTEM
    try {
        let { spokeID} = req.body;
        if(!spokeID){
            return utils.commonResponse(res, 400, "Missing spokeID");
        }
        spokeID = new mongoose.Types.ObjectId(spokeID)
        let result = await Spoke.deleteOne({ '_id':  spokeID});
        utils.commonResponse(res, 200, "spoke deleted successfully");
    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error",error.toString());
    }
}

exports.getAllSpokes = async (req, res) => {
    // THIS FUNCTION WILL RETURN ALL THE EXISTING SPOKES IN THE SYSTEM
    try {
        const allSpokes = await Spoke.find();
        utils.commonResponse(res, 200, "All hubs fetched successfully",allSpokes);
    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error",error.toString());

    }
}

