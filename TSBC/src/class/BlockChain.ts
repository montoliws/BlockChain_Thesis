import { Block } from './Block';
import { ITransaction } from '../interface/ITransaction';
import { IBlock } from '../interface/IBlock';

export class BlockChain {
	chain: IBlock[];
	pendingTransactions: ITransaction[];
	difficulty: string;
	constructor(genesis: string, difficulty = '00000') {
		this.chain = [this.createFirstBlock(genesis)];
		this.pendingTransactions = [];
		this.difficulty = difficulty;
	}

	createFirstBlock(genesis: string): IBlock {
		return new Block(0, genesis);
	}

	getLastBlock(): IBlock {
		return this.chain[this.chain.length - 1];
	}

	addBlock(data: string): void {
		const block = this.mine(this.difficulty);
		this.chain.push(block);
	}

	getBlock(hash: string): IBlock | null {
		let correctBlock = null;
		this.chain.forEach((block: IBlock) => {
			if (block.hash === hash) correctBlock = block;
		});

		return correctBlock;
	}

	isValid(): boolean {
		for (let i = 1; i < this.chain.length; i++) {
			const prevBlock = this.chain[i - 1];
			const currentBlock = this.chain[i];
			if (currentBlock.previousHash !== prevBlock.hash) return false;
			if (currentBlock.createHash() !== currentBlock.hash) return false;
		}

		return true;
	}

	mine(difficulty: string): IBlock {
		const { index, hash } = this.getLastBlock();

		const newBlock = new Block(index + 1, '', hash);

		newBlock.hash = newBlock.createHash();
		while (!newBlock.hash.startsWith(difficulty)) {
			newBlock.nonce++;
			newBlock.hash = newBlock.createHash();
		}
		return newBlock;
	}

	addTransactionToPendingTransactions(transaction: ITransaction): number {
		myBlockChain.pendingTransactions.push(transaction);
		return myBlockChain.getLastBlock().index + 1;
	}
}

export const myBlockChain = new BlockChain('This is the first block');
myBlockChain.addBlock('This is the second block');
myBlockChain.addBlock('This is the third block');
