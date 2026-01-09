const portfolioData = {
  header: {
    title: "Portfolio de Gaétan",
    badge: "Toulon",
    intro: "Ingénieur formé à Centrale Marseille (option informatique). Passionné par l'intelligence artificielle et le déploiement de modèles IA en local."
  },
  sections: [
    { id: 'presentation', title: 'Présentation', content: "J'ai fait Centrale Marseille avec option informatique. J'ai ensuite suivi une formation en IA à l'ISEN Méditerranée à Toulon pour développer ma carrière." },
    { id: 'parcours', title: 'Parcours', items: [
      "Bac STI2D (Spécialité SIN)",
      "Diplôme d'ingénieur généraliste à Centrale Marseille, option informatique",
      "Formation en Intelligence Artificielle à l'ISEN Méditerranée Toulon"
    ] },
    { id: 'experience', title: 'Expérience', items: [
      "Stage en start-up : maintenance de site web et débogage d'applications embarquées",
      "Stage de fin d'étude : contrôle d'installations domotiques et documentation"
    ] },
    { id: 'competences', title: 'Compétences techniques', groups: [
      { title: 'Development IA', tags: ['Python','Hugging Face','Transformers','PyTorch','CUDA C']},
      { title: 'Embarqué', tags: ['C','C++','Arduino C']},
      { title: 'Web', tags: ['HTML','CSS','SQL']},
      { title: 'Administration', tags: ['Bash','OS','Nginx']}
    ] }
  ],
  projects: [
    { id: 'p1', title: 'LLM locaux (Mistral / Phi / Qwant)', year: 'modèle publication', tech: ['Python','Transformers'], type: 'IA', description: 'Déploiement et optimisation de modèles LLM en local, fine-tuning et quantification.' },
    { id: 'p2', title: 'Autre modèle locaux StableDiffusion and Wan', year: 'modèle publication', tech: ['Python'], type: 'Diffusion', description: 'Installation et optimisation de modèles de diffusion pour génération d\'images.' },
    { id: 'p3', title: 'Système embarqué', year: '2014-2018', tech: ['C','Arduino C'], type: 'Embarqué', description: 'Programation sur mirocontroleur (dont PIC et arduino) et controle de l\'asservicement d\'un système.' },
    { id: 'p4', title: 'Serveur local Nginx', year: '2023-2025', tech: ['Nginx','Linux'], type: 'Administration', description: 'Configuration d\'un serveur web local pour hébergement et tests.' }
  ],
  footer: "2026 · Portfolio de Gaétan Pardon — Dernière mise à jour le 8 janvier 2026"
};

const state = {
  activeFilter: { tech: 'All' },
  selectedProjectId: null,
  visibleSections: {} // id: true/false
};

document.addEventListener('DOMContentLoaded', () => {
  // init visibleSections (tout visible par défaut)
  portfolioData.sections.forEach(s => state.visibleSections[s.id] = true);

  renderHeader();
  renderSectionControls();
  renderContentSections();
  renderProjectFilters();
  renderProjects();
  renderFooter();
});

function renderHeader() {
  const el = document.getElementById('header');
  el.innerHTML = `
    <div class="title" aria-label="Nom et titre">
      <span>${portfolioData.header.title}</span>
      <span class="badge" aria-label="Localisation">${portfolioData.header.badge}</span>
    </div>
    <p class="intro">${portfolioData.header.intro}</p>
  `;
}

function renderSectionControls() {
  const nav = document.getElementById('section-controls');
  nav.innerHTML = portfolioData.sections.map(s => {
    return `<button data-section="${s.id}" class="section-toggle" aria-pressed="${state.visibleSections[s.id]}">${s.title}</button>`;
  }).join('');
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-section]');
    if (!btn) return;
    const id = btn.dataset.section;
    state.visibleSections[id] = !state.visibleSections[id];
    btn.setAttribute('aria-pressed', state.visibleSections[id]);
    renderContentSections();
  });
}

