import { Request, Response } from 'express';
import { myBlockChain } from '../class/BlockChain';
import { v1 as uuid } from 'uuid';
import { Transaction } from '../class/Transaction';
const nodeAddress = uuid().split('-').join('');

export const proofOfWork = (req: Request, res: Response) => {
	const newBlock = myBlockChain.mine('00000');
	const newTransaction = new Transaction(5, '58', nodeAddress);
	myBlockChain.addTransactionToPendingTransactions(newTransaction);

	res.json({
		note: 'New block mined successfully',
		block: newBlock,
	});
};
