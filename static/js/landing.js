// Navbar scroll shadow effect
window.addEventListener('scroll', () => {
const navbar = document.getElementById('navbar');
if (window.scrollY > 20) {
navbar.classList.add('shadow-lg');
} else {
navbar.classList.remove('shadow-lg');
}
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', (e) => {
e.preventDefault();
const target = document.querySelector(anchor.getAttribute('href'));
if (target) {
target.scrollIntoView({ behavior: 'smooth' });
}
});
});