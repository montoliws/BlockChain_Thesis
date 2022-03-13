var express = require("express");
const Blockchain = require("./blockchain");
var app = express();
const upvcoin = new Blockchain();
const bodyParser = require("body-parser");
const { v1 } = require("uuid");
const { v4 } = require("uuid");
// Para añadir los distintos números de puerto al ejecutar los lee de package.json. en este caso 3001
const port = process.argv[2];

//En esta dirección hay guiones y no queremos ningún tipo de guion así que los eliminamos
const nodeAddress = v4().split("-").join("");
/**
 * nodeAddress es un string aleatorio que garatiza que será único para un porcentaje alto de nodos
 */
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", function (req, res) {
  res.send(upvcoin);
});

app.post("/transaction", function (req, res) {
  const blockIndex = upvcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );

  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.get("/mine", function (req, res) {
  /**
   * Para crear un bloque necesitamos, el hash del bloque anterior, un nonce y el hash del bloque actual
   */
  //Obtenemos el hash del bloque anterior
  const lastBlock = upvcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: upvcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  //Con ProofOfWork nos devuelve el nonce(número de iteraciones necesarias para calcular el hash con x 0s
  const nonce = upvcoin.proofOfWork(previousBlockHash, currentBlockData);
  //Creamos el hash de nuestro nuevo bloque
  const newBlockHash = upvcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  const newBlock = upvcoin.createNewBlock(
    nonce,
    previousBlockHash,
    newBlockHash
  );

  res.json({
    note: "New block is mined successfully",
    block: newBlock,
  });

  upvcoin.createNewTransaction(5, "58", nodeAddress);
});

app.post("/register-and-broadcast-node", function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (upvcoin.networkNodes.indexOf(newNodeUrl) == -1)
    upvcoin.networkNodes.push(newNodeUrl);

  upvcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };
    regNodesPromises.push(rp(requestOptions));
  });
  Promise.all(regNodesPromises).then((data) => {
    //use the data...
  });
});

app.post("/register-node", function (req, res) {});

app.post("/register-nodes-bulk", function (req, res) {});

app.listen(port, function () {
  console.log(`listenning on port ${port}...`);
});
