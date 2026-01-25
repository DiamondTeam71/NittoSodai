import { firebaseConfig } from '../Firebase-Config/FirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Show / Hide Forms
window.showRegister = ()=> {
  document.getElementById('loginForm').style.display='none';
  
}
window.showLogin = ()=> {
    document.getElementById('loginForm').style.display='block';
}

// Toggle Password
window.togglePassword = (icon,id)=>{
  const input = document.getElementById(id);
  if(input.type==="password"){ input.type="text"; icon.classList.replace("fa-eye","fa-eye-slash"); }
  else{ input.type="password"; icon.classList.replace("fa-eye-slash","fa-eye"); }
}


// Login
document.getElementById('loginBtn').addEventListener('click', async()=>{
  const loginInput = document.getElementById('loginInput').value.trim();
  const password = document.getElementById('loginPassword').value;
  if(!loginInput || !password){ alert('সব ফিল্ড পূরণ করুন'); return; }

  try{
    let email = loginInput;
    if(!loginInput.includes('@')){ // username
      const snapshot = await get(child(ref(db), 'users'));
      const users = snapshot.val() || {};
      let found=false;
      for(let uid in users){
        if(users[uid].name.toLowerCase()===loginInput.toLowerCase()){
          email = users[uid].email; found=true; break;
        }
      }
      if(!found){ alert('ইউজার নেই'); return; }
    }
    await signInWithEmailAndPassword(auth,email,password);
    alert('লগইন সফল!');
  }catch(err){ alert(err.message); }
});

// Forgot Password
window.openForgotPasswordPopup = ()=> document.getElementById('forgotPasswordPopup').style.display='flex';
window.closeForgotPasswordPopup = ()=> document.getElementById('forgotPasswordPopup').style.display='none';

window.submitForgotPassword = async()=>{
  const email = document.getElementById('forgotEmail').value.trim();
  if(!email){ alert('ইমেইল দিন'); return; }
  try{
    await sendPasswordResetEmail(auth,email);
    alert('পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে '+email);
    closeForgotPasswordPopup();
  }catch(err){ alert(err.message); }
}