import dotenv from 'dotenv';

import { Router } from 'express';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';

import pool from '../initPool.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import AuthController, {
  getLogin, postLogin, postSignUp, logout,
} from '../controller/auth.controller.js';

dotenv.config();

// heroku
const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

const authController = new AuthController(pool);

const multerUpload = multer({
  storage: multerS3({
    s3,
    bucket: 'deto-bucket',
    acl: 'public-read',
    metadata: (request, file, callback) => {
      callback(null, { fieldName: file.fieldname });
    },
    key: (request, file, callback) => {
      callback(null, Date.now().toString());
    },
  }),
});

const singleFileUpload = multerUpload.single('photo');

const routePrefix = '';
const router = Router();

router.get(`${routePrefix}/sign-up`, authMiddleware, authController.getSignUp);

router.post(`${routePrefix}/sign-up`, authMiddleware, singleFileUpload, postSignUp);

router.get(`${routePrefix}/login`, authMiddleware, getLogin);

router.post(`${routePrefix}/login`, authMiddleware, postLogin);

router.delete(`${routePrefix}/logout`, authMiddleware, logout);

export default router;
