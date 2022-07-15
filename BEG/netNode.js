//CREAR UN REGISTRO DE ACCESOS CON UUID
var express = require("express");
var app = express();
var mongoose = require("mongoose");

//Set a random value as a user id
const { v4 } = require("uuid");
const nodeAddress = v4().split("-").join("");
const rp = require("request-promise");
// request-promise is deprecated ?¿?¿? Hay que solucionarlo ¿Problema?
//To have different port values every time
const port = process.argv[2];
let database = require("./database");
let chalk = require("chalk");
let blockchainModel = mongoose.model("BlockSchema");

/**This lines are stating that if a request comes in with JSON data or with form data, we simply want to parse
 * that data so we can access it in any of the endpoints. So with any endpoint we hit,
 * our data is first going to go through the body-parser */
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const meddata = new Blockchain();

app.post("/transaction/broadcast", function (req, res) {
  const newTransaction = meddata.createNewTransaction(
    req.body.data,
    req.body.responsable,
    req.body.paciente
  );
  meddata.pushTransaccionaPendientes(newTransaction);
  const requestPromises = [];
  meddata.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true,
    };

    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then((data) => {
    res.json({
      note: "La transacción ha sido creada y distribuida correctamente.",
    });
  });
});

app.get("/blockchain", async function (req, res) {
  const chain = await blockchainModel.find();
  meddata.chain = chain;
  res.send(chain);
});

app.post("/transaction", function (req, res) {
  const newTransaction = req.body;
  const blockIndex = meddata.pushTransaccionaPendientes(newTransaction);
  res.json({
    note: `La transacción será añadida en el bloque: ${blockIndex}.`,
  });
});

app.get("/mine", async function (req, res) {
  const lastBlock = meddata.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: meddata.pendingTransactions,
    index: lastBlock["index"] + 1,
  };
  console.log("Antes del nonce");
  const nonce = meddata.proofOfWork(previousBlockHash, currentBlockData);
  console.log("Despues del nonce");
  const newBlockHash = meddata.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  console.log;
  const newBlock = meddata.createNewBlock(
    nonce,
    previousBlockHash,
    newBlockHash
  );
  const requestPromises = [];
  meddata.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/recive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true,
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then((data) => {
    res.json({
      note: "Se ha completado el minado de un nuevo nodo",
      block: newBlock,
    });
  });

  let newBlockMod = new blockchainModel(newBlock);
  console.log(newBlockMod);

  newBlockMod = await newBlockMod.save((err) => {
    if (err)
      return console.log(chalk.red("cannot save the block", err.message));
    console.log(chalk.green("Block saved on DB"));
  });

  /**Reward for mining a blockSi
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
  /**
   * El método Promise.all(iterable) devuelve una promesa que termina
   * correctamente cuando todas las promesas en el argumento iterable
   * han sido concluídas con éxito, o bien rechaza la petición con el
   * motivo pasado por la primera promesa que es rechazada.
   */
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
      /**
       * La variable data son los datos que recivimos de la promesa de arriba.
       * No vamos a utilizar estos datos pero hay que hacer este paso dentro de
       * este endpoint por lo que solo podemos hacerlo una vez la promesa se ha completado.
       */
      res.json({
        note: "El nuevo nodo ha sido correctamente registrado en la red.",
      });
    });
});

app.post("/recive-new-block", function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = meddata.getLastBlock();
  if (
    lastBlock.hash === newBlock.previousBlockHash &&
    lastBlock["index"] + 1 === newBlock["index"]
  ) {
    meddata.chain.push(newBlock);
    meddata.pendingTransactions = [];
    res.json({
      note: "El nuevo bloque ha sido recibido y aceptado con exito",
      newBlock: newBlock,
    });
  } else {
    res.json({
      note: "El nuevo bloque ha sido rechazado.",
      newBlock: newBlock,
    });
  }
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
/**
 * This endpoint is accepting all data that contains every URL of every node that
 *  are already present on the blkchain network. This endpoint is only ever hit on
 * a new node that's being added to our network.
 */
app.post("/register-nodes-bulk", function (req, res) {
  /** We are sending allNetworkNodes to register-nodes-bulk to have access to allNetworkNodes data */
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

app.get("/consensus", function (req, res) {
  const requestPromises = [];
  meddata.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/blockchain",
      method: "GET",
      json: true,
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then((blockchains) => {
    const chainLength = meddata.chain.length;
    let maxLength = chainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxLength) {
        maxLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    if (
      !newLongestChain ||
      (newLongestChain && !meddata.chainValidation(newLongestChain))
    ) {
      res.json({
        note: "La cadena actual no va a ser reemplazada.",
        chain: meddata.chain,
      });
    } else {
      meddata.chain = newLongestChain;
      meddata.pendingTransactions = newPendingTransactions;
      res.json({
        note: "La cadena actual ha sido reemplazada.",
        chain: meddata.chain,
      });
    }
  });
});

app.listen(port, function () {
  console.log(`Aplicación escuchando en el puerto: ${port}`);
});
