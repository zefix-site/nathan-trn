import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCUs-Db9FS0zir4pb3RmU8_ThCuztv1p8",
  authDomain: "admin-nathan-trn.firebaseapp.com",
  projectId: "admin-nathan-trn",
  storageBucket: "admin-nathan-trn.firebasestorage.app",
  messagingSenderId: "287443505609",
  appId: "1:287443505609:web:1a02dd4a415d291c5c9818",
  measurementId: "G-QD1MY5VCRL"
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