import { Router } from 'express';
import chatController from '../service/chatService.js';

const router = Router();

router.get('/', chatController.getAccess);
router.post('/', chatController.webHook);

export default router;