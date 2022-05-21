import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
  getDiscover,
  postDiscover,
} from '../controllers/discover.controller.js';

const routePrefix = '';
const router = Router();

// todo: connect unsplash API
// todo: render random users
/* -------------------------------- discover -------------------------------- */
router.get(`${routePrefix}/discover`, authMiddleware, getDiscover);
router.post(`${routePrefix}/discover`, authMiddleware, postDiscover);

export default router;
