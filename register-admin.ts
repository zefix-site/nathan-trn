import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

document.getElementById("createAdminBtn")
.addEventListener("click", async ()=>{

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    const status = document.getElementById("status");

    if(!email || !password){
        status.textContent="Remplis tous les champs";
        return;
    }

    try{

        const userCredential = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;

        // On crée le document admin
        await setDoc(doc(db,"admins",user.uid),{
            email: email,
            role: "admin",
            createdAt: new Date()
        });

        status.textContent="✅ Compte admin créé avec succès !";

    }catch(error){
        status.textContent="❌ Erreur : " + error.message;
    }

});