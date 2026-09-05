let savedImages = []; // { img, scale, offsetX, offsetY }
const inputKolase = document.getElementById('inputKolase');
const canvasKolase = document.getElementById('canvasKolase');
const ctxKolase = canvasKolase ? canvasKolase.getContext('2d') : null;

const COLS = 5;
const ROWS = 8;
const TOTAL_SLOTS = COLS * ROWS;

let activeSlotIndex = null;
let selectedSlotForEdit = null;
let swapSourceIndex = null; // Menyimpan index slot pertama saat mode tukar

// Gestur State
let isDragging = false;
let startX = 0, startY = 0;
let initialPinchDist = null;
let initialScale = 1;
let longPressTimer = null;

// Elemen Toolbar
const quickToolbar = document.getElementById('quickToolbar');
const btnQuickGanti = document.getElementById('btnQuickGanti');
const btnQuickTukar = document.getElementById('btnQuickTukar');
const btnQuickHapus = document.getElementById('btnQuickHapus');
const btnQuickTutup = document.getElementById('btnQuickTutup');
const inputGantiFoto = document.getElementById('inputGantiFoto');

function initKolaseCanvas() {
  if (!canvasKolase) return;
  canvasKolase.width = 1200;
  canvasKolase.height = 1920;
  renderMatrixCollage();
}

// Upload Foto Awal
if (inputKolase) {
  inputKolase.addEventListener('change', function(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = TOTAL_SLOTS - savedImages.length;
    if (remainingSlots <= 0) {
      alert("Slot sudah penuh! Maksimal 40 foto.");
      return;
    }

    const filesToProcess = Math.min(files.length, remainingSlots);
    let loadedCount = 0;
    let tempLoaded = [];

    for (let i = 0; i < filesToProcess; i++) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          tempLoaded[i] = { img, scale: 1, offsetX: 0, offsetY: 0 };
          loadedCount++;
          if (loadedCount === filesToProcess) {
            savedImages = savedImages.concat(tempLoaded.filter(Boolean));
            renderMatrixCollage();
            updateStatusText();
            inputKolase.value = "";
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(files[i]);
    }
  });
}

// Gambar Grid Canvas 5x8
function renderMatrixCollage() {
  if (!canvasKolase || !ctxKolase) return;

  const cellWidth = canvasKolase.width / COLS;
  const cellHeight = canvasKolase.height / ROWS;
  const borderThickness = 3;

  ctxKolase.fillStyle = "#ffffff";
  ctxKolase.fillRect(0, 0, canvasKolase.width, canvasKolase.height);

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = col * cellWidth + borderThickness;
    const y = row * cellHeight + borderThickness;
    const w = cellWidth - (borderThickness * 2);
    const h = cellHeight - (borderThickness * 2);

    if (i < savedImages.length && savedImages[i]) {
      const item = savedImages[i];
      ctxKolase.save();
      ctxKolase.beginPath();
      ctxKolase.rect(x, y, w, h);
      ctxKolase.clip();

      const imgRatio = item.img.width / item.img.height;
      const slotRatio = w / h;
      let rw, rh;

      if (imgRatio > slotRatio) {
        rh = h;
        rw = h * imgRatio;
      } else {
        rw = w;
        rh = w / imgRatio;
      }

      rw *= item.scale;
      rh *= item.scale;

      const rx = x + (w - rw) / 2 + item.offsetX;
      const ry = y + (h - rh) / 2 + item.offsetY;

      ctxKolase.drawImage(item.img, rx, ry, rw, rh);

      // Highlight garis biru untuk slot terpilih
      if (i === selectedSlotForEdit) {
        ctxKolase.strokeStyle = "#007bff";
        ctxKolase.lineWidth = 6;
        ctxKolase.strokeRect(x, y, w, h);
      }

      // Highlight garis kuning putus-putus untuk slot sumber tukar
      if (i === swapSourceIndex) {
        ctxKolase.strokeStyle = "#f39c12";
        ctxKolase.lineWidth = 8;
        ctxKolase.strokeRect(x, y, w, h);
      }

      ctxKolase.restore();
    } else {
      ctxKolase.fillStyle = "#1a1a1a";
      ctxKolase.fillRect(x, y, w, h);
    }
  }
}

function getSlotIndexFromEvent(e) {
  const rect = canvasKolase.getBoundingClientRect();
  const scaleX = canvasKolase.width / rect.width;
  const scaleY = canvasKolase.height / rect.height;

  let clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  const col = Math.floor(x / (canvasKolase.width / COLS));
  const row = Math.floor(y / (canvasKolase.height / ROWS));

  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
  return row * COLS + col;
}

