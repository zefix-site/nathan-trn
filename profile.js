import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHLFJroGx5EX9-M8Ps14eC0z3OZI_eZg8",
  authDomain: "nathan-trn.firebaseapp.com",
  projectId: "nathan-trn",
  storageBucket: "nathan-trn.firebasestorage.app",
  messagingSenderId: "24707035797",
  appId: "1:24707035797:web:34aef38b6cc8d76a19c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const playerRef = doc(db,"players",id);
const snap = await getDoc(playerRef);

if(snap.exists()){
    const p=snap.data();
    const kd=(p.kills/p.deaths).toFixed(2);

    document.getElementById("profile").innerHTML=`
        <h3>${p.name}</h3>
        <p>Points: ${p.points}</p>
        <p>Kills: ${p.kills}</p>
        <p>Deaths: ${p.deaths}</p>
        <p>K/D: ${kd}</p>
        <p>Wins: ${p.wins}</p>
    `;
}