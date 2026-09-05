function switchScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));

  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  if (screenId === 'screenKolase') {
    if (typeof initKolaseCanvas === 'function') initKolaseCanvas();
  } else if (screenId === 'screen5S') {
    if (typeof init5SCanvas === 'function') init5SCanvas();
  }
}

async function downloadCanvas(canvasId, namePrefix) {
  const targetCanvas = document.getElementById(canvasId);
  if (!targetCanvas) {
    alert("Canvas tidak ditemukan!");
    return;
  }

  const fileName = `${namePrefix}-${Date.now()}.jpg`;
  const dataURL = targetCanvas.toDataURL('image/jpeg', 0.95);
  const base64Data = dataURL.split(',')[1];
  const Filesystem = window.Capacitor?.Plugins?.Filesystem;

  if (Filesystem) {
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: 'DOCUMENTS',
        recursive: true
      });
      alert(`Foto berhasil disimpan ke folder Dokumen HP!\nNama: ${fileName}`);
    } catch (err) {
      alert("Gagal simpan ke HP: " + err.message);
    }
  } else {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    link.click();
  }
}
