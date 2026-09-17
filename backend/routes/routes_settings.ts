import { Router } from 'express';
import Controller_Settings from '../controllers/controller_settings.js';

const router = Router();

router.get('/', Controller_Settings.Listar);
router.get('/listar', Controller_Settings.Listar);
router.get('/buscar/:key', Controller_Settings.Buscar);
router.post('/salvar', Controller_Settings.Salvar);
router.delete('/excluir/:key', Controller_Settings.Excluir);

export default router;
