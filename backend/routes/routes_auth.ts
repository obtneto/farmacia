import { Router } from 'express';
import Controller_Auth from '../controllers/controller_auth.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/simular', Controller_Auth.SimularSessao);

export default router;
