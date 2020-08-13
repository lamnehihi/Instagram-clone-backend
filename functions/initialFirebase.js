const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase = require("firebase");

const serviceAccount = require("./socialape-30f245b81b91.json");

var firebaseConfig = {
  apiKey: "AIzaSyAfygoN_d6s6nq_3ITWL8gp6D-e1K5JJuA",
  authDomain: "socialape-fb7db.firebaseapp.com",
  databaseURL: "https://socialape-fb7db.firebaseio.com",
  projectId: "socialape-fb7db",
  storageBucket: "socialape-fb7db.appspot.com",
  messagingSenderId: "990932135566",
  appId: "1:990932135566:web:1597715563418f630da3df",
  measurementId: "G-606PWRRRZH",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialape-fb7db.firebaseio.com",
});

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

const { error } = require("firebase-functions/lib/logger");

module.exports.firebase = firebase;
module.exports.db = db;
module.exports.admin = admin;
module.exports.functions = functions;

