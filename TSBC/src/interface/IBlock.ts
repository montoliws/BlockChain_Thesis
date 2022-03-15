export interface IBlock {
 index: number;
 date: Date;
 data: string;
 previousHash: string;
 hash: string;
 createHash(): string;
}
