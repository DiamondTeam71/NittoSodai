import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "../Firebase-Config/FirebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const modal = document.getElementById('custom-modal');

const imgEl = document.getElementById('modal-img');
const textEl = document.getElementById('modal-text');
const closeBtn = document.querySelector('.close-btn');

async function loadPopupAd(){
  const ref = doc(db, "popupAd", "main");
  const snap = await getDoc(ref);

  if(snap.exists()){
    const data = snap.data();

    if(data.active){
    
      
      imgEl.src = data.image;
      
      textEl.textContent = data.text;
      

      modal.classList.add('active');
    }
  }
}


setTimeout(() => {
  loadPopupAd();
}, 5000);

closeBtn.onclick = () => modal.classList.remove('active');
modal.onclick = e => {
  if(e.target === modal) modal.classList.remove('active');
};