const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");
const middlewareAuth = require("../middlewares/FBAuth.middleware");

router.post(
  '/uploadImg',
  middlewareAuth.FBAuth, 
  controller.uploadImg
);

module.exports = router;
