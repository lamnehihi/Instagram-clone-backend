const { functions, db } = require("../initialFirebase");

// ANCHOR: create notification on like
module.exports.createNotificationOnLikee = functions
.region('asia-east2')
  .firestore.document("likes/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`screams/${snapshot.data().screamId}`).get();
      if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
        return await db.doc(`notifications/${snapshot.id}`).set({
          createAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          senderImage: snapshot.data().userImage,
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
.region('asia-east2')
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
.region('asia-east2')
  .firestore.document("comments/{id}")
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`screams/${snapshot.data().screamId}`).get();
      if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
        return await db.doc(`notifications/${snapshot.id}`).set({
          createAt: new Date().toISOString(),
          recipient: doc.data().userHandle,
          sender: snapshot.data().userHandle,
          senderImage: snapshot.data().userImage,
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
.region('asia-east2')
  .firestore.document("users/{userId}")
  .onUpdate(async (change) => {
    try {

      //ANCHOR: change Avatar
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
      const dataLike = await db
        .collection("likes")
        .where("userHandle", "==", change.before.data().handle)
        .get();
        dataLike.forEach((doc) => {
        batch.update(db.doc(`likes/${doc.id}`), {
          userImage: change.after.data().imageUrl,
        });
      });
      const dataNoti = await db
        .collection("notifications")
        .where("sender", "==", change.before.data().handle)
        .get();
        dataNoti.forEach((doc) => {
        batch.update(db.doc(`notifications/${doc.id}`), {
          senderImage: change.after.data().imageUrl,
        });
      });


      //ANCHOR: change handle
      if (change.before.data().handle === change.after.data().handle)
        return true;
      console.log("user handle change");
      console.log("before", change.before.data());
      console.log("after", change.after.data());

      const dataScream2 = await db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get();
      dataScream2.forEach((doc) => {
        batch.update(db.doc(`screams/${doc.id}`), {
          userHandle: change.after.data().handle,
        });
      });
      const dataComment2 = await db
        .collection("comments")
        .where("userHandle", "==", change.before.data().handle)
        .get();
      dataComment2.forEach((doc) => {
        batch.update(db.doc(`comments/${doc.id}`), {
          userHandle: change.after.data().handle,
        });
      });
      const dataLike2 = await db
        .collection("likes")
        .where("userHandle", "==", change.before.data().handle)
        .get();
        dataLike2.forEach((doc) => {
        batch.update(db.doc(`likes/${doc.id}`), {
          userHandle: change.after.data().handle,
        });
      });
      const dataNotiSender = await db
        .collection("notifications")
        .where("sender", "==", change.before.data().handle)
        .get();
        dataNotiSender.forEach((doc) => {
        batch.update(db.doc(`notifications/${doc.id}`), {
          sender: change.after.data().handle,
        });
      });
      const dataNotiRecipient = await db
        .collection("notifications")
        .where("recipient", "==", change.before.data().handle)
        .get();
        dataNotiRecipient.forEach((doc) => {
        batch.update(db.doc(`notifications/${doc.id}`), {
          recipient: change.after.data().handle,
        });
      });

      return batch.commit();
    } catch (error) {
      console.log(error);
    }
  });

// ANCHOR: delete notification, like, comment when scream delete
module.exports.onScreamDeletee = functions
.region('asia-east2')
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
