const { admin, firebaseConfig, db } = require("../initialFirebase");
const { reducerUserDetails } = require("../middlewares/userAuth.middleware");

// ANCHOR: get user details
module.exports.getUser = async (req, res) => {
  try {
    const userDetails = {};
    const doc = await db.doc(`users/${req.user.handle}`).get();
    userDetails.credentials = doc.data();
    const data = await db
      .collection("likes")
      .where("handle", "==", doc.data().handle)
      .get();
    userDetails.likes = [];
    data.forEach((doc) => {
      userDetails.likes.push(doc.data());
    });
    return res.json(userDetails);
  } catch (error) {
    res.status(500).json({ error: err.code });
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
