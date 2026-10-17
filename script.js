
const seedItems = [
  {
    id: 1,
    name: 'Wireless earbuds',
    type: 'Lost',
    category: 'Electronics',
    location: 'Student lounge',
    date: '2026-10-08',
    description: 'White earbuds in a small charging case. May have been left near the window seats.',
    reporter: 'FAITH student',
    status: 'Open',
    emoji: '🎧',
    tone: 'purple'
  },
  {
    id: 2,
    name: 'Blue water bottle',
    type: 'Found',
    category: 'Personal items',
    location: 'Gym entrance',
    date: '2026-10-08',
    description: 'Reusable blue bottle with a silver lid. Handed in after PE class.',
    reporter: 'FAITH campus community',
    status: 'Open',
    emoji: '🧴',
    tone: 'green'
  },
  {
    id: 3,
    name: 'Student ID holder',
    type: 'Lost',
    category: 'Accessories',
    location: 'Main building, Room 204',
    date: '2026-10-07',
    description: 'Clear ID holder with a blue strap. Please check around the classroom.',
    reporter: 'FAITH student',
    status: 'Open',
    emoji: '🪪',
    tone: 'yellow'
  },
  {
    id: 4,
    name: 'Black umbrella',
    type: 'Found',
    category: 'Personal items',
    location: 'Cafeteria',
    date: '2026-10-06',
    description: 'Compact black umbrella left beside the tables near the entrance.',
    reporter: 'FAITH campus community',
    status: 'Open',
    emoji: '☂️',
    tone: 'pink'
  },
  {
    id: 5,
    name: 'Math notebook',
    type: 'Lost',
    category: 'School supplies',
    location: 'Library study area',
    date: '2026-10-05',
    description: 'Blue notebook with handwritten notes inside. Name may be written on the first page.',
    reporter: 'FAITH student',
    status: 'Open',
    emoji: '📓',
    tone: 'green'
  },
  {
    id: 6,
    name: 'Silver keychain',
    type: 'Found',
    category: 'Accessories',
    location: 'Gate 2',
    date: '2026-10-04',
    description: 'One silver key with a small star keychain. Please confirm details when claiming.',
    reporter: 'FAITH campus community',
    status: 'Returned',
    emoji: '🔑',
    tone: 'purple'
  }
];

let items = loadItems();
let activeType = 'All';

function loadItems() {
  try {
    const saved = localStorage.getItem('findit_items');

    return saved
      ? JSON.parse(saved)
      : seedItems.map(item => ({ ...item }));
  } catch (error) {
    return seedItems.map(item => ({ ...item }));
  }
}

function saveItems() {
  try {
    localStorage.setItem('findit_items', JSON.stringify(items));
  } catch (error) {
    console.error('Unable to save reports:', error);
  }
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatDate(date) {
  if (!date) return 'Date not provided';

  return new Date(date + 'T12:00:00').toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }
  );
}

// Display reports on the board
function render() {
  const query = document
    .getElementById('searchInput')
    .value.trim().toLowerCase();

  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortFilter').value;

  let list = items.filter(item => {
    const matchesType =
      activeType === 'All' ||
      (
        activeType === 'Returned'
          ? item.status === 'Returned'
          : item.type === activeType &&
            item.status !== 'Returned'
      );

    const matchesCategory =
      category === 'All' || item.category === category;

    const searchableText = [
      item.name,
      item.description,
      item.location,
      item.category
    ].join(' ').toLowerCase();

    return matchesType &&
      matchesCategory &&
      searchableText.includes(query);
  });

  list.sort((a, b) =>
    sort === 'newest'
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date)
  );

  // Update statistics
  document.getElementById('totalCount').textContent = items.length;

  document.getElementById('openCount').textContent =
    items.filter(item => item.status !== 'Returned').length;

  document.getElementById('returnedCount').textContent =
    items.filter(item => item.status === 'Returned').length;

  const grid = document.getElementById('itemGrid');

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty">
        <div>🧭</div>
        <strong>No matching reports yet</strong>
        <p>Try another search or create a new report.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(item => `
    <article class="item-card">
      <div class="item-visual ${esc(item.tone || 'green')} ${item.photo ? 'has-photo' : ''}">
        <span class="badge ${item.type === 'Found' ? 'found' : ''}">
          ${item.type === 'Lost' ? 'Lost item' : 'Found item'}
        </span>

        ${
          item.photo
            ? `<img class="item-photo"
                src="${item.photo}"
                alt="Photo of ${esc(item.name)}"
                loading="lazy">`
            : `<span aria-hidden="true">${esc(item.emoji || '📦')}</span>`
        }
      </div>

      <div class="item-content">
        <div class="item-title-row">
          <h3>${esc(item.name)}</h3>

          <span class="status ${item.status === 'Returned' ? 'returned' : ''}">
            ${item.status === 'Returned' ? 'Returned' : 'Open'}
          </span>
        </div>

        <p class="item-desc">${esc(item.description)}</p>

        <div class="meta">
          <span>📍 ${esc(item.location)}</span>
          <span>📅 ${formatDate(item.date)} · ${esc(item.category)}</span>
        </div>
      </div>

      <div class="card-footer">
        <small>Reported by ${esc(item.reporter || 'FAITH community member')}</small>

        ${
          item.status === 'Returned'
            ? '<span style="color:#16856b;font-size:11px;font-weight:800">✓ Reunited</span>'
            : `<button class="text-button"
                onclick="markReturned(${item.id})">
                Mark returned ↗
              </button>`
        }
      </div>
    </article>
  `).join('');
}

