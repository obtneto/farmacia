import { Router } from 'express';
import Controller_Controle_DDU from '../controllers/controllers_controle_ddu.js';

const router = Router();

router.get('/listar/:pesq/:data_ini/:data_fin/:cdd_status', Controller_Controle_DDU.Listar);
router.get('/buscar-por-requisicao/:req_num', Controller_Controle_DDU.BuscarPorRequisicao);
router.get('/listar-itens/:req_num/:pesq', Controller_Controle_DDU.ListarItens);
router.post('/atualizar-item', Controller_Controle_DDU.AtualizarItemDDU);
router.delete('/excluir-item', Controller_Controle_DDU.ExcluirItemDDU);

export default router;
