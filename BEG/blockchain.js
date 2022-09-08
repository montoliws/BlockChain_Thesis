//CREAR UN REGISTRO DE ACCESOS CON UUID.
var sha256 = require("js-sha256");
const currentNodeUrl = process.argv[3];
const { v4 } = require("uuid");
var assert = require("assert");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient; //use Grid via the native mongodb driver
const client = new MongoClient(
  "mongodb://user:PASSWORD@localhost:27017/Images"
);

const database = client.db("Images");
const docs = database.collection("Images");
var bucket = new mongodb.GridFSBucket(database, { bucketName: "imagesBucket" });
module.exports = Blockchain;
const fs = require("fs");

function Blockchain() {
  //Todos los bloques que minemos, serán guardados en el array chain
  this.chain = [];
  //En el array pendingTransactions serán almacenadas todas las transacciones que aún no hayan sido almacenadas en un bloque
  this.pendingTransactions = [];
  this.pendingImages = [];
  this.networkNodes = [];
  this.currentNodeUrl = currentNodeUrl;
}

Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  /*Este objeto newBlock va a ser un nuevo bloque dentro de nuestra Blockchain, 
  por lo que todos los datos se almacenarán dentro de este bloque*/
  const newBlock = {
    // index: block number
    index: this.chain.length + 1,
    // timestamp: cuando se creó el bloque
    timestamp: Date.now(),
    // transactions: las nuevas transacciones que estban esperando ser añadidas a un bloque
    transactions: this.pendingTransactions,
    /**Este nonce es una prueba de que hemos creado este nuevo bloque de manera legítima
     * mediante el uso de prueba de trabajo* */
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash,
  };

  for (var j = 0; j < this.pendingImages.length; j++) {
    var transaction = this.pendingImages[j];
    for (var i = 0; i < transaction.data.images.length; i++) {
      let data = transaction.data.images[i];
      let buff = new Buffer(data, "base64");
      fs.writeFileSync("stack-abuse-logo-out.png", buff);
      fs.createReadStream("./stack-abuse-logo-out.png")
        .pipe(bucket.openUploadStream(transaction.data.imagesHash[i] + ".png"))
        .on("error", function (error) {
          assert.ifError(error);
        });
    }
  }

  /** Al crear un nuevo bloque, colocamos todas las transacciones nuevas (pendingTransactions) en el
   * bloque nuevo. Por lo tanto, queremos borrar todo el array de transacciones
   *  pendientes para que podamos comenzar en el siguiente bloque. Sin embargo,
   * todas las transacciones en este array no están realmente almacenadas.
   *  Todavía no están realmente registrados en nuestra cadena de bloques.
   * Se registrarán en nuestra cadena de bloques cuando se genere un nuevo bloque.
   *  /minr, que es cuando se crea un nuevo bloque. Todos estos nuevas
   * transacciones son solo transacciones pendientes, y aún no han
   *  sido validados. Se validan, se almacenan de manera definitiva, y son registrada en nuestra cadena
   *  de bloques cuando creamos un nuevo bloque con la ayuda del método createNewBlock.
   *  la propiedad |pendingTransactions| es como una propiedad de transacciones pendientes.|| */
  this.pendingImages = [];
  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (newData) {
  // newData = {
  //   id: id,
  //   address: address,
  //   responsable: responsable,
  //   paciente: paciente,
  //   images: images, //.map((i) => btoa(i)),
  // };
  const timer = Date.now();
  const date = new Date(timer);
  const sg = (images, a) => {
    let r = [];
    for (const img of images) r.push(sha256(img + a));
    return r;
  };
  const newTransaction = {
    data: {
      datos: newData.datos,
      address: newData.address,
      responsable: newData.responsable,
      paciente: newData.paciente,
      imageUniHash: sg(newData.images, date.toString()),
      imagesHash: sg(newData.images, ""),
    }, //.map((i) => btoa(i)),
    transUUID: v4().split("-").join(""),
    timestamp: date,
    /**Unique Id for every transaction */
  };
  const newTransaction2 = {
    data: {
      datos: newData.datos,
      address: newData.address,
      responsable: newData.responsable,
      paciente: newData.paciente,
      images: newData.images,
      imagesHash: sg(newData.images, ""),
    }, //.map((i) => btoa(i)),
    timestamp: date,
    /**Unique Id for every transaction */
  };
  this.pendingImages.push(newTransaction2);
  return newTransaction;

  /*this.pendingTransactions.push(newTransaction);
  devolvemos el último bloque, obtenemos el indice de este bloque
  (['index']) y al añadir + 1 nos da el número de bloque de la 
  transacción que acabamos de añadir */

  /**
   * NOTA: AÑADIR ['variable'] AL LADO DE UN OBJETO, OBTIENE EL VALOR
   * DE ESA 'variable' EN ESE OBJETO CONCRETO.
   * return this.getLastBlock()["index"] + 1;
   */

  /**
   * Si creamos una transacción antes de un bloque, este la recogerá
   * dentro de su variable transactions y se vaciará el array
   * pendingTransactions[], si creamos transacciones pero no
   * incluimos ningún bloque después, estas estarán almacenadas en
   * el array pendingTransactions
   */
};

Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

