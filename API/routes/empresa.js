import { Router } from 'express';
import empresaController from '../service/empresaService.js';
import auth from '../middleware/auth.js';

const router = Router();

/* GET users listing. */

router.post('/', empresaController.create);
router.get('/', empresaController.read);
router.get('/:id', auth, empresaController.readOne);
router.get('/:id/setor', auth, empresaController.readSetor);
router.get('/:id/funcionario', auth, empresaController.readFuncionarios);
router.get('/:id/feriado', auth, empresaController.readFuncionarios);
router.put('/:id', empresaController.update);
router.delete('/:id', empresaController.delete);


export default router;