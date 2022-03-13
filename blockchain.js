const sha256 = require("sha256");
const currentNodeUrl = process.argv[3];
module.exports = Blockchain;

function Blockchain() {
  //Todos los bloques que minemos serán almacenados en este Array
  this.chain = [];
  //Aquí mantendremos todas las nuevas transacciones que sean creadas antes de ser situadas en un bloque
  this.pendingTransactions = [];
  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.createNewBlock(100, "0", "0");
}
/** Con la función createNewBlock básicamente creamos un nuevo bloque, dentro de este bloque
 * tenemos nuestras transacciones y las nuevas transacciones creadas desde que nuestro bloque fue minado
 * una vez lo creamos, eliminamos el buffer pendingTransactions , introducimos el bloque en la cadena y lo devolvemos.
 */
Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  /**El objeto newBlock va a ser un bloque nuevo dentro de la blockchain,
   *así que toda la información va a ser almacenada dentro de este bloque/objeto
   */

  const newBlock = {
    //Número o posición del bloque en la cadena
    index: this.chain.length + 1,
    //Para conocer la fecha de creación del bloque
    timestamp: Date.now(),
    /*Esta linea de código indica que todas las transacciones en el
        bloque serán las nuevas transacciones que estaban esperando a ser
        ubicadas en un bloque*/
    transactions: this.pendingTransactions,
    /*Nonce viene de PoW, es simplemente un número que varía para conseguir que nuestro
        hash tengael número de 0s deseado, como la variable i de un for.*/
    nonce: nonce,
    /*este hash serán los datos de nuestro newBlock, lo que va a pasar es que le vamos a pasat nuestras transactions o nuestras
        pendingTransactions una función hash. Esto significa qye todas nuestras transacciones van a estar comprimidas en
        una simple cadena de código*/
    hash: hash,
    /*Es el hash de los datos del bloque anterior a este*/
    previousBlockHash: previousBlockHash,
  };
  /*Como una vez creado el bloque, hemos introducido todas las nuevas transacciones en este, 
    limpiamos el buffer pendingTransactions para introducir las nuevas en el siguiente bloque
    */
  this.pendingTransactions = [];
  /*Lo siguiente es coger el nuevo bloque creado, introducirlo en la cadena y devolver el nuevo bloque*/
  this.chain.push(newBlock);
  return newBlock;
};
//Coger el último bloque
Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};
//Crear transacción (recipient = receptor)
/**
 * Van a haber una gran cantidad de transacciones sin
 * almacenar en la cadena, solo la almacenamos una vez
 * ha sido minada, así que la mayoría de transacciones
 * van a ser transacciones pendientes, no validadas
 * Podemos ver el array pendingTransactions como un array
 * de transacciones aún por validar
 */
/**
 * En el último return nos devuelve el número de bloque en el que
 * nuestra transacción ha sido almacenada
 */
Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount: amount,
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
/**
 * Método para crear el hash del bloque con el nonce, los datos del bloque y el hash del bloque anterior
 */
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
/**
 * 
 * Estructura currentBlockData
 * const currentBlockData = [
  {
    amount: 10,
    sender: "B4CEE9C0E5CD571",
    recipient: "3A3F6E462D48E9",
  },
];
 */
Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 5) !== "00000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};
