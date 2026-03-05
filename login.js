import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHLFJroGx5EX9-M8Ps14eC0z3OZI_eZg8",
  authDomain: "nathan-trn.firebaseapp.com",
  projectId: "nathan-trn",
  storageBucket: "nathan-trn.firebasestorage.app",
  messagingSenderId: "24707035797",
  appId: "1:24707035797:web:34aef38b6cc8d76c17a19c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Remplis tous les champs !");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Erreur connexion : " + error.message);
    }
});

// Redirection si déjà connecté
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "index.html"; // vers la page principale
    }
});