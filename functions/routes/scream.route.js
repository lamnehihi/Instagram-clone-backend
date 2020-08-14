const express = require("express");
const router = express.Router();

const controller = require('../controllers/scream.controller');
const middlewareAuth = require('../middlewares/userAuth.middleware');

router.get('/', controller.screams);

router.post(
  '/screamPost',
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
 
module.exports = router;