import { Router } from 'express';
import telefoneController from '../service/telefoneService.js';

const router = Router();

router.post('/', telefoneController.create);
router.get('/', telefoneController.read);
router.get('/:id', telefoneController.readOne);
router.put('/:id', telefoneController.update);
router.delete('/:id', telefoneController.delete);

export default router;