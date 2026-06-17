let data5S = []; 
const canvas5S = document.getElementById('canvas5S');
const ctx5S = canvas5S ? canvas5S.getContext('2d') : null;

function init5SCanvas() {
    if (!canvas5S) return;
    canvas5S.width = 1275;  
    canvas5S.height = 2100; 
    renderTable5S();
}

function tambahBaris5S() {
    const inputBatch = document.getElementById('inputBatch5S');
    const inputLokasi = document.getElementById('inputLokasi');

    if (data5S.length >= 10) {
        alert("Lembar laporan sudah penuh! Maksimal 10 baris.");
        return;
    }

    if (!inputBatch.files || inputBatch.files.length < 2) {
        alert("Mohon pilih 2 foto sekaligus dari galeri (Sebelum & Sesudah)!");
        return;
    }

    if (!inputLokasi.value.trim()) {
        alert("Mohon isi Kode Lokasi!");
        return;
    }

    const fileBefore = inputBatch.files[0];
    const fileAfter = inputBatch.files[1];
    const teksLokasi = inputLokasi.value.toUpperCase();

    let imgBeforeLoaded = null;
    let imgAfterLoaded = null;
    let loadedCheck = 0;

    const readerBefore = new FileReader();
    readerBefore.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            imgBeforeLoaded = img;
            loadedCheck++;
            if (loadedCheck === 2) simpanDanRender();
        };
        img.src = e.target.result;
    };
    readerBefore.readAsDataURL(fileBefore);

    const readerAfter = new FileReader();
    readerAfter.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            imgAfterLoaded = img;
            loadedCheck++;
            if (loadedCheck === 2) simpanDanRender();
        };
        img.src = e.target.result;
    };
    readerAfter.readAsDataURL(fileAfter);

    function simpanDanRender() {
        data5S.push({
            before: imgBeforeLoaded,
            after: imgAfterLoaded,
            lokasi: teksLokasi
        });

        document.getElementById('status5S').innerText = `Total Terisi: ${data5S.length} / 10 Baris`;
        inputBatch.value = "";
        inputLokasi.value = "";

        renderTable5S();
    }
}

function renderTable5S() {
    if (!ctx5S) return;
    const mainHeaderHeight = 120;
    const subHeaderHeight = 50;
    const totalRowsPaten = 10; 
    const borderThickness = 4;

    const rowHeight = (canvas5S.height - mainHeaderHeight - subHeaderHeight) / totalRowsPaten; 
    const colWidth = canvas5S.width / 3; 

    ctx5S.fillStyle = "#ffffff";
    ctx5S.fillRect(0, 0, canvas5S.width, canvas5S.height);

    ctx5S.fillStyle = "#4d9efa"; 
    ctx5S.fillRect(0, 0, canvas5S.width, mainHeaderHeight);

    ctx5S.fillStyle = "#000000";
    ctx5S.font = "bold 32px Arial";
    ctx5S.textAlign = "center";
    ctx5S.textBaseline = "middle";
    ctx5S.fillText("PROGRESS 5S", canvas5S.width / 2, mainHeaderHeight / 2);

    ctx5S.fillStyle = "#f5f5f5";
    ctx5S.fillRect(0, mainHeaderHeight, canvas5S.width, subHeaderHeight);

    ctx5S.fillStyle = "#111111";
    ctx5S.font = "bold 20px Arial";
    
    ctx5S.fillText("SEBELUM", colWidth * 0.5, mainHeaderHeight + (subHeaderHeight / 2));
    ctx5S.fillText("SESUDAH", colWidth * 1.5, mainHeaderHeight + (subHeaderHeight / 2));
    ctx5S.fillText("LOKASI", colWidth * 2.5, mainHeaderHeight + (subHeaderHeight / 2));

    ctx5S.strokeStyle = "#bbbbbb"; 
    ctx5S.lineWidth = borderThickness;

    ctx5S.beginPath();
    ctx5S.moveTo(0, mainHeaderHeight + subHeaderHeight);
    ctx5S.lineTo(canvas5S.width, mainHeaderHeight + subHeaderHeight);
    ctx5S.moveTo(colWidth, mainHeaderHeight); 
    ctx5S.lineTo(colWidth, canvas5S.height);
    ctx5S.moveTo(colWidth * 2, mainHeaderHeight); 
    ctx5S.lineTo(colWidth * 2, canvas5S.height);
    ctx5S.stroke();

    for (let i = 0; i < totalRowsPaten; i++) {
        const currentY = mainHeaderHeight + subHeaderHeight + (i * rowHeight);
        const nextY = currentY + rowHeight;

        ctx5S.beginPath();
        ctx5S.moveTo(0, nextY); 
        ctx5S.lineTo(canvas5S.width, nextY);
        ctx5S.stroke();

        const photoSize = rowHeight - 16; 
        const centerOffsetX = (colWidth - photoSize) / 2;
        const centerOffsetY = (rowHeight - photoSize) / 2;

        if (i < data5S.length && data5S[i]) {
            const item = data5S[i];

            drawImageCenterCrop(ctx5S, item.before, centerOffsetX, currentY + centerOffsetY, photoSize, photoSize);
            drawImageCenterCrop(ctx5S, item.after, colWidth + centerOffsetX, currentY + centerOffsetY, photoSize, photoSize);

            ctx5S.fillStyle = "#111111";
            ctx5S.font = "bold 26px Courier New";
            ctx5S.textAlign = "center";
            ctx5S.textBaseline = "middle";
            ctx5S.fillText(item.lokasi, (colWidth * 2) + (colWidth / 2), currentY + (rowHeight / 2));
        } else {
            ctx5S.fillStyle = "#fafafa";
            ctx5S.fillRect(centerOffsetX, currentY + centerOffsetY, photoSize, photoSize);
            ctx5S.fillRect(colWidth + centerOffsetX, currentY + centerOffsetY, photoSize, photoSize);
        }
    }
}

function hapusBarisTerakhir5S() {
    if (data5S.length === 0) {
        alert("Belum ada baris laporan yang dibuat!");
        return;
    }
    data5S.pop();
    document.getElementById('status5S').innerText = `Total Terisi: ${data5S.length} / 10 Baris`;
    renderTable5S();
}

async function simpanGambar5S() {
    const canvas = document.getElementById('canvas5S'); // Pastikan ID canvas-mu sudah sesuai
    if (!canvas) {
        alert("Canvas tidak ditemukan!");
        return;
    }

    try {
        const dataUrl = canvas.toDataURL("image/png");
        const base64Content = dataUrl.split(',')[1];

        // Memanggil fungsi native resmi Android lewat Capacitor
        await window.Capacitor.Plugins.Filesystem.writeFile({
            path: 'Laporan_5S_' + Date.now() + '.png',
            data: base64Content,
            directory: 'DOWNLOADS' // Gambar otomatis masuk folder Download HP
        });

        alert("Gambar sukses disimpan ke folder Download!");
    } catch (error) {
        alert("Gagal menyimpan file: " + error.message);
    }
}
