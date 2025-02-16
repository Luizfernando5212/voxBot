const router = require('express').Router();
const chatController = require('../service/chatService');

router.get('/', chatController.getAccess);
router.post('/', chatController.webHook);

module.exports = router;