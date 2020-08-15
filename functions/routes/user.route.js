const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const middlewareAuth = require("../middlewares/userAuth.middleware");

router.post(
  '/uploadImg',
  middlewareAuth.FBAuth,
  controller.uploadAvatar
);

router.post(
  '/',
  middlewareAuth.FBAuth,
  controller.updateUserDetails
);

router.get(
  '/',
  middlewareAuth.FBAuth,
  controller.getUser
);

router.get(
  '/:handle',
  controller.getVisitUser
);

router.post(
  '/notifications',
  middlewareAuth.FBAuth,
  controller.markNotificationRead
);



module.exports = router;
