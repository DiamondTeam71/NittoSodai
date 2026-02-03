import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from '../Firebase-Config/FirebaseConfig.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let selectedRating = 0;

const userName = document.getElementById('userName');
const userReview = document.getElementById('userReview');
const reviewsList = document.getElementById('reviewsList');

document.querySelectorAll('.star-rating i').forEach(star => {
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.getAttribute('data-value'));
    document.querySelectorAll('.star-rating i').forEach(s => {
      s.classList.toggle('active', parseInt(s.getAttribute('data-value')) <= selectedRating);
    });
  });
});

document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = userName.value.trim();
  const review = userReview.value.trim();

  if (!selectedRating) {
    alert("স্টার রেটিং দিন");
    return;
  }

  if (name.split(' ').length < 2 || /[^a-zA-Z\sঅ-হা-য়]/.test(name)) {
    alert("নাম দুটি শব্দ এবং কোনো বিশেষ চিহ্ন ছাড়া হতে হবে");
    return;
  }

  if (review.split(' ').length < 10) {
    alert("মিনিমাম ১০টি শব্দের মতামত লিখুন");
    return;
  }

  await addDoc(collection(db, "reviews"), {
    name,
    rating: selectedRating,
    review,
    time: serverTimestamp()
  });

  e.target.reset();
  selectedRating = 0;
  document.querySelectorAll('.star-rating i').forEach(s => s.classList.remove('active'));

  loadReviews();
});

async function loadReviews() {
  reviewsList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "reviews"));
  const reviews = [];
  querySnapshot.forEach(doc => reviews.push(doc.data()));

  reviews.sort((a, b) => (b.time?.seconds || 0) - (a.time?.seconds || 0));

  reviews.forEach(d => {
    reviewsList.innerHTML += `
      <div class="review-card">
        <strong> গ্রাহকের নাম: ${d.name}</strong>
        <p><span style="color: white;"> গ্রাহকের মতামত: </span> ${d.review || ""}</p>
        <div class="stars">${"★".repeat(d.rating)}</div>
      </div>
    `;
  });
}

loadReviews();