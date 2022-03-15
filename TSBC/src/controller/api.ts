import { Request, Response } from 'express';

export const apiWelcome = (req: Request, res: Response) => {
	return res.status(200).send('Prueba');
};
