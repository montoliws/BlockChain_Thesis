import { SHA256 } from 'crypto-js';
import { IBlock } from '../interface/IBlock';

export class Block implements IBlock {
	index: number;
	date: Date;
	data: string;
	previousHash: string;
	hash: string;
	nonce: number;

	constructor(index: number, data: string, previousHash: string = '') {
		this.index = index;
		this.date = new Date();
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.createHash();
		this.nonce = 0;
	}

	createHash(): string {
		return SHA256(
			'' + this.nonce + this.index + this.date + this.data + this.previousHash
		).toString();
	}
}
