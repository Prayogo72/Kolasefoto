let savedImages = []; 
const inputKolase = document.getElementById('inputKolase');
const canvasKolase = document.getElementById('canvasKolase');
const ctxKolase = canvasKolase ? canvasKolase.getContext('2d') : null;

function initKolaseCanvas() {
    if (!canvasKolase) return;
    canvasKolase.width = 1200;
    canvasKolase.height = 1200;
    ctxKolase.fillStyle = "#ffffff";
    ctxKolase.fillRect(0, 0, canvasKolase.width, canvasKolase.height);
}

if (inputKolase) {
    inputKolase.addEventListener('change', function(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        const currentCount = savedImages.length;
        const remainingSlots = 20 - currentCount;

        if (remainingSlots <= 0) {
            alert("Slot sudah penuh! Maksimal 20 foto.");
            return;
        }

        const filesToProcess = Math.min(files.length, remainingSlots);
        let loadedCount = 0;
        let tempNewImages = [];

        for (let i = 0; i < filesToProcess; i++) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    tempNewImages[i] = img;
                    loadedCount++;

                    if (loadedCount === filesToProcess) {
                        savedImages = savedImages.concat(tempNewImages.filter(Boolean));
                        renderMatrixCollage(savedImages);
                        
                        const statusTxt = document.getElementById('statusFoto');
                        if (statusTxt) {
                            statusTxt.innerText = `Total Terisi: ${savedImages.length} / 20 Foto`;
                        }
                        inputKolase.value = ""; 
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(files[i]);
        }
    });
}

function renderMatrixCollage(images) {
    const cols = 5;
    const rows = 4;
    const totalSlots = cols * rows;
    const borderThickness = 4; 

    const cellWidth = canvasKolase.width / cols;
    const cellHeight = canvasKolase.height / rows;

    ctxKolase.fillStyle = "#ffffff";
    ctxKolase.fillRect(0, 0, canvasKolase.width, canvasKolase.height);

    for (let i = 0; i < totalSlots; i++) {
        const colIndex = i % cols;
        const rowIndex = Math.floor(i / cols);

        const posX = colIndex * cellWidth;
        const posY = rowIndex * cellHeight;

        const photoX = posX + borderThickness;
        const photoY = posY + borderThickness;
        const photoW = cellWidth - (borderThickness * 2);
        const photoH = cellHeight - (borderThickness * 2);

        if (i < images.length && images[i]) {
            drawImageCenterCrop(ctxKolase, images[i], photoX, photoY, photoW, photoH);
        } else {
            ctxKolase.fillStyle = "#1a1a1a"; 
            ctxKolase.fillRect(photoX, photoY, photoW, photoH);
        }
    }
}

function hapusFotoTerakhirKolase() {
    if (savedImages.length === 0) {
        alert("Belum ada foto yang dimasukkan!");
        return;
    }
    savedImages.pop();
    renderMatrixCollage(savedImages);
    const statusTxt = document.getElementById('statusFoto');
    if (statusTxt) {
        statusTxt.innerText = `Total Terisi: ${savedImages.length} / 20 Foto`;
    }
}

function drawImageCenterCrop(ctx, img, x, y, w, h) {
    let iw = img.width, ih = img.height;
    let r = Math.min(w / iw, h / ih);
    let nw = iw * r, nh = ih * r, cx, cy, cw, ch;

    if (nw < w) { r = w / iw; nh = ih * r; nw = iw * r; }
    if (nh < h) { r = h / ih; nw = iw * r; nh = ih * r; }

    cw = iw / (nw / w); ch = ih / (nh / h);
    cx = (iw - cw) * 0.5; cy = (ih - ch) * 0.5;

    if (cx < 0) cx = 0; if (cy < 0) cy = 0;
    if (cw > iw) cw = iw; if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

async function simpanHasilKolase() {
    // 1. Ambil ID canvas tempat kolase fotomu digabungkan
    const canvas = document.getElementById('canvasKolase'); // <--- Ganti sesuai ID canvas kolasemu
    if (!canvas) {
        alert("Canvas kolase tidak ditemukan!");
        return;
    }

    try {
        const dataUrl = canvas.toDataURL("image/png");
        const base64Content = dataUrl.split(',')[1];

        // 2. Simpan lewat jembatan native resmi Android
        await window.Capacitor.Plugins.Filesystem.writeFile({
            path: 'Hasil_Kolase_' + Date.now() + '.png',
            data: base64Content,
            directory: 'DOWNLOADS' // Biar langsung masuk folder Download HP dan muncul di Galeri
        });

        alert("Foto kolase sukses disimpan ke folder Download!");
    } catch (error) {
        alert("Gagal menyimpan kolase: " + error.message);
    }
}
