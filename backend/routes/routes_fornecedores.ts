import {Router} from 'express';
import Controller_Fornecedores from '../controllers/controller_fornecedores.js';

const router = Router();

router.get('/buscar/:id_fornecedor',Controller_Fornecedores.Buscar);
router.get('/listar/:pesq',Controller_Fornecedores.Listar);
router.get('/listar_ativos/:pesq',Controller_Fornecedores.ListarAtivos);
router.post('/salvar',Controller_Fornecedores.Salvar);
router.delete('/excluir/:fornecedor_id',Controller_Fornecedores.Excluir);

export default router;