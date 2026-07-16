const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelector('.menu-btn')?.addEventListener('click', () => {
  const nav = document.querySelector('.site-header nav');
  const opened = nav.style.display === 'flex';
  nav.style.display = opened ? 'none' : 'flex';
  if (!opened) {
    Object.assign(nav.style, {
      position: 'absolute', top: '70px', left: '0', right: '0',
      background: '#fbfaf7', padding: '24px', flexDirection: 'column',
      borderBottom: '1px solid rgba(38,38,43,.12)'
    });
  }
});
