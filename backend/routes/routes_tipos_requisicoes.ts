import { Router } from 'express';
import Controller_TiposRequicoes from '../controllers/controller_tipos_requisicoes.js';

const router = Router();

router.get('/listar', Controller_TiposRequicoes.Listar);
router.get('/buscar/:id_tipo', Controller_TiposRequicoes.BuscarPorId);
router.post('/salvar', Controller_TiposRequicoes.Salvar);
router.delete('/excluir/:id_tipo', Controller_TiposRequicoes.Excluir);

export default router;
