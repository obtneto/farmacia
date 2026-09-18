import { Router } from 'express';
import Controller_Solicitacoes from '../controllers/controller_solicitacoes.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/buscar/:sol_id', Controller_Solicitacoes.Buscar);
router.get('/imprimir/:sol_id', Controller_Solicitacoes.Imprimir);
router.get('/listar_abertas/', Controller_Solicitacoes.ListarAbertas);
router.get('/listar_encerradas/:data_ini/:data_fin', Controller_Solicitacoes.ListarEncerradas);
router.post('/salvar', Controller_Solicitacoes.Salvar);
router.delete('/excluir/:sol_id', Controller_Solicitacoes.Excluir);
router.post('/encerrar', Controller_Solicitacoes.Encerrar);

export default router;
