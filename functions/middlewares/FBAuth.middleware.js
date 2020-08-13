const { admin, db } = require("../initialFirebase");

module.exports.FBAuth = (req, res, next) => {
  let idToken;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.log("No token found");
    return res.status(403).json({ error: "UnAuthorized"});
  };

  admin.auth().verifyIdToken(idToken)
    .then(decodeToken => {
      req.user = decodeToken;
      console.log("decodedToken: ", decodeToken);
      return db.collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
      })
      .then(data => {
        req.user.handle = data.docs[0].data().handle;
        return next();
      })
      .catch(err => {
        console.log("Field when verifying token", err);
        return res.status(403).json(err);
      })
}