const express = require('express');
const router = express.Router();
const credentialRouter = require('./credentialsRoutes');
const csvRouter = require('./csvRoutes');
const ctListRouter = require('./ctListRoutes');
const groupRouter = require('./groupRoutes');
const reportRouter = require('./reportRoutes');
const settingRouter = require('./settingRoutes');
const sourceRouter = require('./sourceRoutes');
const tagRouter = require('./tagRoutes');
const userRouter = require('./userRoutes');
const visualizationRouter = require('./visualizationRoutes');

// Add all API routes
router.use('/credential', credentialRouter);
router.use('/csv', csvRouter);
router.use('/ctlist', ctListRouter);
router.use('/group', groupRouter);
router.use('/report', reportRouter);
router.use('/setting', settingRouter);
router.use('/source', sourceRouter);
router.use('/tag', tagRouter);
router.use('/user', userRouter);
router.use('/visualization', visualizationRouter);
module.exports = router;


