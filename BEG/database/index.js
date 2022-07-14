let mongoose = require("mongoose");
let BlockchainModel = require("./model");
const { MongoClient } = require("mongodb");

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
const uri = "mongodb://localhost:27017/Blockchain";
const client = new MongoClient(uri, options);
async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    var data = listDatabases(client);
    console.log(Object.values(data));

    return Object.values(data);

    // Make the appropriate DB calls
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);

async function listDatabases(client) {
  var cursor = await client
    .db("Blockchain")
    .collection("blockschemas")
    .find()
    .toArray();
  //console.log(Object.values(cursor));
  return Object.values(cursor);
}
