// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- IMPORTS ///////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, collection, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, Timestamp, increment, deleteField } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- FIREBASE //////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const firebaseConfig = {
  apiKey: "AIzaSyBOuvYnU3JEVwsFe1h17-JtLVkXjFYENkE",
  authDomain: "jones-family-app.firebaseapp.com",
  projectId: "jones-family-app",
  storageBucket: "jones-family-app.firebasestorage.app",
  messagingSenderId: "57424407391",
  appId: "1:57424407391:web:f4fcdc5c45d9b3cc6124ea",
  measurementId: "G-P1R1HWX701"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- FIREBASE //////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



export async function GetEvents() {
  const docRef = doc(db, "global", "events");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const tempArray = [];
    for (const key in data) { tempArray.push({ name: key, date: data[key][0], emoji: data[key][1] }) }
    return tempArray;
  } else {
    console.log("No Document Found!")
    return []
  }
}

export async function AddEvent(name, date, emoji) {
  const eventsDocRef = doc(db, "global", "events");

  await updateDoc(eventsDocRef, {
    [name]: [date, emoji]
  });
  return
}

export async function RemoveEvent(name) {
  const eventsDocRef = doc(db, 'global', 'events');

  await updateDoc(eventsDocRef, {
      [name]: deleteField()
  });
  return
}