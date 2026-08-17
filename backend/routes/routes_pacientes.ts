import {Router} from 'express';
import Controller_Pacientes from '../controllers/controller_pacientes.js';

const router = Router();

router.get('/listar_pacientes/:pesq',Controller_Pacientes.ListarPacientes);
router.get('/visualizar_paciente/:num_paciente',Controller_Pacientes.VisualizarPaciente)

export default router;