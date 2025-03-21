// IMPORTING REQUERED PACKAGES
const Admin = require("../Models/Admins");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// GENEREATE TOKEN FOR USER AUTHENTICATION
const generateToken = async (admin_id) => {
  const token = await jwt.sign({ admin_id: admin_id }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
  return token;
};


// HANDLE ADMIN LOGIN REQUEST
exports.adminLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const findAdmin = await Admin.findOne({ username: username });
  if (findAdmin) {
    const comparePassword = await bcrypt.compare(password, findAdmin.password);
    if (!comparePassword) {
      return res.status(201).json({
        status: 201,
        message: "username/password is incorrect!!!",
      });
    }
    const token = await generateToken(findAdmin._id);
    return res.status(200).json({
      status: 200,
      message: "login successfull",
      data: {
        token: token,
        username: username,
        id: findAdmin._id,
        level: findAdmin.level,
      },
    });
  } else {
    return res.status(202).json({
      status: 202,
      message: "user not found",
    });
  }
};


// HANDLE ADMIN CREATION
exports.adminSignUp = async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    const admin = await Admin.findOne({ username: username });
    if (!admin) {
      await bcrypt.hash(password, 10);
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = {
        username,
        password: hashedPassword,
      };
      console.log(newAdmin);
      const AdminDb = await Admin.create(newAdmin);
      res
        .status(201)
        .json({ AdminDb: AdminDb, message: "Admin created successfully" });
    } else {
      res.status(200).json({ msg: "this user name is allredy existed" });
    }
  }
  catch (error) {
    console.log(error)
    res.status(200).json({ msg: "Error at server" });
  }
};


// HANDLE GETALLADMIN
exports.getAllAdmin = async (req, res) => {
  try {
    const allAdmin = await Admin.find({});
    res
      .status(200)
      .json({ allAdmin: allAdmin, message: "Admin fecthed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


// HANDLE DELTEADMIN
exports.deleteAdmin = async (req, res) => {
  try {
    const { _id } = req.body;
    await Admin.deleteOne({ _id: _id });
    res
      .status(200)
      .json({ allAdmin: allAdmin, message: " deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


// HANDLE UPDATEADMIN
exports.UpdateAdmin = async (req, res) => {
  try {
    const { _id, username, password, level } = req.body;
    const updateObj = {
      username: username,
      password: password,
      level: level,
    };
    await Admin.findOneAndUpdate({ _id: _id }, { $set: updateObj });
    if (updatedAdmin) {
      res
        .status(200)
        .json({ message: " Updateed successfully" });
    } else {
      res.status(301).json({ msg: "Updated Filed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


// END