Blockchain.prototype.pushTransaccionesPendientes = function (ObjTransaction) {
  this.pendingTransactions.push(ObjTransaction);
  return this.getLastBlock()["index"] + 1;
};
/**
 * chainValidation para validar las otras cadenas dentro de la red
 * comparándolos con la cadena que está alojada en el nodo actual
 * para esto, iteramos a través de cada bloque dentro de la cadena de bloques
 * y verifique si todos los hashes se alinean correctamente o no.
 */

Blockchain.prototype.getDatabyAddress = function (address) {
  const addressData = [];
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.data.address === address) {
        addressData.push(transaction);
      }
    });
  });
  return addressData;
};

Blockchain.prototype.getImages = async function (imagen) {
  const images = database.collection("imagesBucket.files");
  let imgId = undefined;
  const img = imagen + ".png";
  const r1 = await images.find({});
  //console.log(r1);
  const data = (await r1.toArray()).find((e) => img === e.filename);
  /*r1.toArray((err, result) => {
    //console.log(result);
    const img = imagen + ".png";
    //console.log(img);
    for (const e of result) {
      if (img === e.filename) {
        imgId = e._id.toString();
        //console.log(imgId);
      }
    }
  });*/
  //console.log(data);
  let imgData = null;
  if (data !== undefined) {
    imgId = data._id.toString();

    const imagesFiles = database.collection("imagesBucket.chunks");
    const r2 = await imagesFiles.find({});
    const data2 = (await r2.toArray()).find(
      (e) => imgId === e.files_id.toString()
    );

    if (data2 !== undefined) {
      imgData = data2.data.toString("base64");
    }
  }
  //console.log(imgId);
  /* await imagesFiles.find().toArray((err, result) => {
      //console.log(result);
      for (const e of result) {
        //console.log(e.files_id.toString());
        if (imgId === e.files_id.toString()) {
          //console.log(e.data);
          imgData = Buffer.from(e.data).toString("base64");
        }
      }
    });
  }*/
  console.log(imgData);
  return imgData;
};
Blockchain.prototype.getDatabyDoctor = function (responsableStr) {
  const doctorTransact = [];
  const responsable = responsableStr.toLowerCase();
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.data.responsable.toLowerCase().includes(responsable)) {
        doctorTransact.push(transaction);
      }
    });
  });
  return doctorTransact;
};

Blockchain.prototype.getDatabyPatient = function (pacienteStr) {
  const patientTransact = [];
  const paciente = pacienteStr.toLowerCase();
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      console.log(transaction);
      if (transaction.data.paciente.toLowerCase().includes(paciente)) {
        patientTransact.push(transaction);
        console.log(transaction);
      }
    });
  });
  return patientTransact;
};

Blockchain.prototype.getBlock = function (blockHash) {
  let bloqueCorrecto = null;
  this.chain.forEach((block) => {
    if (block.hash === blockHash) {
      bloqueCorrecto = block;
    }
  });
  return bloqueCorrecto;
};

Blockchain.prototype.getTransaction = function (transUUID) {
  let transaccionCorrecta = null;
  let bloqueCorrecto = null;
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.transUUID === transUUID) {
        transaccionCorrecta = transaction;
        bloqueCorrecto = block;
      }
    });
  });
  return {
    transaction: transaccionCorrecta,
    block: bloqueCorrecto,
  };
};

Blockchain.prototype.chainValidation = function (blockchain) {
  let cadenaValida = true;
  for (var i = 1; i < blockchain.length; i++) {
    const bloquePrev = blockchain[i - 1];
    const bloqueAct = blockchain[i];
    const hashBlockconst = this.hashBlock(
      bloquePrev["hash"],
      { transactions: bloqueAct["transactions"], index: bloqueAct["index"] },
      bloqueAct["nonce"]
    );
    if (hashBlockconst.substring(0, 4) !== "0000") {
      console.log(
        "hash previo: " +
          bloquePrev["hash"] +
          " TRANSACCIONES: " +
          JSON.stringify(bloqueAct["transactions"]) +
          "IIIndice:  " +
          bloqueAct["index"] +
          " HAsh resultante" +
          hashBlockconst.substring(0, 4) +
          "HASH ACTUAL: " +
          bloqueAct["hash"] +
          "NONCE : " +
          bloqueAct["nonce"]
      );
      cadenaValida = false;
    }
    if (bloqueAct["previousBlockHash"] !== bloquePrev["hash"]) {
      console.log("2 if");
      cadenaValida = false;
    }
  }
  const genesisBlck = blockchain[0];
  const transactionsCheck = genesisBlck["transactions"].length === 0;
  const nonCheck = genesisBlck["nonce"] === 58;
  const previousBlockHashCheck = genesisBlck["previousBlockHash"] === "0";
  const hashCheck = genesisBlck["hash"] === "0";
  if (
    transactionsCheck !== true ||
    nonCheck !== true ||
    previousBlockHashCheck !== true ||
    hashCheck !== true
  ) {
    console.log("3 if");
    cadenaValida = false;
  }
  return cadenaValida;
};
