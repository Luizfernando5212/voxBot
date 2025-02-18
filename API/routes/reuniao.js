import { Router } from 'express';
import reuniaoController from '../service/reuniaoService.js';

const router = Router();

router.post('/', reuniaoController.create);
router.get('/', reuniaoController.read);
router.get('/:id', reuniaoController.readOne);
router.put('/:id', reuniaoController.update);
router.delete('/:id', reuniaoController.delete);
router.delete('/', reuniaoController.deleteAll);

export default router;