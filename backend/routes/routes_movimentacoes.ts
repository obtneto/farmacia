import {Router} from 'express';
import Controller_Movimentacoes from '../controllers/controller_movimentos.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

router.get('/listar-movimentacoes/:pesq/:data_ini/:data_fin/:tipo_med',Controller_Movimentacoes.ListarMovimentacoes);
router.get('/listar-por-medicamento/:tipo_med',Controller_Movimentacoes.ListaPorMedicamentos);

export default router;