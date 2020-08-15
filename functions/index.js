const express = require("express");
const app = express();
const { db, functions } = require('./initialFirebase');

//Routes
const authRoute = require("./routes/auth.route");
const screamRoute = require("./routes/scream.route");
const userRoute = require("./routes/user.route");

const middlewareUserAuth = require("./middlewares/userAuth.middleware");

app.use("/scream", screamRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);

//trigger notifications
const {createNotificationOnLikee, deleteNotificationOnUnlikee, createNotificationOnCommentt} =  require('./trigger/notification.trigger');

exports.createNotificationOnLike = createNotificationOnLikee;
exports.deleteNotificationOnUnlike = deleteNotificationOnUnlikee;
exports.createNotificationOnComment = createNotificationOnCommentt;

exports.api = functions.region("asia-east2").https.onRequest(app);
