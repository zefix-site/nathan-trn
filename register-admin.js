import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

document.getElementById("createAdminBtn").addEventListener("click", async ()=>{

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if(!email || !password){
        alert("Remplis tous les champs");
        return;
    }

    try{

        const userCredential = await createUserWithEmailAndPassword(auth,email,password);

        const uid = userCredential.user.uid;

        await setDoc(doc(db,"admins",uid),{
            email:email,
            role:"admin",
            createdAt:new Date()
        });

        document.getElementById("status").innerText = "✅ Admin créé avec succès";

    }catch(e){
        console.error(e);
        alert("Erreur : "+e.message);
    }

});