// Open the report form
function openModal(type) {
  document.getElementById('reportForm').reset();

  clearPhoto();

  document.getElementById('reportType').value = type || 'Lost';

  document.getElementById('itemDate').value =
    new Date().toISOString().slice(0, 10);

  document.getElementById('modalBackdrop').classList.add('open');

  document.getElementById('itemName').focus();
}

// Close the report form
function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
}

// Show notification
function showToast(message) {
  const toast = document.getElementById('toast');

  toast.textContent = message;
  toast.classList.remove('show');

  void toast.offsetWidth;

  toast.classList.add('show');
}

// Mark an item as returned
function markReturned(id) {
  const item = items.find(item => item.id === id);

  if (!item) return;

  if (confirm(`Mark "${item.name}" as returned?`)) {
    item.status = 'Returned';

    saveItems();
    render();

    showToast('Item status updated to Returned.');
  }
}

// Photo upload variables
let selectedPhoto = '';

const photoInput = document.getElementById('itemPhoto');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewWrap = document.getElementById('photoPreviewWrap');

// Handle photo selection
photoInput.addEventListener('change', async () => {
  const file = photoInput.files && photoInput.files[0];

  if (!file) {
    clearPhoto();
    return;
  }

  if (!file.type.startsWith('image/')) {
    showToast('Please choose an image file.');
    photoInput.value = '';
    clearPhoto();
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showToast('Photo must be 5 MB or smaller.');
    photoInput.value = '';
    clearPhoto();
    return;
  }

  try {
    selectedPhoto = await compressPhoto(file);

    photoPreview.src = selectedPhoto;
    photoPreviewWrap.hidden = false;
  } catch (error) {
    showToast('Could not load that photo. Please try another image.');

    photoInput.value = '';
    clearPhoto();
  }
});

// Clear the selected photo
function clearPhoto() {
  selectedPhoto = '';

  photoPreview.removeAttribute('src');
  photoPreviewWrap.hidden = true;
}

// Resize and compress photo
function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('File read failed'));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Image load failed'));

      image.onload = () => {
        const maxSide = 1000;

        const scale = Math.min(
          1,
          maxSide / Math.max(image.width, image.height)
        );

        const canvas = document.createElement('canvas');

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale)
        );

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale)
        );

        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Canvas unavailable'));
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

// Remove selected photo
document.getElementById('removePhoto').addEventListener('click', () => {
  photoInput.value = '';
  clearPhoto();
});

// Submit a new report
document.getElementById('reportForm').addEventListener('submit', event => {
  event.preventDefault();

  const type = document.getElementById('reportType').value;
  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('itemCategory').value;

  const tones = ['purple', 'green', 'yellow', 'pink'];

  const emojis = {
    Electronics: '🎧',
    Accessories: '🎒',
    'School supplies': '📓',
    'Personal items': '🧴',
    Other: '📦'
  };

  const newItem = {
    id: Date.now(),
    name: name,
    type: type,
    category: category,
    location: document.getElementById('itemLocation').value.trim(),
    date: document.getElementById('itemDate').value,
    description: document.getElementById('itemDescription').value.trim(),
    reporter: document.getElementById('reporterName').value.trim()
      || 'FAITH community member',
    photo: selectedPhoto,
    status: 'Open',
    emoji: emojis[category] || '📦',
    tone: tones[Math.floor(Math.random() * tones.length)]
  };

  items.unshift(newItem);

  saveItems();

  activeType = 'All';

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.type === 'All');
  });

  closeModal();

  photoInput.value = '';
  clearPhoto();

  render();

  showToast('Your report has been added to the board!');

  document.getElementById('items').scrollIntoView({
    behavior: 'smooth'
  });
});

// Filter reports by tab
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeType = tab.dataset.type;

    document.querySelectorAll('.tab').forEach(button => {
      button.classList.toggle('active', button === tab);
    });

    render();
  });
});

// Search and filter events
document.getElementById('searchInput')
  .addEventListener('input', render);

document.getElementById('categoryFilter')
  .addEventListener('change', render);

document.getElementById('sortFilter')
  .addEventListener('change', render);

// Close modal when clicking outside
document.getElementById('modalBackdrop')
  .addEventListener('click', event => {
    if (event.target.id === 'modalBackdrop') {
      closeModal();
    }
  });

// Close modal using Escape key
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Display initial reports
render();
