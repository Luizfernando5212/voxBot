import { Router } from 'express';
import pessoaController from '../service/pessoaService.js';

const router = Router();

router.post('/', pessoaController.create);
router.get('/', pessoaController.read);
router.get('/:id', pessoaController.readOne);
router.put('/:id', pessoaController.update);
router.delete('/:id', pessoaController.delete);

export default router;