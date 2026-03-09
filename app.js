import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    getDocs, 
    addDoc,   // <-- nécessaire
    doc       // <-- nécessaire si tu supprimes des participants
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);

signInAnonymously(auth);

const playersRef = collection(db,"players");
const tournamentRef = collection(db,"tournaments");


// =======================
// CLASSEMENT INTELLIGENT
// =======================

onSnapshot(playersRef,(snapshot)=>{

    const leaderboard = document.getElementById("leaderboard");
    const podium = document.getElementById("podium");

    leaderboard.innerHTML="";
    podium.innerHTML="";

    let players=[];

    snapshot.forEach(doc=>{
        const data = doc.data();

        const kd = data.deaths ? data.kills/data.deaths : 0;

        const rankingScore =
            data.points +
            (data.wins * 50) +
            (kd * 20);

        players.push({
            id:doc.id,
            ...data,
            rankingScore:rankingScore
        });
    });

    players.sort((a,b)=> b.rankingScore - a.rankingScore);

    const top3 = players.slice(0,3);
    const classes=["first","second","third"];

    top3.forEach((p,i)=>{

        const kd=(p.kills/p.deaths).toFixed(2);

        podium.innerHTML+=`
        <div class="podium-card ${classes[i]}">
            <h3>${p.name}</h3>
            <p>${p.points} pts</p>
            <p>K/D: ${kd}</p>
        </div>`;
    });

    players.forEach((p,index)=>{

        const kd=(p.kills/p.deaths).toFixed(2);

        leaderboard.innerHTML+=`
        <div class="player" onclick="window.location.href='profile.html?id=${p.id}'">
            <span>#${index+1} ${p.name}</span>
            <span>${p.points} pts | K/D ${kd}</span>
        </div>`;
    });

});


// =======================
// TOURNOIS ADMIN PRO
// =======================

onSnapshot(tournamentRef, (snapshot) => {
    const div = document.getElementById("tournaments");
    div.innerHTML = "";

    snapshot.forEach(docSnap => {
        const t = docSnap.data();
        const tournamentId = docSnap.id;

        // Div du tournoi
        const tournamentDiv = document.createElement("div");
        tournamentDiv.className = "player";
        tournamentDiv.style.flexDirection = "column";
        tournamentDiv.style.alignItems = "flex-start";
        div.appendChild(tournamentDiv);

        tournamentDiv.innerHTML = `
            <strong>${t.title}</strong>
            <small>${t.date}</small>
            <p>${t.description || ""}</p>
            <p id="inscrits-${tournamentId}">Inscrits : 0${t.maxPlayers ? " / " + t.maxPlayers : ""}</p>
            <p>Status : ${t.status || "open"}</p>
            ${t.status === "open" ? `<button onclick="register('${tournamentId}')">S'inscrire</button>` : `<button disabled>Complet / Fermé</button>`}
            <button onclick="viewParticipants('${tournamentId}')">Voir les inscrits</button>
        `;

        // ✅ Snapshot sur les participants pour chaque tournoi
        const participantsRef = collection(db, "tournaments", tournamentId, "participants");
        onSnapshot(participantsRef, (participantsSnap) => {
            const count = participantsSnap.size;
            document.getElementById(`inscrits-${tournamentId}`).innerText =
                `Inscrits : ${count}${t.maxPlayers ? " / " + t.maxPlayers : ""}`;
        });
    });
});




// =======================
// INSCRIPTION TOURNOI
// =======================

window.register = async function(id){

    const playerName = prompt("Nom EXACT du joueur inscrit ?");
    if(!playerName) return;

    const snapshot = await getDocs(playersRef);

    let foundPlayer = null;

    snapshot.forEach(doc=>{

        if(doc.data().name === playerName){

            foundPlayer = {
                id:doc.id,
                ...doc.data()
            };
        }

    });

    if(!foundPlayer){

        alert("Ce joueur n'existe pas !");
        return;
    }

    const participantsRef = collection(db,"tournaments",id,"participants");

    const existing = await getDocs(participantsRef);

    let already=false;

    existing.forEach(doc=>{

        if(doc.data().playerId === foundPlayer.id){

            already=true;
        }

    });

    if(already){

        alert("Déjà inscrit !");
        return;
    }

    await addDoc(participantsRef,{
        playerId:foundPlayer.id,
        name:foundPlayer.name,
        points:foundPlayer.points
    });

    alert("Inscription validée !");
};


// =======================
// VUE PARTICIPANTS
// =======================

window.viewParticipants = async function(id){

    const participantsRef = collection(db,"tournaments",id,"participants");

    const snapshot = await getDocs(participantsRef);

    let list="";

    snapshot.forEach(doc=>{

        list += doc.data().name + " ("+doc.data().points+" pts)\n";

    });

    if(!list) list="Aucun inscrit";

    alert("Liste des inscrits :\n\n"+list);
};