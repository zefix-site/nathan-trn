import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

const tournamentsRef = collection(db,"tournaments");
const playersRef = collection(db,"players");

// ================= LOGIN =================
document.getElementById("loginBtn").addEventListener("click", async ()=>{
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;
    try{ await signInWithEmailAndPassword(auth,email,password); }
    catch(e){ alert("Erreur connexion : "+e.message); }
});

onAuthStateChanged(auth, async (user)=>{
    if(user){
        const adminRef = doc(db,"admins",user.uid);
        const adminSnap = await getDoc(adminRef);

        if(adminSnap.exists()){
            document.getElementById("loginBox").style.display="none";
            document.getElementById("adminPanel").style.display="block";
            loadTournaments();
            loadPlayers();
            loadLeaderboard();
        }else{
            alert("Accès refusé : pas admin");
            signOut(auth);
        }
    }
});

// ================= CREATE TOURNAMENT =================
document.getElementById("createTournament")
.addEventListener("click", async ()=>{
    const title=document.getElementById("tTitle").value.trim();
    const date=document.getElementById("tDate").value;
    const maxPlayers=parseInt(document.getElementById("tMaxPlayers").value);
    const description=document.getElementById("tDescription").value.trim();
    const prize=document.getElementById("tPrize").value.trim();
    const mode=document.getElementById("tMode").value.trim();

    if(!title || !date || !maxPlayers){ alert("Champs obligatoires manquants"); return; }

    const docRef = await addDoc(tournamentsRef,{
        title, date, maxPlayers, description, prize, mode, status:"open", createdAt:new Date()
    });

    alert("Tournoi créé !");
    await createMatches(docRef.id);
    loadTournaments();
});

// ================= CREATE MATCHES =================
async function createMatches(tournamentId){
    const participantsSnap = await getDocs(collection(db,"tournaments",tournamentId,"participants"));
    const participants = participantsSnap.docs.map(doc=>({id:doc.id, ...doc.data()}));
    participants.sort(()=>Math.random()-0.5);
    const matchesRef = collection(db,"tournaments",tournamentId,"matches");

    for(let i=0; i<participants.length; i+=2){
        if(i+1 < participants.length){
            await addDoc(matchesRef,{player1Id: participants[i].playerId, player2Id: participants[i+1].playerId, score1:0, score2:0, winnerId:null});
        } else {
            await addDoc(matchesRef,{player1Id: participants[i].playerId, player2Id:null, score1:0, score2:0, winnerId:participants[i].playerId});
        }
    }
}

// ================= LOAD TOURNOIS =================
async function loadTournaments(){
    const div=document.getElementById("adminTournaments");
    const finishedDiv=document.getElementById("finishedTournaments");
    div.innerHTML=""; finishedDiv.innerHTML="";

    const snapshot=await getDocs(tournamentsRef);

    snapshot.forEach(async docSnap=>{
        const t=docSnap.data(); const id=docSnap.id;
        const participantsSnap = await getDocs(collection(db,"tournaments",id,"participants"));

        let htmlParticipants="";
        participantsSnap.forEach((p,index)=> htmlParticipants += `<div>${index+1}. ${p.data().name} (${p.data().points} pts)</div>`);

        const targetDiv = t.status==="finished"? finishedDiv : div;

        targetDiv.innerHTML += `
        <div class="player" style="flex-direction:column;align-items:flex-start;margin-bottom:20px;">
            <h3>${t.title}</h3>
            <small>Date: ${t.date}</small>
            <p>Mode: ${t.mode || "N/A"}</p>
            <p>Cashprize: ${t.prize || "N/A"}</p>
            <p>Status: ${t.status}</p>
            <p>Participants: ${participantsSnap.size}/${t.maxPlayers}</p>
            <div style="margin:10px 0;">
                <button onclick="toggleStatus('${id}','${t.status}')">Ouvrir / Fermer</button>
                <button onclick="finishTournamentPro('${id}')">🏁 Terminer</button>
                <button onclick="loadMatches('${id}')">Voir Matchs</button>
            </div>
            <div style="border-top:1px solid #00f2ff;padding-top:5px;">
                ${htmlParticipants || "<p>Aucun participant</p>"}
            </div>
        </div>
        `;
    });
}

// ================= LOAD MATCHES =================
async function loadMatches(tournamentId){
    const matchesDiv=document.getElementById("matchesList");
    matchesDiv.innerHTML="<h3>Matchs / Bracket</h3>";
    const matchesSnap = await getDocs(collection(db,"tournaments",tournamentId,"matches"));

    matchesSnap.forEach(docSnap=>{
        const m = docSnap.data();
        matchesDiv.innerHTML += `
        <div class="player" style="flex-direction:column;margin-bottom:10px;">
            <span>${m.player1Id} vs ${m.player2Id || "bye"}</span>
            <input type="number" placeholder="Score ${m.player1Id}" id="score1-${docSnap.id}">
            <input type="number" placeholder="Score ${m.player2Id}" id="score2-${docSnap.id}">
            <button onclick="updateMatch('${tournamentId}','${docSnap.id}')">Valider</button>
        </div>
        `;
    });
}

