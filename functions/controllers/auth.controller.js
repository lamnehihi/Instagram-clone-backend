const { firebase, db, firebaseConfig } = require("../initialFirebase");
const { isEmptyString, isEmail } = require("../validates/inputField.validate");
const { validateSignInData, validateLogInData } = require("../validates/auth.validate");

module.exports.login = function (req, res) {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = validateLogInData(user);
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      if (err.code === "auth/wrong-password") {
        return res
          .status(400)
          .json({ general: "wrong email or password, please try again" });
      }
      return res.status(500).json({ error: err.code });
    });
};

module.exports.signin = function (req, res) {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  const defaultImg = 'no-img.png';

  let errors = validateSignInData(newUser);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  //NOTE: validate data 
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(404).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      console.log(data);
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${defaultImg}?alt=media`,
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(200).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ error: "Email already in use" });
      }
      res.status(500).json({ error: err.code });
    });
};
