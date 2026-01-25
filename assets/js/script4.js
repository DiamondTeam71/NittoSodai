import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { firebaseConfig } from '../Firebase-Config/FirebaseConfig.js';
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
 
       document.getElementById('currentUser').textContent = `লগইন ইউজার: ${user.email}`;
  } else {
  
    window.location.href = "LogAd.html";
  }
});

const paymentFieldsContainer = document.getElementById('payment-fields');
const addPaymentBtn = document.getElementById('add-payment-method');
const saveNumbersBtn = document.getElementById('save-numbers');
let paymentMethods = {};
const paymentRef = ref(db,'paymentNumbers/');


get(paymentRef).then(snapshot=>{
  paymentMethods = snapshot.val() || {};
  renderPaymentFields();
});

const clickSound = new Audio('/Click.mp3');
const orderSound = new Audio('/Order.mp3');

document.addEventListener('click', () => {
  clickSound.currentTime = 0;
  clickSound.play();
});



function renderPaymentFields(){
  paymentFieldsContainer.innerHTML='';
  Object.entries(paymentMethods).forEach(([method,number])=>{
    const wrapper=document.createElement('div');
    wrapper.className='payment-wrapper';
    const icon=document.createElement('img');
    icon.src=method.toLowerCase().includes("bkash")?"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJrFRWimQSqxvv3_uKtZyG2plz7YuER6Bx__KibaWItg&s=10":
              method.toLowerCase().includes("nagad")?"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ1kq9_6GpY3anEMuEoGRstF5dbWZp86KNNf9XaYu4Sw&s=10":
              method.toLowerCase().includes("rocket")?"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0rXsngDTKkHw48pqQEp87Iwjs_kUVbm460bihKuyi0Q&s":
              "https://nittosodaibd.netlify.app/assets/images/logo.png";
    const input=document.createElement('input');
    input.type='text';input.value=number;input.dataset.method=method;
    input.placeholder=method.charAt(0).toUpperCase()+method.slice(1)+' Number';
    const delBtn=document.createElement('button');
    delBtn.className='delete-btn';delBtn.innerHTML='<i class="fas fa-trash"></i>';
    delBtn.addEventListener('click',()=>{
      if(confirm(`"${method}" মুছতে চান?`)){
        delete paymentMethods[method];
        set(paymentRef,paymentMethods).then(()=>renderPaymentFields());
      }
    });
    wrapper.appendChild(icon);
    wrapper.appendChild(input);
    wrapper.appendChild(delBtn);
    paymentFieldsContainer.appendChild(wrapper);
  });
}

addPaymentBtn.addEventListener('click',()=>{
  const method=prompt('Enter payment method name (e.g., bkash, nagad, rocket):');
  if(!method)return;
  if(paymentMethods[method]){alert('Already exists!');return;}
  paymentMethods[method]='';renderPaymentFields();
});

saveNumbersBtn.addEventListener('click',()=>{
  const inputs=paymentFieldsContainer.querySelectorAll('input');
  inputs.forEach(i=>{paymentMethods[i.dataset.method]=i.value;});
  set(paymentRef,paymentMethods).then(()=>alert('Updated ✅'));
});


const ordersListEl=document.getElementById('orders-list');
const orderSearch=document.getElementById('order-search');
let ordersData={};

const ordersRef=ref(db,'orders/');
onValue(ordersRef,snap=>{
  ordersData=snap.val()||{};
  renderOrders(Object.entries(ordersData));
});

