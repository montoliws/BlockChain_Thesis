//CREAR UN REGISTRO DE ACCESOS CON UUID
var express = require("express");
var app = express();

//Set a random value as a user id
const { v4 } = require("uuid");
const nodeAddress = v4().split("-").join("");
const rp = require("request-promise");
//To have different port values every time
const port = process.argv[2];

/**This lines are stating that if a request comes in with JSON data or with form data, we simply want to parse
 * that data so we can access it in any of the endpoints. So with any endpoint we hit,
 * our data is first going to go through the body-parser */
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const meddata = new Blockchain();

app.get("/", function (req, res) {
  res.send("Hello world");
});

app.get("/blockchain", function (req, res) {
  res.send(meddata);
});

app.post("/transaction", function (req, res) {
  const blockIndex = meddata.createNewTransaction(
    req.body.data,
    req.body.sender,
    req.body.recipient
  );

  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.get("/mine", function (req, res) {
  const lastBlock = meddata.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    trasactions: meddata.pendingTransactions,
    index: lastBlock["index"] + 1,
  };
  const nonce = meddata.proofOfWork(previousBlockHash, currentBlockData);
  const newBlock = upvcoin.createNewBlock(
    nonce,
    previousBlockHash,
    newBlockHash
  );
  res.json({
    note: "New block is mined successfully",
    block: newBlock,
  });

  /**Reward for mining a block
   * meddata.createNewTransaction(12, "11", nodeAddress)
   */
});

/**
 * DIFFERENCE BETWEEN registerandbroadcast and register: whenever we want to register
 * a new node we are gonna use registerandbroadcast, this will register the node on its
 * own server ans broadcast this new node to all other network nodes
 * The other nodes just use register to register this broadcasted node. They dont need to
 * broadcast again
 */
//This endpoint will register a node and broadcast that node to the whole network.
app.post("/register-and-broadcast-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (meddata.networkNodes.indexOf(newNodeUrl) == -1)
    meddata.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  meddata.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };

    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then((data) => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...meddata.networkNodes, meddata.currentNodeUrl],
        },
        json: true,
      };

      return rp(bulkRegisterOptions);
    })
    .then((data) => {
      res.json({ note: "New node registered with network successfully." });
    });
});

//This endpoint will register a node with the network
app.post("/register-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const notAlreadyPresent = meddata.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = meddata.currentNodeUrl !== newNodeUrl;
  if (notAlreadyPresent && notCurrentNode)
    meddata.networkNodes.push(newNodeUrl);

  res.json({ note: "Nuevo nodo registrado correctamente." });
});

app.post("/register-nodes-bulk", function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      meddata.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = meddata.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
      meddata.networkNodes.push(networkNodeUrl);
  });

  res.json({ note: "Bulk registration successful." });
});
app.listen(port, function () {
  console.log(`listening on port ${port}`);
});
