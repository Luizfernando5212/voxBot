import { Router } from 'express';
import empresaController from '../service/empresaService.js';

const router = Router();

/* GET users listing. */

router.post('/', empresaController.create);
router.get('/', empresaController.read);
router.get('/:id', empresaController.readOne);
router.put('/:id', empresaController.update);
router.delete('/:id', empresaController.delete);


export default router;