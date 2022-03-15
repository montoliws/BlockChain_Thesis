import { Router } from 'express';
import { apiWelcome } from '../controller/api';

const router = Router();

router.route('/').get(apiWelcome);

export default router;
