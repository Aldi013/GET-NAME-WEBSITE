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