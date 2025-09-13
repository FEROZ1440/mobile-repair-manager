import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBqCurN2QZmEMjr9pz3lTIknoEQVDI9Pi8",
  authDomain: "imran-mobiles-9ff40.firebaseapp.com",
  projectId: "imran-mobiles-9ff40",
  storageBucket: "imran-mobiles-9ff40.firebasestorage.app",
  messagingSenderId: "759241733312",
  appId: "1:759241733312:web:0730fe77706af06ccfe925"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };