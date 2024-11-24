const router = require('express').Router();

const mensagemController = require('../service/mensagemService');

/* GET users listing. */

router.post('/', mensagemController.create);
router.get('/', mensagemController.read);
router.get('/:id', mensagemController.readOne);
router.put('/:id', mensagemController.update);
router.delete('/:id', mensagemController.delete);

module.exports = router;