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

module.exports = function(user) {
  // Add all API routes
  router.use('/credential', credentialRouter(user));
  router.use('/csv', csvRouter(user));
  router.use('/ctlist', ctListRouter(user));
  router.use('/group', groupRouter(user));
  router.use('/report', reportRouter(user));
  router.use('/setting', settingRouter(user));
  router.use('/source', sourceRouter(user));
  router.use('/tag', tagRouter(user));
  router.use('/user', userRouter(user));
  router.use('/visualization', visualizationRouter(user));
  return router;
}


