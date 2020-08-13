const express = require("express");
const app = express();
const { db, functions } = require('./initialFirebase');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

//Routes
var authRoute = require("./routes/auth.route");
var screamRoute = require("./routes/scream.route");

app.use("/scream", screamRoute);
app.use("/auth", authRoute);

exports.api = functions.region("asia-east2").https.onRequest(app);
