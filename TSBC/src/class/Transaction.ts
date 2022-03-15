import { ITransaction } from '../interface/ITransaction';
import { v4 as uuid } from 'uuid';

export class Transaction implements ITransaction {
	amount: number;
	sender: string;
	recipient: string;
	transactionId: string;
	constructor(amount: number, sender: string, recipient: string) {
		this.amount = amount;
		this.sender = sender;
		this.recipient = recipient;
		this.transactionId = uuid().split('-').join('');
	}
}
