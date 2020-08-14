const { firebase, db } = require("../initialFirebase");

// ANCHOR: get all scream
module.exports.screams = function (req, res) {
  db.collection("screams")
    .orderBy("createAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          ...doc.data(),
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
};

// ANCHOR: post new scream
module.exports.screamPost = function (req, res) {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createAt: new Date().toISOString(),
  };

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

// ANCHOR: get a scream by id param
module.exports.getScream = function (req, res) {
  let screamData = {};

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "scream not found" });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      return db
        .collection("comments")
        .orderBy('createAt', 'desc')
        .where("screamId", "==", screamData.screamId)
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach(doc => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch(err => {
      return res.status(500).json({error: err.code});
    })
};

// ANCHOR: add comment on a scream
module.exports.commentPost = function (req, res) {
  if(req.body.body.trim() === '') return res.status(400).json({ error: 'comment must not be empty'});
  
  const newComment = {
    createAt: new Date().toISOString(),
    body: req.body.body,
    userHandle: req.user.handle,
    screamId: req.params.screamId,
    userImage: req.user.imageUrl,
  }

  db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
      if(!doc.exists) return res.status(404).json({ error: 'scream not found'})
      return db.collection('comments').add(newComment)
    })
    .then(() => {
      res.json({newComment})
    })
    .catch(err => {
      res.status(500).json({error: `something went wrong ${err}`});
    })

}

