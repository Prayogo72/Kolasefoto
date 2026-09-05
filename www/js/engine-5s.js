let foto5S = {
  before: null,
  after: null
};

let active5SSlot = null;
let isDragging5S = false;
let startX5S = 0, startY5S = 0;
let initialPinchDist5S = null;
let initialScale5S = 1;

const canvas5S = document.getElementById('canvas5S');
const ctx5S = canvas5S ? canvas5S.getContext('2d') : null;
const inputFoto5S = document.getElementById('inputFoto5S');
const inputLokasi5S = document.getElementById('inputLokasi5S');
const fileStatus5S = document.getElementById('fileStatus5S');
const btnSimpan5S = document.getElementById('btnSimpan5S');

function init5SCanvas() {
  if (!canvas5S) return;
  canvas5S.width = 1600;
  canvas5S.height = 990;
  render5S();
}

if (inputFoto5S) {
  inputFoto5S.addEventListener('change', async function (e) {
    const files = e.target.files;
    if (!files || files.length < 2) {
      alert("Pilih langsung 2 foto (Foto ke-1: Before, Foto ke-2: After).");
      return;
    }

    if (fileStatus5S) {
      fileStatus5S.innerText = `2 Foto terpilih: ${files[0].name} & ${files[1].name}`;
    }

    const img1 = await loadImg5S(files[0]);
    const img2 = await loadImg5S(files[1]);

    foto5S.before = { img: img1, scale: 1, offsetX: 0, offsetY: 0 };
    foto5S.after = { img: img2, scale: 1, offsetX: 0, offsetY: 0 };

    render5S();
  });
}

function loadImg5S(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

if (inputLokasi5S) {
  inputLokasi5S.addEventListener('input', () => render5S());
}

function render5S() {
  if (!canvas5S || !ctx5S) return;

  const slotW = 790;
  const slotH = 840;
  const gap = 20;
  const labelH = 70;
  const footerH = 80;

  canvas5S.width = (slotW * 2) + gap;
  canvas5S.height = slotH + labelH + footerH;

  ctx5S.fillStyle = "#ffffff";
  ctx5S.fillRect(0, 0, canvas5S.width, canvas5S.height);

  // Before (Kiri)
  if (foto5S.before) {
    drawTransformed(ctx5S, foto5S.before, 0, 0, slotW, slotH);
  } else {
    ctx5S.fillStyle = "#1a1a1a";
    ctx5S.fillRect(0, 0, slotW, slotH);
  }

  // After (Kanan)
  const xAfter = slotW + gap;
  if (foto5S.after) {
    drawTransformed(ctx5S, foto5S.after, xAfter, 0, slotW, slotH);
  } else {
    ctx5S.fillStyle = "#1a1a1a";
    ctx5S.fillRect(xAfter, 0, slotW, slotH);
  }

  // Label BEFORE
  ctx5S.fillStyle = "#d9534f";
  ctx5S.fillRect(0, slotH, slotW, labelH);
  ctx5S.fillStyle = "#ffffff";
  ctx5S.font = "bold 36px Arial";
  ctx5S.textAlign = "center";
  ctx5S.textBaseline = "middle";
  ctx5S.fillText("BEFORE", slotW / 2, slotH + (labelH / 2));

  // Label AFTER
  ctx5S.fillStyle = "#28a745";
  ctx5S.fillRect(xAfter, slotH, slotW, labelH);
  ctx5S.fillStyle = "#ffffff";
  ctx5S.fillText("AFTER", xAfter + (slotW / 2), slotH + (labelH / 2));

  // Footer Lokasi
  const yFooter = slotH + labelH;
  ctx5S.fillStyle = "#222222";
  ctx5S.fillRect(0, yFooter, canvas5S.width, footerH);

  const teks = inputLokasi5S ? inputLokasi5S.value.trim() : "";
  ctx5S.fillStyle = "#ffffff";
  ctx5S.font = "bold 32px Arial";
  ctx5S.fillText(teks ? `LOKASI: ${teks.toUpperCase()}` : "LOKASI: -", canvas5S.width / 2, yFooter + (footerH / 2));
}

function drawTransformed(ctx, item, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

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

  ctx.drawImage(item.img, rx, ry, rw, rh);
  ctx.restore();
}

function get5SSlotFromEvent(e) {
  const rect = canvas5S.getBoundingClientRect();
  const scaleX = canvas5S.width / rect.width;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = (clientX - rect.left) * scaleX;

  const slotW = 790;
  if (x <= slotW) return 'before';
  if (x >= slotW + 20) return 'after';
  return null;
}

if (canvas5S) {
  canvas5S.addEventListener('contextmenu', (e) => e.preventDefault());

  const onStart = (e) => {
    const slot = get5SSlotFromEvent(e);
    if (!slot || !foto5S[slot]) {
      active5SSlot = null;
      return;
    }

    active5SSlot = slot;
    isDragging5S = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX5S = clientX;
    startY5S = clientY;

    if (e.touches && e.touches.length === 2) {
      initialPinchDist5S = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale5S = foto5S[active5SSlot].scale;
    }
  };

  const onMove = (e) => {
    if (!isDragging5S || !active5SSlot) return;
    e.preventDefault();

    if (e.touches && e.touches.length === 2 && initialPinchDist5S) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / initialPinchDist5S;
      foto5S[active5SSlot].scale = Math.min(Math.max(initialScale5S * factor, 1), 4);
      render5S();
      return;
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = (clientX - startX5S) * 2;
    const dy = (clientY - startY5S) * 2;

    foto5S[active5SSlot].offsetX += dx;
    foto5S[active5SSlot].offsetY += dy;

    startX5S = clientX;
    startY5S = clientY;
    render5S();
  };

  const onEnd = () => {
    isDragging5S = false;
    initialPinchDist5S = null;
  };

  canvas5S.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  canvas5S.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);

  canvas5S.addEventListener('wheel', (e) => {
    e.preventDefault();
    const slot = get5SSlotFromEvent(e);
    if (slot && foto5S[slot]) {
      if (e.deltaY < 0) foto5S[slot].scale = Math.min(foto5S[slot].scale + 0.1, 4);
      else foto5S[slot].scale = Math.max(foto5S[slot].scale - 0.1, 1);
      render5S();
    }
  }, { passive: false });
}

