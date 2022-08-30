let mongoose = require("mongoose");
let BlockchainModel = require("./model");
const options = {
  /**user: "user",
  pass: "PASSWORD",
  */
  auth: {
    username: "user",
    password: "PASSWORD",
  },
};
mongoose.connect("mongodb://localhost:27017/Blockchain", options);

let connectionCallback = () => {};
module.exports.onConnect = (callback) => {
  connectionCallback = callback;
};
