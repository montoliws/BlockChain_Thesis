import { Router } from 'express';
import { newTransaction } from '../controller/transaction';

const router = Router();

router.route('/transaction').post(newTransaction);

export default router;
