window.register = async function(id){

    const playerName = prompt("Nom EXACT du joueur inscrit ?");
    if(!playerName) return;

    const snapshot = await getDocs(playersRef);

    let foundPlayer = null;

    snapshot.forEach(doc=>{
        const dbName = doc.data().name.trim().toLowerCase();
        const inputName = playerName.trim().toLowerCase();

        if(dbName === inputName){
            foundPlayer = {id:doc.id,...doc.data()};
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