// Interaksi Gestur & Seleksi
if (canvasKolase) {
  canvasKolase.addEventListener('contextmenu', (e) => e.preventDefault());

  const handleStart = (e) => {
    const idx = getSlotIndexFromEvent(e);

    // Bila sedang dalam mode tukar posisi
    if (swapSourceIndex !== null) {
      if (idx >= 0 && idx < savedImages.length && idx !== swapSourceIndex) {
        // Eksekusi penukaran data slot
        const temp = savedImages[swapSourceIndex];
        savedImages[swapSourceIndex] = savedImages[idx];
        savedImages[idx] = temp;
      }
      swapSourceIndex = null;
      hideQuickToolbar();
      renderMatrixCollage();
      return;
    }

    if (idx < 0 || idx >= savedImages.length || !savedImages[idx]) {
      activeSlotIndex = null;
      hideQuickToolbar();
      return;
    }

    activeSlotIndex = idx;
    isDragging = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;

    if (e.touches && e.touches.length === 2) {
      initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = savedImages[activeSlotIndex].scale;
      clearTimeout(longPressTimer);
      return;
    }

    // Klik tahan 450ms untuk membuka bar Ganti / Tukar / Hapus
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      if (isDragging && activeSlotIndex !== null) {
        selectedSlotForEdit = activeSlotIndex;
        showQuickToolbar(activeSlotIndex);
        renderMatrixCollage();
      }
    }, 450);
  };

  const handleMove = (e) => {
    if (!isDragging || activeSlotIndex === null) return;
    e.preventDefault();

    // Pinch Zoom 2 Jari
    if (e.touches && e.touches.length === 2 && initialPinchDist) {
      clearTimeout(longPressTimer);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDist;
      savedImages[activeSlotIndex].scale = Math.min(Math.max(initialScale * factor, 1), 5);
      renderMatrixCollage();
      return;
    }

    // Geser Foto
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = (clientX - startX) * 2;
    const dy = (clientY - startY) * 2;

    if (Math.hypot(dx, dy) > 6) {
      clearTimeout(longPressTimer);
    }

    savedImages[activeSlotIndex].offsetX += dx;
    savedImages[activeSlotIndex].offsetY += dy;

    startX = clientX;
    startY = clientY;
    renderMatrixCollage();
  };

  const handleEnd = () => {
    clearTimeout(longPressTimer);
    isDragging = false;
    initialPinchDist = null;
  };

  canvasKolase.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);

  canvasKolase.addEventListener('touchstart', handleStart, { passive: false });
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
  window.addEventListener('touchcancel', handleEnd);

  canvasKolase.addEventListener('wheel', (e) => {
    e.preventDefault();
    const idx = getSlotIndexFromEvent(e);
    if (idx >= 0 && idx < savedImages.length && savedImages[idx]) {
      const zoomStep = e.deltaY < 0 ? 1.1 : 0.9;
      savedImages[idx].scale = Math.min(Math.max(savedImages[idx].scale * zoomStep, 1), 5);
      renderMatrixCollage();
    }
  }, { passive: false });
}

// ---------------- MENU QUICK TOOLBAR ----------------

function showQuickToolbar(slotIndex) {
  if (!quickToolbar) return;
  const rect = canvasKolase.getBoundingClientRect();
  const col = slotIndex % COLS;
  const row = Math.floor(slotIndex / COLS);

  const slotW = rect.width / COLS;
  const slotH = rect.height / ROWS;

  const posX = rect.left + window.scrollX + (col * slotW);
  const posY = rect.top + window.scrollY + (row * slotH) + 6;

  quickToolbar.style.left = `${posX}px`;
  quickToolbar.style.top = `${posY}px`;
  quickToolbar.style.display = 'flex';
}

function hideQuickToolbar() {
  if (quickToolbar) quickToolbar.style.display = 'none';
  selectedSlotForEdit = null;
  renderMatrixCollage();
}

if (btnQuickTutup) btnQuickTutup.addEventListener('click', hideQuickToolbar);

// 1. Ganti Foto
if (btnQuickGanti) {
  btnQuickGanti.addEventListener('click', () => {
    if (inputGantiFoto) inputGantiFoto.click();
  });
}

if (inputGantiFoto) {
  inputGantiFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || selectedSlotForEdit === null) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const img = new Image();
      img.onload = function() {
        savedImages[selectedSlotForEdit] = { img, scale: 1, offsetX: 0, offsetY: 0 };
        hideQuickToolbar();
        updateStatusText();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
    inputGantiFoto.value = "";
  });
}

// 2. Tukar Posisi Foto
if (btnQuickTukar) {
  btnQuickTukar.addEventListener('click', () => {
    if (selectedSlotForEdit !== null) {
      swapSourceIndex = selectedSlotForEdit;
      quickToolbar.style.display = 'none';
      alert("Sentuh foto tujuan yang ingin ditukar posisinya.");
      renderMatrixCollage();
    }
  });
}

// 3. Hapus 1 Foto Slot Terpilih
if (btnQuickHapus) {
  btnQuickHapus.addEventListener('click', () => {
    if (selectedSlotForEdit !== null) {
      savedImages.splice(selectedSlotForEdit, 1);
      hideQuickToolbar();
      updateStatusText();
    }
  });
}

function updateStatusText() {
  const statusTxt = document.getElementById('statusFoto');
  if (statusTxt) statusTxt.innerText = `Total Terisi: ${savedImages.length} / 40 Foto`;
}

function hapusFotoTerakhirKolase() {
  if (savedImages.length === 0) return alert("Belum ada foto!");
  savedImages.pop();
  hideQuickToolbar();
  updateStatusText();
}

async function simpanHasilKolase() {
  if (!canvasKolase) return;
  hideQuickToolbar();
  try {
    const dataUrl = canvasKolase.toDataURL("image/png");
    const base64Content = dataUrl.split(',')[1];
    await window.Capacitor.Plugins.Filesystem.writeFile({
      path: 'Hasil_Kolase_' + Date.now() + '.png',
      data: base64Content,
      directory: 'DOWNLOADS'
    });
    alert("Foto kolase sukses disimpan ke folder Download!");
  } catch (error) {
    alert("Gagal menyimpan kolase: " + error.message);
  }
}

document.addEventListener('DOMContentLoaded', initKolaseCanvas);