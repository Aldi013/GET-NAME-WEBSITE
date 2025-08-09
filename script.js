// Ambil objek WebApp dari Telegram
const tg = window.Telegram.WebApp;

document.getElementById("cekNama").addEventListener("click", function () {
    // Ambil data user
    let userData = tg.initDataUnsafe.user;

    // Nama
    let firstName = (userData && userData.first_name) || "tidak ada nama";

    // ID
    let userId = (userData && userData.id) || "tidak ada id";

    // Tampilkan
    document.getElementById("hasil").innerText = `Nama: ${firstName} | ID: ${userId}`;
});

// Ganti handleFileChange jadi simpan di key 'sharedUploadUrl' (bukan user spesifik)
function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedImageSrc = e.target.result;
        // Simpan di shared key supaya semua user browser ini bisa lihat
        localStorage.setItem('sharedUploadUrl', uploadedImageSrc);
        showMainMenu();
    };
    reader.readAsDataURL(file);
}

// Saat init, baca dari shared key
function init() {
    let user = tg.initDataUnsafe.user;
    if (!user) {
        document.getElementById('content').innerHTML = '<p>Gagal mendapatkan data user Telegram.</p>';
        return;
    }

    // Ambil gambar dari key umum
    const savedImage = localStorage.getItem('sharedUploadUrl');
    if (savedImage) {
        uploadedImageSrc = savedImage;
    }

    setupMenu(user.id);

    if (user.id === allowedUserId) {
        showUploadUI();
    } else {
        showMainMenu();
    }
}