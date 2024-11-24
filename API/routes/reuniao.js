const router = require('express').Router();

const reuniaoController = require('../service/reuniaoService');

/* GET users listing. */

router.post('/', reuniaoController.create);
router.get('/', reuniaoController.read);
router.get('/:id', reuniaoController.readOne);
router.put('/:id', reuniaoController.update);
router.delete('/:id', reuniaoController.delete);

module.exports = router;