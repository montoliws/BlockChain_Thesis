//CREAR UN REGISTRO DE ACCESOS CON UUID.
var sha256 = require("js-sha256");
const currentNodeUrl = process.argv[3];
module.exports = Blockchain;
function Blockchain() {
  //All the blocks that we mine will be stored in this particular array
  this.chain = [];
  //Where we hold all of the new transactions before they are placed into a block
  this.pendingTransactions = [];
  this.networkNodes = [];
  this.currentNodeUrl = currentNodeUrl;
  //To create our genesis block we use createNewBlock method inside Blockchain
  this.createNewBlock(58, "0", "0");
}

Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  /*This newBlock object is going to be a new block inside of our Blockchain, so all
  the data is going to be stored inside of this block
*/
  const newBlock = {
    // index: block number
    index: this.chain.length + 1,
    // timestamp: when the block was created
    timestamp: Date.now(),
    // transactions: the new transactions that are waiting to be placed into a block
    transactions: this.pendingTransactions,
    /**This nonce is a proof that we've creaated this new block in a legitimate way
     * by using proofOfWork
     *  */
    nonce: nonce,

    //hash: We pass our newTransaction into a hashing function
    hash: hash,
    previousBlockHash: previousBlockHash,
  };
  /**
         * When creating a new block, we put all of the new transactions into the newBlock
         * Therefore, we want to clear out the entire pendingTransactions array so that we can start
         * over for the next block.
         *  However, all of the transactions in this array are not really set
            in stone. They're not really recorded in our blockchain yet.
            They will get recorded in our blockchain when a new block is
            mined, which is when a new block is created. All of these new
            transactions are pretty much just pending transactions, and
            they have not been validated yet. They get validated, set in
            stone, and recorded in our blockchain when we create a new
            block with the help of the createNewBlock method.
            |pendingTransactions| property is like a pending transactions property.||

         */
  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (data, sender, recipient) {
  const newTransaction = {
    data: data,
    sender: sender,
    recipient: recipient,
  };
  this.pendingTransactions.push(newTransaction);
  /*
devolvemos el último bloque, obtenemos el indice de este bloque
(['index']) y al añadir + 1 nos da el número de bloque de la 
transacción que acabamos de añadir
*/
  /**
   * NOTA: AÑADIR ['variable'] AL LADO DE UN OBJETO, OBTIENE EL VALOR
   * DE ESA 'variable' EN ESE OBJETO CONCRETO.
   */
  return this.getLastBlock()["index"] + 1;
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