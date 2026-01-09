const contactForm = document.getElementById('contact-form');
const messagesEl = document.getElementById('form-messages');
const submissionsEl = document.getElementById('submissions');

// stockage temporaire en mémoire 
const submissionsKey = 'portfolio_contact_messages';
let submissions = JSON.parse(localStorage.getItem(submissionsKey) || '[]');

function renderSubmissions() {
  if (!submissions.length) {
    submissionsEl.textContent = 'Aucun message enregistré.';
    return;
  }
  submissionsEl.innerHTML = submissions.map((s, i) => {
    const when = new Date(s.timestamp).toLocaleString();
    return `<div class="submission">
      <strong>${escapeHtml(s.name)}</strong> — <small>${escapeHtml(s.email)}</small> <div class="meta">${when}</div>
      <p>${escapeHtml(s.subject || '(pas de sujet)')}</p>
      <blockquote>${escapeHtml(s.message || '(pas de corps de message)')}</blockquote>
    </div>`;
  }).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function showMessage(type, lines) {
  const cls = type === 'success' ? 'alert-success' : 'alert-error';
  const content = Array.isArray(lines) ? lines.map(l => `<div>${escapeHtml(l)}</div>`).join('') : `<div>${escapeHtml(lines)}</div>`;
  messagesEl.innerHTML = `<div class="${cls}">${content}</div>`;
}

function validate(values) {
  const errors = [];
  if (!values.name.trim()) errors.push('Le nom est requis.');
  if (!values.email.trim()) errors.push('L\'email est requis.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.push('Le format de l\'email est invalide.');
  if ( values.message.trim().length + values.subject.length < 2) errors.push('Le message est trop court.');
  return errors;
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  messagesEl.innerHTML = '';
  const formData = new FormData(contactForm);
  const values = {
    name: formData.get('name') || '',
    email: formData.get('email') || '',
    subject: formData.get('subject') || '',
    message: formData.get('message') || ''
  };

  // validation
  const errors = validate(values);
  if (errors.length) {
    showMessage('error', errors);
    // flag fields
    ['name','email','message'].forEach(id => {
      const el = document.getElementById(id);
      el.setAttribute('aria-invalid', errors.some(err => err.toLowerCase().includes(id) || err.toLowerCase().includes('email') && id==='email') ? 'true' : 'false');
    });
    return;
  }

  // stockage temporaire
  const entry = { ...values, timestamp: Date.now() };
  submissions.unshift(entry);
  localStorage.setItem(submissionsKey, JSON.stringify(submissions)); // optionnel: persist local
  showMessage('success', 'Message enregistré en local (simulation) — merci !');
  contactForm.reset();
  // remove aria-invalid flags
  ['name','email','message'].forEach(id => document.getElementById(id).removeAttribute('aria-invalid'));
  renderSubmissions();
});

// initial render
renderSubmissions();