const { db } = require("../initialFirebase");

// ANCHOR: is that your scream ?
module.exports.checkOwner = async (req, res, next) => {
  try {
    const doc = await db.doc(`/screams/${req.params.screamId}`).get();
    if (doc.data().userHandle === req.user.handle) {
      req.scream = doc.data();
      return next();
    } else {
      return res
        .status(400)
        .json({
          error: "can not action with this scream, authorization error",
        });
    }
  } catch (error) {
    return res.status(500).json(error.code);
  }
};

// ANCHOR: is scream exist ?
module.exports.checkExist = async (req, res, next) => {
  try {
    const doc = await db.doc(`/screams/${req.params.screamId}`).get();
    if(!doc.exists) res.status(404).json({error: 'scream not exist'});
    req.scream = doc.data();
    req.scream.id = doc.id;
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};
