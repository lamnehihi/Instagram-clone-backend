const express = require("express");
const router = express.Router();

const controller = require('../controllers/scream.controller');
const middlewareAuth = require('../middlewares/userAuth.middleware');
const middlewareScream = require('../middlewares/screamAuth.middleware');


router.get('/', controller.screams);

router.post(
  '/',
  middlewareAuth.FBAuth, 
  controller.screamPost
);

router.get(
  '/:screamId', 
  controller.getScream
);

router.post(
  '/:screamId/comment', 
  middlewareAuth.FBAuth, 
  controller.commentPost
);

router.delete(
  '/:screamId',
  middlewareAuth.FBAuth,
  middlewareScream.checkOwner,
  controller.deletePost
);

router.post(
  '/:screamId/like',
  middlewareAuth.FBAuth,
  middlewareScream.checkExist,
  controller.like
);

router.post(
  '/:screamId/unlike',
  middlewareAuth.FBAuth,
  middlewareScream.checkExist,
  controller.unlike
);
 
module.exports = router;