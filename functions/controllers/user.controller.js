const { admin, firebaseConfig, db } = require("../initialFirebase");
const { reducerUserDetails } = require("../middlewares/userAuth.middleware");

// ANCHOR: get user details
module.exports.getUser = async (req, res) => {
  try {
    const userDetails = {};
    const doc = await db.doc(`users/${req.user.handle}`).get();
    userDetails.credentials = doc.data();

    //get user likes
    const dataLikes = await db
      .collection("likes")
      .where("userHandle", "==", doc.data().handle)
      .get();
    userDetails.likes = [];
    dataLikes.forEach((doc) => {
      let newLike = doc.data();
      newLike.id = doc.id;
      userDetails.likes.push(newLike);
    });

    //get user notifications
    const dataNotifications = await db
      .collection("notifications")
      .where("recipient", "==", doc.data().handle)
      .orderBy("createAt", "desc")
      .limit(10)
      .get();
    userDetails.notifications = [];
    dataNotifications.forEach((doc) => {
      let newNoti = doc.data();
      newNoti.id = doc.id;
      userDetails.notifications.push(newNoti);
    });

    //get user screams
    const dataScreams = await db
      .collection("screams")
      .where("userHandle", "==", doc.data().handle)
      .orderBy("createAt", "desc")
      .get();
    userDetails.screams = [];
    dataScreams.forEach((doc) => {
      let scream = doc.data();
      scream.id = doc.id;
      userDetails.screams.push(scream);
    });
    return res.json(userDetails);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ANCHOR: update user details
module.exports.updateUserDetails = async (req, res) => {
  try {
    const userDetails = reducerUserDetails(req.body);
    await db.doc(`users/${req.user.handle}`).update({ ...userDetails });
    return res.json({ message: "update user details successfully" });
  } catch (error) {
    return res.status(500).json({ error: err.code });
  }
};

// ANCHOR: upload user avatar
module.exports.uploadAvatar = async (req, res) => {
  const user = req.user;
  const Busboy = require("busboy");

  const http = require("http"),
    path = require("path"),
    os = require("os"),
    fs = require("fs");

  const busboy = new Busboy({ headers: req.headers });
  let imageToBeUploaded;
  let imageFileName;
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const type = mimetype.split("/")[0];
    if (type !== "image") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }

    //lamnehihi.as.png
    const imageExtension = filename.split(".").slice(-1).pop();
    imageFileName = `${user.uid}_${Math.trunc(
      Math.random() * 10000000000
    )}.${imageExtension}`;

    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filePath, mimetype };
    file.pipe(fs.createWriteStream(filePath));
  });
  busboy.on("finish", async () => {
    try {
      await admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filePath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype,
            },
          },
        });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
      await db.doc(`/users/${req.user.handle}`).update({ imageUrl });
      return res.json({ message: "upload image successfully" });
    } catch (err) {
      return res.status(500).json({ error: err.code });
    }
  });
  busboy.end(req.rawBody);
};

// ANCHOR: visit user as guest
module.exports.getVisitUser = async (req, res) => {
  try {
    let user = {};
    const doc = await db.doc(`users/${req.params.handle}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "user not found" });
    }
    user = doc.data();
    const data = await db
      .collection("screams")
      .orderBy("createAt", "desc")
      .where("userHandle", "==", req.params.handle)
      .get();
    user.screams = [];
    data.forEach((doc) => {
      const newScream = doc.data();
      newScream.id = doc.id;
      user.screams.push(newScream);
    });
    return res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports.markNotificationRead = async (req, res) => {
  try {
    let batch = db.batch();
    req.body.forEach((notificationId) => {
      const notification = db.doc(`notifications/${notificationId}`);
      batch.update(notification, { read: true });
    });
    await batch.commit();
    return res.json({ message: "Notifications marked read" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
