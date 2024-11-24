const router = require('express').Router;

const participantesController = require('../service/participantesService');

/* GET users listing. */

router.post('/', participantesController.create);
router.get('/', participantesController.read);
router.get('/:id', participantesController.readOne);
router.put('/:id', participantesController.update);
router.delete('/:id', participantesController.delete);