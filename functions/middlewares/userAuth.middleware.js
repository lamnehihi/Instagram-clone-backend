const { admin, db } = require("../initialFirebase");
const { isEmptyString } = require("../validates/inputField.validate");

module.exports.FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.log("No token found");
    return res.status(403).json({ error: "UnAuthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodeToken) => {
      req.user = decodeToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch((err) => {
      console.log("Field when verifying token", err);
      return res.status(403).json(err);
    });
};

// ANCHOR: update user details
module.exports.reducerUserDetails = (data) => {
  const userDetails = {};

  if(!isEmptyString(data.bio.trim())) userDetails.bio = data.bio;
  if(!isEmptyString(data.website.trim())) {
    if(data.website.substring(0,4) !== 'http') {
      userDetails.website = `http://${data.website}`;
    } else userDetails.website = data.website;
  }
  if(!isEmptyString(data.location.trim())) userDetails.location = data.location;
  return userDetails;
}
