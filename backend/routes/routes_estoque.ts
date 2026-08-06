import {Router} from 'express';
import Controller_Estoque from '../controllers/controler_estoque.js';

const router = Router();

router.get('/listar/:pesq/:dep_id/:med_tipo_codigo',Controller_Estoque.Listar);
router.get('/buscar/:est_id',Controller_Estoque.Buscar);
router.post('/salvar',Controller_Estoque.Salvar);
router.post('/transferir',Controller_Estoque.Transferir);

export default router;