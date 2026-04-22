// main.js
// ==================== KONFIGURASI FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyDGYnq4VKq-YGu4RbfoI_ZHez9fishYjZo",
    authDomain: "insan-cemerlang-afd2f.firebaseapp.com",
    projectId: "insan-cemerlang-afd2f",
    storageBucket: "insan-cemerlang-afd2f.appspot.com",
    messagingSenderId: "686649580589",
    appId: "1:686649580589:web:61374bbbd68adb604eaca4",
    measurementId: "G-LNZTQBCE26"
};

// ==================== IMPORT FIREBASE MODULAR ====================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== REFERENSI KOLEKSI FIRESTORE ====================
const bukuCol = collection(db, 'buku');
const anggotaCol = collection(db, 'anggota');
const pinjamCol = collection(db, 'pinjam');
const transaksiCol = collection(db, 'transaksi');
const adminDocRef = doc(db, 'admin', 'admin');

// ==================== FUNGSI CRUD BUKU ====================
async function getBuku() {
    const snapshot = await getDocs(query(bukuCol, orderBy('judul')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addBuku(data) {
    data.stok = Number(data.stok);
    data.tahun = Number(data.tahun);
    await addDoc(bukuCol, data);
}

async function updateBuku(id, data) {
    data.stok = Number(data.stok);
    data.tahun = Number(data.tahun);
    await updateDoc(doc(bukuCol, id), data);
}

async function deleteBuku(id) {
    await deleteDoc(doc(bukuCol, id));
}

// ==================== FUNGSI CRUD ANGGOTA ====================
async function getAnggota() {
    const snapshot = await getDocs(query(anggotaCol, orderBy('nama')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addAnggota(data) {
    await addDoc(anggotaCol, { ...data, status: 'Aktif' });
}

async function updateAnggota(id, data) {
    await updateDoc(doc(anggotaCol, id), data);
}

async function deleteAnggota(id) {
    await deleteDoc(doc(anggotaCol, id));
}

// ==================== FUNGSI ADMIN (LOGIN) ====================
async function getAdmin() {
    const snap = await getDoc(adminDocRef);
    return snap.exists() ? snap.data() : null;
}

async function setAdminDefault() {
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
        await setDoc(adminDocRef, {
            username: 'admin',
            password: 'admin123',
            nama: 'Administrator'
        });
    }
}

// ==================== FUNGSI PEMINJAMAN ====================
async function getPinjam(statusFilter = null) {
    try {
        let q;
        if (statusFilter) {
            q = query(pinjamCol, where('status', '==', statusFilter), orderBy('tglPinjam', 'desc'));
        } else {
            q = query(pinjamCol, orderBy('tglPinjam', 'desc'));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        if (error.code === 'failed-precondition') {
            console.warn('Index belum tersedia, menggunakan fallback.');
            let q;
            if (statusFilter) {
                q = query(pinjamCol, where('status', '==', statusFilter));
            } else {
                q = pinjamCol;
            }
            const snapshot = await getDocs(q);
            const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            results.sort((a, b) => (a.tglPinjam < b.tglPinjam ? 1 : -1));
            return results;
        } else {
            throw error;
        }
    }
}

async function addPinjam(data) {
    data.tglPinjam = data.tglPinjam || new Date().toISOString().slice(0, 10);
    data.status = 'Dipinjam';
    await addDoc(pinjamCol, data);
}

async function updatePinjam(id, data) {
    await updateDoc(doc(pinjamCol, id), data);
}

async function deletePinjam(id) {
    await deleteDoc(doc(pinjamCol, id));
}

// ==================== FUNGSI TRANSAKSI (RIWAYAT) ====================
async function getTransaksi() {
    const snapshot = await getDocs(query(transaksiCol, orderBy('tglKembali', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addTransaksi(data) {
    await addDoc(transaksiCol, data);
}

// ==================== INISIALISASI DATA CONTOH ====================
async function initSampleData() {
    const bukuSnap = await getDocs(bukuCol);
    if (bukuSnap.empty) {
        const sampleBuku = [
            { judul: 'Laskar Pelangi', pengarang: 'Andrea Hirata', penerbit: 'Bentang Pustaka', tahun: 2005, kategori: 'Fiksi', stok: 5 },
            { judul: 'Matematika SMA Kelas XI', pengarang: 'Marthen Kanginan', penerbit: 'Erlangga', tahun: 2020, kategori: 'Matematika', stok: 8 },
            { judul: 'Fisika Dasar', pengarang: 'Alonso & Finn', penerbit: 'Gelora Aksara', tahun: 2018, kategori: 'Sains', stok: 3 },
            { judul: 'Pemrograman Web', pengarang: 'Wahyu Widodo', penerbit: 'Andi', tahun: 2021, kategori: 'Teknologi', stok: 6 },
            { judul: 'Bumi Manusia', pengarang: 'Pramoedya Ananta Toer', penerbit: 'Hasta Mitra', tahun: 1980, kategori: 'Fiksi', stok: 4 }
        ];
        for (const b of sampleBuku) await addBuku(b);
    }

    const anggotaSnap = await getDocs(anggotaCol);
    if (anggotaSnap.empty) {
        const sampleAnggota = [
            { nama: 'Budi Santoso', nis: '2024001', kelas: 'XI RPL 1', username: 'budi', password: 'budi123', status: 'Aktif' },
            { nama: 'Siti Rahayu', nis: '2024002', kelas: 'XI RPL 2', username: 'siti', password: 'siti123', status: 'Aktif' },
            { nama: 'Ahmad Fauzi', nis: '2024003', kelas: 'X TKJ 1', username: 'ahmad', password: 'ahmad123', status: 'Aktif' }
        ];
        for (const a of sampleAnggota) await addAnggota(a);
    }

    await setAdminDefault();
}

// ==================== FUNGSI PEMBANTU ====================
function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    else if (type === 'error') icon = 'exclamation-circle';
    else if (type === 'warning') icon = 'exclamation-triangle';

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(30px)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ==================== STATE APLIKASI ====================
let currentUser = null;

// ==================== AUTENTIKASI ====================
window.setRole = function(role) {
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    const info = document.getElementById('login-role-info');
    if (role === 'admin') {
        info.innerHTML = 'Default admin: <b>admin</b> / <b>admin123</b>';
        info.style.display = 'block';
        document.getElementById('register-link-wrap').style.display = 'block';
    } else {
        info.innerHTML = 'Gunakan username dan password yang sudah terdaftar, atau <b>daftar</b> dulu.';
        info.style.display = 'block';
        document.getElementById('register-link-wrap').style.display = 'block';
    }
    document.getElementById('login-role-info').dataset.role = role;
};

function getSelectedRole() {
    const active = document.querySelector('.role-tab.active');
    return active ? (active.textContent.includes('Admin') ? 'admin' : 'siswa') : 'admin';
}

window.doLogin = async function() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const role = getSelectedRole();
    const alertEl = document.getElementById('login-alert');

    if (!username || !password) {
        alertEl.innerHTML = '<div class="alert alert-danger">Username dan password wajib diisi.</div>';
        showNotification('Username dan password wajib diisi.', 'error');
        return;
    }

    try {
        if (role === 'admin') {
            const admin = await getAdmin();
            if (admin && admin.username === username && admin.password === password) {
                currentUser = { role: 'admin', nama: admin.nama, username };
                startApp();
                showNotification(`Selamat datang, ${admin.nama}!`, 'success');
            } else {
                alertEl.innerHTML = '<div class="alert alert-danger">Username atau password salah.</div>';
                showNotification('Login gagal: Username atau password salah.', 'error');
            }
        } else {
            const anggota = await getAnggota();
            const found = anggota.find(a => a.username === username && a.password === password);
            if (found) {
                currentUser = { role: 'siswa', nama: found.nama, username, id: found.id };
                startApp();
                showNotification(`Halo, ${found.nama}!`, 'success');
            } else {
                alertEl.innerHTML = '<div class="alert alert-danger">Username atau password salah.</div>';
                showNotification('Login gagal: Username atau password salah.', 'error');
            }
        }
    } catch (error) {
        console.error(error);
        alertEl.innerHTML = '<div class="alert alert-danger">Terjadi kesalahan saat login.</div>';
        showNotification('Terjadi kesalahan saat login.', 'error');
    }
};

window.doRegister = async function() {
    const nama = document.getElementById('reg-nama').value.trim();
    const nis = document.getElementById('reg-nis').value.trim();
    const kelas = document.getElementById('reg-kelas').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const alertEl = document.getElementById('reg-alert');

    if (!nama || !nis || !kelas || !username || !password) {
        alertEl.innerHTML = '<div class="alert alert-danger">Semua field wajib diisi.</div>';
        showNotification('Semua field wajib diisi.', 'error');
        return;
    }

    try {
        const anggota = await getAnggota();
        if (anggota.find(a => a.username === username)) {
            alertEl.innerHTML = '<div class="alert alert-danger">Username sudah digunakan.</div>';
            showNotification('Username sudah digunakan.', 'error');
            return;
        }

        await addAnggota({ nama, nis, kelas, username, password, status: 'Aktif' });
        alertEl.innerHTML = '<div class="alert alert-success">Registrasi berhasil! Silakan login.</div>';
        showNotification('Registrasi berhasil! Silakan login.', 'success');
        setTimeout(showLogin, 1500);
    } catch (error) {
        console.error(error);
        alertEl.innerHTML = '<div class="alert alert-danger">Gagal mendaftar.</div>';
        showNotification('Gagal mendaftar.', 'error');
    }
};

window.showRegister = function() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'block';
};

window.showLogin = function() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('login-alert').innerHTML = '';
};

async function cekPeringatanTenggat() {
    if (currentUser.role !== 'siswa') return;
    const pinjamAktif = await getPinjam('Dipinjam');
    const myPinjam = pinjamAktif.filter(p => p.anggotaId === currentUser.id);
    const today = new Date().toISOString().slice(0, 10);
    const mendekati = myPinjam.filter(p => {
        const selisih = Math.floor((new Date(p.tenggat) - new Date(today)) / 86400000);
        return selisih >= 0 && selisih <= 2;
    });
    const terlambat = myPinjam.filter(p => p.tenggat < today);
    if (terlambat.length > 0) {
        showNotification(`Anda memiliki ${terlambat.length} buku yang terlambat dikembalikan!`, 'warning');
    } else if (mendekati.length > 0) {
        showNotification(`Peringatan: ${mendekati.length} buku mendekati tenggat pengembalian.`, 'warning');
    }
}

function startApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    document.getElementById('sidebar-username').textContent = currentUser.nama;
    document.getElementById('sidebar-role').textContent = currentUser.role === 'admin' ? 'Administrator' : 'Siswa';
    document.getElementById('user-avatar-text').textContent = currentUser.nama[0].toUpperCase();

    if (currentUser.role === 'siswa') {
        document.getElementById('nav-anggota').style.display = 'none';
        document.getElementById('nav-transaksi').style.display = 'none';
    } else {
        document.getElementById('nav-anggota').style.display = '';
        document.getElementById('nav-transaksi').style.display = '';
    }

    document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    showPage('dashboard');
    cekPeringatanTenggat(); // async, tidak perlu await karena fire-and-forget
}

window.doLogout = function() {
    currentUser = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-alert').innerHTML = '';
    showNotification('Anda telah logout.', 'info');
};

// ==================== NAVIGASI HALAMAN ====================
const pageTitles = {
    dashboard: 'Dashboard',
    buku: 'Data Buku',
    anggota: 'Kelola Anggota',
    pinjam: 'Peminjaman Buku',
    kembali: 'Pengembalian Buku',
    transaksi: 'Riwayat Transaksi',
};

window.showPage = async function(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + name + "'")) {
            n.classList.add('active');
        }
    });
    document.getElementById('topbar-title').textContent = pageTitles[name] || name;

    if (name === 'dashboard') await renderDashboard();
    if (name === 'buku') await renderBuku();
    if (name === 'anggota') await renderAnggota();
    if (name === 'pinjam') await renderPinjam();
    if (name === 'kembali') await renderKembali();
    if (name === 'transaksi') await renderTransaksi();
};

// ==================== MODAL ====================
window.openModal = function(id) { document.getElementById(id).classList.add('open'); };
window.closeModal = function(id) { document.getElementById(id).classList.remove('open'); };
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

// ==================== RENDER DASHBOARD ====================
async function renderDashboard() {
    const tbody = document.getElementById('dashboard-pinjam-table');
    if (!tbody) return;

    try {
        const [buku, anggota, pinjam] = await Promise.all([
            getBuku().catch(() => []),
            getAnggota().catch(() => []),
            getPinjam('Dipinjam').catch(() => [])
        ]);

        const pinjamAktif = pinjam.filter(p => p.status === 'Dipinjam');
        const today = new Date().toISOString().slice(0, 10);
        const terlambat = pinjamAktif.filter(p => p.tenggat < today);

        document.getElementById('stat-buku').textContent = buku.length || 0;
        document.getElementById('stat-anggota').textContent = anggota.length || 0;
        document.getElementById('stat-dipinjam').textContent = pinjamAktif.length || 0;
        document.getElementById('stat-terlambat').textContent = terlambat.length || 0;

        if (pinjamAktif.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted);">📭 Tidak ada peminjaman aktif</td></tr>`;
            return;
        }

        let rows = '';
        pinjamAktif.forEach((p, i) => {
            const angg = anggota.find(a => a.id === p.anggotaId) || {};
            const bk = buku.find(b => b.id === p.bukuId) || {};
            const late = p.tenggat < today;
            rows += `<tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(angg.nama || '-')}</td>
                <td>${escapeHtml(bk.judul || '-')}</td>
                <td>${p.tglPinjam || '-'}</td>
                <td>${p.tenggat || '-'}</td>
                <td><span class="badge ${late ? 'badge-danger' : 'badge-success'}">${late ? 'Terlambat' : 'Tepat Waktu'}</span></td>
            </tr>`;
        });
        tbody.innerHTML = rows;
    } catch (error) {
        console.error('Gagal render dashboard:', error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:red;">⚠️ Gagal memuat data: ${error.message}</td></tr>`;
    }
}

// ==================== CRUD BUKU (UI) ====================
async function renderBuku() {
    const q = (document.getElementById('search-buku').value || '').toLowerCase();
    let buku = await getBuku();
    if (q) {
        buku = buku.filter(b =>
            b.judul.toLowerCase().includes(q) ||
            b.pengarang.toLowerCase().includes(q) ||
            b.kategori.toLowerCase().includes(q)
        );
    }

    const isAdmin = currentUser && currentUser.role === 'admin';
    document.getElementById('buku-add-btn').innerHTML = isAdmin ?
        '<button class="btn btn-primary btn-sm" onclick="openBukuModal()">+ Tambah Buku</button>' : '';

    let rows = '';
    if (buku.length === 0) {
        rows = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted);">📭 Tidak ada data buku</td></tr>';
    } else {
        buku.forEach((b, i) => {
            rows += `<tr>
                <td>${i + 1}</td>
                <td><b>${escapeHtml(b.judul)}</b></td>
                <td>${escapeHtml(b.pengarang)}</td>
                <td>${escapeHtml(b.penerbit)}</td>
                <td><span class="badge badge-info">${escapeHtml(b.kategori)}</span></td>
                <td><span class="badge ${b.stok > 0 ? 'badge-success' : 'badge-danger'}">${b.stok}</span></td>
                <td>
                    ${isAdmin ? `
                        <button class="btn btn-secondary btn-sm" onclick="editBuku('${b.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="hapusBuku('${b.id}')">🗑️</button>
                    ` : `
                        <button class="btn btn-success btn-sm" onclick="pinjamBukuLangsung('${b.id}')" ${b.stok < 1 ? 'disabled' : ''}>📤 Pinjam</button>
                        <button class="btn btn-gold btn-sm" onclick="kembalikanBukuLangsung('${b.id}')">📥 Kembalikan</button>
                    `}
                </td>
            </tr>`;
        });
    }
    document.getElementById('buku-table').innerHTML = rows;
}

window.openBukuModal = function() {
    document.getElementById('buku-id').value = '';
    document.getElementById('buku-judul').value = '';
    document.getElementById('buku-pengarang').value = '';
    document.getElementById('buku-penerbit').value = '';
    document.getElementById('buku-tahun').value = '';
    document.getElementById('buku-stok').value = '';
    document.getElementById('modal-buku-title').textContent = 'Tambah Buku';
    openModal('modal-buku');
};

window.editBuku = async function(id) {
    const buku = (await getBuku()).find(b => b.id === id);
    if (!buku) return;
    document.getElementById('buku-id').value = buku.id;
    document.getElementById('buku-judul').value = buku.judul;
    document.getElementById('buku-pengarang').value = buku.pengarang;
    document.getElementById('buku-penerbit').value = buku.penerbit;
    document.getElementById('buku-tahun').value = buku.tahun;
    document.getElementById('buku-kategori').value = buku.kategori;
    document.getElementById('buku-stok').value = buku.stok;
    document.getElementById('modal-buku-title').textContent = 'Edit Buku';
    openModal('modal-buku');
};

window.saveBuku = async function() {
    const id = document.getElementById('buku-id').value;
    const data = {
        judul: document.getElementById('buku-judul').value.trim(),
        pengarang: document.getElementById('buku-pengarang').value.trim(),
        penerbit: document.getElementById('buku-penerbit').value.trim(),
        tahun: parseInt(document.getElementById('buku-tahun').value) || 0,
        kategori: document.getElementById('buku-kategori').value,
        stok: parseInt(document.getElementById('buku-stok').value) || 0,
    };
    if (!data.judul || !data.pengarang) { alert('Judul dan pengarang wajib diisi!'); return; }

    if (id) {
        await updateBuku(id, data);
        showNotification('Buku berhasil diperbarui.', 'success');
    } else {
        await addBuku(data);
        showNotification('Buku berhasil ditambahkan.', 'success');
    }
    closeModal('modal-buku');
    await renderBuku();
};

window.hapusBuku = function(id) {
    showConfirm('Buku ini akan dihapus dari sistem.', async () => {
        await deleteBuku(id);
        await renderBuku();
        showNotification('Buku berhasil dihapus.', 'success');
    });
};

// ==================== CRUD ANGGOTA (UI) ====================
async function renderAnggota() {
    const q = (document.getElementById('search-anggota').value || '').toLowerCase();
    let anggota = await getAnggota();
    if (q) {
        anggota = anggota.filter(a =>
            a.nama.toLowerCase().includes(q) ||
            a.nis.toLowerCase().includes(q) ||
            a.kelas.toLowerCase().includes(q)
        );
    }

    let rows = '';
    if (anggota.length === 0) {
        rows = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted);">📭 Tidak ada data anggota</td></tr>';
    } else {
        anggota.forEach((a, i) => {
            rows += `<tr>
                <td>${i + 1}</td>
                <td><b>${escapeHtml(a.nama)}</b></td>
                <td>${escapeHtml(a.nis)}</td>
                <td>${escapeHtml(a.kelas)}</td>
                <td>${escapeHtml(a.username)}</td>
                <td><span class="badge badge-success">${a.status || 'Aktif'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editAnggota('${a.id}')">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="hapusAnggota('${a.id}')">🗑️</button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('anggota-table').innerHTML = rows;
}

window.editAnggota = async function(id) {
    const a = (await getAnggota()).find(a => a.id === id);
    if (!a) return;
    document.getElementById('anggota-id').value = a.id;
    document.getElementById('anggota-nama').value = a.nama;
    document.getElementById('anggota-nis').value = a.nis;
    document.getElementById('anggota-kelas').value = a.kelas;
    document.getElementById('anggota-username').value = a.username;
    document.getElementById('anggota-password').value = '';
    document.getElementById('modal-anggota-title').textContent = 'Edit Anggota';
    openModal('modal-anggota');
};

window.saveAnggota = async function() {
    const id = document.getElementById('anggota-id').value;
    const data = {
        nama: document.getElementById('anggota-nama').value.trim(),
        nis: document.getElementById('anggota-nis').value.trim(),
        kelas: document.getElementById('anggota-kelas').value.trim(),
        username: document.getElementById('anggota-username').value.trim(),
        password: document.getElementById('anggota-password').value || undefined,
        status: 'Aktif',
    };
    if (!data.nama || !data.nis || !data.username) { alert('Nama, NIS, dan username wajib diisi!'); return; }

    if (id) {
        if (!data.password) delete data.password;
        await updateAnggota(id, data);
        showNotification('Anggota berhasil diperbarui.', 'success');
    } else {
        if (!data.password) { alert('Password wajib diisi untuk anggota baru!'); return; }
        await addAnggota(data);
        showNotification('Anggota berhasil ditambahkan.', 'success');
    }
    closeModal('modal-anggota');
    document.getElementById('anggota-id').value = '';
    document.getElementById('modal-anggota-title').textContent = 'Tambah Anggota';
    await renderAnggota();
};

window.hapusAnggota = function(id) {
    showConfirm('Anggota ini akan dihapus dari sistem.', async () => {
        await deleteAnggota(id);
        await renderAnggota();
        showNotification('Anggota berhasil dihapus.', 'success');
    });
};

// ==================== PEMINJAMAN (UI) ====================
async function renderPinjam() {
    const q = (document.getElementById('search-pinjam').value || '').toLowerCase();
    const anggota = await getAnggota();
    const buku = await getBuku();
    const today = new Date().toISOString().slice(0, 10);

    let pinjam = await getPinjam('Dipinjam');
    if (currentUser.role === 'siswa') {
        pinjam = pinjam.filter(p => p.anggotaId === currentUser.id);
    }
    if (q) {
        pinjam = pinjam.filter(p => {
            const a = anggota.find(a => a.id === p.anggotaId);
            const b = buku.find(b => b.id === p.bukuId);
            return (a && a.nama.toLowerCase().includes(q)) || (b && b.judul.toLowerCase().includes(q));
        });
    }

    const isAdmin = currentUser && currentUser.role === 'admin';
    document.getElementById('pinjam-add-btn').innerHTML = `<button class="btn btn-primary btn-sm" onclick="openPinjamModal()">+ Pinjam Buku</button>`;

    let rows = '';
    if (pinjam.length === 0) {
        rows = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted);">📭 Tidak ada peminjaman aktif</td></tr>';
    } else {
        pinjam.forEach((p, i) => {
            const angg = anggota.find(a => a.id === p.anggotaId);
            const bk = buku.find(b => b.id === p.bukuId);
            const late = p.tenggat < today;
            rows += `<tr>
                <td>${i + 1}</td>
                <td>${angg ? angg.nama : '-'}</td>
                <td>${bk ? bk.judul : '-'}</td>
                <td>${p.tglPinjam}</td>
                <td>${p.tenggat}</td>
                <td><span class="badge ${late ? 'badge-danger' : 'badge-success'}">${late ? 'Terlambat' : 'Aktif'}</span></td>
                <td>${isAdmin ? `<button class="btn btn-danger btn-sm" onclick="hapusPinjam('${p.id}')">🗑️</button>` : '—'}</td>
            </tr>`;
        });
    }
    document.getElementById('pinjam-table').innerHTML = rows;
}

window.openPinjamModal = async function() {
    const anggota = await getAnggota();
    const buku = (await getBuku()).filter(b => b.stok > 0);
    const today = new Date().toISOString().slice(0, 10);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);

    const anggotaGrp = document.getElementById('pinjam-anggota-group');
    if (currentUser.role === 'siswa') {
        anggotaGrp.style.display = 'none';
    } else {
        anggotaGrp.style.display = 'block';
        let opts = '<option value="">-- Pilih Anggota --</option>';
        anggota.forEach(a => opts += `<option value="${a.id}">${a.nama} (${a.kelas})</option>`);
        document.getElementById('pinjam-anggota-id').innerHTML = opts;
    }

    let bOpts = '<option value="">-- Pilih Buku --</option>';
    buku.forEach(b => bOpts += `<option value="${b.id}">${b.judul} [Stok: ${b.stok}]</option>`);
    document.getElementById('pinjam-buku-id').innerHTML = bOpts;

    document.getElementById('pinjam-tgl').value = today;
    document.getElementById('pinjam-tenggat').value = deadline.toISOString().slice(0, 10);

    openModal('modal-pinjam');
};

window.savePinjam = async function() {
    const anggotaId = currentUser.role === 'siswa' ?
        currentUser.id :
        document.getElementById('pinjam-anggota-id').value;
    const bukuId = document.getElementById('pinjam-buku-id').value;
    const tglPinjam = document.getElementById('pinjam-tgl').value;
    const tenggat = document.getElementById('pinjam-tenggat').value;

    if (!anggotaId || !bukuId || !tglPinjam || !tenggat) {
        alert('Semua field wajib diisi!');
        return;
    }

    const buku = await getBuku();
    const bk = buku.find(b => b.id === bukuId);
    if (!bk || bk.stok < 1) { alert('Stok buku habis!'); return; }

    await updateBuku(bukuId, { ...bk, stok: bk.stok - 1 });
    await addPinjam({ anggotaId, bukuId, tglPinjam, tenggat });
    closeModal('modal-pinjam');
    await renderPinjam();
    showNotification('Buku berhasil dipinjam!', 'success');
};

window.hapusPinjam = function(id) {
    showConfirm('Data peminjaman ini akan dihapus.', async () => {
        const pinjamList = await getPinjam();
        const p = pinjamList.find(x => x.id === id);
        if (p && p.status === 'Dipinjam') {
            const buku = await getBuku();
            const bk = buku.find(b => b.id === p.bukuId);
            if (bk) {
                await updateBuku(p.bukuId, { ...bk, stok: bk.stok + 1 });
            }
        }
        await deletePinjam(id);
        await renderPinjam();
        showNotification('Data peminjaman dihapus.', 'success');
    });
};

// ==================== PENGEMBALIAN (UI) ====================
async function renderKembali() {
    const q = (document.getElementById('search-kembali').value || '').toLowerCase();
    const anggota = await getAnggota();
    const buku = await getBuku();
    const today = new Date().toISOString().slice(0, 10);

    let pinjam = await getPinjam('Dipinjam');
    if (currentUser.role === 'siswa') {
        pinjam = pinjam.filter(p => p.anggotaId === currentUser.id);
    }
    if (q) {
        pinjam = pinjam.filter(p => {
            const a = anggota.find(a => a.id === p.anggotaId);
            const b = buku.find(b => b.id === p.bukuId);
            return (a && a.nama.toLowerCase().includes(q)) || (b && b.judul.toLowerCase().includes(q));
        });
    }

    let rows = '';
    if (pinjam.length === 0) {
        rows = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted);">✅ Tidak ada buku yang perlu dikembalikan</td></tr>';
    } else {
        pinjam.forEach((p, i) => {
            const angg = anggota.find(a => a.id === p.anggotaId);
            const bk = buku.find(b => b.id === p.bukuId);
            const late = p.tenggat < today;
            const days = late ? Math.floor((new Date(today) - new Date(p.tenggat)) / 86400000) : 0;
            const denda = days * 1000;
            rows += `<tr>
                <td>${i + 1}</td>
                <td>${angg ? angg.nama : '-'}</td>
                <td>${bk ? bk.judul : '-'}</td>
                <td>${p.tglPinjam}</td>
                <td>${p.tenggat}</td>
                <td>${late ? `<span class="badge badge-danger">${formatRupiah(denda)}</span>` : '<span class="badge badge-success">Rp 0</span>'}</td>
                <td><button class="btn btn-gold btn-sm" onclick="openKembaliModal('${p.id}')">📥 Kembalikan</button></td>
            </tr>`;
        });
    }
    document.getElementById('kembali-table').innerHTML = rows;
}

window.openKembaliModal = async function(pinjamId) {
    const pinjamList = await getPinjam();
    const p = pinjamList.find(x => x.id === pinjamId);
    const anggota = await getAnggota();
    const buku = await getBuku();
    const a = anggota.find(x => x.id === p.anggotaId);
    const b = buku.find(x => x.id === p.bukuId);
    const today = new Date().toISOString().slice(0, 10);

    document.getElementById('kembali-pinjam-id').value = pinjamId;
    document.getElementById('kembali-tgl').value = today;
    document.getElementById('kembali-detail').innerHTML = `
        <b>Peminjam:</b> ${a ? a.nama : '-'}<br>
        <b>Buku:</b> ${b ? b.judul : '-'}<br>
        <b>Tgl Pinjam:</b> ${p.tglPinjam}<br>
        <b>Tenggat:</b> ${p.tenggat}
    `;

    hitungDenda();
    openModal('modal-kembali');
    document.getElementById('kembali-tgl').oninput = hitungDenda;
};

function hitungDenda() {
    const pinjamId = document.getElementById('kembali-pinjam-id').value;
    getPinjam().then(pinjamList => {
        const p = pinjamList.find(x => x.id === pinjamId);
        const tglKembali = document.getElementById('kembali-tgl').value;
        if (!p || !tglKembali) return;

        const late = tglKembali > p.tenggat;
        const days = late ? Math.floor((new Date(tglKembali) - new Date(p.tenggat)) / 86400000) : 0;
        const denda = days * 1000;
        const dendaEl = document.getElementById('denda-info');
        if (late) {
            dendaEl.style.display = 'block';
            dendaEl.innerHTML = `⚠️ Terlambat <b>${days} hari</b>. Denda: <b>${formatRupiah(denda)}</b> (Rp 1.000/hari)`;
        } else {
            dendaEl.style.display = 'none';
        }
    });
}

window.prosesPengembalian = async function() {
    const pinjamId = document.getElementById('kembali-pinjam-id').value;
    const tglKembali = document.getElementById('kembali-tgl').value;
    if (!tglKembali) { alert('Tanggal kembali wajib diisi!'); return; }

    const pinjamList = await getPinjam();
    const p = pinjamList.find(x => x.id === pinjamId);
    if (!p) return;

    const late = tglKembali > p.tenggat;
    const days = late ? Math.floor((new Date(tglKembali) - new Date(p.tenggat)) / 86400000) : 0;
    const denda = days * 1000;

    await updatePinjam(pinjamId, { ...p, status: 'Dikembalikan', tglKembali, denda });

    const buku = await getBuku();
    const bk = buku.find(b => b.id === p.bukuId);
    if (bk) await updateBuku(p.bukuId, { ...bk, stok: bk.stok + 1 });

    await addTransaksi({
        anggotaId: p.anggotaId,
        bukuId: p.bukuId,
        tglPinjam: p.tglPinjam,
        tenggat: p.tenggat,
        tglKembali,
        denda,
        status: late ? 'Terlambat' : 'Tepat Waktu',
    });

    closeModal('modal-kembali');
    await renderKembali();
    showNotification('Buku berhasil dikembalikan.', 'success');
};

// ==================== RIWAYAT TRANSAKSI (UI) ====================
async function renderTransaksi() {
    const q = (document.getElementById('search-transaksi').value || '').toLowerCase();
    const anggota = await getAnggota();
    const buku = await getBuku();
    let transaksi = await getTransaksi();

    if (q) {
        transaksi = transaksi.filter(t => {
            const a = anggota.find(x => x.id === t.anggotaId);
            const b = buku.find(x => x.id === t.bukuId);
            return (a && a.nama.toLowerCase().includes(q)) || (b && b.judul.toLowerCase().includes(q));
        });
    }

    let rows = '';
    if (transaksi.length === 0) {
        rows = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--muted);">📭 Belum ada riwayat transaksi</td></tr>';
    } else {
        transaksi.forEach((t, i) => {
            const a = anggota.find(x => x.id === t.anggotaId);
            const b = buku.find(x => x.id === t.bukuId);
            const late = t.status === 'Terlambat' || (t.tglKembali && t.tglKembali > t.tenggat);
            rows += `<tr>
                <td>${i + 1}</td>
                <td>${a ? a.nama : '-'}</td>
                <td>${b ? b.judul : '-'}</td>
                <td>${t.tglPinjam}</td>
                <td>${t.tglKembali || '-'}</td>
                <td>${t.denda > 0 ? formatRupiah(t.denda) : 'Rp 0'}</td>
                <td><span class="badge ${late ? 'badge-danger' : 'badge-success'}">${late ? 'Terlambat' : 'Tepat Waktu'}</span></td>
            </tr>`;
        });
    }
    document.getElementById('transaksi-table').innerHTML = rows;
}

// ==================== KONFIRMASI HAPUS ====================
let confirmCb = null;
window.showConfirm = function(msg, cb) {
    document.getElementById('confirm-msg').textContent = msg;
    confirmCb = cb;
    openModal('modal-confirm');
};
document.getElementById('confirm-yes-btn').addEventListener('click', async () => {
    if (confirmCb) {
        await confirmCb();
        confirmCb = null;
    }
    closeModal('modal-confirm');
});

// ==================== FUNGSI UNTUK SISWA DI HALAMAN BUKU ====================
window.pinjamBukuLangsung = async function(bukuId) {
    if (!currentUser || currentUser.role !== 'siswa') {
        alert('Anda harus login sebagai siswa.');
        return;
    }

    const buku = (await getBuku()).find(b => b.id === bukuId);
    if (!buku) {
        alert('Buku tidak ditemukan.');
        return;
    }

    if (buku.stok < 1) {
        alert('Stok buku habis, tidak dapat dipinjam.');
        return;
    }

    await openPinjamModal();
    document.getElementById('pinjam-buku-id').value = bukuId;
};

window.kembalikanBukuLangsung = async function(bukuId) {
    if (!currentUser || currentUser.role !== 'siswa') {
        alert('Anda harus login sebagai siswa.');
        return;
    }

    const pinjamList = await getPinjam('Dipinjam');
    const peminjaman = pinjamList.find(p => p.anggotaId === currentUser.id && p.bukuId === bukuId);

    if (!peminjaman) {
        alert('Anda tidak sedang meminjam buku ini.');
        return;
    }

    await openKembaliModal(peminjaman.id);
};

// ==================== TOGGLE PASSWORD VISIBILITY ====================
document.addEventListener('click', function(e) {
    const toggleIcon = e.target.closest('.toggle-password');
    if (!toggleIcon) return;

    const wrapper = toggleIcon.closest('.password-wrapper');
    if (!wrapper) return;

    const input = wrapper.querySelector('input');
    if (!input) return;

    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);

    toggleIcon.classList.toggle('fa-eye');
    toggleIcon.classList.toggle('fa-eye-slash');
});

// ==================== EKSPOR FUNGSI KE GLOBAL UNTUK DEBUGGING ====================
window.initSampleData = initSampleData;
window.getBuku = getBuku;
window.getAnggota = getAnggota;
window.addBuku = addBuku;
window.addAnggota = addAnggota;
window.addPinjam = addPinjam;
window.getPinjam = getPinjam;

// ==================== INISIALISASI AWAL ====================
(async () => {
    await initSampleData();
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('app').style.display = 'none';
})();