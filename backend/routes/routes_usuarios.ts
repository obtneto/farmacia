import { Router } from 'express';
import Controller_Usuarios from '../controllers/controller_usuarios.js';
const router = Router();

router.get('/listar/:pesq', Controller_Usuarios.Listar);
router.get('/buscar/:usuario', Controller_Usuarios.Buscar);
router.post('/salvar', Controller_Usuarios.Salvar);

export default router;
