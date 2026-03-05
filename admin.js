import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getAuth, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
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

    try{
        await signInWithEmailAndPassword(auth,email,password);
    }catch(e){
        alert("Erreur connexion : "+e.message);
    }
});

onAuthStateChanged(auth, async (user)=>{
    if(user){
        const adminRef = doc(db,"admins",user.uid);
        const adminSnap = await getDoc(adminRef);

        if(adminSnap.exists()){
            document.getElementById("loginBox").style.display="none";
            document.getElementById("adminPanel").style.display="block";
            loadTournaments();
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

    if(!title || !date || !maxPlayers){
        alert("Champs obligatoires manquants");
        return;
    }

    const docRef = await addDoc(tournamentsRef,{
        title,
        date,
        maxPlayers,
        description,
        prize,
        mode,
        status:"open",
        createdAt:new Date()
    });

    alert("Tournoi créé !");
    await createMatches(docRef.id);
    loadTournaments();
});

// ================= CREATE MATCHES =================
async function createMatches(tournamentId){
    const participantsSnap = await getDocs(collection(db,"tournaments",tournamentId,"participants"));
    const participants = participantsSnap.docs.map(doc=>({id:doc.id, ...doc.data()}));
    participants.sort(()=>Math.random()-0.5); // Mélange aléatoire

    const matchesRef = collection(db,"tournaments",tournamentId,"matches");
    for(let i=0; i<participants.length; i+=2){
        if(i+1 < participants.length){
            await addDoc(matchesRef,{
                player1Id: participants[i].playerId,
                player2Id: participants[i+1].playerId,
                score1: 0,
                score2: 0,
                winnerId: null
            });
        } else {
            await addDoc(matchesRef,{
                player1Id: participants[i].playerId,
                player2Id: null,
                score1: 0,
                score2: 0,
                winnerId: participants[i].playerId
            });
        }
    }
}

// ================= LOAD TOURNAMENTS =================
async function loadTournaments(){

    const div=document.getElementById("adminTournaments");
    div.innerHTML="";

    const snapshot=await getDocs(tournamentsRef);

    snapshot.forEach(async (docSnap)=>{
        const t=docSnap.data();
        const tournamentId=docSnap.id;

        const participantsRef = collection(db,"tournaments",tournamentId,"participants");
        const participantsSnap = await getDocs(participantsRef);

        let participantsHTML = "";
        if(participantsSnap.empty){
            participantsHTML = "<p>Aucun participant</p>";
        }else{
            participantsSnap.forEach((pDoc,index)=>{
                const p = pDoc.data();
                participantsHTML += `
                    <div style="display:flex;justify-content:space-between;padding:4px 0;">
                        <span>${index+1}. ${p.name} (${p.points} pts)</span>
                        <button onclick="removeParticipant('${tournamentId}','${pDoc.id}')">❌</button>
                    </div>
                `;
            });
        }

        div.innerHTML += `
        <div class="player" style="flex-direction:column;align-items:flex-start;margin-bottom:25px;">
            <h3>${t.title}</h3>
            <small>Date : ${t.date}</small>
            <p>Mode : ${t.mode || "N/A"}</p>
            <p>Cashprize : ${t.prize || "N/A"}</p>
            <p>Status : ${t.status}</p>
            <p>Participants : ${participantsSnap.size}/${t.maxPlayers}</p>

            <div style="margin:10px 0;">
                <button onclick="toggleStatus('${tournamentId}','${t.status}')">Ouvrir / Fermer</button>
                <button onclick="finishTournamentPro('${tournamentId}')">🏁 Terminer</button>
                <button onclick="loadMatches('${tournamentId}')">Voir Matchs</button>
            </div>

            <div style="border-top:1px solid #00f2ff;padding-top:10px;">
                <strong>Participants :</strong>
                ${participantsHTML}
            </div>
        </div>
        `;
    });
}

// ================= REMOVE PARTICIPANT =================
window.removeParticipant = async function(tournamentId, participantId){
    await deleteDoc(doc(db,"tournaments",tournamentId,"participants",participantId));
    loadTournaments();
};

// ================= TOGGLE STATUS =================
window.toggleStatus = async function(id,currentStatus){
    let newStatus = currentStatus === "open" ? "closed" : "open";
    await updateDoc(doc(db,"tournaments",id),{status:newStatus});
    loadTournaments();
};

// ================= LOAD MATCHES =================
async function loadMatches(tournamentId){
    const matchesDiv = document.getElementById("matchesList");
    matchesDiv.innerHTML = `<h3>Matchs du tournoi</h3>`;
    const matchesSnap = await getDocs(collection(db,"tournaments",tournamentId,"matches"));

    matchesSnap.forEach(docSnap=>{
        const m = docSnap.data();
        matchesDiv.innerHTML += `
        <div class="player" style="flex-direction:column;margin-bottom:10px;">
            <span>Match: ${m.player1Id} vs ${m.player2Id || "bye"}</span>
            <input type="number" placeholder="Score ${m.player1Id}" id="score1-${docSnap.id}">
            <input type="number" placeholder="Score ${m.player2Id}" id="score2-${docSnap.id}">
            <button onclick="updateMatch('${tournamentId}','${docSnap.id}')">Valider</button>
        </div>
        `;
    });
}

// ================= UPDATE MATCH =================
window.updateMatch = async function(tournamentId, matchId){
    const s1 = parseInt(document.getElementById(`score1-${matchId}`).value);
    const s2 = parseInt(document.getElementById(`score2-${matchId}`).value);

    const matchRef = doc(db,"tournaments",tournamentId,"matches",matchId);
    let winnerId = null;
    const mData = (await getDoc(matchRef)).data();
    if(s1>s2) winnerId = mData.player1Id;
    else if(s2>s1) winnerId = mData.player2Id;

    await updateDoc(matchRef,{score1: s1, score2: s2, winnerId});
};

// ================= FINISH TOURNAMENT PRO =================
async function finishTournamentPro(tournamentId){
    const participantsSnap = await getDocs(collection(db,"tournaments",tournamentId,"participants"));
    if(participantsSnap.empty){ alert("Aucun participant"); return; }

    let ranking = [...participantsSnap.docs].map(doc=>({id: doc.id, ...doc.data()}));
    ranking.sort((a,b)=> b.points - a.points);

    const pointsDistribution = [100,50,25];

    for(let i=0;i<ranking.length;i++){
        const pRef = doc(db,"players",ranking[i].playerId);
        await updateDoc(pRef,{
            points: ranking[i].points + (pointsDistribution[i] || 0),
            wins: i===0 ? 1 : 0
        });
    }

    await updateDoc(doc(db,"tournaments",tournamentId),{status:"finished"});
    alert("Tournoi terminé et points attribués !");
    loadTournaments();
}