// ================= LOAD PLAYERS =================
async function loadPlayers(){
    const div=document.getElementById("playersList"); div.innerHTML="";
    const snapshot = await getDocs(playersRef);

    snapshot.forEach(docSnap=>{
        const p = docSnap.data();
        div.innerHTML += `
        <div class="player" style="flex-direction:column;align-items:flex-start;margin-bottom:10px;">
            <strong>${p.name}</strong>
            <span>Points: ${p.points} | Wins: ${p.wins} | Kills: ${p.kills} | Deaths: ${p.deaths}</span>
            <div style="margin-top:5px;">
                <button onclick="addPoints('${docSnap.id}',10)">+10 pts</button>
                <button onclick="addWin('${docSnap.id}')">+1 Win</button>
                <button onclick="resetStats('${docSnap.id}')">Reset</button>
            </div>
        </div>`;
    });
}

// ================= LOAD LEADERBOARD =================
async function loadLeaderboard(){
    const div = document.getElementById("leaderboardPanel"); 
    div.innerHTML = "";

    const snapshot = await getDocs(playersRef);
    let players = [];

    snapshot.forEach(doc=>{
        const data = doc.data();
        const kd = (data.deaths ? data.kills/data.deaths : 0).toFixed(2);
        const rankingScore = data.points + (data.wins*50) + (kd*20);
        players.push({...data, id: doc.id, rankingScore, kd});
    });

    // Tri par score
    players.sort((a,b)=> b.rankingScore - a.rankingScore);

    // Affichage complet avec rang
    players.forEach((p, index)=>{
        div.innerHTML += `
        <div class="player-card leaderboard-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>#${index+1} ${p.name}</strong>
                <span>${p.rankingScore.toFixed(0)} pts</span>
            </div>
            <div style="display:flex; gap:10px; font-size:13px; color:#aaa;">
                <span>Points: ${p.points}</span>
                <span>Wins: ${p.wins}</span>
                <span>Kills: ${p.kills}</span>
                <span>Deaths: ${p.deaths}</span>
                <span>K/D: ${p.kd}</span>
            </div>
            <div style="margin-top:5px;">
                <button onclick="addPoints('${p.id}',10)">+10 pts</button>
                <button onclick="addWin('${p.id}')">+1 Win</button>
                <button onclick="resetStats('${p.id}')">Reset</button>
            </div>
        </div>
        `;
    });
}

// ================= PLAYER UTILITIES =================
window.addPoints = async function(playerId, pts){
    const ref = doc(db,"players",playerId); const snap=await getDoc(ref);
    await updateDoc(ref,{points:(snap.data().points||0)+pts}); loadPlayers(); loadLeaderboard();
};
window.addWin = async function(playerId){
    const ref = doc(db,"players",playerId); const snap=await getDoc(ref);
    await updateDoc(ref,{wins:(snap.data().wins||0)+1}); loadPlayers(); loadLeaderboard();
};
window.resetStats = async function(playerId){
    await updateDoc(doc(db,"players",playerId),{kills:0,deaths:1,wins:0}); loadPlayers(); loadLeaderboard();
};

// ================= MATCH & TOURNAMENT UTILS =================
window.updateMatch = async function(tournamentId, matchId){
    const s1=parseInt(document.getElementById(`score1-${matchId}`).value);
    const s2=parseInt(document.getElementById(`score2-${matchId}`).value);
    const ref=doc(db,"tournaments",tournamentId,"matches",matchId);
    const mData=(await getDoc(ref)).data();
    let winner=null;
    if(s1>s2) winner=mData.player1Id;
    else if(s2>s1) winner=mData.player2Id;
    await updateDoc(ref,{score1:s1,score2:s2,winnerId:winner});
};
window.toggleStatus=async function(id,status){ await updateDoc(doc(db,"tournaments",id),{status:status==="open"?"closed":"open"}); loadTournaments(); };
async function finishTournamentPro(tournamentId){
    const participantsSnap = await getDocs(collection(db,"tournaments",tournamentId,"participants"));
    if(participantsSnap.empty){ alert("Aucun participant"); return; }
    let ranking = [...participantsSnap.docs].map(doc=>({id: doc.id, ...doc.data()}));
    ranking.sort((a,b)=> b.points - a.points);
    const pointsDist=[100,50,25];
    for(let i=0;i<ranking.length;i++){
        const pRef = doc(db,"players",ranking[i].playerId);
        await updateDoc(pRef,{points: ranking[i].points+(pointsDist[i]||0), wins: i===0?1:0});
    }
    await updateDoc(doc(db,"tournaments",tournamentId),{status:"finished"});
    alert("Tournoi terminé et points attribués !");
    loadTournaments(); loadLeaderboard();
}