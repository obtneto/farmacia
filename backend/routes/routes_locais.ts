import {Router} from 'express';
import Controller_Locais from '../controllers/controller_locais.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

router.get('/buscar/:id_local',Controller_Locais.Buscar);
router.get('/listar/:pesq',Controller_Locais.Listar);
router.get('/listar_ativos/:pesq',Controller_Locais.ListarAtivos);
router.post('/salvar',Controller_Locais.Salvar);
router.delete('/excluir/:local_id',Controller_Locais.Excluir);

export default router;