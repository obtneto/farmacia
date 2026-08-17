import {Router} from 'express';
import Controller_Itens_Demandas from '../controllers/controller_itens_demandas.js';

const router = Router();

router.get('/buscar_por_id/:ite_id',Controller_Itens_Demandas.BuscarPorId);
router.get('/listar_ativos/:dem_id',Controller_Itens_Demandas.ListarAtivos);
router.get('/ativar_desativar/:ite_id',Controller_Itens_Demandas.AtivarDesativar);
router.post('/salvar',Controller_Itens_Demandas.Salvar);
router.delete('/excluir/:ite_id',Controller_Itens_Demandas.Excluir);

export default router;