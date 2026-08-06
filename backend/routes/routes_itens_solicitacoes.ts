import { Router } from 'express';
import Controller_ItensSolicitacoes from '../controllers/constroller_itens_solicitacoes.js';

const router = Router();

router.get('/buscar/:iso_id', Controller_ItensSolicitacoes.BuscarPorId);
router.get('/listar/:iso_sol_id', Controller_ItensSolicitacoes.ListarItensSolicitacoes);
router.post('/salvar', Controller_ItensSolicitacoes.SalvarItemSolicitacao);
router.delete('/excluir/:iso_id', Controller_ItensSolicitacoes.ExcluirItemSolicitacao);

export default router;