//CREAR UN REGISTRO DE ACCESOS CON UUID.
var sha256 = require("js-sha256");
const currentNodeUrl = process.argv[3];
const { v4 } = require("uuid");

module.exports = Blockchain;

function Blockchain() {
  //Todos los bloques que minemos, serán guardados en el array chain
  this.chain = [];
  //En el array pendingTransactions serán almacenadas todas las transacciones que aún no hayan sido almacenadas en un bloque
  this.pendingTransactions = [];
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

  const newTransaction = {
    data: newData,
    //address: address,
    //responsable: responsable,
    //paciente: paciente,
    //images: images, //.map((i) => btoa(i)),
    transUUID: v4().split("-").join(""),
    /**Unique Id for every transaction */
  };
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
    console.log(paciente);
    block.transactions.forEach((transaction) => {
      console.log(transaction);
      if (transaction.data.paciente.toLowerCase().includes(paciente)) {
        patientTransact.push(transaction);
        console.log(transaction);
        console.log(paciente);
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
