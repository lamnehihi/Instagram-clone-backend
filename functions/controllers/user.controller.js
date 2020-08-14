const { admin, firebaseConfig, db } = require("../initialFirebase");
const { reducerUserDetails } = require("../middlewares/userAuth.middleware");

// ANCHOR: upload user avatar
module.exports.uploadAvatar = function (req, res) {
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
    if(type !== 'image') {
      return res.status(400).json({ error: 'Wrong file type submitted'});
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
  busboy
    .on("finish", () => {
      admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filePath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype,
            },
          },
        })
    .then(() => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
      return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
    })
    .then(() => {
      return res.json({ message: "upload image successfully" });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.code });
    });
  });
  busboy.end(req.rawBody);
};

module.exports.updateUserDetails = (req, res) => {
  const userDetails = reducerUserDetails(req.body);

  db.doc(`users/${req.user.handle}`).update({ ...userDetails })
    .then(() => {
      return res.json({ message: 'update user details successfully'});
    })
    .catch(err => {
      res.status(500).json({ error: err.code });
    })
}

 















