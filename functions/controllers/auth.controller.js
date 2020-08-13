const { firebase, db } = require('../initialFirebase');
const { isEmptyString, isEmail } = require('../validates/inputField.validate');

module.exports.login = function (req, res) {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};
  if (isEmptyString(user.email)) errors.email = "email is require!";
  if (!isEmail(user.email)) errors.email = "invalid email!";
  if (isEmptyString(user.password)) errors.password = "password is require!";

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

  let errors = {};

  if (isEmptyString(newUser.email)) {
    errors.email = "email is required!";
  } else if (!isEmail(newUser.email)) {
    errors.email = "invalid email!";
  }

  if (isEmptyString(newUser.password)) {
    errors.password = "password is required!";
  }
  if (newUser.password !== newUser.confirmPassword) {
    errors.password = "password must match!";
  }
  if (isEmptyString(newUser.handle)) {
    errors.handle = "handle is required!";
  }
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
