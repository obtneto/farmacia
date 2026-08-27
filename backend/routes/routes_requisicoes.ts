import { Router } from 'express'
import Controller_Requisicoes from '../controllers/controller_requisicoes.js';

const router = Router();

router.get('/listar/:dat_ini/:dat_fim/:dep_id', Controller_Requisicoes.Listar);
router.get('/buscar/:req_id', Controller_Requisicoes.Buscar);
router.get('/naoaprovadas', Controller_Requisicoes.ListarRequisicoesNaoAprovadas);
router.get('/imprimir/:req_id', Controller_Requisicoes.Imprimir);
router.post('/salvar', Controller_Requisicoes.Salvar);
router.post('/salvar_devolucao', Controller_Requisicoes.SalvarDevolucao);
router.post('/aprovar/:req_id', Controller_Requisicoes.AprovarRequisicao);
router.put('/itens/:ite_id', Controller_Requisicoes.AtualizarItem);
router.delete('/itens/:ite_id', Controller_Requisicoes.ExcluirItem);
router.post('/reprovar', Controller_Requisicoes.ReprovarRequisicao);
router.get('/buscar_para_devolucao/:req_num', Controller_Requisicoes.BuscarRequisicaoParaDevolucao)

export default router;
