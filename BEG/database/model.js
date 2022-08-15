let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let BlockchainSchema = new Schema({
  index: {
    required: true,
    type: Schema.Types.Number,
  },
  timestamp: {
    required: true,
    type: Schema.Types.Date,
    default: Date().now,
  },
  transactions: {
    required: true,
    type: Schema.Types.Array,
  },
  nonce: {
    required: true,
    type: Schema.Types.Number,
  },
  previousBlockHash: {
    required: false,
    type: Schema.Types.String,
  },
  hash: {
    required: true,
    type: Schema.Types.String,
  },
});
module.exports = mongoose.model(
  "BlockSchema",
  BlockchainSchema,
  "blockschemas"
);
