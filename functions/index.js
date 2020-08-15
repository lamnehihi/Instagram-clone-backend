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
app.use("/user", middlewareUserAuth.FBAuth, userRoute);

//trigger

exports.api = functions.region("asia-east2").https.onRequest(app);
