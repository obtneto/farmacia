import { Router } from 'express';
import Controller_Inventarios from '../controllers/controller_inventario.js';

const router = Router();

router.get('/listar/:date_ini/:date_fin/:dep_id', Controller_Inventarios.Listar);
router.get('/detalhar/:inv_id', Controller_Inventarios.Detalhar);
router.post('/novo', Controller_Inventarios.Novo);
router.post('/fechar/:inv_id', Controller_Inventarios.Fechar);

export default router;
