import { firebaseConfig } from '../Firebase-Config/FirebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, get, remove, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

const tableBody = document.querySelector('#productsTable tbody');
const sectorSelect = document.getElementById('sectorSelect');
let currentSector = '';

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "AdminLogin.html";
    return;
  }

  try {
    const snapshot = await get(ref(db, 'users/' + user.uid));
    const userData = snapshot.val();
    
    if (!userData?.isAdmin) {
      alert("Access denied! আপনি admin নন।");
      await signOut(auth);
      window.location.href = "AdminLogin.html";
      return;
    }

   
    const userDisplay = userData.username || user.email;
    document.getElementById('currentUser').textContent = `লগইন ইউজার: ${userDisplay}`;

  } catch(err) {
    console.error(err);
    window.location.href = "AdminLogin.html";
  }
});


document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "AdminLogin.html";
});

sectorSelect.addEventListener('change', () => {
  currentSector = sectorSelect.value;
  loadSectorProducts(currentSector);
});



function loadSectorProducts(sector){
  tableBody.innerHTML = '';
  if(!sector) return;

  const sectorRef = ref(db, 'products/' + sector);
  get(sectorRef).then(snapshot => {
    snapshot.forEach(child => {
      const key = child.key;
      const data = child.val();
      const tr = createRow(key, data);
      tableBody.appendChild(tr);
    });
    updateRowCount();
  });
}


function createRow(key, data){
  const tr = document.createElement('tr');
  tr.dataset.key = key;
  tr.innerHTML = `
    <td contenteditable class="name">${data.name||''}</td>
    <td contenteditable class="mainContent">${data.popupContent||''}</td>
    <td contenteditable class="brand">${data.brand||''}</td>
    <td contenteditable class="weight">${data.weight||''}</td>
    <td contenteditable class="price">${data.price||0}</td>
    <td contenteditable class="discount-percent">${data.discountPercent||''}</td>
    <td class="discount-amt" contenteditable>${data.discountAmount||''}</td>
    <td class="final-price">${data.finalPrice||0}</td>
    <td contenteditable class="tags">${(data.tags||[]).join(', ')}</td>
    <td class="media-cell">
      <input type="text" class="media-link" placeholder="মিডিয়া URL" value="${data.media||''}">
      <div class="media-preview">${data.media ? `<img src="${data.media.startsWith('http') ? data.media : `https://nittosodai71.netlify.app/assets/images/${data.media}` }">` : ''}</div>
    </td>
    <td>
  <button class="icon-btn" onclick="copyRow(this)">কপি</button>
      <button class="icon-btn" onclick="duplicateRow(this)">ডুপ্লিকেট</button>
      <button class="icon-btn" onclick="deleteRow(this)">মুছুন</button>
    </td>
  `;
  updateDiscountState(tr);

  let timer;
  function schedule(){
    clearTimeout(timer);
    timer = setTimeout(()=>updateRowInFirebase(currentSector,key,tr),600);
  }

  tr.querySelectorAll('td[contenteditable]').forEach(td=>{
    td.addEventListener('input', ()=>{
      updateDiscountState(tr);
      schedule();
    });
  });

  const mediaInput = tr.querySelector('.media-link');
  const mediaPreview = tr.querySelector('.media-preview');

  mediaInput.addEventListener('blur', ()=>{
    let fileName = mediaInput.value.trim();
    if(fileName){
      const url = fileName.startsWith('http') ? fileName : `https://nittosodai71.netlify.app/assets/images/${fileName}`;
      mediaPreview.innerHTML = `<img src="${url}">`;
      schedule();
    } else {
      mediaPreview.innerHTML = '';
      schedule();
    }
  });

  return tr;
}

function updateDiscountState(tr){
  const price = parseFloat(tr.querySelector('.price').textContent) || 0;
  const percentCell = tr.querySelector('.discount-percent');
  const amountCell = tr.querySelector('.discount-amt');
  const percent = parseFloat(percentCell.textContent) || 0;

  if(percent > 0){
    amountCell.textContent = '';
    amountCell.removeAttribute('contenteditable');
    amountCell.style.opacity = '0.5';
    amountCell.style.pointerEvents = 'none';
    tr.querySelector('.final-price').textContent = (price - (price * percent / 100)).toFixed(2);
  }else{
    amountCell.setAttribute('contenteditable','true');
    amountCell.style.opacity = '1';
    amountCell.style.pointerEvents = 'auto';
    const amt = parseFloat(amountCell.textContent) || 0;
    tr.querySelector('.final-price').textContent = (price - amt).toFixed(2);
  }
}


function updateRowCount(){
  document.getElementById('rowCount').textContent = tableBody.querySelectorAll('tr').length;
}


function updateRowInFirebase(sector,key,tr){
  if(!sector) return;
  const data = {
    name: tr.querySelector('.name').textContent.trim(),
    popupContent: tr.querySelector('.mainContent').textContent.trim(),
    brand: tr.querySelector('.brand').textContent.trim(),
    weight: tr.querySelector('.weight').textContent.trim(),
    price: parseFloat(tr.querySelector('.price').textContent) || 0,
    discountPercent: parseFloat(tr.querySelector('.discount-percent').textContent) || 0,
    discountAmount: tr.querySelector('.discount-amt').textContent.trim()===''?0:parseFloat(tr.querySelector('.discount-amt').textContent) || 0,
    finalPrice: parseFloat(tr.querySelector('.final-price').textContent) || 0,
    tags: tr.querySelector('.tags').textContent.split(',').map(t=>t.trim()).filter(Boolean),
    media: tr.querySelector('.media-link').value.trim()
  };
  update(ref(db,'products/'+sector+'/'+key), data);
}


