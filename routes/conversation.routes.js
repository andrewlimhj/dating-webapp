import Router from 'express';
import {
  getConversations,
  getMessages,
} from '../controllers/conversation.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const routePrefix = '';
const router = Router();

/* ------------------------------ conversations ----------------------------- */
router.get(`${routePrefix}/conversations`, authMiddleware, getConversations);
router.get(`${routePrefix}/message/:id`, authMiddleware, getMessages);

export default router;
