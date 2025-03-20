import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGifnwsyeq-GGUXEeVLgzyBgG-B7nCsNQ",
  authDomain: "chatapp-saas.firebaseapp.com",
  databaseURL: "https://chatapp-saas-default-rtdb.firebaseio.com",
  projectId: "chatapp-saas",
  storageBucket: "chatapp-saas.appspot.com",
  messagingSenderId: "532703155376",
  appId: "1:532703155376:web:edabd668650939fa9b5775",
  measurementId: "G-Q9KK98H1ZG"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };