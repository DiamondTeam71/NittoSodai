import { firebaseConfig } from '../Firebase-Config/FirebaseConfig.js';  
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";  
import { getDatabase, ref, push, get, remove, update, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";  
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
  
  
document.getElementById('logoutBtn').addEventListener('click', () => {  
  signOut(auth)  
    .then(() => {  
      alert("আপনি সফলভাবে লগআউট হয়েছেন।");  
      window.location.href = "LogAd.html";  
    })  
    .catch((error) => {  
      console.error("লগআউট ব্যর্থ:", error);  
      alert("লগআউট করতে সমস্যা হয়েছে।");  
    });  
});  
const tableBody = document.querySelector('#productsTable tbody');  
const sectorSelect = document.getElementById('sectorSelect');  
let currentSector = '';  
  
  
sectorSelect.addEventListener('change', () => {  
  currentSector = sectorSelect.value;  
  loadSectorProducts(currentSector);  
});  
  
  
  
function loadSectorProducts(sector){  
  tableBody.innerHTML = '';  
  if(!sector) return;  
  
  const sectorRef = ref(db, 'products/' + sector);  
  
  onValue(sectorRef, snapshot => {  
    tableBody.innerHTML = '';  
    snapshot.forEach(child => {  
      const key = child.key;  
      const data = child.val();  
      const tr = createRow(key, data, sector);  
      tableBody.appendChild(tr);  
    });  
    updateRowCount();  
  });  
}  
  
  
function createRow(key, data, sector){  
  const tr = document.createElement('tr');  
  tr.dataset.key = key;  
  
  const stockStatus = data.stock !== undefined ? data.stock : true;  
  
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
  <input type="text" class="media-link" value="${data.media||''}">  
  <div class="media-preview">${data.media ? `<img src="${data.media.startsWith('http') ? data.media : `https://nittosodai71.netlify.app/assets/images/${data.media}` }">` : ''}</div>  
</td>  
<td>  
  <button class="stock-btn">${stockStatus ? 'স্টক ইন' : 'স্টক আউট'}</button>  
  <button class="icon-btn" onclick="copyRow(this)">কপি</button>  
  <button class="icon-btn" onclick="duplicateRow(this)">ডুপ্লিকেট</button>  
  <button class="icon-btn" onclick="deleteRow(this)">মুছুন</button>  
</td>  
`;  
  
  updateDiscountState(tr);  
  
  const stockBtn = tr.querySelector('.stock-btn');  
  stockBtn.addEventListener('click', () => {  
    const newStock = !data.stock;  
    const newData = { ...data, stock: newStock };  
    update(ref(db, 'products/' + sector + '/' + key), { stock: newStock })  
      .then(() => {  
        data.stock = newStock;  
        stockBtn.textContent = newStock ? 'স্টক ইন' : 'স্টক আউট';  
      });  
  });  
  
  let timer;  
  function schedule(){  
    clearTimeout(timer);  
    timer = setTimeout(()=>updateRowInFirebase(sector, key, tr),600);  
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
    let url = '';  
  
    // যদি data URL হয়  
    if(fileName.startsWith('data:')) {  
      url = fileName;  
    }  
    // যদি http বা https URL হয়  
    else if(fileName.startsWith('http://') || fileName.startsWith('https://')) {  
      url = fileName;  
    }  
    // অন্যথায় সার্ভার ইমেজ ধরে নাও  
    else {  
      url = `https://nittosodai71.netlify.app/assets/images/${fileName}`;  
    }  
  
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
  
  
function updateRowInFirebase(sector, key, tr){  
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
  if(confirm("আপনি কি নিশ্চিত এই সারিটি মুছে ফেলতে চান?")){  
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
    media: tr.querySelector('.media-link').value.trim(),  
    stock: tr.querySelector('.stock-btn').textContent === 'স্টক ইন'  
  };  
  push(ref(db,'products/'+currentSector), data).then(s=>{  
    const newTr = createRow(s.key, data, currentSector);  
    tableBody.appendChild(newTr);  
    updateRowCount();  
  });  
}  
  
document.getElementById('addRow').addEventListener('click', ()=>{  
  if(!currentSector) return alert("প্রথমে সেক্টর নির্বাচন করুন!");  
  const data = {  
  name:'নতুন পণ্য',  
  popupContent:'',  
  brand:'',  
  weight:'',  
  price:0,  
  discountPercent:'',  
  discountAmount:'',  
  finalPrice:0,  
  tags:[],  
  media:'',  
  stock: true   
};    
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

document.getElementById('exportProducts').addEventListener('click', () => {
  if (!currentSector) return alert("প্রথমে সেক্টর নির্বাচন করুন!");

  const ws_data = [['পণ্যের নাম','মূল বিষয়বস্তু','ব্র্যান্ড','ওজন','দাম','ডিসকাউন্ট %','ডিসকাউন্ট ৳','ফাইনাল প্রাইস','ট্যাগস','মিডিয়া']];
  
  document.querySelectorAll('#productsTable tbody tr').forEach(tr => {
    ws_data.push([
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
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, `products_${currentSector}.xlsx`);
});


const importInput = document.getElementById('importFile');

document.getElementById('decodeProducts').addEventListener('click', () => {
  if(!currentSector) return alert("প্রথমে সেক্টর নির্বাচন করুন!");
  importInput.click();
});

importInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    let jsonData = XLSX.utils.sheet_to_json(worksheet, { header:1 });

    // খালি সারি ফিল্টার
    jsonData = jsonData.filter(row => row.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== ''));

    if(jsonData.length === 0) return alert("এক্সেল ফাইলে কোনো ডাটা নেই!");

    const headers = jsonData.shift(); // প্রথম লাইন হেডার

    for(const row of jsonData){
      const dataObj = {};
      headers.forEach((h,i)=>{
        const value = row[i] || '';
        if(['দাম','ডিসকাউন্ট %','ডিসকাউন্ট ৳','ফাইনাল প্রাইস'].includes(h)){
          dataObj[h] = parseFloat(value) || 0;
        } else if(h==='ট্যাগস'){
          dataObj[h] = value ? value.split(',').map(t=>t.trim()) : [];
        } else if(h==='মিডিয়া'){
          dataObj.media = value;
        } else {
          dataObj[h] = value;
        }
      });

      await push(ref(db,'products/'+currentSector), {
        name: dataObj['পণ্যের নাম']||'',
        popupContent: dataObj['মূল বিষয়বস্তু']||'',
        brand: dataObj['ব্র্যান্ড']||'',
        weight: dataObj['ওজন']||'',
        price: dataObj['দাম']||0,
        discountPercent: dataObj['ডিসকাউন্ট %']||0,
        discountAmount: dataObj['ডিসকাউন্ট ৳']||0,
        finalPrice: dataObj['ফাইনাল প্রাইস']||0,
        tags: dataObj['ট্যাগস']||[],
        media: dataObj['মিডিয়া']||'',
        stock: true
      });
    }

    loadSectorProducts(currentSector);
    alert('✅ সব পণ্য এক্সেল থেকে আপলোড হয়েছে!');
  };

  reader.readAsArrayBuffer(file);
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
