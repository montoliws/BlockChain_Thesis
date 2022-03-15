import { Request, Response } from 'express';
import { myBlockChain } from '../class/BlockChain';

export const getEntireBlockchain = (req: Request, res: Response) => {
	res.send(myBlockChain);
};

export const postNewBlock = (req: Request, res: Response) => {
	const newBlock = req.body.newBlock;
	const lastBlock = myBlockChain.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash;
	const correctIndex = lastBlock.index + 1 === newBlock.index;

	if (correctHash && correctIndex) {
		myBlockChain.chain.push(newBlock);
		myBlockChain.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock,
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock,
		});
	}
};

export const getBlock = (req: Request, res: Response) => {
	const idBloque = req.params.id;
	const block = myBlockChain.getBlock(idBloque);
	res.json({
		block: block,
	});
};
