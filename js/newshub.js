async function fetchNews() {
  const res = await fetch('json/pomoika.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load news JSON');
  return await res.json();
}

function sanitize(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  // Keep only text content for the brief description
  return div.textContent || div.innerText || '';
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (_) {
    return '';
  }
}

function renderFeatured(container, item) {
  if (!item) return;
  const card = document.createElement('article');
  card.className = 'featured-card';
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.src = item.media || '';
  const body = document.createElement('div');
  body.className = 'featured-body';
  const title = document.createElement('h2');
  title.className = 'featured-title';
  title.textContent = item.title || '';
  const desc = document.createElement('p');
  desc.className = 'featured-desc';
  desc.textContent = sanitize(item.content).slice(0, 280);
  const link = document.createElement('a');
  link.href = item.link || '#';
  link.target = '_blank';
  link.rel = 'noopener';
  link.className = 'news-link';
  link.textContent = 'Открыть';
  body.appendChild(title);
  body.appendChild(desc);
  body.appendChild(link);
  card.appendChild(img);
  card.appendChild(body);
  container.appendChild(card);
}

function renderList(container, items) {
  const frag = document.createDocumentFragment();
  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'news-card';
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.className = 'thumb';
    img.src = item.media || '';
    const body = document.createElement('div');
    body.className = 'news-body';
    const title = document.createElement('h3');
    title.className = 'news-title';
    title.textContent = item.title || '';
    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.textContent = fmtDate(item.date);
    const link = document.createElement('a');
    link.href = item.link || '#';
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'news-link';
    link.textContent = 'Читать';
    const desc = document.createElement('p');
    desc.className = 'news-desc';
    desc.textContent = sanitize(item.content).slice(0, 160);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(desc);
    body.appendChild(link);
    card.appendChild(img);
    card.appendChild(body);
    frag.appendChild(card);
  });
  container.appendChild(frag);
}

(async function init() {
  const featuredRoot = document.getElementById('featured');
  const listRoot = document.getElementById('news-list');
  try {
    const data = await fetchNews();
    if (!Array.isArray(data) || data.length === 0) {
      listRoot.textContent = 'Пока нет новостей.';
      return;
    }
    // sort by sortIndex (desc) then by date (desc)
    const normalized = data.slice().sort((a, b) => {
      const idx = Number(b.sortIndex || 0) - Number(a.sortIndex || 0);
      if (idx !== 0) return idx;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    renderFeatured(featuredRoot, normalized[0]);
    renderList(listRoot, normalized.slice(1));
  } catch (e) {
    console.error(e);
    listRoot.textContent = 'Ошибка загрузки новостей.';
  }
})();


