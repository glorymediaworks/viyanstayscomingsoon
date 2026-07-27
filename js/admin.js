/* ==========================================================================
   Viyan Stays — Coming Soon
   Admin Image Management Logic: Upload, Preview, LocalStorage Sync
   ========================================================================== */

(() => {
  'use strict';

  /* ———————————————— Configuration ———————————————— */
  const CONFIG = {
    storageKey: 'viyanStaysRooms',
    defaultRooms: [
      { id: 'room-1', src: './public/images/rooms/1.jpeg', title: '1 BHK Luxury Suite', description: 'A cozy yet elegant one-bedroom suite designed for comfort.' },
      { id: 'room-2', src: './public/images/rooms/2.jpeg', title: '2 BHK Premium Suite', description: 'Spacious two-bedroom accommodation with premium amenities.' },
      { id: 'room-3', src: './public/images/rooms/3.jpeg', title: '3 BHK Executive Suite', description: 'Our flagship three-bedroom executive suite for discerning guests.' },
      { id: 'room-4', src: './public/images/rooms/4.jpeg', title: '4 BHK Deluxe Suite', description: 'Premium four-bedroom accommodation with luxury amenities.' },
      { id: 'room-5', src: './public/images/rooms/5.jpeg', title: '5 BHK Grand Suite', description: 'Expansive five-bedroom suite for large groups and families.' },
      { id: 'room-6', src: './public/images/rooms/6.jpeg', title: '6 BHK Royal Suite', description: 'Six-bedroom royal accommodation with premium furnishings.' },
      { id: 'room-7', src: './public/images/rooms/7.jpeg', title: '7 BHK Imperial Suite', description: 'Seven-bedroom imperial suite with panoramic views.' },
      { id: 'room-8', src: './public/images/rooms/8.jpeg', title: '8 BHK Presidential Suite', description: 'Eight-bedroom presidential accommodation with full service.' },
      { id: 'room-9', src: './public/images/rooms/9.jpeg', title: '9 BHK Ambassador Suite', description: 'Nine-bedroom ambassador-level luxury accommodation.' },
      { id: 'room-10', src: './public/images/rooms/10.jpeg', title: '10 BHK Penthouse Suite', description: 'Our flagship ten-bedroom penthouse with exclusive amenities.' },
    ],
  };

  /* ———————————————— DOM Elements ———————————————— */
  const elements = {
    uploadForm: document.getElementById('upload-form'),
    fileInput: document.getElementById('file-input'),
    dropZone: document.getElementById('drop-zone'),
    roomSelect: document.getElementById('room-select'),
    titleInput: document.getElementById('room-title'),
    descInput: document.getElementById('room-description'),
    previewContainer: document.getElementById('preview-container'),
    resetBtn: document.getElementById('reset-btn'),
    statusEl: document.getElementById('status'),
  };

  /* ———————————————— State ———————————————— */
  let currentRooms = [];

  /* ———————————————— Drag & Drop ———————————————— */
  if (elements.dropZone && elements.fileInput) {
    // Click to browse
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());

    // Drag events
    elements.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.dropZone.classList.add('dragover');
    });

    elements.dropZone.addEventListener('dragleave', () => {
      elements.dropZone.classList.remove('dragover');
    });

    elements.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        elements.fileInput.files = files;
        processFile(files[0]);
      }
    });

    // File input change
    elements.fileInput.addEventListener('change', () => {
      if (elements.fileInput.files.length > 0) {
        processFile(elements.fileInput.files[0]);
      }
    });
  }

  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      showStatus('Please upload a valid image file (JPG, PNG, GIF, WebP).', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showStatus('Image file is too large. Maximum size is 5MB.', 'error');
      return;
    }

    readFileAsDataURL(file)
      .then((dataUrl) => {
        const roomData = {
          id: generateId(),
          src: dataUrl,
          title: elements.titleInput.value || 'New Room',
          description: elements.descInput.value || 'Luxury accommodation at Viyan Stays.',
        };

        const roomId = elements.roomSelect.value;
        const existingIndex = currentRooms.findIndex((r) => r.id === roomId);

        if (existingIndex >= 0) {
          currentRooms[existingIndex] = roomData;
        } else {
          currentRooms.push(roomData);
        }

        saveRooms();
        renderPreview();
        resetForm();
      })
      .catch((err) => {
        console.error('File read error:', err);
        showStatus('Failed to read image file. Please try again.', 'error');
      });
  }

  /* ———————————————— Utility Functions ———————————————— */
  function showStatus(message, type = 'info') {
    if (!elements.statusEl) return;
    elements.statusEl.textContent = message;
    elements.statusEl.className = `mt-3 text-sm font-medium ${
      type === 'success'
        ? 'text-green-400'
        : type === 'error'
        ? 'text-red-400'
        : 'text-white/70'
    }`;
    setTimeout(() => {
      elements.statusEl.textContent = '';
    }, 4000);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function generateId() {
    return 'room-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /* ———————————————— Load / Save ———————————————— */
  function loadRooms() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          currentRooms = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load stored rooms:', e);
    }
    // Fallback to defaults
    currentRooms = [...CONFIG.defaultRooms];
  }

  function saveRooms() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(currentRooms));
      // Dispatch storage event for same-tab updates
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: CONFIG.storageKey,
          newValue: JSON.stringify(currentRooms),
        })
      );
      showStatus('Changes saved! Gallery updated on the main page.', 'success');
    } catch (e) {
      console.error('Failed to save rooms:', e);
      showStatus('Error saving changes. Please try again.', 'error');
    }
  }

  /* ———————————————— Render Preview ———————————————— */
  function renderPreview() {
    if (!elements.previewContainer) return;

    if (currentRooms.length === 0) {
      elements.previewContainer.innerHTML = `
        <div class="text-center py-8 text-white/50">
          <p>No room images configured. Upload one to get started!</p>
        </div>
      `;
      return;
    }

    elements.previewContainer.innerHTML = currentRooms
      .map(
        (room, index) => `
      <div class="glass-strong rounded-xl p-4 flex items-center gap-4">
        <div class="w-20 h-15 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
          <img src="${room.src}" alt="${room.title}" class="w-full h-full object-cover" loading="lazy" />
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-white truncate">${room.title}</h4>
          <p class="text-sm text-white/60 truncate">${room.description}</p>
          <p class="text-xs text-white/40 truncate">${room.src}</p>
        </div>
        <div class="flex-shrink-0 flex gap-2">
          <button
            onclick="adminApp.editRoom(${index})"
            class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9a1 1 0 01-1-1v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onclick="adminApp.deleteRoom(${index})"
            class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M10 11V6a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4m-4 0l1 5h2l1-5" />
            </svg>
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  /* ———————————————— Form Handlers ———————————————— */
  function handleUpload(e) {
    e.preventDefault();

    const file = elements.fileInput.files[0];
    if (!file) {
      showStatus('Please select an image file first.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showStatus('Please upload a valid image file (JPG, PNG, GIF, WebP).', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showStatus('Image file is too large. Maximum size is 5MB.', 'error');
      return;
    }

    // Read file and add to rooms
    readFileAsDataURL(file)
      .then((dataUrl) => {
        const roomData = {
          id: generateId(),
          src: dataUrl,
          title: elements.titleInput.value || 'New Room',
          description: elements.descInput.value || 'Luxury accommodation at Viyan Stays.',
        };

        // Replace existing room or add new
        const roomId = elements.roomSelect.value;
        const existingIndex = currentRooms.findIndex((r) => r.id === roomId);

        if (existingIndex >= 0) {
          currentRooms[existingIndex] = roomData;
        } else {
          currentRooms.push(roomData);
        }

        saveRooms();
        renderPreview();
        resetForm();
      })
      .catch((err) => {
        console.error('File read error:', err);
        showStatus('Failed to read image file. Please try again.', 'error');
      });
  }

  function resetForm() {
    if (elements.fileInput) elements.fileInput.value = '';
    if (elements.titleInput) elements.titleInput.value = '';
    if (elements.descInput) elements.descInput.value = '';
    if (elements.roomSelect) elements.roomSelect.value = '';
  }

  function resetToDefaults() {
    if (!confirm('Reset all room images to defaults? This cannot be undone.')) return;
    currentRooms = [...CONFIG.defaultRooms];
    saveRooms();
    renderPreview();
    resetForm();
  }

  function deleteRoom(index) {
    if (!confirm('Remove this room image from the gallery?')) return;
    currentRooms.splice(index, 1);
    saveRooms();
    renderPreview();
  }

  function editRoom(index) {
    const room = currentRooms[index];
    if (!room) return;

    elements.titleInput.value = room.title;
    elements.descInput.value = room.description;
    elements.roomSelect.value = room.id;

    // Scroll to form
    document.getElementById('upload-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  /* ———————————————— Public API ———————————————— */
  window.adminApp = {
    editRoom,
    deleteRoom,
  };

  /* ———————————————— Initialization ———————————————— */
  function init() {
    loadRooms();
    renderPreview();

    // Attach event listeners
    if (elements.uploadForm) {
      elements.uploadForm.addEventListener('submit', handleUpload);
    }
    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', resetToDefaults);
    }

    console.log('Viyan Stays — Admin panel initialized.');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
