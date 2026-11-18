import {Router} from 'express';
import Controller_DemandasEspecificas from '../controllers/controller_demandas_especificas.js';

const router = Router();

router.get('/buscar/:id_demanda',Controller_DemandasEspecificas.Buscar);
router.get('/listar/',Controller_DemandasEspecificas.Listar);
router.get('/listar-itens-demandas/:dem_pac_id',Controller_DemandasEspecificas.ListarItensDemandas);
router.get('/listar-pacientes',Controller_DemandasEspecificas.ListarPacientes);
router.get('/imprimir-recibo/:ent_id',Controller_DemandasEspecificas.ImprimirRecibo);
router.post('/salvar',Controller_DemandasEspecificas.Salvar);
router.delete('/excluir/:demanda_id',Controller_DemandasEspecificas.Excluir);
router.post('/salvar_entradas_demandas',Controller_DemandasEspecificas.SalvarEntradas);

export default router;  
