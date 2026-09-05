// ==================== LIBRARY ATURAN LOKASI GUDANG ====================
const AturanLokasiGudang = {
    1: { start: 21, end: 92, mix: [21, 52, 55, 71, 74] }, 
    2: { start: 60, end: 92, mix: [74] },                  
    3: { start: 1,  end: 92, mix: [18, 21, 52, 55, 71, 72] } 
};

let gTerpilih = null;

function bukaModalLokasi() {
    document.getElementById("modal-lokasi").style.display = "flex";
}

function tutupModalLokasi() {
    document.getElementById("modal-lokasi").style.display = "none";
    document.getElementById("konten-lokasi").innerHTML = '<p style="text-align: center; color: #7f8c8d; margin-top: 50px;">Pilih kategori G1/G2/G3 di atas...</p>';
}

function tampilkanG(nomorG) {
    gTerpilih = nomorG;
    const konten = document.getElementById("konten-lokasi");
    
    let htmlHasil = `<strong>Pilih Zonasi Huruf G${nomorG}:</strong><br><br>`;
    htmlHasil += `<div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 5px;">`;

    for (let i = 65; i <= 84; i++) {
        const huruf = String.fromCharCode(i);
        htmlHasil += `<button type="button" onclick="tampilkanNomorRak('${huruf}')" style="background: #e67e22; color: white; width: 45px; height: 45px; font-size: 16px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer;">${huruf}</button>`;
    }

    htmlHasil += `</div>`;
    konten.innerHTML = htmlHasil;
}

function tampilkanNomorRak(hurufTerpilih) {
    const konten = document.getElementById("konten-lokasi");
    const config = AturanLokasiGudang[gTerpilih];
    const kodePrefix = `G${gTerpilih}${hurufTerpilih}`;

    let htmlHasil = `<button type="button" onclick="tampilkanG(${gTerpilih})" style="background: #7f8c8d; color: white; padding: 6px 12px; font-size: 11px; border: none; width: auto; margin-bottom: 12px; border-radius: 4px; cursor: pointer;">⬅️ Kembali</button><br>`;
    htmlHasil += `<strong>Daftar Lokasi ${kodePrefix}:</strong><br><br>`;
    htmlHasil += `<div style="border: 1px solid #e0e0e0; padding: 8px; border-radius: 8px; background: #fafafa;">`;

    for (let i = config.start; i <= config.end; i++) {
        const formatAngka = String(i).padStart(3, '0');
        const kodeLokasiUtama = `${kodePrefix}-${formatAngka}`;
        
        if (config.mix.includes(i)) {
            htmlHasil += `<div style="background: #fff9db; padding: 6px; margin-bottom: 6px; border-left: 4px solid #f1c40f; border-radius: 4px;">`;
            htmlHasil += `<span style="font-weight: bold; color: #b7791f; font-size: 11px; display: block; margin-bottom: 4px;">⚠️ AREA MIX</span>`;
            for (let sub = 1; sub <= 6; sub++) {
                const kodeMixFull = `${kodeLokasiUtama}-${sub}`;
                htmlHasil += `<div onclick="pilihLokasiDariLibrary('${kodeMixFull}')" style="font-family: monospace; font-size: 14px; font-weight: bold; padding: 6px; color: #2c3e50; cursor: pointer; border-bottom: 1px solid #fce8a6;">${kodeMixFull}</div>`;
            }
            htmlHasil += `</div>`;
        } else {
            htmlHasil += `<div onclick="pilihLokasiDariLibrary('${kodeLokasiUtama}')" style="background: #ffffff; padding: 10px; margin-bottom: 4px; border: 1px solid #e2e8f0; border-radius: 4px; font-family: monospace; font-size: 14px; font-weight: bold; color: #2d3748; cursor: pointer;">`;
            htmlHasil += `📍 ${kodeLokasiUtama}`;
            htmlHasil += `</div>`;
        }
    }

    htmlHasil += `</div>`;
    konten.innerHTML = htmlHasil;
}

function pilihLokasiDariLibrary(kodePilihan) {
    const fieldInput5S = document.getElementById("inputLokasi");
    if (fieldInput5S) {
        fieldInput5S.value = kodePilihan;
    }
    tutupModalLokasi();
}