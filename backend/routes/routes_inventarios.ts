import { Router } from 'express';
import Controller_Inventarios from '../controllers/controller_inventario.js';

const router = Router();

router.get('/listar/:date_ini/:date_fin/:dep_id', Controller_Inventarios.Listar);
router.get('/detalhar/:inv_num', Controller_Inventarios.Detalhar);
router.get('/imprimir/:inv_num', Controller_Inventarios.Imprimir);
router.post('/novo', Controller_Inventarios.Novo);
router.post('/adicionar-item/:inv_num', Controller_Inventarios.AdicionarItem);
router.delete('/excluir-item/:inv_num/:iti_id', Controller_Inventarios.ExcluirItem);
router.patch('/fechar/:inv_num', Controller_Inventarios.Fechar);
router.patch('/salvar-digitacao/:inv_num', Controller_Inventarios.SalvarDigitacao);

export default router;
