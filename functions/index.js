const express = require("express");
const app = express();
const { db, functions } = require('./initialFirebase');

//Routes
var authRoute = require("./routes/auth.route");
var screamRoute = require("./routes/scream.route");
var userRoute = require("./routes/user.route");


app.use("/scream", screamRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);

exports.api = functions.region("asia-east2").https.onRequest(app);
