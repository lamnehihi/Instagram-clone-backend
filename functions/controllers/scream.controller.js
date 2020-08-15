const { firebase, db } = require("../initialFirebase");
const { isEmptyString } = require("../validates/inputField.validate");

// ANCHOR: get all scream
module.exports.screams = async (req, res) => {
  try {
    const data = await db
      .collection("screams")
      .orderBy("createAt", "desc")
      .get();
    let screams = [];
    data.forEach((doc) => {
      screams.push({
        ...doc.data(),
      });
    });
    return res.json(screams);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ error: err.code });
  }
};

// ANCHOR: post new scream
module.exports.screamPost = async (req, res) => {
  if (isEmptyString(req.body.body))
    return res.status(400).json({ error: "scream must not be empty" });

  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  try {
    const doc = await db.collection("screams").add(newScream);
    const resScream = { ...newScream };
    resScream.id = doc.id;
    return res.json(resScream);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "something went wrong" });
  }
};

// ANCHOR: get a scream by id param
module.exports.getScream = async (req, res) => {
  let screamData = {};

  try {
    const doc = await db.doc(`/screams/${req.params.screamId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "scream not found" });
    }

    screamData = doc.data();
    screamData.screamId = doc.id;
    const data = await db
      .collection("comments")
      .orderBy("createAt", "desc")
      .where("screamId", "==", screamData.screamId)
      .get();

    screamData.comments = [];
    data.forEach((doc) => {
      screamData.comments.push(doc.data());
    });

    return res.json(screamData);
  } catch (err) {
    return res.status(500).json({ error: err.code });
  }
};

// ANCHOR: add comment on a scream
module.exports.commentPost = async (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ error: "comment must not be empty" });

  const newComment = {
    createAt: new Date().toISOString(),
    body: req.body.body,
    userHandle: req.user.handle,
    screamId: req.params.screamId,
    userImage: req.user.imageUrl,
  };

  try {
    const doc = await db.doc(`/screams/${req.params.screamId}`).get();
    if (!doc.exists) return res.status(404).json({ error: "scream not found" });
    await db.collection("comments").add(newComment);
    return res.json({ newComment });
  } catch (err) {
    return res.status(500).json({ error: `something went wrong` });
  }
};

// ANCHOR: delete a scream
module.exports.deletePost = async (req, res) => {
  try {
    const response = await db
      .collection("screams")
      .doc(`${req.params.screamId}`)
      .delete();
    return res
      .status(200)
      .json({ message: `delete successfully ${response.data}` });
  } catch (err) {
    return res.status(500).json({ error: `can not delete ${err}` });
  }
};

// ANCHOR: add like on a scream
module.exports.like = async (req, res) => {
  try {
    const scream = req.scream;
    const newLike = {
      screamId: scream.id,
      userHandle: req.user.handle,
    };

    const data = await db
      .collection("likes")
      .where("userHandle", "==", req.user.handle)
      .get();
    if (!data.empty) {
      const like = [];
      data.forEach((doc) => {
        like.push(doc.data());
      });
      let likeFound = {};
      likeFound = like.find((item) => {
        if (item.userHandle === req.user.handle && item.screamId === scream.id)
          return item;
      });
      console.log("like found", likeFound);
      if(likeFound === undefined) likeFound = {};
      console.log("like found", likeFound);
      if (Object.keys(likeFound).length > 0) {
        return res.status(400).json({ error: "already liked on this scream" });
      }
    }
    const response = await db.collection("likes").add(newLike);
    await db
      .doc(`/screams/${req.params.screamId}`)
      .update({ likeCount: req.scream.likeCount += 1 });
    return res.json(req.scream);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: `something wrong` });
  }
};

// ANCHOR: unlike on a scream
module.exports.unlike = async (req, res) => {
  try {
    const scream = req.scream;
    const willUnlike = {
      screamId: scream.id,
      userHandle: req.user.handle,
    };

    const data = await db
      .collection("likes")
      .where("userHandle", "==", req.user.handle)
      .get();
    const like = [];
    data.forEach((doc) => {
      const newLike = doc.data();
      newLike.id = doc.id;
      like.push(newLike);
    });

    let likeFound = {};
    likeFound = like.find((item) => {
      if (item.userHandle === req.user.handle && item.screamId === scream.id)
        return item;
    });
    if(likeFound === undefined) likeFound = {};
    
    if (Object.keys(likeFound).length > 0) {
      const response = await db.collection("likes").doc(likeFound.id).delete();
      await db
        .doc(`/screams/${req.params.screamId}`)
        .update({ likeCount: scream.likeCount -= 1 });
      return res.json(scream);
    } else {
      return res.status(400).json({ error: "you havn't like on this scream" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: `something wrong` });
  }
};
