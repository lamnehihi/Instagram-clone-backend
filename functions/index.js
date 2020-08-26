const express = require("express");
const app = express();
const { db, functions } = require('./initialFirebase');

//Routes
const authRoute = require("./routes/auth.route");
const screamRoute = require("./routes/scream.route");
const userRoute = require("./routes/user.route");

const cors = require('cors');
app.use(cors());

app.use("/scream", screamRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);

//trigger notifications
const {createNotificationOnLikee, deleteNotificationOnUnlikee, createNotificationOnCommentt, onUserImageChangee, onScreamDeletee} =  require('./trigger/notification.trigger');

exports.createNotificationOnLike = createNotificationOnLikee;
exports.deleteNotificationOnUnlike = deleteNotificationOnUnlikee;
exports.createNotificationOnComment = createNotificationOnCommentt;
exports.onUserImageChange = onUserImageChangee;
exports.onScreamDelete = onScreamDeletee;

exports.api = functions.region('asia-east2').https.onRequest(app);