if (btnSimpan5S) {
  btnSimpan5S.addEventListener('click', async function () {
    if (!foto5S.before || !foto5S.after) {
      alert("Harap pilih 2 foto terlebih dahulu!");
      return;
    }
    const lokasi = inputLokasi5S ? inputLokasi5S.value.trim().replace(/[^a-zA-Z0-9]/g, "_") : "lokasi";
    const fileName = `5S_${lokasi}_${Date.now()}.png`;
    downloadCanvas('canvas5S', `5S_${lokasi}`);
  });
}
// Sambungkan ke fungsi library lokasi bawaan proyek
const btnPilihLokasi5S = document.getElementById('btnPilihLokasi5S');
if (btnPilihLokasi5S) {
  btnPilihLokasi5S.addEventListener('click', function () {
    // Memanggil fungsi modal/picker lokasi dari library-lokasi.js
    if (typeof bukaModalLokasi === 'function') {
      bukaModalLokasi((lokasiTerpilih) => {
        if (inputLokasi5S) {
          inputLokasi5S.value = lokasiTerpilih;
          render5S();
        }
      });
    } else if (typeof pilihLokasi === 'function') {
      pilihLokasi((lokasiTerpilih) => {
        if (inputLokasi5S) {
          inputLokasi5S.value = lokasiTerpilih;
          render5S();
        }
      });
    } else {
      // Prompt cadangan jika function library belum terdaftar
      const input = prompt("Masukkan kode lokasi:", inputLokasi5S ? inputLokasi5S.value : "");
      if (input !== null && inputLokasi5S) {
        inputLokasi5S.value = input.trim();
        render5S();
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init5SCanvas);