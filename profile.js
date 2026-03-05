import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHLFJroGx5EX9-M8Ps14eC0z3OZI_eZg8",
  authDomain: "nathan-trn.firebaseapp.com",
  projectId: "nathan-trn",
  storageBucket: "nathan-trn.firebasestorage.app",
  messagingSenderId: "24707035797",
  appId: "1:24707035797:web:34aef38b6cc8d76c17a19c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const playerRef = doc(db,"players",id);
const snap = await getDoc(playerRef);

if(snap.exists()){

    const p = snap.data();

    const kd = (p.kills / p.deaths).toFixed(2);

    let kdColor = "#00ff9d";

    if(kd < 1) kdColor = "#ff3b3b";
    if(kd >= 1 && kd < 2) kdColor = "#ffaa00";
    if(kd >= 2) kdColor = "#00ff9d";

    document.getElementById("profile").innerHTML = `

<div class="profile-card">

<div class="profile-header">

<div class="profile-avatar">
🎮
</div>

<h3 class="profile-name">${p.name}</h3>

</div>

<div class="profile-stats">

<div class="stat-box">
<span class="stat-title">POINTS</span>
<span class="stat-value">${p.points}</span>
</div>

<div class="stat-box">
<span class="stat-title">KILLS</span>
<span class="stat-value">${p.kills}</span>
</div>

<div class="stat-box">
<span class="stat-title">DEATHS</span>
<span class="stat-value">${p.deaths}</span>
</div>

<div class="stat-box">
<span class="stat-title">VICTOIRES</span>
<span class="stat-value">${p.wins}</span>
</div>

<div class="stat-box kd">
<span class="stat-title">K/D</span>
<span class="stat-value" style="color:${kdColor}">${kd}</span>
</div>

</div>

</div>

`;

}