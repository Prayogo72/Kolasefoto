function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'screenKolase') {
        if (typeof initKolaseCanvas === "function") initKolaseCanvas();
    } else if (screenId === 'screen5S') {
        if (typeof init5SCanvas === "function") init5SCanvas();
    }
}

function downloadCanvas(canvasId, namePrefix) {
    const targetCanvas = document.getElementById(canvasId);
    if (!targetCanvas) {
        alert("Canvas tidak ditemukan!");
        return;
    }
    
    const dataURL = targetCanvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.download = `${namePrefix}-${Date.now()}.jpg`;
    link.href = dataURL;
    link.click();
}