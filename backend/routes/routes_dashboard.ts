import { Router } from 'express';
import Controller_Dashboard from '../controllers/controller_dashboard.js';

const router = Router();

router.get('/listar/:ano-:mes', Controller_Dashboard.Listar);

export default router;