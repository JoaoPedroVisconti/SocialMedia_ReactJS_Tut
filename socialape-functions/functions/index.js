const functions = require('firebase-functions');

// const express = require('express');
// const app = express();
const app = require('express')();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signup, login, uploadImage } = require('./handlers/users');

//## SCREAMS ROUTES ##//
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

//## USERS ROUTES ##//
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);

// Telling Firebase that the 'app' is the container for all routes
exports.api = functions.region('europe-west1').https.onRequest(app);
