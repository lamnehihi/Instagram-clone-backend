const { functions, db } = require("../initialFirebase");

// ANCHOR: create notification on like
module.exports.createNotificationOnLikee = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`screams/${snapshot.data().screamId}`).get();
      if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
        return await db.doc(`notifications/${snapshot.id}`).set({
          createAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: "like",
          read: false,
          screamId: doc.id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

// ANCHOR: delete notification on unlike
module.exports.deleteNotificationOnUnlikee = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onDelete(async (snapshot) => {
    try {
      return await db.doc(`notifications/${snapshot.id}`).delete();
    } catch (error) {
      console.log(error);
    }
  });

// ANCHOR: create notification on comment
module.exports.createNotificationOnCommentt = functions
  .region("asia-east2")
  .firestore.document("comments/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`screams/${snapshot.data().screamId}`).get();
      if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
        return await db.doc(`notifications/${snapshot.id}`).set({
          createAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: "comments",
          read: false,
          screamId: doc.id,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

// ANCHOR: change userImage of scream when user change image
module.exports.onUserImageChangee = functions
  .region("asia-east2")
  .firestore.document("users/{userId}")
  .onUpdate(async (change) => {
    try {
      if (change.before.data().imageUrl === change.after.data().imageUrl)
        return true;
      console.log("user image change");
      console.log("before", change.before.data());
      console.log("after", change.after.data());

      const batch = db.batch();
      const dataScream = await db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get();
      dataScream.forEach((doc) => {
        batch.update(db.doc(`screams/${doc.id}`), {
          userImage: change.after.data().imageUrl,
        });
      });
      const dataComment = await db
        .collection("comments")
        .where("userHandle", "==", change.before.data().handle)
        .get();
      dataComment.forEach((doc) => {
        batch.update(db.doc(`comments/${doc.id}`), {
          userImage: change.after.data().imageUrl,
        });
      });
      return batch.commit();
    } catch (error) {
      console.log(error);
    }
  });

// ANCHOR: delete notification, like, comment when scream delete
module.exports.onScreamDeletee = functions
  .region("asia-east2")
  .firestore.document("screams/{screamId}")
  .onDelete(async (snapshot, context) => {
    try {
      const screamId = context.params.screamId;
      const batch = db.batch();
      const dataLike = await db
        .collection("likes")
        .where("screamId", "==", screamId)
        .get();
      dataLike.forEach((doc) => {
        batch.delete(db.doc(`likes/${doc.id}`));
      });
      const dataComment = await db
        .collection("comments")
        .where("screamId", "==", screamId)
        .get();
      dataComment.forEach((doc) => {
        batch.delete(db.doc(`comments/${doc.id}`));
      });
      const dataNotification = await db
        .collection("notifications")
        .where("screamId", "==", screamId)
        .get();
        dataNotification.forEach((doc) => {
        batch.delete(db.doc(`notifications/${doc.id}`));
      });
      return batch.commit();
    } catch (error) {
      console.log(error);
    }
  });
