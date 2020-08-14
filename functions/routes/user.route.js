const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const middlewareAuth = require("../middlewares/userAuth.middleware");

router.post(
  '/uploadImg', 
  controller.uploadAvatar
);

router.post(
  '/updateUserDetails', 
  controller.updateUserDetails
);

module.exports = router;
