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
 
module.exports = router;