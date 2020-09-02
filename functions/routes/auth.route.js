const express = require("express");
const router = express.Router();

const controller = require('../controllers/auth.controller');
const middlewareAuth = require("../middlewares/userAuth.middleware");

router.post('/login', controller.login);

router.post('/signup', controller.signup);

router.post('/signupoauth', controller.signupOAuth);

router.get('/checkoauth', middlewareAuth.FBAuth, controller.checkOAuth);

module.exports = router;