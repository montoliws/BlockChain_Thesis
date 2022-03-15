import { Router } from 'express';
import { proofOfWork } from '../controller/proof';

const router = Router();

router.route('/proof').get(proofOfWork);

export default router;
