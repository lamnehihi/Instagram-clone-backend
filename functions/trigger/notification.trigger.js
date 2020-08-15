const { functions, db } = require("../initialFirebase");

// ANCHOR: create notification on like
exports.createNotificationOnLike = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`screams/${snapshot.data().screamId}`).get();
      if (doc.exists) {
        await db.doc(`notifications/${snapshot.id}`).set({
          createAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: "like",
          read: false,
          screamId: doc.id,
        });
      }
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  });

// ANCHOR: delete notification on unlike
exports.deleteNotificationOnUnlike = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onDelete(async (snapshot) => {
    try {
        await db.doc(`notifications/${snapshot.id}`).delete();
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  });

// ANCHOR: create notification on comment
exports.createNotificationOnComment = functions
  .region("asia-east2")
  .firestore.document("comments/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`screams/${snapshot.data().screamId}`).get();
      if (doc.exists) {
        await db.doc(`notifications/${snapshot.id}`).set({
          createAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          type: "comments",
          read: false,
          screamId: doc.id,
        });
      }
      return;
    } catch (error) {
      console.log(error);
      return;
    }
  });
