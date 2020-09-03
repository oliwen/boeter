// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhgCJj2UY-GDqUswAp2bE9DYCvlflXUyI",
  authDomain: "boeter-fb3f0.firebaseapp.com",
  databaseURL: "https://boeter-fb3f0.firebaseio.com",
  projectId: "boeter-fb3f0",
  storageBucket: "boeter-fb3f0.appspot.com",
  messagingSenderId: "747657321260",
  appId: "1:747657321260:web:46512ab350307ce059aa89",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
