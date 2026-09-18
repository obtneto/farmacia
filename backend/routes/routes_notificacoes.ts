import { Router } from 'express';
import Controller_Notificacoes from '../controllers/controller_notificacoes.js';
import authMiddleware from '../middleware/auth.js';
const router = Router();
router.use(authMiddleware);

router.get('/listar', Controller_Notificacoes.Listar);
router.get('/stream', Controller_Notificacoes.Stream);
router.post('/publicar', Controller_Notificacoes.Publicar);
router.patch('/read/:id', Controller_Notificacoes.MarcarComoLida);
router.delete('/limpar', Controller_Notificacoes.Limpar);
router.delete('/:id', Controller_Notificacoes.Remover);

export default router;