window.deleteRow = function(btn){
  const tr = btn.closest('tr');
  const key = tr.dataset.key;
  if(confirm("এই সারিটি মুছে ফেলবেন?")){
    remove(ref(db,'products/'+currentSector+'/'+key)).then(()=>{
      tr.remove();
      updateRowCount();
    });
  }
}


window.duplicateRow = function(btn){
  const tr = btn.closest('tr');
  const data = {
    name: tr.querySelector('.name').textContent.trim(),
    popupContent: tr.querySelector('.mainContent').textContent.trim(),
    brand: tr.querySelector('.brand').textContent.trim(),
    weight: tr.querySelector('.weight').textContent.trim(),
    price: parseFloat(tr.querySelector('.price').textContent) || 0,
    discountPercent: parseFloat(tr.querySelector('.discount-percent').textContent) || 0,
    discountAmount: parseFloat(tr.querySelector('.discount-amt').textContent) || 0,
    finalPrice: parseFloat(tr.querySelector('.final-price').textContent) || 0,
    tags: tr.querySelector('.tags').textContent.split(',').map(t=>t.trim()).filter(Boolean),
    media: tr.querySelector('.media-link').value.trim()
  };
  push(ref(db,'products/'+currentSector), data).then(s=>{
    const newTr = createRow(s.key, data);
    tableBody.appendChild(newTr);
    updateRowCount();
  });
}


document.getElementById('addRow').addEventListener('click', ()=>{
  if(!currentSector) return alert("প্রথমে সেক্টর নির্বাচন করুন!");
  const data = {name:'নতুন পণ্য',popupContent:'',brand:'',weight:'',price:0,discountPercent:'',discountAmount:'',finalPrice:0,tags:[],media:''};
  push(ref(db,'products/'+currentSector), data).then(s=>{
    const tr = createRow(s.key,data);
    tableBody.appendChild(tr);
    updateRowCount();
    tr.scrollIntoView({behavior:'smooth',block:'end'});
  });
});


document.getElementById('search').addEventListener('input', e=>{
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#productsTable tbody tr').forEach(tr=>{
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});


document.getElementById('tagFilter').addEventListener('input', e=>{
  const filters = e.target.value.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean);
  document.querySelectorAll('#productsTable tbody tr').forEach(tr=>{
    const tags = tr.querySelector('.tags').textContent.toLowerCase().split(',').map(t=>t.trim());
    tr.style.display = filters.every(f=>tags.includes(f)) ? '' : 'none';
  });
});

document.getElementById('exportCSV').addEventListener('click', ()=>{
  const rows = [['পণ্যের নাম','মূল বিষয়বস্তু','ব্র্যান্ড','ওজন','দাম','ডিসকাউন্ট %','ডিসকাউন্ট ৳','ফাইনাল প্রাইস','ট্যাগস','মিডিয়া']];
  document.querySelectorAll('#productsTable tbody tr').forEach(tr=>{
    const cells = [
      tr.querySelector('.name').textContent,
      tr.querySelector('.mainContent').textContent,
      tr.querySelector('.brand').textContent,
      tr.querySelector('.weight').textContent,
      tr.querySelector('.price').textContent,
      tr.querySelector('.discount-percent').textContent,
      tr.querySelector('.discount-amt').textContent,
      tr.querySelector('.final-price').textContent,
      tr.querySelector('.tags').textContent,
      tr.querySelector('.media-link').value.trim()
    ].map(c=>`"${c.replace(/"/g,'""')}"`);
    rows.push(cells);
  });
  const csv = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'products.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById('deleteSector').addEventListener('click', ()=>{
  if(!currentSector) return alert("প্রথমে সেক্টর নির্বাচন করুন!");
  if(confirm("আপনি কি নিশ্চিত এই সেক্টরের সব পণ্য মুছে ফেলতে চান?")){
    remove(ref(db,'products/'+currentSector)).then(()=>{
      tableBody.innerHTML='';
      updateRowCount();
      alert("✅ সেক্টরের সব পণ্য মুছে ফেলা হয়েছে!");
    });
  }
});

window.copyRow = function(btn){
    const tr = btn.closest('tr'); 
    if(!tr) return;

    const name = tr.querySelector('.name')?.textContent.trim() || '';
    const brand = tr.querySelector('.brand')?.textContent.trim() || '';
    const weight = tr.querySelector('.weight')?.textContent.trim() || '';

    const textToCopy = `${name} ${brand} ${weight}`; 
    navigator.clipboard.writeText(textToCopy)
        .then(()=>{
            alert('কপি হয়েছে: ' + textToCopy);
        })
        .catch(err=>{
            console.error('কপি ব্যর্থ হয়েছে:', err);
        });
}
