import { getEntireBlockchain, postNewBlock, getBlock } from './../controller/blockchain';
import { Router } from 'express';

const router = Router();

router.route('/blockchain').get(getEntireBlockchain);
router.route('/blockchain/:id').get(getBlock);
router.route('/blockchain/new-block').post(postNewBlock);

export default router;
