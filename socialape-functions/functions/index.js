const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase = require('firebase');

// const express = require('express');
// const app = express();
const app = require('express')();

admin.initializeApp();

const firebaseConfig = {
  apiKey: 'AIzaSyALv420WtjLptcPN-PThDAUKplQ_qs-eDA',
  authDomain: 'socialape-861bb.firebaseapp.com',
  databaseURL: 'https://socialape-861bb.firebaseio.com',
  projectId: 'socialape-861bb',
  storageBucket: 'socialape-861bb.appspot.com',
  messagingSenderId: '495283256056',
  appId: '1:495283256056:web:837c5466d8c2a7d9a8d90d',
};

firebase.initializeApp(firebaseConfig);

// exports.getScreams = functions.https.onRequest((req, res) => {
//   admin
//     .firestore()
//     .collection('screams')
//     .get()
//     .then((data) => {
//       let screams = [];

//       data.forEach((doc) => {
//         screams.push(doc.data());
//       });
//       return res.json(screams);
//     })
//     .catch((err) => console.log(err));
// });

app.get('/screams', (req, res) => {
  admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt', 'desc')
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

// exports.createScream = functions.https.onRequest((req, res) => {
//   if (req.method !== 'POST') {
//     return res.status(400).json({ message: 'Method not allowed' });
//   }

//   const newScream = {
//     body: req.body.body,
//     userHandle: req.body.userHandle,
//     createdAt: admin.firestore.Timestamp.fromDate(new Date()),
//   };

//   admin
//     .firestore()
//     .collection('screams')
//     .add(newScream)
//     .then((doc) => {
//       res.json({ message: `Document ${doc.id} created successfully` });
//     })
//     .catch((err) => {
//       res.status(500).json({ error: 'Something went wrong' });
//       console.log(err);
//     });
// });

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({ message: `Document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Something went wrong' });
      console.log(err);
    });
});

// SINGUP ROUTE
app.post('/signup', (res, req) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  //TODO: Validate data

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return res
        .status(201)
        .json({ message: `User ${data.user.uid} Signed up successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: err.code });
    });
});

// Telling Firebase that the 'app' is the container for all routes
exports.api = functions.region('europe-west1').https.onRequest(app);
