import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', getProfile);

export default router;
