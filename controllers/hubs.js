// IMPORING MODULES
const { default: mongoose } = require("mongoose");
const Hubs = require("../Models/Hubs");
const utils = require("../controllers/utils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HubUsers = require("../Models/HubUsers");

// GENERATE TOKEN FOR LOGIN
const generateToken = async (hub_ID) => {
    const token = await jwt.sign({ hub_ID: hub_ID }, process.env.JWT_SECRET);
    return token;
};

// HELPS IN CREATING HUBS
exports.createHubs = async (req, res) => {
    // THIS FUNCTION WILL CREATE NEW HUB
    try {
        console.log(req.body)
        const { hubName, hubShortName, hubUsername, hubPassword, logo_ZPL } = req.body;
        let existingHubUser = await HubUsers.find({ username: hubUsername })
        let existingHub = await Hubs.find({ hubName })
        if (existingHubUser.length > 0) {
            let error = "Hub User name Already exist, Enter another user name"
            return utils.commonResponse(res, 500, "user name Already exist, Enter another user name", error.toString());
        }
        if (existingHub.length > 0) {
            let error = "Hub name Already exist, Enter another hub name"
            return utils.commonResponse(res, 500, "Hub name Already exist, Enter another hub name", error.toString());
        }
        let result = await Hubs.create({ hubName, hubShortName, logo_ZPL })
        await HubUsers.create({ username: hubUsername, password: hubPassword, level: 1, hub_id: result._id })
        const allHubs = await Hubs.find();
        return utils.commonResponse(res, 200, "hub created successfully", allHubs);
    }
    catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN CRATEING HUB USER
exports.createHubUser = async (req, res) => {
    // THIS FUNCTION WILL CREATE NEW HUB
    try {
        const { username, password, phonenumber, hub_id } = req.body;
        // Validate required fields
        if (!username || !password || !phonenumber || !hub_id) {
            return utils.commonResponse(
                res,
                400,
                "All fields are required: username, password, phonenumber, hub_id"
            );
        }
        let existinguser = await HubUsers.findOne({ username })
        // console.log(existinguser)
        if (existinguser) { return utils.commonResponse(res, 201, "username already exist , try using another username") }
        else {
            let newUser = {
                "username": username,
                "password": password,
                "phonenumber": phonenumber,
                "level": 2,
                "hub_id": hub_id
            }
            await HubUsers.create(newUser)
            const allHubs = await Hubs.find();
            return utils.commonResponse(res, 200, "hub user created successfully", allHubs); 
        }
    }
    catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN GETTING ALL HUB USERS
exports.getAllHubUser = async (req, res) => {
    // THIS FUNCTION WILL CREATE NEW HUB
    try {
        const { hub_id } = req.body;
        // Validate required fields
        if (!hub_id) {
            return utils.commonResponse(
                res,
                400,
                "All fields are required: hub_id"
            );
        }
        let hubUsers = await HubUsers.find({ hub_id, level: 2 })
        utils.commonResponse(res, 200, "hub users fetched successfully", hubUsers);
    }
    catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN DELETING HUBS
exports.deleteHub = async (req, res) => {
    // THIS FUNCTION WILL DELETE EXISTNG HUB
    try {
        let { hubID } = req.body;
        if (!hubID) {
            return utils.commonResponse(res, 400, "Missing hubID");
        }
        hubID = new mongoose.Types.ObjectId(hubID)
        let result = await Hubs.deleteOne({ _id: hubID });
        if (result.deletedCount > 0) {
            await HubUsers.deleteMany({ hub_id: hubID })
            utils.commonResponse(res, 200, "Hub deleted successfully");
        } else {
            utils.commonResponse(res, 404, "Hub not found or already deleted");
        }
    } catch (err) {
        utils.commonResponse(res, 500, "Unexpected server error", err.toString());
    }
}



// HELPS IN UPDATING HUBS
exports.updateHub = async (req, res) => {
    // THIS FUNCTION WILL DELETE EXISTNG HUB
    try {
        let { hubID, logo_ZPL, isHubActive } = req.body;
        if (!hubID) {
            return utils.commonResponse(res, 400, "Missing hubID");
        }
        hubID = new mongoose.Types.ObjectId(hubID)
        let hub = await Hubs.updateOne({ _id: hubID }, { logo_ZPL, isHubActive });
        if (hub) {
            utils.commonResponse(res, 200, "Hub updated successfully");
        } else {
            utils.commonResponse(res, 404, "Hub not found or already updated");
        }
    } catch (err) {
        utils.commonResponse(res, 500, "Unexpected server error", err.toString());
    }
}


// HELPS IN GETTING ALL HUBS
exports.getAllHubs = async (req, res) => {
    // THIS FUNCTION WILL RESPPOND WITH ALL THE AVAILABLE HUBS
    try {
        const allHubs = await Hubs.find();
        utils.commonResponse(res, 200, "All hubs fetched successfully", allHubs);

    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN ACTIVATEING THE HUB USER
exports.activateHubUser = async (req, res) => {
    // THIS FUNCTION WILL RESPPOND WITH ALL THE AVAILABLE HUBS
    try {
        const { user_id } = req.body
        await HubUsers.updateOne({ _id: user_id }, { isActive: true });
        let hubusers = await HubUsers.find()
        utils.commonResponse(res, 200, "User Activated successfully", hubusers);

    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN DEACTIVATING THE HUB USER
exports.deactivateHubUser = async (req, res) => {
    // THIS FUNCTION WILL RESPPOND WITH ALL THE AVAILABLE HUBS
    try {
        const { user_id } = req.body
        await HubUsers.updateOne({ _id: user_id }, { isActive: false });
        let hubusers = await HubUsers.find()
        utils.commonResponse(res, 200, "User Deactivated successfully", hubusers);

    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN DELETING HUB USER
exports.deletehubuser = async (req, res) => {
    // THIS FUNCTION WILL RESPPOND WITH ALL THE AVAILABLE HUBS
    try {
        const { user_id } = req.body
        await HubUsers.deleteOne({ _id: user_id });
        let hubusers = await HubUsers.find()
        utils.commonResponse(res, 200, "User Deleted successfully", hubusers);

    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}


// HELPS IN UPDATING HUB USER
exports.updatehubuser = async (req, res) => {
    // THIS FUNCTION WILL RESPPOND WITH ALL THE AVAILABLE HUBS
    try {
        console.log("you hited here")
        const { user_id, password } = req.body
        let user = await HubUsers.findById({ _id: user_id })
        console.log(user._id, user.password)
        if (user) {
            user.password = password
            user.save()
            let hubusers = await HubUsers.find()
            utils.commonResponse(res, 200, "User updated successfully", hubusers);
        }
        else {
            let hubusers = await HubUsers.find()
            utils.commonResponse(res, 200, "user_id do not exist", hubusers);
        }
    } catch (error) {
        utils.commonResponse(res, 500, "unexpected server error", error.toString());
    }
}



// HELPS IN LOGIN TO HUBS
exports.LoginToHubs = async (req, res) => {
    // THIS FUNCTION WILL HELP THE HUB TO GET THE AUTHENTICATION KEY FOR ENTERING THE PLATFORM
    try {
        const { hubUsername, hubPassword } = req.body;
        const user = await HubUsers.findOne({ username: hubUsername, password: hubPassword });
        if (user) {
            if (!user.isActive) {
                return utils.commonResponse(res, 201, "User Is not Active. Contact Hub Admin");
            }
            const hub = await Hubs.findById(user.hub_id)
            if (hub) {
                const token = await generateToken(hub._id);
                let resdata = {
                    "hubName": hub.hubName,
                    "hubShortName": hub.hubShortName,
                    "hubUsername": user.username,
                    "isHubActive": hub.isHubActive,
                    "logo_ZPL": hub.logo_ZPL,
                    "token": token,
                    "level": user.level,
                    "_id": hub._id,
                }
                utils.commonResponse(res, 200, "Login successfully", resdata);
            } else {
                utils.commonResponse(res, 401, "Something is Not Right");
            }
        }
        else {
            utils.commonResponse(res, 401, "Invalid username or password");
        }
    } catch (error) {
        utils.commonResponse(res, 500, "Unexpected server error", error.toString());
    }
};


// END