// assets/gallery.js (updated)
// Loads images from images/list.json (if present) and supports client-side uploads (in-memory).
// Handles double-encoded URLs (e.g. %2520) by fully decoding then encoding once.

(() => {
  const fileInput = document.getElementById('fileInput');
  const dropArea = document.getElementById('dropArea');
  const gallery = document.getElementById('gallery');
  const viewerModal = new bootstrap.Modal(document.getElementById('viewerModal'));
  const viewerImage = document.getElementById('viewerImage');
  const viewerTitle = document.getElementById('viewerTitle');
  const clearAllBtn = document.getElementById('clearAll');
  const loadServerBtn = document.getElementById('loadServer');

  // Keeps items in memory for this session
  const items = [];

  // Init listeners
  fileInput && fileInput.addEventListener('change', (e) => {
    addFiles(e.target.files);
    fileInput.value = '';
  });

  // Drag & drop (if dropArea exists)
  if (dropArea) {
    ['dragenter', 'dragover'].forEach(evt => {
      dropArea.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropArea.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (evt === 'drop') {
          const dt = e.dataTransfer;
          if (dt && dt.files && dt.files.length) addFiles(dt.files);
        }
        dropArea.classList.remove('dragover');
      });
    });
  }

  clearAllBtn && clearAllBtn.addEventListener('click', () => {
    items.length = 0;
    gallery.innerHTML = '';
  });

  // Optional manual reload button (keeps compatibility)
  loadServerBtn && loadServerBtn.addEventListener('click', () => {
    loadListJson();
  });

  // Try to load images/list.json automatically on page load
  window.addEventListener('load', () => {
    loadListJson();
  });

  // Add files from file input or dropped files
  function addFiles(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type && f.type.startsWith('image/'));
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const id = cryptoRandomId();
        const item = { id, name: file.name, src: dataUrl, size: file.size };
        items.push(item);
        appendCard(item);
      };
      reader.readAsDataURL(file);
    });
  }

  // Append card to DOM
  function appendCard(item) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3';
    col.dataset.id = item.id;

    col.innerHTML = `
      <div class="card gallery-card shadow-sm">
        <img class="gallery-thumb" src="${item.src}" alt="${escapeHtml(item.name)}" loading="lazy">
        <div class="gallery-actions">
          <button class="btn btn-sm btn-dark view-btn" title="View"><i class="bi bi-eye"></i></button>
          <a class="btn btn-sm btn-primary download-btn" title="Download" href="${item.src}" download="${encodeURIComponent(item.name)}"><i class="bi bi-download"></i></a>
          <button class="btn btn-sm btn-outline-danger delete-btn" title="Remove"><i class="bi bi-trash"></i></button>
        </div>
        <div class="gallery-caption border-top">
          <div class="text-truncate">${escapeHtml(item.name)}</div>
          <small class="text-muted">${formatBytes(item.size)}</small>
        </div>
      </div>
    `;

    col.querySelector('.view-btn').addEventListener('click', () => openViewer(item));
    col.querySelector('.delete-btn').addEventListener('click', () => removeItem(item.id));
    // download button uses native anchor with download attribute

    gallery.prepend(col);
  }

  function openViewer(item) {
    viewerImage.src = item.src;
    viewerTitle.textContent = item.name;
    viewerModal.show();
  }

  function removeItem(id) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    items.splice(idx, 1);
    const el = gallery.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
  }

  // Load images listed in images/list.json
  async function loadListJson() {
    const listUrl = 'images/list.json';
    console.info('Attempting to fetch', listUrl);
    try {
      const resp = await fetch(listUrl, { cache: 'no-cache' });
      if (!resp.ok) {
        console.warn(`Failed to load ${listUrl}: ${resp.status} ${resp.statusText}`);
        return;
      }
      const data = await resp.json();
      if (!Array.isArray(data)) {
        console.warn('images/list.json is not an array.');
        return;
      }
      for (const imgMeta of data) {
        await addServerImage(imgMeta);
      }
      console.info('Loaded images from list.json');
    } catch (err) {
      console.warn('Could not load images/list.json:', err);
    }
  }

  // Add a server-hosted image to gallery by fetching it and converting to data URL
  async function addServerImage(imgMeta) {
    try {
      const rawUrl = imgMeta.url || imgMeta.path;
      if (!rawUrl) return;

      // Normalize URL:
      // 1) Fully decode any repeated encodings (handles %2520 -> %20 -> ' ')
      // 2) Then encode once for fetch
      let normalized = rawUrl;
      try {
        // If encoded multiple times, decode repeatedly until no %25 remains
        // (e.g. "%2520" -> "%20" -> " ")
        while (/%25/.test(normalized)) {
          normalized = decodeURIComponent(normalized);
        }
        // If there are still percent-escapes like %20, decode them to get real characters
        normalized = decodeURIComponent(normalized);
      } catch (e) {
        // ignore decode errors and use the original rawUrl
        normalized = rawUrl;
      }
      const safeUrl = encodeURI(normalized);

      console.debug('Fetching image', { rawUrl, normalized, safeUrl });

      const resp = await fetch(safeUrl);
      if (!resp.ok) {
        console.warn('Failed to fetch image:', safeUrl, resp.status);
        return;
      }
      const blob = await resp.blob();
      if (!blob.type.startsWith('image/')) {
        console.warn('Fetched resource is not an image:', safeUrl);
        return;
      }

      const reader = new FileReader();
      await new Promise((res, rej) => {
        reader.onload = (e) => {
          const id = cryptoRandomId();
          const item = {
            id,
            name: imgMeta.name || safeUrl.split('/').pop(),
            src: e.target.result,
            size: imgMeta.size || blob.size || 0
          };
          items.push(item);
          appendCard(item);
          res();
        };
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Error adding server image', imgMeta, err);
    }
  }

  // Helpers
  function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '';
    const thresh = 1024;
    if (Math.abs(bytes) < thresh) return bytes + ' B';
    const units = ['KB', 'MB', 'GB', 'TB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }

  function cryptoRandomId() {
    return 'id-' + Math.random().toString(36).slice(2, 9);
  }

  function escapeHtml(s){
    return (s || '').replace(/[&<>"']/g, function(m) {
      return ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[m];
    });
  }

})();