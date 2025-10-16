import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { firebaseConfig } from '../Firebase-Config/FirebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

let allProducts = [];
const sectorPages = {
  0: "1stDial.html",
  2: "2ndDial.html",
  3: "3rdDial.html",
  4: "4thDial.html",
  5: "5thDial.html",
  6: "6thDial.html",
  7: "7thDial.html",
  8: "8thDial.html",
  9: "9thDial.html",
  10: "10thDial.html"
};

const sectorList = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10];

sectorList.forEach(sector => {
  onValue(ref(db, `products/sector${sector}`), snapshot => {
    if (!snapshot.exists()) return;
    snapshot.forEach(childSnap => {
      const product = childSnap.val();
      product.id = childSnap.key;
      product.sector = sector;
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          allProducts.push({
            name: product.name || "Unknown",
            tag: tag,
            sector: sector
          });
        });
      }
    });
  });
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();
  suggestions.innerHTML = '';
  if (query === '') return;

  const matchedTags = [];
  allProducts.forEach(item => {
    if (item.tag.toLowerCase().startsWith(query) && 
        !matchedTags.some(t => t.tag === item.tag)) {
      matchedTags.push({ tag: item.tag, sector: item.sector });
    }
  });

  matchedTags.forEach(t => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `<i class="fa fa-box"></i> ${t.tag}`;
    div.addEventListener('click', () => {
      localStorage.setItem('selectedProduct', JSON.stringify({
        sector: t.sector,
        tag: t.tag
      }));
      window.location.href = sectorPages[t.sector] || "index.html";
    });
    suggestions.appendChild(div);
  });
});