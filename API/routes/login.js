import { Router } from 'express';
import loginController from '../service/loginService.js';

const router = Router();

// Route to handle user login
router.post('/', loginController);

export default router;