import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import getLikes from '../controllers/likes.controller.js';

const routePrefix = '';
const router = Router();

/* ---------------------------------- likes --------------------------------- */
router.get(`${routePrefix}/likes`, authMiddleware, getLikes);

export default router;
