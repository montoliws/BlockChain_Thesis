//CREAR UN REGISTRO DE ACCESOS CON UUID
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var async = require("async");
//Set a random value as a user id
const { v4 } = require("uuid");
const nodeAddress = v4().split("-").join("");
const rp = require("request-promise");
let databases = require("./database");
var MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(
  "mongodb://user:PASSWORD@localhost:27018/Blockchain"
);
const database = client.db("Blockchain");
const docs = database.collection("blockschemas");
// request-promise is deprecated ?¿?¿? Hay que solucionarlo ¿Problema?
//To have different port values every time
//const port = process.argv[2];
port = process.argv[2];

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
  console.time("timeTransaction");
  const newTransaction = meddata.createNewTransaction(
    req.body.data
    // req.body.address,
    // req.body.responsable,
    // req.body.paciente,
    // req.body.images
  );
  meddata.pushTransaccionesPendientes(newTransaction);
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
  console.timeEnd("timeTransaction");
});

app.get("/blockchain", async function (req, res) {
  //const chain = await blockchainModel.find();
  //meddata.chain = chain;
  const chain = await blockchainModel.find().sort({ index: 1 });
  meddata.chain = chain;

  res.send(meddata);
});
app.get("/blockchain1", async function (req, res) {
  const chain = await blockchainModel.find().sort({ index: 1 });
  meddata.chain = chain;
  res.json({
    blockchainData: meddata.chain,
  });
});

app.post("/transaction", function (req, res) {
  const newTransaction = req.body;
  const blockIndex = meddata.pushTransaccionesPendientes(newTransaction);
  res.json({
    note: `La transacción será añadida en el bloque: ${blockIndex}.`,
  });
});

app.get("/mine", async function (req, res) {
  console.time("timeMining");
  const chain = await blockchainModel.find();
  meddata.chain = chain;
  const requestPromises = [];
  if (meddata.chain.length == 0) {
    const genesis = meddata.createNewBlock(58, "0", "0");
    let newBlockGen = new blockchainModel(genesis);

    newBlockGen = await newBlockGen.save((err) => {
      if (err)
        return console.log(chalk.red("cannot save the block", err.message));
      console.log(chalk.green("Block saved on DB"));
    });

    await meddata.networkNodes.forEach((networkNodeUrl) => {
      const requestOptions = {
        uri: networkNodeUrl + "/recive-new-block",
        method: "POST",
        body: { newBlock: genesis },
        json: true,
      };

      requestPromises.push(rp(requestOptions));
    });
  }

  const lastBlock = meddata.chain[meddata.chain.length - 1];
  const previousBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: meddata.pendingTransactions,
    index: lastBlock["index"] + 1,
  };

  const nonce = meddata.proofOfWork(previousBlockHash, currentBlockData);

  const newBlockHash = meddata.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  const newBlock = meddata.createNewBlock(
    nonce,
    previousBlockHash,
    newBlockHash
  );

  let newBlockMod = new blockchainModel(newBlock);
  console.log(newBlockMod);

  newBlockMod = await newBlockMod.save((err) => {
    if (err)
      return console.log(chalk.red("cannot save the block", err.message));
    console.log(chalk.green("Block saved on DB"));
  });
  await meddata.networkNodes.forEach((networkNodeUrl) => {
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

  /**Reward for mining a blockSi
   * meddata.createNewTransaction(12, "11", nodeAddress)
   */
  console.timeEnd("timeMining");
});

app.get("/images/:imagen", async function (req, res) {
  const imagen = req.params.imagen;
  const imagenData = await meddata.getImages(imagen);
  res.json({
    imagenData,
  });
});
app.get("/address/:address", function (req, res) {
  const address = req.params.address;
  const addressData = meddata.getDatabyAddress(address);
  res.json({
    addressData: addressData,
  });
});

app.get("/doctor/:doctor", function (req, res) {
  const doctor = req.params.doctor;
  const doctorData = meddata.getDatabyDoctor(doctor);
  res.json({
    doctorData: doctorData,
  });
});

app.get("/patient/:patient", function (req, res) {
  const patient = req.params.patient;
  const patientData = meddata.getDatabyPatient(patient);
  res.json({
    patientData: patientData,
  });
});

app.get("/block/:blockHash", function (req, res) {
  const blockHash = req.params.blockHash;
  const correctBlock = meddata.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

app.get("/transaction/:transactionId", function (req, res) {
  const transactionId = req.params.transactionId;
  const datosTransacc = meddata.getTransaction(transactionId);
  res.json({
    transaction: datosTransacc.transaction,
    block: datosTransacc.block,
  });
});

app.get("/views", function (req, res) {
  res.sendFile("./views/index.html", { root: __dirname });
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
       * La variable data son los datos que recibimos de la promesa de arriba.
       * No vamos a utilizar estos datos pero hay que hacer este paso dentro de
       * este endpoint por lo que solo podemos hacerlo una vez la promesa se ha completado.
       */
      res.json({
        note: "El nuevo nodo ha sido correctamente registrado en la red.",
      });
    });
});

app.post("/recive-new-block", async function (req, res) {
  const chain = await blockchainModel.find().sort({ index: 1 });
  meddata.chain = chain;

  const newBlock = req.body.newBlock;
  const lastBlock = meddata.chain[meddata.chain.length - 1];
  if (meddata.chain.length === 0) {
    let newBlockMod = new blockchainModel(newBlock);
    console.log(newBlockMod);

    newBlockMod = await newBlockMod.save((err) => {
      if (err)
        return console.log(chalk.red("cannot save the block", err.message));
      console.log(chalk.green("Block saved on DB2"));
    });
    meddata.chain.push(newBlock);

    meddata.pendingTransactions = [];
    res.json({
      note: "El nuevo bloque ha sido recibido y aceptado con exito",
      newBlock: newBlock,
    });
  } else if (
    lastBlock.hash === newBlock.previousBlockHash &&
    lastBlock["index"] + 1 === newBlock["index"]
  ) {
    let newBlockMod = new blockchainModel(newBlock);
    console.log(newBlockMod);

    newBlockMod = await newBlockMod.save((err) => {
      if (err)
        return console.log(chalk.red("cannot save the block", err.message));
      console.log(chalk.green("Block saved on DB"));
    });
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
  Promise.all(requestPromises).then(async (blockchains) => {
    const chainLength = meddata.chain.length;
    console.log("Longitud max length" + chainLength);
    let maxLength = chainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    blockchains.forEach((blockchain) => {
      console.log("Longitud de la otra cadena" + blockchain.chain.length);
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
      await blockchainModel.deleteMany({});
      const options = { ordered: true };
      const result = await docs.insertMany(meddata.chain, options);
      // await newBlockMod.save((err) => {
      //   if (err)
      //     return console.log(chalk.red("cannot save the block", err.message));
      //   console.log(chalk.green("Block saved on DB"));
      // });

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
