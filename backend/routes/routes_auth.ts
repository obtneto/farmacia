import { Router } from 'express';
import Controller_Auth from '../controllers/controller_auth.js';
import verificarJWT, { verificarSessaoOpcional } from '../middleware/middleware_auth.js';
const router = Router();

router.get('/autentica/', Controller_Auth.Autenticar);
router.post('/autentica', Controller_Auth.Autenticar);
router.get('/listar_dominios', Controller_Auth.Listar_Dominios);
router.post('/logout', Controller_Auth.Logout);
router.get('/sessao', verificarSessaoOpcional, Controller_Auth.Sessao);
router.use(verificarJWT);
router.get('/listar_perfis', Controller_Auth.Listar_Perfis);

export default router;
