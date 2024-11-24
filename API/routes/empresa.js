const router = require('express').Router();

const empresaController = require('../service/empresaService');

/* GET users listing. */

router.post('/', empresaController.create);
router.get('/', empresaController.read);
router.get('/:id', empresaController.readOne);
router.put('/:id', empresaController.update);
router.delete('/:id', empresaController.delete);

module.exports = router;