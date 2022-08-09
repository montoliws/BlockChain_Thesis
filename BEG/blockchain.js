//CREAR UN REGISTRO DE ACCESOS CON UUID.
var sha256 = require("js-sha256");
const currentNodeUrl = process.argv[3];
const { v4 } = require("uuid");
module.exports = Blockchain;

function Blockchain() {
  //All the blocks that we mine will be stored in this particular array
  this.chain = [];
  //Where we hold all of the new transactions before they are placed into a block
  this.pendingTransactions = [];
  this.networkNodes = [];
  this.currentNodeUrl = currentNodeUrl;
  //To create our genesis block we use createNewBlock method inside Blockchain
}

Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  /*This newBlock object is going to be a new block inside of our Blockchain, so all
  the data is going to be stored inside of this block*/
  const newBlock = {
    // index: block number
    index: this.chain.length + 1,
    // timestamp: when the block was created
    timestamp: Date.now(),
    // transactions: the new transactions that are waiting to be placed into a block
    transactions: this.pendingTransactions,
    /**This nonce is a proof that we've creaated this new block in a legitimate way
     * by using proofOfWork*  */
    nonce: nonce,
    //hash: We pass our newTransaction into a hashing function
    hash: hash,
    previousBlockHash: previousBlockHash,
  };
  /**
    When creating a new block, we put all of the new transactions into the newBlock
    Therefore, we want to clear out the entire pendingTransactions array so that we can start
    over for the next block.
    However, all of the transactions in this array are not really set
    in stone. They're not really recorded in our blockchain yet.
    They will get recorded in our blockchain when a new block is
    mined, which is when a new block is created. All of these new
    transactions are pretty much just pending transactions, and
    they have not been validated yet. They get validated, set in
    stone, and recorded in our blockchain when we create a new
    block with the help of the createNewBlock method.
    |pendingTransactions| property is like a pending transactions property.|| */

  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (
  data,
  responsable,
  paciente
) {
  const newTransaction = {
    data: data,
    responsable: responsable,
    paciente: paciente,
    TransUUID: v4().split("-").join(""),
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
 * chainValidation to validate the other chains inside of the network
 *  comparing them to the chain that is hosted on the current node
 * for this, we iterate thrpugh every block inside of the blockchain
 * and verify whetheror not allof the hashesalign correctly.
 */
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
