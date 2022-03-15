const Blockchain = require("./blockchain");
//Creamos una instancia de nuestra función Blockchain
const upvcoin = new Blockchain();

const currentBlockData = [
  {
    amount: 10,
    sender: "B4CEE9C0E5CD571",
    recipient: "3A3F6E462D48E9",
  },
  {
    amount: 110,
    sender: "B4CEfffffE9C0E5CD571",
    recipient: "3A3F6E462D48E9FdeFebrero",
  },
];
const previousBlockHash = "87765DA6CCF0668238C1D27C35692E11";

console.log(upvcoin.poofOfWork(previousBlockHash, currentBlockData));
