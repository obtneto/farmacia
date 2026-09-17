import { Router } from 'express';
import Controller_Notificacoes from '../controllers/controller_notificacoes.js';

const router = Router();

router.get('/listar', Controller_Notificacoes.Listar);
router.get('/stream', Controller_Notificacoes.Stream);
router.post('/publicar', Controller_Notificacoes.Publicar);
router.patch('/read/:id', Controller_Notificacoes.MarcarComoLida);
router.delete('/limpar', Controller_Notificacoes.Limpar);

export default router;
