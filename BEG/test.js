const Blockchain = require("./blockchain");
const meddata = new Blockchain();
const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1657527068069,
      transactions: [],
      nonce: 58,
      hash: "0",
      previousBlockHash: "0",
    },
    {
      index: 2,
      timestamp: 1657527072091,
      transactions: [],
      nonce: 0,
      hash: "0000d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
      previousBlockHash: "0",
    },
    {
      index: 3,
      timestamp: 1657527095183,
      transactions: [],
      nonce: 0,
      hash: "00004e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
      previousBlockHash:
        "0000d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    },
    {
      index: 4,
      timestamp: 1657527100562,
      transactions: [],
      nonce: 0,
      hash: "00004b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      previousBlockHash:
        "00004e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    },
  ],
  pendingTransactions: [],
  networkNodes: [],
  currentNodeUrl: "http://localhost:3001",
};
console.log("Validex:", meddata.chainValidation(bc1.chain));
