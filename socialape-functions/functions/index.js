const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebase = require("firebase");
const { firestore } = require("firebase-admin");
const { user } = require("firebase-functions/lib/providers/auth");

// const express = require('express');
// const app = express();
const app = require("express")();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyALv420WtjLptcPN-PThDAUKplQ_qs-eDA",
  authDomain: "socialape-861bb.firebaseapp.com",
  databaseURL: "https://socialape-861bb.firebaseio.com",
  projectId: "socialape-861bb",
  storageBucket: "socialape-861bb.appspot.com",
  messagingSenderId: "495283256056",
  appId: "1:495283256056:web:837c5466d8c2a7d9a8d90d",
};

firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];

      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.log(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `Document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
      console.log(err);
    });
});

// SING UP ROUTE
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  //TODO: Validate data
  let token, userId;

  db.doc(`/user/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "This handle already exist" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId,
      };

      return db.doc(`/user/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      res.status(201).json({ token: token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ message: err.code });
      }
    });
});

// Telling Firebase that the 'app' is the container for all routes
exports.api = functions.region("europe-west1").https.onRequest(app);
