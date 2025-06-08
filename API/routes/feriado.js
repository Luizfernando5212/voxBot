import { Router } from 'express';
import feriadoController from '../service/feriadoService.js';

const router = Router();


router.post('/', feriadoController.create);
router.get('/', feriadoController.read);
router.get('/:id', feriadoController.readOne);
router.put('/:id', feriadoController.update);
router.delete('/:id', feriadoController.delete);

export default router;