const tg = window.Telegram.WebApp;
const allowedUserId = 7998861975;
let uploadedImageSrc = null;

function showUploadUI() {
    // Kosongkan konten, supaya siap untuk upload (atau bisa tampilkan pesan khusus)
    document.getElementById('content').innerHTML = '<p>Silakan klik tombol 🔄 UPLOAD untuk pilih foto.</p>';
}

function showMainMenu() {
    let content = document.getElementById('content');
    let html = `<h2>Selamat datang di Menu Utama</h2>`;

    if (uploadedImageSrc) {
        html += `
          <p>Foto yang sudah diupload owner:</p>
          <img id="fotoPreview" src="${uploadedImageSrc}" alt="Foto Upload" style="max-width:90vw; max-height:60vh; border-radius:12px; object-fit:contain;" />
        `;
    } else {
        html += `<p>Belum ada foto yang diupload.</p>`;
    }

    content.innerHTML = html;
}

function setupMenu(userId) {
    const menuDiv = document.getElementById('menuButtons');
    menuDiv.innerHTML = '';

    const mainBtn = document.createElement('button');
    mainBtn.textContent = 'MENU UTAMA';
    mainBtn.onclick = () => showMainMenu();
    menuDiv.appendChild(mainBtn);

    if (userId === allowedUserId) {
        const uploadBtn = document.createElement('button');
        uploadBtn.innerHTML = '🔄 UPLOAD';
        uploadBtn.id = 'uploadBtn';
        uploadBtn.onclick = () => document.getElementById('fileInput').click();
        menuDiv.appendChild(uploadBtn);
    }
}

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
        localStorage.setItem('sharedUploadUrl', uploadedImageSrc);
        showMainMenu();
    };
    reader.readAsDataURL(file);
}

function init() {
    const user = tg.initDataUnsafe.user;
    if (!user) {
        document.getElementById('content').innerHTML = '<p>Gagal mendapatkan data user Telegram.</p>';
        return;
    }

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

// Buat input file hidden sekali waktu load halaman
window.onload = () => {
    init();

    if (!document.getElementById('fileInput')) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.id = 'fileInput';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', handleFileChange);
        document.body.appendChild(fileInput);
    }
};