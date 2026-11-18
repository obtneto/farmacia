import { Router } from 'express';
import Controller_Auth from '../controllers/controllers_auth.js';
const router = Router();

router.get('/autentica/', Controller_Auth.Autenticar);

export default router;