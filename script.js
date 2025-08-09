// Ambil objek WebApp dari Telegram
const tg = window.Telegram.WebApp;

document.getElementById("cekNama").addEventListener("click", function () {
    // Ambil data user
    let userData = tg.initDataUnsafe.user;
    let firstName = (userData && userData.first_name) || "tidak ada nama";
    
    document.getElementById("hasil").innerText = `Nama pengguna: ${firstName}`;
});
