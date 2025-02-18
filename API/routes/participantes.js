import { Router } from 'express';
import participantesController from '../service/participantesService.js';

const router = Router();

/* GET users listing. */

router.post('/', participantesController.create);
router.get('/', participantesController.read);
router.get('/:id', participantesController.readOne);
router.put('/:id', participantesController.update);
router.delete('/:id', participantesController.delete);
router.delete('/', participantesController.deleteAll);

export default router;
