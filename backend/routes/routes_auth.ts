import { Router } from 'express';
import Controller_Auth from '../controllers/controller_auth.js';

const router = Router();

router.post('/simular', Controller_Auth.SimularSessao);

export default router;
