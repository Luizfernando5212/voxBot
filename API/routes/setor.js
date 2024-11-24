const router = require('express').Router();

const setorController = require('../service/setorService');

/* GET users listing. */

router.post('/', setorController.create);
router.get('/', setorController.read);
router.get('/:id', setorController.readOne);
router.put('/:id', setorController.update);
router.delete('/:id', setorController.delete);

module.exports = router;