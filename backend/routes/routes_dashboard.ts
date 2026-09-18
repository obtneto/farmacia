import { Router } from 'express';
import Controller_Dashboard from '../controllers/controller_dashboard.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

router.get('/listar/:ano-:mes', Controller_Dashboard.Listar);

export default router;