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
      if (!data.docs[0]) {
        console.log("user data not found");
        return res.status(403).json({ user: "user data not found!" });
      }
      req.user.handle = data.docs[0].data().handle;
      req.user.imageUrl = data.docs[0].data().imageUrl;
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

  if (data.bio) {
    if (!isEmptyString(data.bio.trim())) {
      userDetails.bio = data.bio;
    } else {
      userDetails.bio = "";
    }
  }

  if (data.website) {
    if (!isEmptyString(data.website.trim())) {
      if (data.website.substring(0, 4) !== "http") {
        userDetails.website = `http://${data.website}`;
      } else userDetails.website = data.website;
    } else {
      userDetails.website = "";
    }
  }

  if (data.location) {
    if (!isEmptyString(data.location.trim())) {
      userDetails.location = data.location;
    } else {
      userDetails.location = "";
    }
  }

  return userDetails;
};
