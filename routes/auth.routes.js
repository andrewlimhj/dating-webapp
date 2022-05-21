import { Router } from 'express';
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import authMiddleware from '../middlewares/auth.middleware.js';
import getHome from '../controllers/home.controller.js';
import {
  getSignUp,
  postSignUp,
  getLogin,
  postLogin,
  logout,
} from '../controllers/auth.controller.js';
import getProfile from '../controllers/profile.controller.js';

dotenv.config();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

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

/* -------------------------------- home page ------------------------------- */
router.get(`${routePrefix}/`, authMiddleware, getHome);

/* --------------------------------- sign-up -------------------------------- */
router.get(`${routePrefix}/sign-up`, authMiddleware, getSignUp);
router.post(
  `${routePrefix}/sign-up`,
  authMiddleware,
  singleFileUpload,
  postSignUp
);

/* ---------------------------------- login --------------------------------- */
router.get(`${routePrefix}/login`, authMiddleware, getLogin);
router.post(`${routePrefix}/login`, authMiddleware, postLogin);

/* --------------------------------- logout --------------------------------- */
router.delete(`${routePrefix}/logout`, authMiddleware, logout);

/* --------------------------------- profile -------------------------------- */
router.get(`${routePrefix}/profile`, authMiddleware, getProfile);

export default router;
