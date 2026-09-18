import {Router} from 'express';
import Controller_Boname from '../controllers/controller_boname.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

router.get('/listar/:pesq',Controller_Boname.Listar);
router.get('/listar_ativos/:pesq',Controller_Boname.ListarAtivos);
router.get('/buscar/:bona_id',Controller_Boname.Buscar);
router.get('/imprimir/:pesq',Controller_Boname.Imprimir);
router.post('/salvar',Controller_Boname.Salvar);
router.delete('/excluir/:bona_id',Controller_Boname.Excluir);

export default router;
