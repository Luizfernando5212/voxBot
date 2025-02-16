import { Router } from 'express';
import mensagemController from '../service/mensagemService.js';

const router = Router();

router.post('/', mensagemController.create);
router.get('/', mensagemController.read);
router.get('/:id', mensagemController.readOne);
router.put('/:id', mensagemController.update);
router.delete('/:id', mensagemController.delete);

export default router;