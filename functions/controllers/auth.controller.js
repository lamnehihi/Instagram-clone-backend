const { firebase, db, firebaseConfig } = require("../initialFirebase");
const { isEmptyString, isEmail } = require("../validates/inputField.validate");
const {
  validateSignInData,
  validateLogInData,
} = require("../validates/auth.validate");

module.exports.login = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = validateLogInData(user);
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  try {
    const data = await firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password);
    const token = await data.user.getIdToken();
    return res.json({ token });
  } catch (err) {
      return res
        .status(400)
        .json({ general: "wrong email or password, please try again" });
  }
};

module.exports.signup = async (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  const defaultImg = "no-img.png";

  let errors = validateSignInData(newUser);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  let token, userId;
  try {
    const doc = await db.doc(`/users/${newUser.handle}`).get();
    if (doc.exists) {
      return res.status(404).json({ handle: "this handle is already taken" });
    }
    const data = await firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password);
    console.log(data);

    userId = data.user.uid;
    token = await data.user.getIdToken();
    const userCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${defaultImg}?alt=media`,
      userId,
    };

    await db.doc(`/users/${newUser.handle}`).set(userCredentials);
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    if (err.code === "auth/email-already-in-use") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ general: 'something when wrong, please try again'});
  }
};
