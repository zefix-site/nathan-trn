import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

document.getElementById("registerBtn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
        alert("Remplis tous les champs !");
        return;
    }

    try {
        // Crée le compte Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Ajoute le pseudo dans le profil Auth
        await updateProfile(user, { displayName: username });

        // Crée le document joueur dans Firestore
        await addDoc(collection(db, "players"), {
            uid: user.uid,
            name: username,
            email: email,
            points: 0,
            kills: 0,
            deaths: 1,
            wins: 0,
            createdAt: new Date()
        });

        alert("Compte créé avec succès !");
        window.location.href = "login.html";

    } catch (error) {
        alert("Erreur inscription : " + error.message);
    }
});