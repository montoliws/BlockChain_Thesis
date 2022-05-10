const Blockchain = require("./blockchain");
const meddata = new Blockchain();
meddata.createNewBlock("paciente: 1", "OOO23423", "234234FFF");
meddata.createNewTransaction("paciente: 1", "03i2044234", "safe34234");
console.log(meddata);
