import { Router } from 'express';
import setorController from '../service/setorService.js';

const router = Router();

router.post('/', setorController.create);
router.get('/', setorController.read);
router.get('/:id', setorController.readOne);
router.put('/:id', setorController.update);
router.delete('/:id', setorController.delete);

export default router;