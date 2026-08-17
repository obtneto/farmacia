import { Router } from 'express';
import Database, { iDatabase } from '../connections/dbconn.js';
import Controller_Entradas from '../controllers/controller_entradas.js';
import { iresdata } from '../controllers/interface_controllers.js';
import Entradas from '../model/dao_entradas.js';
import ItensEntradas from '../model/dao_itens_entradas.js';
import { applyControllerError } from '../utils/controllerError.js';

const router = Router();

router.get('/listar/:pesq/:data_inicio/:data_fim', Controller_Entradas.ListarTodos);
router.get('/buscar/:ent_id', Controller_Entradas.BuscarPorId);
router.get('/listar-nao-aprovados/:pesq/:data_inicio/:data_fim/:dep_id', Controller_Entradas.ListarEntradasNaoAprovados);
router.post('/aprovar-entradas', Controller_Entradas.AprovarEntradas);
router.delete('/excluir/:ent_id',Controller_Entradas.ExcluirEntradas);
router.get('/itens/:ent_id', Controller_Entradas.ListarItens);
router.put('/itens/:ite_id', Controller_Entradas.AtualizarItem);
router.post('/salvar', Controller_Entradas.Salvar);

export default router;