function renderContentSections() {
  const container = document.getElementById('content');
  container.innerHTML = portfolioData.sections.map(s => {
    const hidden = state.visibleSections[s.id] ? '' : ' hidden';
    if (s.items) {
      return `<section id="${s.id}" class="portfolio-section${hidden}">
        <h2>${s.title}</h2>
        <ul>${s.items.map(it => `<li>${it}</li>`).join('')}</ul>
      </section>`;
    }
    if (s.groups) {
      return `<section id="${s.id}" class="portfolio-section${hidden}">
        <h2>${s.title}</h2>
        ${s.groups.map(g => `<div class="tagset"><h3>${g.title}</h3>${g.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`).join('')}
      </section>`;
    }
    return `<section id="${s.id}" class="portfolio-section${hidden}">
      <h2>${s.title}</h2>
      <p>${s.content || ''}</p>
    </section>`;
  }).join('');
}

function renderProjectFilters() {
  const filters = document.getElementById('project-filters');
  const techs = Array.from(new Set(portfolioData.projects.flatMap(p => p.tech))).sort();

  filters.innerHTML = `
    <label>Technologie:
      <select id="filter-tech">
        <option value="All">Toutes</option>
        ${techs.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </label>
    <button id="clear-filters" type="button">Effacer</button>
  `;

  filters.querySelector('#filter-tech').value = state.activeFilter.tech;

  filters.addEventListener('change', (e) => {
    if (e.target.id === 'filter-tech') state.activeFilter.tech = e.target.value;
    renderProjects();
  });
  filters.querySelector('#clear-filters').addEventListener('click', () => {
    state.activeFilter = { tech: 'All' };
    renderProjectFilters();
    renderProjects();
  });
}

function renderProjects() {
  const list = document.getElementById('project-list');
  const { tech } = state.activeFilter;
  const filtered = portfolioData.projects
    .filter(p => (tech === 'All' || p.tech.includes(tech)))
    .sort((a,b) => a.title.localeCompare(b.title)); // tri par titre (alphabetique)

  if (!filtered.length) {
    list.innerHTML = '<p>Aucun projet correspondant au filtre.</p>';
    document.getElementById('project-detail').classList.add('hidden');
    return;
  }

  list.innerHTML = filtered.map(p => {
    const selected = p.id === state.selectedProjectId ? ' selected' : '';
    return `<article class="project-card${selected}" data-id="${p.id}">
      <h3>${p.title} </h3>
      <p class="meta">${p.type} • ${p.tech.join(', ')}</p>
      <p class="excerpt">${p.description}</p>
    </article>`;//<small>(${p.year})</small>
  }).join('');

  list.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      state.selectedProjectId = id;
      renderProjects(); // to update selection style
      renderProjectDetail();
    });
  });

  // If a selected project was filtered out, clear selection
  if (state.selectedProjectId && !filtered.some(p => p.id === state.selectedProjectId)) {
    state.selectedProjectId = null;
    document.getElementById('project-detail').classList.add('hidden');
  }

  // If a project is selected still, show its detail
  if (state.selectedProjectId) renderProjectDetail();
}

function renderProjectDetail() {
  const detail = document.getElementById('project-detail');
  const proj = portfolioData.projects.find(p => p.id === state.selectedProjectId);
  if (!proj) {
    detail.classList.add('hidden');
    return;
  }
  detail.classList.remove('hidden');
  detail.innerHTML = `
    <button id="close-detail" aria-label="Fermer">Fermer</button>
    <h3>${proj.title} </h3>
    <p><strong>Technologies:</strong> ${proj.tech.join(', ')}</p>
    <p>${proj.description}</p>
  `;//<small>(${proj.year})</small>
  detail.querySelector('#close-detail').addEventListener('click', () => {
    state.selectedProjectId = null;
    detail.classList.add('hidden');
    renderProjects();
  });
}

function renderFooter() {
  const footerEl = document.getElementById('footer');
  footerEl.innerHTML = `<a href="contact.html" id="contact-link">Contact</a> . ${portfolioData.footer} `;
}