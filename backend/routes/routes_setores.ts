import { Router } from 'express';
import Controller_Setores from '../controllers/controllers_setores.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

router.get('/listar/:pesq', Controller_Setores.Listar);
router.get('/listar-ativos/:pesq', Controller_Setores.ListarAtivos);
router.get('/buscar/:id_setor', Controller_Setores.Buscar);
router.post('/salvar', Controller_Setores.Salvar);
router.delete('/excluir/:id_setor', Controller_Setores.Excluir);

export default router;
