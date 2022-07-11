const Blockchain = require("./blockchain");
const meddata = new Blockchain();
const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1657528579468,
      transactions: [],
      nonce: 58,
      hash: "0",
      previousBlockHash: "0",
    },
    {
      index: 2,
      timestamp: 1657528604423,
      transactions: [
        {
          data: "Doc Rick Sanchez",
          sender: "Marty",
          receptor: "Morty",
          TransUUID: "f14824fe50d446f0898491cf5851bf53",
        },
      ],
      nonce: 129958,
      hash: "000095c4a00cca03a08f07e0b7d618f0776b66c03964c1fc4f0e68d1ac909058",
      previousBlockHash: "0",
    },
  ],
  pendingTransactions: [],
  networkNodes: [],
  currentNodeUrl: "http://localhost:3001",
};
console.log("Validex:", meddata.chainValidation(bc1.chain));
