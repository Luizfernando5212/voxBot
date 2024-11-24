const router = require('express').Router();

const pessoaController = require('../service/pessoaService');

/* GET users listing. */

router.post('/', pessoaController.create);
router.get('/', pessoaController.read);
router.get('/:id', pessoaController.readOne);
router.put('/:id', pessoaController.update);
router.delete('/:id', pessoaController.delete);

module.exports = router;