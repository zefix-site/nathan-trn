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

if(!id){
    document.getElementById("profile").innerHTML = "<p>Joueur introuvable.</p>";
} else {
    const playerRef = doc(db,"players",id);
    const snap = await getDoc(playerRef);

    if(snap.exists()){
        const p = snap.data();

        // Sécuriser les valeurs si elles sont undefined
        const kills = p.kills || 0;
        const deaths = p.deaths || 1; // éviter division par 0
        const points = p.points || 0;
        const wins = p.wins || 0;

        const kd = (kills / deaths).toFixed(2);

        let kdColor = "#00ff9d";
        if(kd < 1) kdColor = "#ff3b3b";
        else if(kd < 2) kdColor = "#ffaa00";

        document.getElementById("profile").innerHTML = `
<div class="profile-card">
    <div class="profile-header">
        <div class="profile-avatar">🎮</div>
        <h3 class="profile-name">${p.name}</h3>
    </div>
    <div class="profile-stats">
        <div class="stat-box">
            <span class="stat-title">POINTS</span>
            <span class="stat-value">${points}</span>
        </div>
        <div class="stat-box">
            <span class="stat-title">KILLS</span>
            <span class="stat-value">${kills}</span>
        </div>
        <div class="stat-box">
            <span class="stat-title">DEATHS</span>
            <span class="stat-value">${deaths}</span>
        </div>
        <div class="stat-box">
            <span class="stat-title">VICTOIRES</span>
            <span class="stat-value">${wins}</span>
        </div>
        <div class="stat-box kd">
            <span class="stat-title">K/D</span>
            <span class="stat-value" style="color:${kdColor}">${kd}</span>
        </div>
    </div>
</div>`;
    } else {
        document.getElementById("profile").innerHTML = "<p>Joueur introuvable.</p>";
    }
}