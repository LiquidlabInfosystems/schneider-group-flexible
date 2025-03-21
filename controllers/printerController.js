const Printer = require("../Models/Printer")
const utils = require("../controllers/utils");

exports.createPrinter = async (req, res) => {
  // THIS FUNCTION WILL CREATE NEW PRINTER 
    let data = req.body
    let printerIP = data.printerIP
    let printerName = data.printerName
    let printerData = {
      printerIP:printerIP,
      PrinterName:printerName
    }
    await Printer.create(printerData)
    utils.commonResponse(res, 200, "success", {});
}  

exports.updatePrinter = async (req, res) => {
  // THIS FUNCTION WILL HELP YOU TO UPDATE THE PRINTER SETTINGS
  let data = req.body;
  try{
  let { printerIP, printerName } = data;
  let currentPrinter = await Printer.find();
  currentPrinter = currentPrinter[0]
  if (!currentPrinter) {
    return utils.commonResponse(res, 404, "Printer not found", {});
  }
  currentPrinter.printerIP = printerIP;
  currentPrinter.PrinterName = printerName;
  await currentPrinter.save();
  utils.commonResponse(res, 200, "Success", currentPrinter);
}
 catch (error) 
 {
  console.error(error);
  utils.commonResponse(res, 500, "Internal server error", {});
}
}

exports.GETPrinter = async (req, res) => {
  // THIS FUNCTION WILL RETURN THE ACTIVE PRINTER DETAILS
    let currentPrinter = await Printer.find()
    utils.commonResponse(res, 200, "success", currentPrinter[0]);

}  
