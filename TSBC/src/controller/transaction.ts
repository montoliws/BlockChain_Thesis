import { Request, Response } from 'express';
import { myBlockChain } from '../class/BlockChain';
import { Transaction } from '../class/Transaction';

export const newTransaction = (req: Request, res: Response) => {
	const transaction = req.body.transaction;
	const newTransaction = new Transaction(
		transaction.amount,
		transaction.sender,
		transaction.recipient
	);
	res.json({
		note: 'New block received and accepted.',
		newTransaction: newTransaction,
	});
	// const blockIndex = myBlockChain.addTransactionToPendingTransactions(newTransaction);

	// res.json({ Index: blockIndex });
};