function renderOrders(orders){
  ordersListEl.innerHTML='';
  orders.sort((a,b)=>new Date(b[1].timestamp)-new Date(a[1].timestamp));
  orders.forEach(([key,order])=>{
    const orderId=order.orderId||'#N/A';
    const delivery=Number(order.delivery)||0;
    const total=(Number(order.total)||0)+delivery;
    const name=order.name||'Unknown';
    const mobile=order.mobile||'N/A';
    const address=order.address||'N/A';
    const passion=order.passion||'N/A';
    const paymentMethod=order.accountType||'Wait For Payment';
    const paymentNumber=order.accountNumber||'N/A';
    const approved=order.approved||'pending';

    let itemsHTML='';
    (order.cart||[]).forEach(item=>{
      const price=Number(item.price)||0;
      const qty=Number(item.qty)||1;
      const discountPercent=Number(item.discountPercent)||0;
      const discountAmount=Number(item.discountAmount)||0;
      let finalPrice=price;
      if(discountPercent>0){
        finalPrice=Math.round(price-(price*discountPercent/100));
      }else if(discountAmount>0){
        finalPrice=price-discountAmount;
      }
      itemsHTML+=`
        <div class="order-item">
          <img src="${item.media||'https://via.placeholder.com/150'}">
          <div><p>${item.name||'Unnamed'}</p><p>৳${finalPrice} x ${qty}</p></div>
        </div>`;
    });

    const card=document.createElement('div');
    card.className=`order-card status-${approved}`;
    card.innerHTML=`
      <div class="order-header">
        <h3>${orderId} | ৳${total} 
          <i class="fas fa-copy copy-btn" title="Copy ID"></i>
        </h3>
        <div class="order-actions">
          <button class="approve" title="Approve"><i class="fas fa-check text-green"></i></button>
          <button class="disapprove" title="Disapprove"><i class="fas fa-times text-red"></i></button>
          <button class="delete" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="order-items">${itemsHTML}</div>
      <div class="order-footer">
        <p><strong>নাম:</strong> ${name}</p>
        <p><strong>পেশা:</strong> ${passion}</p>
        <p><strong>ঠিকানা:</strong> ${address}</p>
        <p><strong>মোবাইল:</strong> ${mobile}</p>
        <p><strong>Payment Type:</strong> ${paymentMethod}</p>
        <p><strong>Payment Number:</strong> ${paymentNumber}</p>
        <p><strong>Delivery:</strong> ৳${delivery}</p>
        <p><strong>Total:</strong> ৳${total}</p>
        <p><strong>Status:</strong> ${approved}</p>
      </div>`;

    card.querySelector('.approve').addEventListener('click',()=>{
      update(ref(db,'orders/'+key),{approved:'approved'});
    });
    card.querySelector('.disapprove').addEventListener('click',()=>{
      update(ref(db,'orders/'+key),{approved:'disapproved'});
    });
    card.querySelector('.delete').addEventListener('click',()=>{
      if(confirm('Delete this order?')) remove(ref(db,'orders/'+key));
    });
    card.querySelector('.copy-btn').addEventListener('click',()=>{
      navigator.clipboard.writeText(orderId);
      alert("Order ID copied ✅");
    });
    ordersListEl.appendChild(card);
  });
}


orderSearch.addEventListener('input',()=>{
  const q=orderSearch.value.toLowerCase();
  const filtered=Object.entries(ordersData).filter(([k,o])=>(o.orderId||'').toLowerCase().includes(q));
  renderOrders(filtered);
});


document.querySelectorAll('.sort-buttons button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const type=btn.dataset.sort;
    let arr=Object.entries(ordersData);
    if(type==="newest")arr.sort((a,b)=>new Date(b[1].timestamp)-new Date(a[1].timestamp));
    if(type==="oldest")arr.sort((a,b)=>new Date(a[1].timestamp)-new Date(b[1].timestamp));
    if(type==="pending")arr=arr.filter(([k,o])=>o.approved==="pending"||!o.approved);
    if(type==="approved")arr=arr.filter(([k,o])=>o.approved==="approved");
    renderOrders(arr);
  });
});



const noticeEl = document.createElement('div');
noticeEl.style.position = 'fixed';
noticeEl.style.bottom = '20px';
noticeEl.style.right = '20px';
noticeEl.style.background = 'rgba(0,0,0,0.85)';
noticeEl.style.color = 'white';
noticeEl.style.padding = '15px 25px';
noticeEl.style.borderRadius = '48px';

noticeEl.style.display = 'none';
noticeEl.style.zIndex = '9999';
noticeEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
document.body.appendChild(noticeEl);

let prevPendingCount = 0;


onValue(ordersRef, snap => {
  const orders = snap.val() || {};
  ordersData = orders;

  
  const pendingOrders = Object.values(orders).filter(o => o.approved === "pending" || !o.approved);
  const currentPendingCount = pendingOrders.length;

 
  if(currentPendingCount > prevPendingCount){
    const newPending = currentPendingCount - prevPendingCount;
    noticeEl.textContent = `পেন্ডিং অর্ডার এসেছে: ${newPending} টি`; 
    noticeEl.style.display = 'block';
    orderSound.currentTime = 0;
    orderSound.play();

    setTimeout(() => { noticeEl.style.display = 'none'; }, 5000); 
  }

  prevPendingCount = currentPendingCount;
  renderOrders(Object.entries(ordersData));
});