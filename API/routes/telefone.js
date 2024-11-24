const router = require('express').Router();

const telefoneController = require('../service/telefoneService');

/* GET users listing. */

router.post('/', telefoneController.create);
router.get('/', telefoneController.read);
router.get('/:id', telefoneController.readOne);
router.put('/:id', telefoneController.update);
router.delete('/:id', telefoneController.delete);

module.exports = router;