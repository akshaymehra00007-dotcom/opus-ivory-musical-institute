document.body.classList.add('loading');

const loader = document.getElementById('loader');
const header = document.getElementById('header');
const progress = document.getElementById('scrollProgress');
const glow = document.getElementById('cursorGlow');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('is-hidden');
    document.body.classList.remove('loading');
  }, reduceMotion ? 100 : 1650);
});

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  header.classList.toggle('scrolled', scrollY > 24);
  const score = document.querySelector('.hero__score');
  if (score && !reduceMotion) score.style.transform = `translate3d(${scrollY * .06}px, ${scrollY * .09}px, 0)`;
};
addEventListener('scroll', updateScroll, {passive:true});
updateScroll();

if (!reduceMotion) {
  addEventListener('pointermove', e => {
    glow.style.transform = `translate(${e.clientX - 224}px, ${e.clientY - 224}px)`;
  }, {passive:true});
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold:.12, rootMargin:'0px 0px -4%'});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const mapPanel = document.querySelector('.visit__map');
if (mapPanel) {
  const mapObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => mapPanel.classList.toggle('in-view', entry.isIntersecting));
  }, {threshold:.28});
  mapObserver.observe(mapPanel);
}

const menuButton = document.querySelector('.menu-button');
menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded','false');
}));

let audioContext;
function playNote(frequency, element) {
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  oscillator.type = 'triangle';
  oscillator.frequency.value = Number(frequency);
  filter.type = 'lowpass';
  filter.frequency.value = 1500;
  gain.gain.setValueAtTime(.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.18, audioContext.currentTime + .018);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + 1.1);
  oscillator.connect(filter).connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1.15);
  element.classList.add('active');
  setTimeout(() => element.classList.remove('active'), 170);
}
document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', e => {
    const black = e.target.closest('.black-key');
    playNote(black?.dataset.frequency || key.dataset.frequency, black || key);
  });
});

document.querySelectorAll('.programme').forEach((row, index) => {
  const frequencies = [261.63,329.63,392,493.88];
  row.addEventListener('pointerenter', () => {
    if (matchMedia('(hover:hover)').matches) playNote(frequencies[index], row);
  }, {once:true});
});

if (!reduceMotion && matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px, ${(e.clientY-r.top-r.height/2)*.12}px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });
}
document.getElementById('year').textContent = new Date().getFullYear();

const whatsappForm = document.getElementById('whatsappForm');
whatsappForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(whatsappForm);
  const name = String(data.get('name') || '').trim();
  const interest = String(data.get('interest') || 'Music classes');
  const message = String(data.get('message') || '').trim();
  const text = `Hello Sur Sangeet Academy, my name is ${name}. I am interested in ${interest}.${message ? ` ${message}` : ''}`;
  window.open(`https://wa.me/918437786555?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
