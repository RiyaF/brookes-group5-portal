var React = require("react");
var ReactDOM = require("react-dom");
var firebase = require("firebase");
var Router = require("react-router").Router;
var Route = require("react-router").Route;
var Link = require("react-router").Link;
var hashHistory = require("react-router").hashHistory;

var routes = require("./config/routes.js");

var config = {
  /*apiKey: "your API Key",
    authDomain: "your authDomain",
    databaseURL: "your databaseURL",
    storageBucket: "your storageBucket",
    messagingSenderId: "your messagingSenderId"*/
  apiKey: "AIzaSyBxPhVAuMaRePvYxKS3VBxipfN-rKsKKso",
  authDomain: "group-social-c0632.firebaseapp.com",
  databaseURL: "https://group-social-c0632-default-rtdb.firebaseio.com",
  projectId: "group-social-c0632",
  storageBucket: "group-social-c0632.appspot.com",
  messagingSenderId: "517339012835",
  appId: "1:517339012835:web:1072c326148070f2eeefd6",
};

var selingConfigTester = {
  /*
    apiKey: "your API Key",
    authDomain: "your authDomain",
    databaseURL: "your databaseURL",
    storageBucket: "your storageBucket",
    messagingSenderId: "your messagingSenderId"
    */
};

firebase.initializeApp(config);

ReactDOM.render(routes, document.getElementById("app"));
