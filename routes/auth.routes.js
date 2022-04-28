import dotenv from 'dotenv'
dotenv.config()

import { Router } from 'express'
import multer from 'multer';
import aws from 'aws-sdk';
import multerS3 from 'multer-s3';

import authMiddleware from '../middlewares/auth.middleware.js';
import { getSignUp, getLogin, postLogin, postSignUp, logout } from '../controller/auth.controller.js'

// heroku
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

const routePrefix = ''
const router = Router()

router.get(`${routePrefix}/sign-up`, authMiddleware, getSignUp)

router.post(`${routePrefix}/sign-up`, authMiddleware, singleFileUpload, postSignUp)

router.get(`${routePrefix}/login`, authMiddleware, getLogin)

router.post(`${routePrefix}/login`, authMiddleware, postLogin)

router.delete(`${routePrefix}/logout`, authMiddleware, logout)

export default router